import React, { Component, Fragment } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableWithoutFeedback,
  View,
  ScrollView,
} from 'react-native';
import Overlay from './Overlay';
import DevicePreview from './DevicePreview';
import ScanButton from './ScanButton';
import BackButton from './BackButton';

export default class ScanOverlay extends Component {

  constructor(props) {
    super(props);
    this.state = { pressed: false };
  }

  onHideUnderlay() {
    this.setState({ pressed: false });
  }

  onShowUnderlay() {
    this.setState({ pressed: true });
  }

  render() {
    const { scanResults } = this.props;
    const devices = [];

    scanResults.forEach((p, id) => {
      if (!this.props.devices.has(id) ||
          (this.props.devices.has(id) &&
          !this.props.devices.get(id).state.added)) {
        devices.push(
          <DevicePreview
            key={id}
            peripheral={p}
            onPress={async () => {
              await this.props.onPress(p.id);
            }}/>
        );
      }
    });

    return (
      <Overlay show={this.props.show}>
        <View style={{
          flex: 1,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
        }}>

          <View style={{
            flexDirection: 'row',
            height: 80,
            margin: 10,
          }}>
            <View style={{ marginRight: 10 }}>
              <BackButton
                onPress={async () => { await this.props.onPress('cancel'); }}/>
            </View>
            <ScanButton
              scanning={this.props.scanning}
              onPress={async () => {
                if (!this.props.scanning) await this.props.onStartScan();
              }}/>
          </View>

          <ScrollView style={{ width: '100%' }}>
            <View style={{
              margin: 10,
              marginTop: 0,
              marginBottom: 0,
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
            }}>
              { devices }
            </View>
          </ScrollView>
        </View>
      </Overlay>
    );
  }
};

const styles = StyleSheet.create({
  buttonBase: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'white',
  },
  button: {
    backgroundColor: 'transparent',
  },
  buttonPressed: {
    backgroundColor: 'white',
  },
  buttonDisabled: {
    backgroundColor: 'transparent', // 'rgba(255,255,255,0.2)',
  },
  buttonText: {
    color: 'white',
  },
  buttonTextPressed: {
    color: 'black',
  },
  buttonTextDisabled: {
    color: 'rgba(255,255,255,0.7)',
  },
});
