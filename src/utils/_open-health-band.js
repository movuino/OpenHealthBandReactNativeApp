const prefix = '28b967f0';
const suffix = '4309-b2de-3d4e0e9f2542';
const getFullUUID = (shortUUID) => `${prefix}-${shortUUID}-${suffix}`;

const service = getFullUUID('0000');
const versionCharacteristic = getFullUUID('1001');
const streamCharacteristic = getFullUUID('1002');
const hrCharacteristic = getFullUUID('1003');

export {
  service,
  versionCharacteristic,
  streamCharacteristic,
  hrCharacteristic,
};