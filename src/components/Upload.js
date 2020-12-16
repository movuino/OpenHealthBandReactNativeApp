import React, { Component } from 'react';
import { StyleSheet, View, Text } from 'react-native';

export default class Upload extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <View style={ styles.container }>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    margin: 10,
    borderRadius: 10,
    backgroundColor: 'white',
  }
});