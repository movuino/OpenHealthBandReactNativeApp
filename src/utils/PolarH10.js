import {
  NativeModules,
  NativeEventEmitter,
} from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';
import BleManager from 'react-native-ble-manager';
import PolarBleSdk from 'react-native-polar-ble-sdk';

const polarEmitter = new NativeEventEmitter(NativeModules.PolarBleSdkModule);

export default class PolarH10 {
  constructor() {
    this.deviceId = null;
    this.connectTimeout = null;

    this.recordStream = null;
    this.firstTimeStamp = 0;
    this.previousTimeStamp = 0;
    this.receivedFirstEcgFrame = false;

    this.currentHrData = null;
    this.hrDataUpdated = false;

    this.handlePolarFirmwareVersion = this.handlePolarFirmwareVersion.bind(this);
    this.handlePolarBatteryLevel = this.handlePolarBatteryLevel.bind(this);
    this.handlePolarConnection = this.handlePolarConnection.bind(this);
    this.handlePolarEcgReady = this.handlePolarEcgReady.bind(this);
    this.handlePolarAccReady = this.handlePolarAccReady.bind(this);
    this.handlePolarPpgReady = this.handlePolarPpgReady.bind(this);
    this.handlePolarPpiReady = this.handlePolarPpiReady.bind(this);
    this.handlePolarHrData = this.handlePolarHrData.bind(this);
    this.handlePolarEcgData = this.handlePolarEcgData.bind(this);
    this.handlePolarAccData = this.handlePolarAccData.bind(this);
    this.handlePolarPpgData = this.handlePolarPpgData.bind(this);
    this.handlePolarPpiData = this.handlePolarPpiData.bind(this);

    this.listeners = {};

    this.state = {
      connectionState: 'disconnected',
      ecgReady: false,
      accReady: false,
      ppgReady: false,
      ppiReady: false,
      currentHr: null,
      recording: false,
      storedDeviceId: null,
    };    
  }

  async start() {
    this.polarFirmwareVersionListener = polarEmitter.addListener('firmwareVersion', this.handlePolarFirmwareVersion);
    this.polarBatteryLevelListener = polarEmitter.addListener('batteryLevel', this.handlePolarBatteryLevel);
    this.polarConnectionListener = polarEmitter.addListener('connectionState', this.handlePolarConnection);
    this.polarEcgReadyListener = polarEmitter.addListener('ecgFeatureReady', this.handlePolarEcgReady);
    this.polarAccReadyListener = polarEmitter.addListener('accelerometerFeatureReady', this.handlePolarAccReady);
    this.polarPpgReadyListener = polarEmitter.addListener('ppgFeatureReady', this.handlePolarPpgReady);
    this.polarPpiReadyListener = polarEmitter.addListener('ppiFeatureReady', this.handlePolarPpiReady);
    this.polarHrDataListener = polarEmitter.addListener('hrData', this.handlePolarHrData);
    this.polarEcgDataListener = polarEmitter.addListener('ecgData', this.handlePolarEcgData);
    this.polarAccDataListener = polarEmitter.addListener('accData', this.handlePolarAccData);
    this.polarPpgDataListener = polarEmitter.addListener('ppgData', this.handlePolarPpgData);
    this.polarPpiDataListener = polarEmitter.addListener('ppiData', this.handlePolarPpiData);

    try {
      const storedDeviceId = await AsyncStorage.getItem('@polar_id');
      this.setState({ storedDeviceId });
    } catch(e) {
      // error reading value
      console.log(`error reading @polar_id value : ${e}`);
    }
  }

  stop() {
    this.disconnect();

    this.polarFirmwareVersionListener.remove();
    this.polarBatteryLevelListener.remove();
    this.polarConnectionListener.remove();
    this.polarEcgReadyListener.remove();
    this.polarAccReadyListener.remove();
    this.polarPpgReadyListener.remove();
    this.polarPpiReadyListener.remove();
    this.polarHrDataListener.remove();
    this.polarEcgDataListener.remove();
    this.polarAccDataListener.remove();
    this.polarPpgDataListener.remove();
    this.polarPpiDataListener.remove();
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

  /* * * * * * * * * * * * * * POLAR CONNECTION * * * * * * * * * * * * * * * */

  async setDeviceID(id) {
    if (this.state.connectionState !== 'disconnected') {
      throw new Error('cannot set new device ID while a polar device is connected');
    }

    await AsyncStorage.setItem('@polar_id', id);
    this.setState({ storedDeviceId: id });
  }

  async connect() {
    if (!this.state.storedDeviceId) return;

    try {
      await BleManager.enableBluetooth();
    } catch (e) {
      // we're probably running on ios
    }

    this.setState({ connectionState: 'scanning' });
    this.connectTimeout = setTimeout(() => { this.disconnect() }, 5000);
    PolarBleSdk.connectToDevice(this.state.storedDeviceId);
  }

  disconnect() {
    if (this.state.connectionState === 'scanning' || this.state.connectionState === 'connecting') {
      this.setState({
        // connectionState: 'disconnected',
        currentHr: null,
      });
    }

    PolarBleSdk.disconnectFromDevice(this.state.storedDeviceId);    
  }

  /* * * * * * * * * * * * * INTERNAL EVENT HANDLERS : * * * * * * * * * * * */

  handlePolarFirmwareVersion(data) {

  }

  handlePolarBatteryLevel(data) {

  }

  handlePolarConnection(data) {
    const connectionState = data.state;
    this.setState({ connectionState });
    // console.log(`connection state changed : ${JSON.stringify(data)}`);

    if (['connected', 'disconnected'].indexOf(connectionState) !== -1 &&
        this.connectTimeout !== null) {
      // console.log('clearing timeout');
      clearTimeout(this.connectTimeout);
      this.connectTimeout = null;
    }

    if (connectionState === 'connected') {
      // PolarBleSdk.startPpgStreaming();
    }
  }


  handlePolarEcgReady() {
    console.log('ecg ready');
    PolarBleSdk.startEcgStreaming();
  }

  handlePolarAccReady() {
    console.log('acc ready');
    PolarBleSdk.startAccStreaming();
  }

  handlePolarPpgReady() {
    console.log('ppg ready');
    PolarBleSdk.startPpgStreaming();
  }

  handlePolarPpiReady() {
    console.log('ppi ready');
    PolarBleSdk.startPpiStreaming();
  }

  handlePolarHrData(data) {
    // console.log(`hr data : ${JSON.stringify(data, null, 2)}`);
    this.currentHrData = data;
    this.hrDataUpdated = true;
    this.setState({ currentHr: data.hr });
    this.emit('hrData', data);
  }

  handlePolarEcgData(data) {
    if (!this.state.ecgReady) {
      this.setState({ ecgReady: true });
    }

    this.emit('ecgData', data);
  }

  handlePolarAccData(data) {
    if (!this.state.accReady) {
      this.setState({ accReady: true });
    }

    this.emit('accData', data);
  }

  handlePolarPpgData(data) {
    if (!this.state.ppgReady) {
      this.setState({ ppgReady: true });
    }

    this.emit('ppgData', data);
  }

  handlePolarPpiData(data) {
    if (!this.state.ppiReady) {
      this.setState({ ppiReady: true });
    }

    this.emit('ppiData', data);
  }
};