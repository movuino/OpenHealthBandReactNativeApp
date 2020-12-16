import {
  NativeEventEmitter,
  NativeModules,
} from 'react-native';

import BleManager from 'react-native-ble-manager';

const bleManagerEmitter = new NativeEventEmitter(NativeModules.BleManager);

class BleScanner {
  constructor() {
    this.listeners = {};
    this.state = {
      scanning: false,
      scanResults: new Map(),
    };

    this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this);
    this.handleStopScan = this.handleStopScan.bind(this);
    // this.handleDisconnectedPeripheral = this.handleDisconnectedPeripheral.bind(this);
    // this.handleUpdateValueForCharacteristic = this.handleUpdateValueForCharacteristic.bind(this);

    this.handlerDiscover = bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral );
    this.handlerStop = bleManagerEmitter.addListener('BleManagerStopScan', this.handleStopScan );
    // this.handlerDisconnect = bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', this.handleDisconnectedPeripheral );
    // this.handlerUpdate = bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', this.handleUpdateValueForCharacteristic );
    
    BleManager.start({ showAlert: true });
  }

  // start() {
  //   this.handlerDiscover = bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral );
  //   this.handlerStop = bleManagerEmitter.addListener('BleManagerStopScan', this.handleStopScan );
  //   this.handlerDisconnect = bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', this.handleDisconnectedPeripheral );
  //   this.handlerUpdate = bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', this.handleUpdateValueForCharacteristic );
    
  //   BleManager.start({ showAlert: true });
  // }

  // stop() {
  //   BleManager.checkState();

  //   this.handlerDiscover.remove();
  //   this.handlerStop.remove();
  //   this.handlerDisconnect.remove();
  //   this.handlerUpdate.remove();
  // }

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

  async startScan(resetResults = true) {
    // make sure bluetooth is enabled on android (prompt user to do so if not)
    BleManager.checkState();
    try { await BleManager.enableBluetooth(); }
    catch (e) { /* we're probably running on ios */ }

    if (resetResults) {
      this.setState({ scanResults: new Map() });
    }

    this.setState({ scanning: true }),

    // do we want to retrieve connected devices ? ==> don't think so ...
    // await this.retrieveConnected();

    // look for any service uuids, scan for 5 seconds, allow duplicates on ios
    await BleManager.scan([], 5, true);
  }

  async stopScan() {
    await BleManager.stopScan();
  }

  /*
  async retrieveConnected() {
    const results = await BleManager.getConnectedPeripherals([]);

    if (results.length == 0) {
      // console.log('No connected peripherals')
    }

    for (var i = 0; i < results.length; i++) {
      var peripheral = results[i];
      peripheral.connected = true;

      let scanResults = this.state.scanResults;
      scanResults.set(peripheral.id, { ...peripheral, meta });
      this.setState({ scanResults });
      // this.peripherals.set(peripheral.id, peripheral);
    }
  }
  //*/

  handleDiscoverPeripheral(peripheral) {
    // console.log('Got ble peripheral', peripheral);
    if (!peripheral.name) return;

    const name = peripheral.name.split(' ');
    const meta = {};

    if (name.length === 3 && name[0] === 'Polar' &&
        ['H10', 'OH1'].indexOf(name[1]) !== -1) {
      meta.type = 'polar';
      meta.model = name[1];
      meta.id = name[2];
    } else if (name.length === 3 && name[0] === 'Movuino' &&
               ['OHB'].indexOf(name[1]) !== -1) {
      meta.type = 'movuino';
      meta.model = name[1];
      meta.id = name[2];
    } else {
      return; // ignore other devices
    }

    let scanResults = this.state.scanResults;
    // for (let i = 0; i < 15; i++) {
    //   scanResults.set(`${peripheral.id}-${i}`, { ...peripheral, meta });
    // }
    scanResults.set(peripheral.id, { ...peripheral, meta });
    this.setState({ scanResults });
  }

  handleStopScan() {
    // console.log(this.state.peripherals);
    this.setState({ scanning: false });
  }

  handleDisconnectedPeripheral() {
    // no use for this here
  }

  handleUpdateValueForCharacteristic() {
    // no use for this here
  }
};

export default new BleScanner();