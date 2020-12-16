import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Overlay from './Overlay';
import CircleLoader from './CircleLoader';

export default class LoaderOverlay extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // componentDidMount() {
  //   console.log('showing loader');
  // }

  // componentWillUnmount() {
  //   console.log('hiding loader');
  // }


  render() {
    return (
      <Overlay show={this.props.show}>
        <View style={{
          flex: 1,
          // width: '100%',
          // height: '100%',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          // backgroundColor: 'red',
        }}>
          <Text style={{
            marginBottom: 20,
            color: 'white',
            fontSize: 30,
            fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier',
          }}>
            {this.props.text}
          </Text>
          <CircleLoader size="100" color="white" />
        </View>
      </Overlay>
    );
  }
};