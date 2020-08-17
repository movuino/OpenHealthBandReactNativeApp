import React, { Component } from 'react';
import { StyleSheet, Text, TouchableHighlight, View } from 'react-native';

export default class statusBar extends Component {
  constructor(props) {
    super(props);
    // this.state = {
    //   pressed: false,
    //   text: '',
    // };
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={ styles.title }>
          Polar H10 ECG recorder
        </Text>
        <Text style={ this.props.deviceConnected ? styles.offText : styles.onText }>
          { this.props.deviceConnected ? 'ON' : 'OFF' }
        </Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // flexDirection: 'row',
    height: 50,
    padding: 10,
    paddingRight: 20,
    // textAlign: 'right',
    // alignSelf: 'stretch',
    backgroundColor: '#c00',
    // justifyContent: 'center',
    // paddingHorizontal: 10,
  },
  title: {
    // flex: 1,
    position: 'absolute',
    padding: 10,
    top: 0,
    textAlign: 'left',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#eee',
  },
  offText: {
    // flex: 1,
    //position: 'absolute',
    top: 0,
    textAlign: 'right',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#eee',
  },
  onText: {
    // flex: 1,
    //position: 'absolute',
    top: 0,
    textAlign: 'right',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#eee'
  },
});