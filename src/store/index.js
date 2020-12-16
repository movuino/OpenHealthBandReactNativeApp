import { createStore, combineReducers } from 'redux';

import navigationReducer from './navigationReducer';
import devicesReducer from './devicesReducer';

const rootReducer = combineReducers({
  navigation: navigationReducer,
  devices: devicesReducer,
});

export default createStore(rootReducer);