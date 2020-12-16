import React from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setNextRoute } from '../store/navigationActions';

import AnimatedView from '../components/AnimatedView';
import AddButton from '../components/AddButton';
import CircleLoader from '../components/CircleLoader';
import Device from '../components/Device';
import DevicePreview from '../components/DevicePreview';
import BottomMenu from '../components/BottomMenu';

import BleManager from 'react-native-ble-manager';
import BleScanner from '../utils/BleScanner';
import Devices from '../utils/Devices';

class DevicesPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      scanning: false,
      scanResults: new Map(),
      displayScan: false,
    };
  }

  async componentDidMount() {
    BleScanner.addListener('state', state => {
      const { scanning, scanResults } = state;
      // console.log('scanner state updated :');
      // console.log(scanning);
      // console.log(scanResults);
      this.setState({ scanning, scanResults });
    });

    // Devices.addListener('state', () => {
    //   this.setState({});
    // });
    // this.initialized = true;
  }

  componentWillUnmount() {
    BleScanner.removeListeners();
    BleManager.checkState();
  }

  render() {
    const devices = [];
    const devicePreviews = [];

    Devices.devices.forEach((d, id) => {
      if (d.state.added) {
        devices.push(
          <Device
            key={id}
            device={d}
            onRemove={async () => {
              await Devices.remove(id);
              this.setState({});
            }}/>
        );
      }
    });

    this.state.scanResults.forEach((p, id) => {
      if (!Devices.devices.has(id) ||
          (Devices.devices.has(id) && !Devices.devices.get(id).state.added)) {
        devicePreviews.push(
          <DevicePreview
            key={id}
            device={p}
            onPress={async () => {
              this.setState({ displayLoader: true });
              const scanResult = this.state.scanResults.get(id);
              try {
                await Devices.add(scanResult);
              } catch (e) {
                // couldn't connect device
              }              

              await BleScanner.stopScan();
              this.setState({ displayScan: false, displayLoader: false });
            }}/>
        );
      }
    });

    return (
      <View style={{ flex: 1, backgroundColor: 'black' }}>
        <View style={{ flex: 1 }}>
          <View
            style={{
              flex: 0,
              margin: 10,
              alignSelf: 'center',
              justifyContent: 'center',
            }}>
            <AddButton 
              size="80"
              onPress={async () => {
                await BleScanner.startScan();
                this.setState({ displayScan: true });
              }}/>
          </View>

          <ScrollView
            style={{
              flex: 1,
              padding: 10,
            }}>
            { devices }
          </ScrollView>

          <View
            style={{
              // position: 'absolute',
              // bottom: 0,
              // width: '100%',
              height: 80,
            }}>
            <BottomMenu
              items={[
                {
                  icon: 'record',
                  onPress: () => {
                    if (Devices.hasActiveStreams()) {
                      this.props.setNextRoute('record');
                    } else {
                      this.props.toast({
                        id: Date.now(),
                        message: 'You need at least one active stream to record',
                        duration: 1200,
                      });
                    }
                  },
                },
                {
                  icon: 'share',
                  onPress: () => { this.props.setNextRoute('share'); },
                },
              ]}/>
          </View>
        </View>

        <AnimatedView show={this.state.displayScan}>
          <ScrollView
            style={{
              flex: 1,
              padding: 10,
              backgroundColor: 'rgba(0,0,0,0.8)',
            }}>
            { devicePreviews }
          </ScrollView>

          <View style={{ height: 80 }}>
            <BottomMenu
              items={[
                {
                  icon: 'back',
                  onPress: async () => {
                    await BleScanner.stopScan();
                    this.setState({ displayScan: false });
                  }
                },
                {
                  icon: this.state.scanning ? 'animatedDots' : 'reload',
                  onPress: async () => {
                    if (!this.state.scanning) { await BleScanner.startScan(); }
                  }
                }
              ]}/>
          </View>
        </AnimatedView>

        <AnimatedView show={this.state.displayLoader}>
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.8)',
            }}>
            <CircleLoader size="100" color="white"/>
          </View>
        </AnimatedView>
      </View>
    );
  }
};

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    setNextRoute,
  }, dispatch)
);

export default connect(null, mapDispatchToProps)(DevicesPage);
