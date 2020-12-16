import React, { Component } from 'react';
import { Provider } from 'react-redux';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Platform,
  PermissionsAndroid,
  AppState,
  // useWindowDimensions,
  Dimensions,
} from 'react-native';

import axios from 'axios';

import AddButton from './components/AddButton';
import ScanOverlay from './components/ScanOverlay';
import LoaderOverlay from './components/LoaderOverlay';
import Device from './components/Device';
import MenuBar from './components/MenuBar';
import MenuPage from './components/MenuPage';
import Streams from './components/Streams';
import Recorder from './components/Recorder';
import Upload from './components/Upload';

import BleManager from 'react-native-ble-manager';
import BleScanner from './utils/BleScanner';
import Devices from './utils/Devices';

import store from './store';

/*
import { setNativeExceptionHandler } from "react-native-exception-handler";

const exceptionhandler = (exceptionString) => {
  // your exception handler code here
  console.log(exceptionString);
};

setNativeExceptionHandler(
  exceptionhandler,
  // forceAppQuit,
  // executeDefaultHandler
);
//*/

const window = Dimensions.get('window');

// export default () => {
//   const window = useWindowDimensions();
//   return (
//     <App width={window.width} height={window.height}/>
//   );
// }

export default class App extends Component {
// class App extends Component {
  constructor() {
    super();

    this.state = {
      scanning: false,
      displayScan: false,
      scanResults: new Map(),
      displayLoader: false,
      loaderText: '',
      enabledMenuItem: null,
    }
  }

  async componentDidMount() {
    // for debug mode when hot reload
    this.setState({ displayLoader: false });
    this.setState({ displayScan: false });

    await this.checkAndRequestPermissions();

    BleScanner.addListener('state', state => {
      const { scanning, scanResults } = state;
      this.setState({ scanning, scanResults });
    });

    try {
      const page = await axios.get('https://www.google.com');
    } catch (e) {
      console.log('could not load page, check your connection and retry');
    }
  }

  componentDidUpdate(prevProps, prevState) {

  }

  componentWillUnmount() {
    BleScanner.removeListeners();
    BleManager.checkState();
  }

  async checkAndRequestPermissions() {
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
  }

  render() {
    const devices = [];
    Devices.devices.forEach((d, id) => {
      if (d.state.added) {
        devices.push(
          <Device
            key={id}
            device={d}
            onRemove={async () => {
              await Devices.remove(id);
              this.setState({});
            }}/>
        );
      }
    });

    return (
      <Provider store={store}>
      <View style={[
        styles.container, {
          // width: this.props.width,
          // height: this.props.height,
        },
      ]}>

        <View
          style={{
            flex: 0,
            margin: 10,
            alignSelf: 'center',
            justifyContent: 'center',
          }}>
          <AddButton 
            size="80"
            onPress={async () => {
              await BleScanner.startScan();
              this.setState({ displayScan: true });
            }}/>
        </View>

        <ScrollView style={{ flex: 1, padding: 10 }}>
          { devices }
        </ScrollView>

        <MenuPage show={this.state.enabledMenuItem === 'signal'}>
          <Streams
            devices={Devices.devices}/>
        </MenuPage>

        <MenuPage show={this.state.enabledMenuItem === 'record'}>
          <Recorder />
        </MenuPage>

        <MenuPage show={this.state.enabledMenuItem === 'share'}>
          <Upload />
        </MenuPage>

        <View style={{ height: 60, backgroundColor: '#1a1a1a' }}>
          <MenuBar
            onPress={(enabledMenuItem) => {
              console.log('enabled menu item : ' + enabledMenuItem);
              this.setState({ enabledMenuItem });
            }}/>
        </View>

        <ScanOverlay
          scanning={this.state.scanning}
          show={this.state.displayScan}
          scanResults={this.state.scanResults}
          devices={Devices.devices}
          onPress={async (res) => {
            console.log('pressed ' + res);

            if (res !== 'cancel') {
              this.setState({ displayLoader: true, loaderText: 'Connecting' });
              const scanResult = this.state.scanResults.get(res);
              try {
                await Devices.add(scanResult);
                // todo : create a global emitter on Devices
                // to avoid many removeListeners on componentWillUnmount
                // ... or maybe listeners are free'd automatically when a device
                // is deleted from the Map
                Devices.devices.get(res).addListener('state', () => {
                  this.setState({}) // triggers a re-render
                });
              } catch (e) {
                // couldn't connect device
              }              
            }

            await BleScanner.stopScan();
            this.setState({ displayScan: false, displayLoader: false });
          }}
          onStartScan={async () => {
            await BleScanner.startScan();
            this.setState({ displayScan: true });
          }}/>

        <LoaderOverlay
          show={this.state.displayLoader}
          text={this.state.loaderText}/>
      </View>
      </Provider>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
    width: window.width,
    height: window.height,
  },
  menuPage: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 60,
    left: 0,
    backgroundColor: 'blue',
  },
});
