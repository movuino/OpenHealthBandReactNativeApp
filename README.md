# OpenHealthBandReactNativeApp

React Native App for the Open Health Band

### Build requirements

* Follow the [environment setup steps](https://reactnative.dev/docs/environment-setup). I use React Native CLI on mac OSX for this project, and only built Android versions so far.
* Clone this repository with the `--recursive` option to include the [`react-native-polar-ble-sdk`](https://github.com/josephlarralde/react-native-polar-ble-sdk) plugin (it is not included as an npm module yet, as it is easier to commit changes to the submodule directly during development and keep its repository up to date rather than using npm link which doesn't seem to work properly).
* run `npm install`
* run `npm run android` to run a debug version on a connected Android device

### Notes

This repository was created with the `npx react-native init ...` command.

The `react-native-polar-ble-sdk` plugin was created using the [`create-react-native-module`](https://github.com/brodybits/create-react-native-module) tool.

At the moment of this writing, both the `react-native-polar-ble-sdk` and the `react-native-ble-manager` plugins don't seem to play together very well. This needs to be sorted out, maybe by incorporating the required functionnalities for the Open Health Band into the native polar plugin and dropping the ble manager plugin ...

The following libs are required for the implementation of navigation :

```json
"dependencies": {
    "@react-native-community/masked-view": "^0.1.10",
    "@react-navigation/native": "^5.8.10",
    "@react-navigation/stack": "^5.12.8",
    "react-native-gesture-handler": "^1.8.0",
    "react-native-reanimated": "^1.13.2",
    "react-native-safe-area-context": "^3.1.9",
    "react-native-screens": "^2.15.0",
}
```

#### iOS

You will need XCode and CocoaPods installed to build a React Native project.
If you have Xcode version 12 or later, you will also need Carthage (a package management alternative to CocoaPods) to rebuild Polar's SDK, and **provide your admin password at some point of the process**.

### Encountered issues

I had to follow [this step](https://github.com/facebook/react-native/issues/27834#issuecomment-579266193) to get the cocapods installation to work while following react native's [environment setup page](https://reactnative.dev/docs/environment-setup). Then, `npx react-native init ...` and `npx react-native run-android` worked as expected.

At some point I started working on a native Android project and I upgraded Android Studio, which seemed to mess up my gradle version, and the project would no longer build. So I tried to "Gradle Sync" the android project from Android Studio but it didn't work, so then I deleted .gradle and .idea folders from the project root and the project built, recreating the .gradle folder automatically.

Then I followed the guide to writing native modules, starting with the android version of a wrapper for the Polar BLE SDK. I always got the "HMRClient is not a registered callable module" error. Apparently it was because I didn't have to run `npm install` inside the plugin's folder, this caused to load multiple react-native instances or something like that. So : **don't run `npm install` in the plugin's folder**.
See `package.json` :

```json
"dependencies": {
    "react": "16.11.0",
    "react-native": "0.62.2",
    "react-native-ble-manager": "^7.2.0",
    "react-native-polar-ble-sdk": "file:plugins/react-native-polar-ble-sdk"
}
```

It seems mandatory (for some weird reason) that the plugin is placed in a folder **inside** the root project before being npm installed (and apparently being watched for modifications by the hot reload system). The following does not work : `npm install --save file:../react-native-polar-ble-sdk`

