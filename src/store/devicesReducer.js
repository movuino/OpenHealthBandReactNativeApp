import Devices from '../utils/Devices';

const initialState = {
  devices: Devices.devices,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case 'add':
      return state;
    case 'remove':
      return state;
    default:
      return state;
  }
};
