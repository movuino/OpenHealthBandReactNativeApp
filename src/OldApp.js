import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableHighlight,
  NativeEventEmitter,
  NativeModules,
  Platform,
  PermissionsAndroid,
  ScrollView,
  AppState,
  FlatList,
  Dimensions,
  Button,
  SafeAreaView
} from 'react-native';
import ObcsButton from './components/ObcsButton';
import SignalPlotter from './components/SignalPlotter';
import StatusBar from './components/StatusBar';
import PromptTextOverlay from './components/PromptTextOverlay';
// import LinkedList from './utils/LinkedList';

import BleManager from 'react-native-ble-manager';
import PolarBleSdk from 'react-native-polar-ble-sdk';
import RNFetchBlob from 'rn-fetch-blob';
import AsyncStorage from '@react-native-community/async-storage';
import { getStringDate } from './utils/date-utils';

import * as ohb from './utils/open-health-band';

import PolarH10 from './utils/PolarH10';

const polarh10 = new PolarH10();

polarh10.addListener('coucou', (val) => { console.log(val); });
polarh10.start();

const window = Dimensions.get('window');

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
const polarEmitter = new NativeEventEmitter(NativeModules.PolarBleSdk);

export default class App extends Component {
  constructor(){
    super();

    this.deviceId = null;
    this.connectTimeout = null;

    this.recordStream = null;
    this.firstTimeStamp = 0;
    this.previousTimeStamp = 0;
    this.receivedFirstEcgFrame = false;

    this.lastOhbDate = Date.now();
    this.notifications = {};

    this.currentHrData = null;
    this.hrDataUpdated = false;

    this.state = {
      appState: '',
      peripherals: new Map(),
      connectionState: 'disconnected',
      ecgReady: false,
      recording: false,
      displayPrompt: false,
      storedDeviceId: null,
      currentHr: null,
    };

    this.handleAppStateChange = this.handleAppStateChange.bind(this);

    this.handlePolarConnection = this.handlePolarConnection.bind(this);
    this.handlePolarEcgReady = this.handlePolarEcgReady.bind(this);
    this.handlePolarAccReady = this.handlePolarAccReady.bind(this);
    this.handlePolarHrData = this.handlePolarHrData.bind(this);
    this.handlePolarEcgData = this.handlePolarEcgData.bind(this);
    this.handlePolarAccData = this.handlePolarAccData.bind(this);

    this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this);
    this.handleStopScan = this.handleStopScan.bind(this);
    this.handleUpdateValueForCharacteristic = this.handleUpdateValueForCharacteristic.bind(this);
    this.handleDisconnectedPeripheral = this.handleDisconnectedPeripheral.bind(this);

    // this.writeSampleInterval = null;
  }

  async componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange);

    this.polarConnectionListener = polarEmitter.addListener('connectionState', this.handlePolarConnection);
    this.polarEcgReadyListener = polarEmitter.addListener('ecgFeatureReady', this.handlePolarEcgReady);
    this.polarAccReadyListener = polarEmitter.addListener('accelerometerFeatureReady', this.handlePolarAccReady);
    this.polarHrDataListener = polarEmitter.addListener('hrData', this.handlePolarHrData);
    this.polarEcgDataListener = polarEmitter.addListener('ecgData', this.handlePolarEcgData);
    this.polarAccDataListener = polarEmitter.addListener('accData', this.handlePolarAccData);

    this.handlerDiscover = bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral );
    this.handlerStop = bleManagerEmitter.addListener('BleManagerStopScan', this.handleStopScan );
    this.handlerDisconnect = bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', this.handleDisconnectedPeripheral );
    this.handlerUpdate = bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', this.handleUpdateValueForCharacteristic );

    BleManager.start({ showAlert: true });

    if (Platform.OS === 'android' && Platform.Version >= 23) {
      let coarsePerm = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION);
      if (!coarsePerm) {
        coarsePerm = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION, {
          title: 'Access Coarse Location',
          message: 'the app needs access to your coarse location for the BLE to work',
          buttonPositive: 'OK',
        });
      }
      if (!coarsePerm) { /* notify the user that the app won't work properly */ }

      // fine location is required now for ble to work (check if coarse can be safely removed)
      // see https://github.com/innoveit/react-native-ble-manager/issues/655#issuecomment-673933665
      let finePerm = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      if (!finePerm) {
        finePerm = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
          title: 'Access Fine Location',
          message: 'the app needs access to your fine location for the BLE to work',
          buttonPositive: 'OK',
        });
      }
      if (!finePerm) { /* notify the user that the app won't work properly */ }

      let writePerm = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
      if (!writePerm) {
        writePerm = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE, {
          title: 'Allow Write to External Storage',
          message: 'the app needs to write to external storage to work properly',
          buttonPositive: 'OK',          
        });
      }
      if (!writePerm) { /* notify the user that the app won't work properly */ }

      /*
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
        if (result) {
          console.log("Permission is OK");
        } else {
          PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((res) => {
            if (res) {
              console.log("User accept");
            } else {
              console.log("User refuse");
            }
          });
        }
      });

      // PermissionsAndroid.request( PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, { title: 'Bluetooth Permission', message: 'In the next dialogue, Android will ask for permission for this ' + 'App to access your location. This is needed for being able to ' + 'use Bluetooth to scan your environment for peripherals.', buttonPositive: 'OK' }, )

      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
        if (result) {
          console.log('allowed to access fine location');
        } else {
          PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((res) => {
            if (res) {
              console.log('user allowed access to fine location');
            } else {
              console.log('user refused to give access to fine location');
            }
          });
        }
      });

      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE).then((result) => {
        if (result) {
          console.log("Permission to write to external storage granted");
        } else {
          PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE).then((result) => {
            if (result) {
              console.log('allowed to write to external storage :)');
            } else {
              console.log('not allowed to write to external storage :(');              
            }
          });
        }
      });
      //*/
    }

    try {
      const storedDeviceId = await AsyncStorage.getItem('@polar_id');
      this.setState({ storedDeviceId });
    } catch(e) {
      // error reading value
      console.log(e);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.connectionState !== this.state.connectionState) {
      console.log(this.state.connectionState);
      if (this.state.connectionState === 'disconnected') {
        this.setState({ ecgReady: false });
      }
    }
  }

  handleAppStateChange(nextAppState) {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!')
      // BleManager.getConnectedPeripherals([]).then((peripheralsArray) => {
      //   console.log('Connected peripherals: ' + peripheralsArray.length);
      // });
    }
    this.setState({ appState: nextAppState });
  }

  //////////////// polar callbacks :

  handlePolarConnection(data) {
    const connectionState = data.state;
    this.setState({ connectionState });
    if (connectionState === 'connected' && this.connectTimeout !== null) {
      clearTimeout(this.connectTimeout);
      this.connectTimeout = null;
    }
  }

  handlePolarEcgReady() {
    PolarBleSdk.startEcgStreaming();
  }

  handlePolarAccReady() {
    // PolarBleSdk.startAccStreaming();
  }

  handlePolarHrData(data) {
    console.log(`hr data : ${JSON.stringify(data, null, 2)}`);
    this.currentHrData = data;
    this.hrDataUpdated = true;
    this.setState({ currentHr: data.hr });
  }

  handlePolarEcgData(data) {
    const { samples, timeStamp } = data;

    if (!this.state.ecgReady) {
      this.setState({ ecgReady: true });
    }

    if (this.state.recording && this.recordStream !== null) {

      if (!this.receivedFirstEcgFrame) {
        this.firstTimeStamp = timeStamp;
        this.receivedFirstEcgFrame = true;
      } else {
        let date = this.previousTimeStamp - this.firstTimeStamp;
        const interval = (timeStamp - this.previousTimeStamp) / samples.length;

        const hr = this.hrDataUpdated ? this.currentHrData.hr : 0;
        this.hrDataUpdated = false;

        for (let i = 0; i < samples.length; i++) {
          date += interval;
          this.recordStream.write(`${date * 1e-6},${samples[i]},${i === 0 ? hr : 0}\n`);
        }
      }

      this.previousTimeStamp = timeStamp;
    }

    this.signalPlotter.addSamples(samples);
  }

  handlePolarAccData(data) {
    console.log(`acc data : ${JSON.stringify(data, null, 2)}`);
  }

  //////////////// generic ble-manager callbacks :

  handleDiscoverPeripheral(peripheral){
    var peripherals = this.state.peripherals;
    console.log('Got ble peripheral', peripheral);
    if (!peripheral.name) {
      peripheral.name = 'NO NAME';
    }
    peripherals.set(peripheral.id, peripheral);
    this.setState({ peripherals });
  }

  handleStopScan() {
    console.log('Scan is stopped');
    this.setState({ scanning: false });
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
    if (data.characteristic === ohb.streamCharacteristic) {
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

  test(peripheral) {
    if (peripheral){
      if (peripheral.connected) {
        BleManager.disconnect(peripheral.id)
        .then(() => {
          let peripherals = this.state.peripherals;
          let p = peripherals.get(peripheral.id);
          if (p) {
            p.connected = false;
            peripherals.set(peripheral.id, p);
            this.setState({ peripherals });
          }
          console.log('Disconnected from ' + peripheral.id);
        })
        .catch((err) => {
          console.log(err);
        });
      } else {
        BleManager.connect(peripheral.id).then(() => {
          let peripherals = this.state.peripherals;
          let p = peripherals.get(peripheral.id);
          if (p) {
            p.connected = true;
            peripherals.set(peripheral.id, p);
            this.setState({ peripherals });
          }
          console.log('Connected to ' + peripheral.id);


          setTimeout(() => {

            //* 
            // Test read current RSSI value

            //*
            // BleManager.requestMTU(peripheral.id, 512).then((mtu) => {
            //   console.log(`new mtu size : ${mtu} bytes`);

              BleManager.retrieveServices(peripheral.id).then((peripheralData) => {
                console.log(`Retrieved peripheral services :\n${JSON.stringify(peripheralData, null, 2)}`);

                const notifications = [];
                peripheralData.characteristics.forEach((c) => {
                  // if (c.characteristic === 'eefb7a93-2002-4e6c-927b-119e2c76b4a7' &&
                  //     c.service === 'eefb7a93-0000-4e6c-927b-119e2c76b4a7') {
                  console.log(ohb.service);
                  console.log(ohb.streamCharacteristic);

                  if (c.service === ohb.service &&
                      c.characteristic === ohb.streamCharacteristic) {
                    notifications.push({
                      service: c.service,
                      characteristic: c.characteristic
                    });

                    BleManager.startNotification(peripheral.id, c.service, c.characteristic)
                    .then(() => {
                      console.log('Started notification on ' + peripheral.id);
                    })
                    .catch((err) => {
                      console.error(err);
                    });
                  }
                });

                this.notifications[peripheral.id] = notifications;

                BleManager.readRSSI(peripheral.id).then((rssi) => {
                  console.log('Retrieved actual RSSI value', rssi);
                });
              });
            // })
            // .catch((error) => {
            //   console.error(error);
            // });
            //*/

            //*/

            /*
            // Test using bleno's pizza example
            // https://github.com/sandeepmistry/bleno/tree/master/examples/pizza

            BleManager.retrieveServices(peripheral.id).then((peripheralInfo) => {
              console.log(JSON.stringify(peripheralInfo, null, 2));
              var service = '13333333-3333-3333-3333-333333333337';
              var bakeCharacteristic = '13333333-3333-3333-3333-333333330003';
              var crustCharacteristic = '13333333-3333-3333-3333-333333330001';

              setTimeout(() => {
                BleManager.startNotification(peripheral.id, service, bakeCharacteristic).then(() => {
                  console.log('Started notification on ' + peripheral.id);
                  setTimeout(() => {
                    BleManager.write(peripheral.id, service, crustCharacteristic, [0]).then(() => {
                      console.log('Writed NORMAL crust');
                      BleManager.write(peripheral.id, service, bakeCharacteristic, [1,95]).then(() => {
                        console.log('Writed 351 temperature, the pizza should be BAKED');
                        var PizzaBakeResult = {
                          HALF_BAKED: 0,
                          BAKED:      1,
                          CRISPY:     2,
                          BURNT:      3,
                          ON_FIRE:    4
                        };
                      });
                    });

                  }, 500);
                }).catch((error) => {
                  console.log('Notification error', error);
                });
              }, 200);
            });
            //*/

          }, 900);
        }).catch((error) => {
          console.log('Connection error', error);
        });
      }
    }
  }

  //////////////// component lifecycle

  componentWillUnmount() {
    // if (this.writeSampleInterval !== null) {
    //   clearInterval(this.writeSampleInterval);
    //   this.writeSampleInterval = null;
    // }
    // this.PolarBleSdk

    this.disconnectFromPolar();
    BleManager.checkState();

    this.polarConnectionListener.remove();
    this.polarEcgReadyListener.remove();
    this.polarAccReadyListener.remove();
    this.polarHrDataListener.remove();
    this.polarEcgDataListener.remove();
    this.polarAccDataListener.remove();

    this.handlerDiscover.remove();
    this.handlerStop.remove();
    this.handlerDisconnect.remove();
    this.handlerUpdate.remove();
  }

  //////////////// actual methods

  connectToPolar() {
    if (!this.state.storedDeviceId) return;

    this.setState({ connectionState: 'scanning' });
    this.connectTimeout = setTimeout(() => { this.disconnectFromPolar() }, 20000);
    PolarBleSdk.connectToDevice(this.state.storedDeviceId);    
  }

  disconnectFromPolar() {
    if (this.state.connectionState === 'scanning' || this.state.connectionState === 'connecting') {
      this.setState({
        connectionState: 'disconnected',
        currentHr: null,
      });
    }

    PolarBleSdk.disconnectFromDevice(this.state.storedDeviceId);    
  }

  // ble-manager scanning

  startScan() {
    if (!this.state.scanning) {
      this.setState({ peripherals: new Map() });
      BleManager.scan([], 3, true).then((results) => {
        console.log('Scanning...');
        this.setState({ scanning: true });
        this.retrieveConnected();
      });
    }
  }

  retrieveConnected(){
    BleManager.getConnectedPeripherals([]).then((results) => {
      if (results.length == 0) {
        console.log('No connected peripherals')
      }
      console.log(results);
      var peripherals = this.state.peripherals;
      for (var i = 0; i < results.length; i++) {
        var peripheral = results[i];
        peripheral.connected = true;
        peripherals.set(peripheral.id, peripheral);
        this.setState({ peripherals });
      }
    });
  }

  // todo : check recording state to avoid calling write on a null stream

  startRecording() {
    const destinationFolder = RNFetchBlob.fs.dirs.DownloadDir;
    const filename = `Polar_${getStringDate()}.csv`;
    RNFetchBlob.fs.writeStream(`${destinationFolder}/${filename}`, 'utf8')
    .then((stream) => {
      this.recordStream = stream;
      this.recordStream.write('ms_date,ecg_uv_value,hr_value\n');
      this.receivedFirstEcgFrame = false;
      this.hrDataUpdated = false;
      this.setState({
        recording: true,
      });
    });
  }

  stopRecording() {
    this.recordStream.close();
    this.recordStream = null;
    this.setState({
      recording: false,
    });
  }

  // renderComponent(component) {
  // }

  renderItem(item) {
    const color = item.connected ? 'green' : '#fff';
    return (
      <TouchableHighlight onPress={() => this.test(item) }>
        <View style={[styles.row, {backgroundColor: color}]}>
          <Text style={{fontSize: 12, textAlign: 'center', color: '#333333', padding: 10}}>{item.name}</Text>
          <Text style={{fontSize: 10, textAlign: 'center', color: '#333333', padding: 2}}>RSSI: {item.rssi}</Text>
          <Text style={{fontSize: 8, textAlign: 'center', color: '#333333', padding: 2, paddingBottom: 20}}>{item.id}</Text>
        </View>
      </TouchableHighlight>
    );
  }

  render() {
    const list = Array.from(this.state.peripherals.values());
    const btnScanTitle = 'Scan Bluetooth (' + (this.state.scanning ? 'on' : 'off') + ')';

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.container}>
          <View style={styles.background} />

          <StatusBar deviceConnected={ this.state.connectionState === 'connected' } />
            
          <View styles={{ margin: 10, width: '100%' }}>
            <Text style={styles.txtTop}> Current ID : </Text>
            <Text style={styles.txt}> {this.state.storedDeviceId} </Text>
          </View>

          <View style={{ margin: 10 }}>
            <ObcsButton
              text='Set new ID'
              onPress={() => {
                this.setState({
                  displayPrompt: true,
                });
              }}
            />
          </View>

          <View style={{ margin: 10 }}>
            <ObcsButton
              text={[ 'Scanning ...', 'Connecting ...', 'Disconnect', 'Connect' ][
                [ 'scanning', 'connecting', 'connected', 'disconnected' ].indexOf(this.state.connectionState)
              ]}
              onPress={() => {
                // this is android only !
                // for iOS, the equivalent is BleManager.start({ showAlert: true })
                BleManager.enableBluetooth()
                .then(() => {
                  if (this.state.connectionState === 'disconnected') {
                    this.connectToPolar();
                  } else if (this.state.connectionState === 'connected') {
                    this.disconnectFromPolar();
                  }
                })
                .catch((err) => {
                  console.log(err);
                });
              }}
            />
          </View>

          <View style={{ margin: 10 }}>
            <ObcsButton
              disabled={!this.state.ecgReady}
              text={this.state.recording ? 'Stop recording' : 'Start recording'}
              onPress={() => {
                if (!this.state.recording) {
                  this.startRecording();
                } else {
                  this.stopRecording();
                }
              }}
            />
          </View>

          <View styles={{ margin: 10, width: '100%' }}>
            <Text style={styles.txtTop}> HR : {this.state.currentHr || ''} </Text>
          </View>

          <View style={{ flex: 0, margin: 10 }}>
            <SignalPlotter
              // we need this ref to call addSamples from ecg data callback
              ref={(instance) => { this.signalPlotter = instance; }}
              nbOfSamples={500}
              minInput={-2000}
              maxInput={2000}
            />
          </View>

          <View style={{ margin: 10 }}>
            <Button title={btnScanTitle} onPress={() => {
              BleManager.enableBluetooth()
              .then(() => {
                this.startScan();
              })
              .catch((err) => {
                console.log(err);
              });
            }} />
          </View>

          <ScrollView style={styles.scroll}>
            {(list.length == 0) &&
              <View style={{flex:1, margin: 20}}>
                <Text style={{textAlign: 'center'}}>No peripherals</Text>
              </View>
            }
            <FlatList
              data={list}
              renderItem={({ item }) => this.renderItem(item) }
              keyExtractor={item => item.id}
            />

          </ScrollView>
        </View>

        <PromptTextOverlay
          show={this.state.displayPrompt}
          onPress={async (id) => {
            try {
              this.setState({ displayPrompt: false });

              if (id !== '' && id !== null) {
                await AsyncStorage.setItem('@polar_id', id);
                this.setState({
                  storedDeviceId: id,
                });
              }
            } catch (e) {
              // saving error
              console.log(e);
            }
          }}
        />

      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    width: window.width,
    height: window.height,
  },
  // see https://stackoverflow.com/questions/50009499/background-with-two-colors-react-native/50011514
  background: {
    position: 'absolute',
    zIndex: -10,
    width: window.width,
    height: 0,
    // borderTopColor: '#fff', //"#bfe5e7",
    // borderRightColor: '#fff', //'#aedde0',
    borderTopColor: "#bfe5e7",
    borderRightColor: '#aedde0',
    borderTopWidth: window.height,
    borderRightWidth: window.width,
  },
  txtTop: {
    // margin: 10,
    marginTop: 20,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',    
  },
  txt: {
    // margin: 10,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  scroll: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    margin: 10,
  },
  row: {
    margin: 10
  },
});
