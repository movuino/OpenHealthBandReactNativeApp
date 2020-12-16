# OpenHealthBandReactNativeApp

React Native App for Movuino and Polar BLE devices data logging

### Build requirements

* Follow the [environment setup steps](https://reactnative.dev/docs/environment-setup). I use React Native CLI on OSX for this project.
* Clone this repository with the `--recursive` option to include the [`react-native-polar-ble-sdk`](https://github.com/josephlarralde/react-native-polar-ble-sdk) plugin (it is not included as an npm module yet, as it is easier to commit changes to the submodule directly during development and keep its repository up to date rather than using npm link which doesn't seem to work properly).
* run `npm install`
* run `npm run android` to run a debug version on a connected Android device, or `npm run ios` to build a debug version for iphone, then run it by opening `ios/OpenHealthBandReactNativeApp.xcworkspace` in XCode and hitting the "run" button with a development iphone connected.

### Notes

This repository was created with the `npx react-native init ...` command.

The `react-native-polar-ble-sdk` plugin was created using the [`create-react-native-module`](https://github.com/brodybits/create-react-native-module) tool.

#### iOS

You will need XCode and CocoaPods installed to build a React Native project.
If you have Xcode version 12 or later, you will also need Carthage (a Swift
package management alternative to CocoaPods) to rebuild Polar's SDK,
and **provide your admin password at some point of the process**.

#### TODO's

* debug iOS version (latest plugin version not tested yet)
