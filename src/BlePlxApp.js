import React, { Component } from 'react';
import {
  StyleSheet,
  //Text,
  //TextInput,
  View,
  // TouchableHighlight,
  // NativeEventEmitter,
  // NativeModules,
  Platform,
  PermissionsAndroid,
  // ScrollView,
  AppState,
  // FlatList,
  Dimensions,
  // Button,
  // SafeAreaView
} from 'react-native';

import ObcsButton from './components/ObcsButton';
import SignalPlotter from './components/SignalPlotter';
import StatusBar from './components/StatusBar';
import PromptTextOverlay from './components/PromptTextOverlay';

import { BleManager } from 'react-native-ble-plx';
import PolarBleSdk from 'react-native-polar-ble-sdk';
import RNFetchBlob from 'rn-fetch-blob';
import AsyncStorage from '@react-native-community/async-storage';
import { getStringDate } from './utils/date-utils';

import * as ohb from './utils/open-health-band';

const window = Dimensions.get('window');

export default class App extends Component {
  constructor() {
    super();

    this.state = {
      scanning: false,
      devices: new Map(),
    };
  }

  async startScanning() {
    this.setState({ scanning: true });
    this.manager.startDeviceScan(null, null, (err, device) => {
      if (err) {
        return;
      }

      if (device.name === 'OpenHealthBand-9CE4') {
        // delete device._manager; // displays a lot of error codes we don't really care about
        // console.log(device);
        this.stopScanning();
        device.connect()
        .then(() => {
          return device.discoverAllServicesAndCharacteristics();
        })
        .then(() => {
          // console.log(await device.isConnected());
          console.log(device.mtu);
          device.monitorCharacteristicForService(ohb.service, ohb.streamCharacteristic, (err, data) => {
            if (!err) {
              const str = atob(data.value);
              const bytes = new UintArray(str.length);
              for (let i = 0; i < str.length; i++) {
                bytes.push(str.charCodeAt(i));
              }
              const value = new Int16Array(bytes.buffer);
              console.log(value);

            }
          });
        })
        .catch((err) => { console.error(err); });
    }
    });
  }

  stopScanning() {
    this.setState({ scanning: false });
    this.manager.stopDeviceScan();
  }

  async componentDidMount() {
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
    }

    console.log('creating ble manager');
    this.manager = new BleManager();
  }

  async componentWillUnmount() {
    console.log('destroying ble manager');
    this.manager.destroy();
  }

  render() {
    return (
      <View style={styles.container}>
        <ObcsButton
          text={this.state.scanning ? 'stop scan' : 'start scan' }
          onPress={() => {
            if (this.state.scanning) {
              this.stopScanning()
            } else {
              this.startScanning();
            }
          }} />
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    width: window.width,
    height: window.height,
  },
});