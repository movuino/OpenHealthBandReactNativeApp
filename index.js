import React from 'react';
import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';

import App from './src/App';
// import App from './src/BlePlxApp';
// import App from './src/BleManagerApp';
// import App from './src/NewApp';

import { Provider } from 'react-redux';
import store from './src/store';

const Wrapper = () => (
  <Provider store={ store }>
    <App />
  </Provider>
);

AppRegistry.registerComponent(appName, () => Wrapper);

// AppRegistry.registerComponent(appName, () => App);
