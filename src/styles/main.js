import { Platform, StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.8)',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  text: {
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier'
  },
  title: {
    fontSize: 20,
  },
  subtitle: {
    fontSize: 16,
  },
  // active: {
  //   zIndex: 10,
  // },
});
