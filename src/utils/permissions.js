import {
  Platform,
  PermissionsAndroid,
} from 'react-native';

export const checkAndRequestPermissions = async () => {
  if (Platform.OS === 'android' && Platform.Version >= 23) {
    let coarsePerm = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION);
    if (coarsePerm !== PermissionsAndroid.RESULTS.GRANTED) {
      coarsePerm = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION, {
        title: 'Access Coarse Location',
        message: 'the app needs access to your coarse location for the BLE to work',
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Cancel",
        buttonPositive: "OK"
      });
    }
    if (!coarsePerm) { /* notify the user that the app won't work properly */ }

    // fine location is required now for ble to work (check if coarse can be safely removed)
    // see https://github.com/innoveit/react-native-ble-manager/issues/655#issuecomment-673933665
    let finePerm = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
    if (finePerm !== PermissionsAndroid.RESULTS.GRANTED) {
      finePerm = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
        title: 'Access Fine Location',
        message: 'the app needs access to your fine location for the BLE to work',
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Cancel",
        buttonPositive: "OK"
      });
    }
    if (!finePerm) { /* notify the user that the app won't work properly */ }

    let backgroundPerm = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION);
    if (backgroundPerm !== PermissionsAndroid.RESULTS.GRANTED) {
      backgroundPerm = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION, {
        title: 'Access Fine Location',
        message: 'the app needs access to your background location for the BLE to work',
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Cancel",
        buttonPositive: "OK"
      });
    }
    if (!backgroundPerm) { /* notify the user that the app won't work properly */ }

    let writePerm = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
    if (writePerm !== PermissionsAndroid.RESULTS.GRANTED) {
      writePerm = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE, {
        title: 'Allow Write to External Storage',
        message: 'the app needs to write to external storage to work properly',
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Cancel",
        buttonPositive: "OK"
      });
    }
    if (!writePerm) { /* notify the user that the app won't work properly */ }
  }    
};
