import React, { Component } from 'react';
import { Platform, Text, View } from 'react-native';
import DeleteButton from './DeleteButton';
import Stream from './Stream';
import { descriptions } from '../utils/streams';

// prop.device : device instance returned by utils/Devices class

export default class Device extends Component {
  constructor(props) {
    super(props);

    const { type, model } = this.props.device.scanResult.meta;
    this.streamDescriptions = descriptions[type][model].streams;
    this.state = {
      pressed: false,
    }

    this.refresh = this.refresh.bind(this);
  }

  componentDidMount() {
    this.props.device.addListener('state', this.refresh);
  }

  componentWillUnmount() {
    this.props.device.removeListener('state', this.refresh);
  }

  refresh() {
    this.setState({});
  }

  render() {
    const streams = [];
    Object.keys(this.streamDescriptions).forEach(s => {
      streams.push(
        <Stream
          key={s}
          device={this.props.device}
          stream={s}/>
      );
    });

    return (
      <View
        style={{
          backgroundColor: 'white',
          borderRadius: 10,
          marginBottom: 20,
          padding: 10,
        }}>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text
            style={{
              color: 'black',
              fontSize: 20,
              fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier'
            }}>
            { this.props.device.scanResult.name }
          </Text>
          <View
            style={{
              width: 8,
              height: 8,
              marginLeft: 20,
              borderRadius: 50,
              backgroundColor: this.props.device.state.connectionState === 'connected' ? '#0c0' : '#c00',
            }}>
          </View>
          <DeleteButton
            size="35"
            onPress={this.props.onRemove}
            style={{ flex: 1, alignItems: 'flex-end' }}/>
        </View>

        <View style={{ alignItems: 'flex-start', justifyContent: 'center', paddingTop: 5, }}>
          { streams }
        </View>
      </View>
    );
  }
};