import {
  NativeEventEmitter,
  NativeModules,
} from 'react-native';

import BleManager from 'react-native-ble-manager';
import Device from './Device';
import Stream from './Stream';
import { descriptions, defaultState } from './streams';

const bleManagerEmitter = new NativeEventEmitter(NativeModules.BleManager);

const prefix = 'a1f04dcb';
const suffix = '470f-a4f8-bd251953cd79';

const getFullUUID = (shortUUID) => `${prefix}-${shortUUID}-${suffix}`;

const services = {
  ppg: {
    uuid: getFullUUID('1000'),
    characteristics: {
      rawPpg: {
        uuid: getFullUUID('1001'),
        stream: 'ppg',
      },
    },
  },
  imu: {
    uuid: getFullUUID('2000'),
    characteristics: {
      accel: {
        uuid: getFullUUID('2001'),
        stream: 'acc',
      },
      gyro: {
        uuid: getFullUUID('2002'),
        stream: 'gyr',
      },
      mag: {
        uuid: getFullUUID('2003'),
        stream: 'mag',
      },
    }
  }
};

const devices = new Map();
const connections = new Map();
const disconnections = new Map();
const connectionTimeout = 6000;

bleManagerEmitter.addListener('BleManagerConnectPeripheral', onConnected);
bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', onDisconnected);
bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', onValueUpdate);

// directly get the "id" from the "peripheral"
async function onConnected({ peripheral }) {
  const id = peripheral;

  if (!devices.has(id)) return;
  const device = devices.get(id);

  if (!device.state.added) {
    await device.initNotifications();
    device.setState({ added: true });
  }

  device.resetStreams({
    ppg: { ready: true },
    acc: { ready: true },
    gyr: { ready: true },
    mag: { ready: true },
  });
  device.setState({ connectionState: 'connected' });

  if (connections.has(id)) { // connection initiated from "connect" method
    const { timeout, resolve } = connections.get(id);
    connections.delete(id);
    clearTimeout(timeout);
    resolve();
  } else { // successful automatic reconnection attempt after lost connection
    device._stopReconnectionDaemon();
  }
}

function onDisconnected({ peripheral }) {
  const id = peripheral;
  if (!devices.has(id)) return;
  const device = devices.get(id);

  if (device.state.connectionState !== 'disconnected') {
    device.resetStreams({});
    device.setState({ connectionState: 'disconnected' });

    if (disconnections.has(id)) { // disconnection initiated from "disconnect" method
      const { resolve } = disconnections.get(id);
      disconnections.delete(id);
      resolve();  
    } else { // connection was lost
      device._startReconnectionDaemon();
    }
  }
}

function onValueUpdate(data) {
  const { peripheral, characteristic, value } = data;
  const id = peripheral;

  const buffer = new Uint8Array(value).buffer;
  const timeStamp = new DataView(buffer, 0, 4).getUint32(0);

  let stream;
  let view;
  const sample = {};

  switch (characteristic) {
    case services.ppg.characteristics.rawPpg.uuid:
      stream = 'ppg';
      view = new DataView(buffer, 4, 12);
      sample.red = view.getUint32(0);
      sample.ir = view.getUint32(4);
      sample.green = view.getUint32(8);
      break;
    case services.imu.characteristics.accel.uuid:
      stream = 'acc';
      view = new DataView(buffer, 4, 6);
      sample.x = view.getInt16(0);
      sample.y = view.getInt16(2);
      sample.z = view.getInt16(4);
      break;
    case services.imu.characteristics.gyro.uuid:
      stream = 'gyr';
      view = new DataView(buffer, 4, 6);
      sample.x = view.getInt16(0);
      sample.y = view.getInt16(2);
      sample.z = view.getInt16(4);
      break;
    case services.imu.characteristics.mag.uuid:
      stream = 'mag';
      view = new DataView(buffer, 4, 6);
      sample.x = view.getInt16(0);
      sample.y = view.getInt16(2);
      sample.z = view.getInt16(4);
      break;
    default: // never happens
      break;
  }

  const samples = [ sample ];
  onNewData(stream, { id, timeStamp, samples });
}

// other callbacks :

function onNewData(stream, data) {
  const { id, timeStamp, samples } = data;
  const device = devices.get(id);

  device.streams[stream].onNewData(data);

  if (device.streams[stream].enabled) {
    device.emit(`stream:${stream}:data`, data);
  }

  // return;

  // if (!device.streams[stream].enabled) return;

  // if (!device.streams[stream].streaming) {
  //   const now = Date.now();
  //   // const delta = timeStamp - now;
  //   device.setStream(stream, {
  //     streaming: true,
  //     localStartDate: now,
  //     startDate: timeStamp,
  //     lastDate: timeStamp,
  //     delta: timeStamp - now,
  //   });  
  // } else {
  //   device.emit(`stream:${stream}:data`, data);
  //   device.streams[stream].onNewData(data);
  //   device.setStream(stream, { lastDate: timeStamp });
  // }
}

////////// MOVUINO DEVICE CLASS

class MovuinoDevice extends Device {
  constructor(scanResult) {
    super(scanResult);

    const { type, model } = this.scanResult.meta;
    this.streams = {};
    this.streamDescriptions = descriptions[type][model].streams;
    
    Object.keys(this.streamDescriptions).forEach(s => {
      this.streams[s] = new Stream(this.streamDescriptions[s]);
    });

    this.resetStreams();
    this.notifications = {};

    this.reconnectionTimeout = null;
    this.reconnectionInterval = 5000;

    devices.set(this.scanResult.id, this);
  }

  async connect() {
    return new Promise(async (resolve, reject) => {
      const { id } = this.scanResult;
      const timeout = setTimeout(async () => {
        BleManager.disconnect(id);
        reject('connection timed out');
      }, connectionTimeout);

      connections.set(id, { timeout, resolve, reject });
      BleManager.connect(id);
    });
  }

  async disconnect() {
    return new Promise(async (resolve, reject) => {
      this._stopReconnectionDaemon();
      const { id } = this.scanResult;
      if (this.state.connectionState !== 'connected') {
        BleManager.disconnect(id);
        resolve();
      } else {
        disconnections.set(id, { resolve });
        BleManager.disconnect(id);
      }
    });
  }

  async initNotifications() {
    const { id } = this.scanResult;
    this.notifications = {};
    const peripheralData = await BleManager.retrieveServices(id);

    peripheralData.characteristics.forEach(c => {
      Object.keys(services).forEach(sk => {
        if (c.service === services[sk].uuid) {
          // console.log(`found service ${c.service}`);
          Object.keys(services[sk].characteristics).forEach(ck => {
            const currentCharacteristic = services[sk].characteristics[ck];
            if (c.characteristic === currentCharacteristic.uuid) {
              // console.log(`found characteristic ${c.characteristic}`);
              const { service, characteristic } = c;
              this.notifications[currentCharacteristic.stream] = {
                service,
                characteristic,
              }
            }
          });
        }
      });
    });
  }

  resetStreams(defaultOverrides = {}) {
    Object.keys(this.streams).forEach(s => {
      const overrides = defaultOverrides[s] || {};

      this.streams[s].setState(Object.assign({
        ready: false,
        enabled: false,
        streaming: false,
      }, overrides));
    });
  }

  async setStream(stream, data) {
    const { id } = this.scanResult;
    const oldData = Object.assign({}, data);
    Object.keys(data).forEach(k => {
      oldData[k] = this.streams[stream].state[k];
    });

    this.streams[stream].setState(data);

    Object.keys(data).forEach(async k => {
      const oldValue = oldData[k];
      const newValue = data[k];

      if (oldValue !== newValue) {
        this.emit(`stream:${stream}:${k}`, { oldValue, newValue });

        if (k === 'enabled') {
          const { service, characteristic } = this.notifications[stream];
          if (newValue) {
            console.log('starting stream ' + stream);
            await BleManager.startNotification(id, service, characteristic);
          } else {
            console.log('stopping stream ' + stream);
            await BleManager.stopNotification(id, service, characteristic);
            this.setStream(stream, { streaming: false }); // kind of reset flag
          }
        }
      }
    });
  }

  // these methods allow us to replicate the way the connection cycle is handled
  // in polar's sdk :
  // if explicitly connected, disconnection event not coming from users will
  // start a reconnection daemon until it is either connected or disconnected
  // explicitly by the user

  // todo ...

  async _reconnectionDaemon() {
    const { id } = this.scanResult;
    try {
      console.log('trying to reconnect ...');
      this.reconnectionTimeout = setTimeout(async () => {
        console.log('canceling auto reconnect');
        await BleManager.disconnect(id);
        this._reconnectionDaemon();
      }, this.reconnectionInterval);

      await BleManager.connect(id);
    } catch (e) {
      console.error(e);
      if (this.reconnectionTimeout !== null) {
        clearTimeout(this.reconnectionTimeout);
        this.reconnectionTimeout = null;
      }

      this._reconnectionDaemon();
    }
  }

  async _startReconnectionDaemon() {
    await this._reconnectionDaemon();
  }

  _stopReconnectionDaemon() {
    if (this.reconnectionTimeout !== null) {
      clearTimeout(this.reconnectionTimeout);
      this.reconnectionTimeout = null;
    }
  }
};

export default MovuinoDevice;
