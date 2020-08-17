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
import BleManager from 'react-native-ble-manager';
// import PolarBleSdk from 'react-native-polar-ble-sdk';
import RNFetchBlob from 'rn-fetch-blob';
// import rnfs from 'react-native-fs';
// import TestRnModule from 'react-native-test-rn-module';

const window = Dimensions.get('window');

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
// const polarEmitter = new NativeEventEmitter(NativeModules.PolarBleSdk);


export default class App extends Component {
  constructor(){
    super()

    this.state = {
      scanning:false,
      peripherals: new Map(),
      appState: ''
    }

    this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this);
    this.handleStopScan = this.handleStopScan.bind(this);
    this.handleUpdateValueForCharacteristic = this.handleUpdateValueForCharacteristic.bind(this);
    this.handleDisconnectedPeripheral = this.handleDisconnectedPeripheral.bind(this);
    this.handleAppStateChange = this.handleAppStateChange.bind(this);
  }

  componentDidMount() {
    // PolarBleSdk.connectToDevice('FD070051');

    AppState.addEventListener('change', this.handleAppStateChange);

    BleManager.start({showAlert: false});

    this.handlerDiscover = bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral );
    this.handlerStop = bleManagerEmitter.addListener('BleManagerStopScan', this.handleStopScan );
    this.handlerDisconnect = bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', this.handleDisconnectedPeripheral );
    this.handlerUpdate = bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', this.handleUpdateValueForCharacteristic );

    /*
    this.polarConnectionListener = polarEmitter.addListener('connectionState', (data) => {
      console.log(`connection state : ${JSON.stringify(data, null, 2)}`);
    });

    this.polarEcgReadyListener = polarEmitter.addListener('ecgFeatureReady', () => {
      // PolarBleSdk.startEcgStreaming();
    });

    this.polarAccReadyListener = polarEmitter.addListener('accelerometerFeatureReady', () => {
      // PolarBleSdk.startAccStreaming();
    });

    this.polarHrDataListener = polarEmitter.addListener('hrData', (data) => {
      console.log(`hr data : ${JSON.stringify(data, null, 2)}`);
    });

    this.polarEcgDataListener = polarEmitter.addListener('ecgData', (data) => {
      console.log(`ecg data : ${JSON.stringify(data, null, 2)}`);
    });


    this.polarAccDataListener = polarEmitter.addListener('accData', (data) => {
      console.log(`acc data : ${JSON.stringify(data, null, 2)}`);
    });
    //*/

    /*
    polarEmitter.addListener('connectionState', (data) => {
      if (data.state === 'connected') {
        console.log(`connectionState : ${JSON.stringify(data, null, 2)}`);
      }
    });

    this.polarListener = polarEmitter.addListener('events', (data) => {
      console.log(`data : ${JSON.stringify(data, null, 2)}`);
      if (data.connectionState === 'connected') {
        // PolarBleSdk.startEcgStreaming();
      }
      if (data.ecgFeatureReady) {
        // PolarBleSdk.startEcgStreaming();
      }

      if (data.accelerometerFeatureReady) {
        // PolarBleSdk.startAccStreaming();
      }
    });
    //*/

    if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
        if (result) {
          console.log("Permission is OK");
        } else {
          PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
            if (result) {
              console.log("User accept");
            } else {
              console.log("User refuse");
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
    }
  }

  handleAppStateChange(nextAppState) {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!')
      BleManager.getConnectedPeripherals([]).then((peripheralsArray) => {
        console.log('Connected peripherals: ' + peripheralsArray.length);
      });
    }
    this.setState({appState: nextAppState});
  }

  componentWillUnmount() {
    this.handlerDiscover.remove();
    this.handlerStop.remove();
    this.handlerDisconnect.remove();
    this.handlerUpdate.remove();

    /*
    this.polarConnectionListener.remove();
    this.polarEcgReadyListener.remove();
    this.polarAccReadyListener.remove();
    this.polarEcgDataListener.remove();
    this.polarAccDataListener.remove();
    this.polarHrDataListener.remove();
    //*/
  }

  handleDisconnectedPeripheral(data) {
    let peripherals = this.state.peripherals;
    let peripheral = peripherals.get(data.peripheral);
    if (peripheral) {
      peripheral.connected = false;
      peripherals.set(peripheral.id, peripheral);
      this.setState({peripherals});
    }
    console.log('Disconnected from ' + data.peripheral);
  }

  handleUpdateValueForCharacteristic(data) {
    console.log('Received data from ' + data.peripheral + ' characteristic ' + data.characteristic, data.value);
  }

  handleStopScan() {
    console.log('Scan is stopped');
    this.setState({ scanning: false });
  }

  startScan() {
    if (!this.state.scanning) {
      //this.setState({peripherals: new Map()});
      BleManager.scan([], 3, true).then((results) => {
        console.log('Scanning...');
        this.setState({scanning:true});
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

  connectToPolar() {
    if (!this.deviceId) return;

    console.log(`will attempt to connect to ${this.deviceId}`);
    // PolarBleSdk.connectToDevice(this.deviceId);    
  }

  // async requestWritePermission() => {
  //   try {
  //     const granted = await PermissionsAndroid.request(
  //       PermissionsAndroid.PERMISSIONS.CAMERA,
  //       {
  //         title: "Cool Photo App Camera Permission",
  //         message:
  //           "Cool Photo App needs access to your camera " +
  //           "so you can take awesome pictures.",
  //         buttonNeutral: "Ask Me Later",
  //         buttonNegative: "Cancel",
  //         buttonPositive: "OK"
  //       }
  //     );
  //     if (granted === PermissionsAndroid.RESULTS.GRANTED) {
  //       console.log("You can use the camera");
  //     } else {
  //       console.log("Camera permission denied");
  //     }
  //   } catch (err) {
  //     console.warn(err);
  //   }
  // }


  writeCsvFile() {
    // const path = rnfs.DownloadDirectoryPath + '/stuff.csv';
    // const content = 'a,b\n0,0\n1,10\n';
    // console.log(path);
    // rnfs.writeFile(path, content, 'utf8')
    // .then(() => { console.log('stuff.csv written :)'); })
    // .catch((error) => {
    //   console.log(error);
    //   console.log('error writing file stuff.csv :(');
    // });

    const fs = RNFetchBlob.fs;
    fs.createFile(fs.dirs.DownloadDir + '/stuff.csv', 'a,b\n', 'utf8')
    .then((res) => { console.log('stuff.csv written successfully !'); })
    .catch((err) => { console.log(err); });
  }

  handleDiscoverPeripheral(peripheral){
    var peripherals = this.state.peripherals;
    console.log('Got ble peripheral', peripheral);
    if (!peripheral.name) {
      peripheral.name = 'NO NAME';
    }
    peripherals.set(peripheral.id, peripheral);
    this.setState({ peripherals });
  }

  test(peripheral) {
    if (peripheral){
      if (peripheral.connected){
        BleManager.disconnect(peripheral.id);
      }else{
        BleManager.connect(peripheral.id).then(() => {
          let peripherals = this.state.peripherals;
          let p = peripherals.get(peripheral.id);
          if (p) {
            p.connected = true;
            peripherals.set(peripheral.id, p);
            this.setState({peripherals});
          }
          console.log('Connected to ' + peripheral.id);


          setTimeout(() => {

            /* Test read current RSSI value
            BleManager.retrieveServices(peripheral.id).then((peripheralData) => {
              console.log('Retrieved peripheral services', peripheralData);

              BleManager.readRSSI(peripheral.id).then((rssi) => {
                console.log('Retrieved actual RSSI value', rssi);
              });
            });*/

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
                        /*
                        var PizzaBakeResult = {
                          HALF_BAKED: 0,
                          BAKED:      1,
                          CRISPY:     2,
                          BURNT:      3,
                          ON_FIRE:    4
                        };*/
                      });
                    });

                  }, 500);
                }).catch((error) => {
                  console.log('Notification error', error);
                });
              }, 200);
            });

          }, 900);
        }).catch((error) => {
          console.log('Connection error', error);
        });
      }
    }
  }

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

          <View style={{margin: 10}}>
            <ObcsButton onPress={() => this.writeCsvFile() } />
          </View>

          <View style={{margin: 10}}>
            <Button title={btnScanTitle} onPress={() => this.startScan() } />
          </View>

          <View style={{margin: 10}}>
            <Button title="Retrieve connected peripherals" onPress={() => this.retrieveConnected() } />
          </View>

          <View style={{margin: 10}}>
            <TextInput style={styles.txtfld} title="type in your H10 ID ..." onChangeText={(text) => {
              this.deviceId = text;
            }} />
          </View>

          <View style={{margin: 10}}>
            <Button title="Connect to Polar" /*onPress={() => this.connectToPolar() }*/ />
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
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    width: window.width,
    height: window.height
  },
  txtfld: {
    margin: 0,
    lineHeight: 0,
    paddingTop: 0,
    paddingBottom: 0,
    borderColor: "#000",
    borderWidth: 1,
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
