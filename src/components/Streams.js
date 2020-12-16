import React, { Component } from 'react';
import { Platform, StyleSheet, View, ScrollView, Text } from 'react-native';
import Stream from './Stream';
import { descriptions } from '../utils/streams';

export default class Streams extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
    };
  }

  render() {
    const devices = [];

    this.props.devices.forEach((d, id) => {
      const { name, meta } = d.scanResult;
      const { type, model } = meta;
      const streamDescriptions = descriptions[type][model].streams;

      const streams = [];

      Object.keys(streamDescriptions).forEach(s => {
        if (d.streams[s].streaming) {
          streams.push(
            <Stream
              key={`${id}:${s}`}
              device={d}
              stream={s}/>
          );
        }
      });

      devices.push(
        <View
          key={id}
          style={styles.device}>
          <Text style={styles.title}>
            { name }
          </Text>
          <View style={{}}>
            { streams }
          </View>
        </View>
      );
    });

    return (
      <ScrollView>
      {/*<ScrollView style={{ width: '100%' }}>*/}
        { devices }
      </ScrollView>
    );
  }
};

const styles = StyleSheet.create({
  title: {
    color: 'black',
    fontSize: 20,
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier'
  },
  device: {
    padding: 10,
    margin: 10,
    // paddingBottom: 0,
    borderRadius: 10,
    backgroundColor: 'white',
  },
});