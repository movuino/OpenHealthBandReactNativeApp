import {
  NativeModules,
  NativeEventEmitter,
} from 'react-native';

import BleManager from 'react-native-ble-manager';
import PolarBleSdk from 'react-native-polar-ble-sdk';
import Device from './Device';
import Stream from './Stream';
import { descriptions, defaultState } from './streams';

const polarEmitter = new NativeEventEmitter(NativeModules.PolarBleSdkModule);

const devices = new Map();
const connections = new Map();
const disconnections = new Map();
const connectionTimeout = 6000;

polarEmitter.addListener('connectionState', onConnectionState);
polarEmitter.addListener('firmwareVersion', onFirmwareVersion);
polarEmitter.addListener('batteryLevel', onBatteryLevel);
polarEmitter.addListener('ecgFeatureReady', onEcgReady);
polarEmitter.addListener('accelerometerFeatureReady', onAccReady);
polarEmitter.addListener('ppgFeatureReady', onPpgReady);
polarEmitter.addListener('ppiFeatureReady', onPpiReady);
polarEmitter.addListener('hrData', onHrData);
polarEmitter.addListener('ecgData', onEcgData);
polarEmitter.addListener('accData', onAccData);
polarEmitter.addListener('ppgData', onPpgData);
polarEmitter.addListener('ppiData', onPpiData);

function onConnectionState(data) {
  const { id, state } = data;
  if (!devices.has(id)) return;

  const device = devices.get(id);
  device.setState({ connectionState: state });

  if (state === 'connected') {
    if (!device.state.added) {
      device.setState({ added: true });
      const { timeout, resolve } = connections.get(id);
      clearTimeout(timeout);
      resolve();
    }

    device.resetStreams({ hr: { ready: true }});
  }

  if (state === 'disconnected') {
    device.resetStreams();
    device.setState({}); // trigger rendering in App.js

    if (disconnections.get(id)) {
      const { resolve } = disconnections.get(id);
      resolve();
    }
  }
}

function onFirmwareVersion(data) {
  const { id, value } = data;
}

function onBatteryLevel(data) {
  const { id, value } = data;
}

function onEcgReady(data) {
  const { id } = data;
  devices.get(id).setStream('ecg', { ready: true });
}

function onAccReady(data) {
  const { id } = data;
  devices.get(id).setStream('acc', { ready: true });
}

function onPpgReady(data) {
  const { id } = data;
  devices.get(id).setStream('ppg', { ready: true });
}

function onPpiReady(data) {
  const { id } = data;
  devices.get(id).setStream('ppi', { ready: true });
}

function onHrData(data) {
  // const {
  //   id,
  //   hr,
  //   contact,
  //   contactSupported,
  //   rrAvailable,
  //   rrs,
  //   rrsMs,
  // } = data;

  // This one has no timeStamp and there is no "samples" array
  // so we reformat before calling onNewData :

  const { id } = data;
  delete data.id;
  const samples = [ Object.assign({}, data) ];
  const timeStamp = Date.now();

  onNewData('hr', { id, samples, timeStamp });
}

function onEcgData(data) {
  const { id, timeStamp } = data;
  const samples = data.samples.map(e => ({ value: e }));
  onNewData('ecg', { id, samples, timeStamp });
}

function onAccData(data) {
  onNewData('acc', data);
}

function onPpgData(data) {
  onNewData('ppg', data);
}

function onPpiData(data) {
  onNewData('ppi', data);
}

function onNewData(stream, data) {
  const { id, samples } = data;
  const timeStamp = data.timeStamp * 1e-6; // nano to milli seconds
  const newData = { id, timeStamp, samples };
  const device = devices.get(id);

  device.streams[stream].onNewData(newData);
  
  if (device.streams[stream].enabled) { // otherwise we would emit hr permanently
    device.emit(`stream:${stream}:data`, newData);
  }

  // return;

  // if (!device.streams[stream].enabled) return;

  // if (!device.streams[stream].streaming) {
  //   const now = Date.now();
  //   // const delta = timeStamp - now
  //   device.setStream(stream, {
  //     streaming: true,
  //     localStartDate: now,
  //     startDate: timeStamp,
  //     lastDate: timeStamp,
  //     delta: timeStamp - now,
  //   });  
  // } else {
  //   device.emit(`stream:${stream}:data`, newData);
  //   device.streams[stream].onNewData(newData);
  //   device.setStream(stream, { lastDate: timeStamp });
  // }
}

////////// POLAR DEVICE CLASS :

class PolarDevice extends Device {
  constructor(scanResult) {
    super(scanResult);

    const { type, model } = this.scanResult.meta;
    this.streams = {};
    this.streamDescriptions = descriptions[type][model].streams;
    
    Object.keys(this.streamDescriptions).forEach(s => {
      this.streams[s] = new Stream(this.streamDescriptions[s]);
    });

    devices.set(this.scanResult.meta.id, this);
  }

  async connect() {
    return new Promise(async (resolve, reject) => {
      const { id } = this.scanResult.meta;
      const timeout = setTimeout(async () => {
        PolarBleSdk.disconnectFromDevice(id);
        reject('connection timed out');
      }, connectionTimeout);

      connections.set(id, { timeout, resolve, reject });
      PolarBleSdk.connectToDevice(id);
    });
  }

  async disconnect() {
    return new Promise((resolve, reject) => {
      const { id } = this.scanResult.meta;
      if (this.state.connectionState !== 'connected') {
        PolarBleSdk.disconnectFromDevice(id);
        resolve();
      } else {
        disconnections.set(id, { resolve });
        PolarBleSdk.disconnectFromDevice(id);
      }
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

  setStream(stream, data) {
    const { id } = this.scanResult.meta;

    const methods = {
      ecg: {
        start: 'startEcgStreaming',
        stop: 'stopEcgStreaming',
      },
      acc: {
        start: 'startAccStreaming',
        stop: 'stopAccStreaming',
      },
      ppg: {
        start: 'startPpgStreaming',
        stop: 'stopPpgStreaming',
      },
      ppi: {
        start: 'startPpiStreaming',
        stop: 'stopPpiStreaming',
      },
    };

    const oldData = Object.assign({}, data);
    Object.keys(data).forEach(k => {
      oldData[k] = this.streams[stream].state[k];
    });

    this.streams[stream].setState(data);

    Object.keys(data).forEach(k => {
      const oldValue = oldData[k];
      const newValue = data[k];

      if (oldValue !== newValue) {
        this.emit(`stream:${stream}:${k}`, { oldValue, newValue });

        const hasMethod = Object.keys(methods).indexOf(stream) !== -1;

        if (k === 'enabled') {
          if (newValue) {
            console.log('starting stream ' + stream);
            if (hasMethod) {
              PolarBleSdk[methods[stream].start](id);
            }
          } else {
            console.log('stopping stream ' + stream);
            if (hasMethod) {
              PolarBleSdk[methods[stream].stop](id);
            }
            this.setStream(stream, { streaming: false }); // kind of reset flag
          }
        }
      }
    });
  }
};

export default PolarDevice;