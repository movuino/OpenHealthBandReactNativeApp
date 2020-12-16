import React from 'react';
import { View, Text } from 'react-native';

export default class FullScreen extends React.Component {
  render() {
    return (
      <View style={{ flex: 1 }}>
        {this.props.children}
      </View>
    );
  }
};