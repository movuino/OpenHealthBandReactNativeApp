import React, { Component } from 'react';
import {
  NativeEventEmitter,
  NativeModules,
} from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';
import BleManager from 'react-native-ble-manager';
// import { BlePlx } from 'react-native-ble-plx';

const prefix = '28b967f0';
const suffix = '4309-b2de-3d4e0e9f2542';

const getFullUUID = (shortUUID) => `${prefix}-${shortUUID}-${suffix}`;

const service = getFullUUID('0000');
const versionCharacteristic = getFullUUID('1001');
const streamCharacteristic = getFullUUID('1002');
const hrCharacteristic = getFullUUID('1003');

const bleManagerEmitter = new NativeEventEmitter(NativeModules.BleManager);

export default class OpenHealthBand /*extends Component*/ {
  constructor() {
    // super();

    this.uuids = {
      service,
      versionCharacteristic,
      streamCharacteristic,
      hrCharacteristic,
    }

    this.notifications = {};

    // this.connect = this.connect.bind(this);
    // this.startScan = this.startScan.bind(this);
    this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this);
    this.handleStopScan = this.handleStopScan.bind(this);
    this.handleUpdateValueForCharacteristic = this.handleUpdateValueForCharacteristic.bind(this);
    this.handleDisconnectedPeripheral = this.handleDisconnectedPeripheral.bind(this);

    this.listeners = {};

    this.state = {
      connectionState: 'disconnected',
      peripherals: new Map(),
      storedDeviceId: null,
    }
  }

  async start() {
    this.handlerDiscover = bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral );
    this.handlerStop = bleManagerEmitter.addListener('BleManagerStopScan', this.handleStopScan );
    this.handlerDisconnect = bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', this.handleDisconnectedPeripheral );
    this.handlerUpdate = bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', this.handleUpdateValueForCharacteristic );

    BleManager.start({ showAlert: true });

    try {
      const storedDeviceId = await AsyncStorage.getItem('@ohb_id');
      this.setState({ storedDeviceId });
    } catch(e) {
      // error reading value
      console.log(`error reading @ohb_id value : ${e}`);
    }
  }

  stop() {
    BleManager.checkState();

    this.handlerDiscover.remove();
    this.handlerStop.remove();
    this.handlerDisconnect.remove();
    this.handlerUpdate.remove();
  }

  addListener(event, listener) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }

    this.listeners[event].push(listener);
  }

  removeListeners(event = null) {
    if (event === null) {
      this.listeners = {};
    } else if (typeof event === 'string' && this.listeners[event]) {
      this.listeners[event] = null;
      delete this.listeners[event];
    }
  }

  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach((l) => { l(data); });
  }

  setState(data) {
    this.state = Object.assign(this.state, data);
    this.emit('state', this.state); // this way we can update views
  }

  /* * * * * * * * * * * OPEN HEALTH BAND CONNECTION * * * * * * * * * * * * */

  async setDeviceID(id) {
    if (this.state.connectionState !== 'disconnected') {
      throw new Error('cannot set new device ID while a polar device is connected');
    }

    await AsyncStorage.setItem('@ohb_id', id);
    this.setState({ storedDeviceId: id });
  }

  async connect() {
    await this.retrieveConnected();
    await this.startScan(); // will trigger calls to handleDiscoverPeripheral
    // once scan ends, handleStopScan is called
    // and automatic connection happens there
  }

  async disconnect() {
    try {
      await BleManager.disconnect(peripheral.id)
      let peripherals = this.state.peripherals;
      let p = peripherals.get(peripheral.id);
      if (p) {
        p.connected = false;
        peripherals.set(peripheral.id, p);
        this.setState({ peripherals, connectionState: 'disconnected' });
      }
      console.log('Disconnected from ' + peripheral.id);
    } catch (err) {
        console.log(err);
    }
  }

  async startScan() {
    try {
      await BleManager.enableBluetooth();
    } catch (e) {
      // we're probably running on ios
    }

    if (this.state.connectionState === 'disconnected') {
      this.setState({ peripherals: new Map() });
      this.setState({ connectionState: 'scanning' });
      await BleManager.scan([], 3, true);
    }
  }

  async retrieveConnected() {
    const results = await BleManager.getConnectedPeripherals([]);    

    if (results.length == 0) {
      console.log('No connected peripherals')
    }

    var peripherals = this.state.peripherals;

    for (var i = 0; i < results.length; i++) {
      var peripheral = results[i];
      peripheral.connected = true;
      peripherals.set(peripheral.id, peripheral);
      this.setState({ peripherals });
    }
  }

  /* * * * * * * * * * * * * INTERNAL EVENT HANDLERS : * * * * * * * * * * * */

  handleDiscoverPeripheral(peripheral) {
    var peripherals = this.state.peripherals;
    console.log('Got ble peripheral', peripheral);
    if (!peripheral.name) {
      peripheral.name = 'NO NAME';
    }
    peripherals.set(peripheral.id, peripheral);
    this.setState({ peripherals });
  }

  async handleStopScan() { // THIS IS WHERE WE WANT TO AUTOMATICALLY CONNECT :
    console.log('Scan is stopped');
    // console.log(this.state.peripherals);

    if (this.state.peripherals.size === 0) {
      this.setState({ connectionState: 'disconnected' });
      return;
    }

    this.state.peripherals.forEach(async (peripheral, id) => {
      const splitName = peripheral.name.split('-');
      console.log(splitName);
      if (splitName.length === 2 &&
          splitName[0] === 'OpenHealthBand' &&
          splitName[1] === this.state.storedDeviceId) {

        if (peripheral.connected) {
          // await this.disconnect();
          // do nothing ?
          if (this.notifications[peripheral.id]) {
            this.setState({ connectionState: 'connected' });
          } else {

          }
        } else {
          try {
            this.setState({ connectionState: 'connecting' });
            await BleManager.connect(peripheral.id);
          } catch (err) {
            console.error('error connecting to peripheral ' + peripheral.name);
            this.setState({ connectionState: 'disconnected' });
          }

          let peripherals = this.state.peripherals;
          let p = peripherals.get(peripheral.id);

          if (p) {
            p.connected = true;
            peripherals.set(peripheral.id, p);
            this.setState({ peripherals });
          }

          const peripheralData = await BleManager.retrieveServices(peripheral.id);
          const notifications = [];

          peripheralData.characteristics.forEach(async (c) => {
            if (c.service === this.uuids.service &&
                c.characteristic === this.uuids.streamCharacteristic) {
              notifications.push({
                service: c.service,
                characteristic: c.characteristic
              });
              try {
                await BleManager.startNotification(peripheral.id, c.service, c.characteristic);
                this.setState({ connectionState: 'connected' });
              } catch (err) {
                console.error('error starting notification on ' + peripheral.name);
                this.disconnect();
              }
            }
          });

          this.notifications[peripheral.id] = notifications;
          // const rssi = await BleManager.readRSSI(peripheral.id);
          // console.log('Retrieved actual RSSI value', rssi);
        }

        return;
      }
    });
  }

  handleDisconnectedPeripheral(data) {
    let peripherals = this.state.peripherals;
    let peripheral = peripherals.get(data.peripheral);

    if (peripheral) {
      // stop listening to notifications :
      if (this.notifications[peripheral.id]) {
        this.notifications[peripheral.id].forEach(({ service, characteristic }) => {
          BleManager.stopNotification(peripheral.id, service, characteristic);
        });
        delete this.notifications[peripheral.id];
      }

      peripheral.connected = false;
      peripherals.set(peripheral.id, peripheral);
      this.setState({ peripherals });
    }

    console.log('Disconnected from ' + data.peripheral);
  }

  handleUpdateValueForCharacteristic(data) {
    if (data.characteristic === this.uuids.streamCharacteristic) {
      const now = Date.now();

      const buffer = new Uint8Array(data.value).buffer;
      const sensors = new Int16Array(buffer);
      console.log('Received stream data from peripheral ' + data.peripheral + ' :');
      console.log(sensors);
      console.log(sensors.length);
      console.log(now - this.lastOhbDate);
      this.lastOhbDate = now;
    } else {
      console.log('Received data from ' + data.peripheral + ' characteristic ' + data.characteristic, data.value);
      console.log(data.value.length);
    }
 }  
};