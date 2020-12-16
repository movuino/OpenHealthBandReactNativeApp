import React from 'react';
import { StyleSheet, View, Text, Switch } from 'react-native';
import ExpandToggle from './ExpandToggle';
import AnimatedView from './AnimatedView';
import { descriptions } from '../utils/streams';
import mainStyles from '../styles/main';

export default class Stream extends React.Component {
  constructor(props) {
    super(props);

    this.lastSetStateDate = 0;
    this.minSetStateInterval = 50;

    this.state = {
      data: {},
      blinking: false,
      showSignal: false,
    };
    this.blinkTimeout = null;
    this.blinkDuration = 100;

    this.stream = this.props.device.streams[this.props.stream];
    this.dataStreamId = `stream:${this.props.stream}:data`;
    this.onNewData = this.onNewData.bind(this);
  }

  onNewData(data) {
    const now = Date.now();

    if (now - this.lastSetStateDate > this.minSetStateInterval) {
      if (this.blinkTimeout !== null) {
        clearTimeout(this.blinkTimeout);
      }

      this.setState({ data: data.samples[0], blinking: true });

      this.blinkTimeout = setTimeout(() => {
        this.setState({ blinking: false });
        this.blinkTimeout = null;
      }, this.blinkDuration);

      this.lastSetStateDate = now;
    }
  }

  componentDidMount() {
    this.props.device.addListener(this.dataStreamId, this.onNewData);
  }

  componentWillUnmount() {
    if (this.blinkTimeout !== null) {
      clearTimeout(this.blinkTimeout);
      this.blinkTimeout = null;
    }

    this.props.device.removeListener(this.dataStreamId, this.onNewData);
  }

  render() {
    const { type, model } = this.props.device.scanResult.meta;
    const desc = descriptions[type][model].streams[this.props.stream];

    const dimensions = []
    Object.keys(desc.sample).forEach(k => {
      // console.log(this.state.data[k]);
      dimensions.push(
        <View
          key={k}
          style={styles.dimension}>
          <Text
            style={[
              mainStyles.text,
              styles.dimensionName
            ]}>
            { k }
          </Text>
          <Text style={{ textAlign: 'center' }}>
            {
              [ undefined, null ].indexOf(this.state.data[k]) === -1
              ? `${this.state.data[k]}`
              : '' 
            }
          </Text>
        </View>
      );
    });

    return (
      <View style={{ flex: 1, width: '100%' }}>

        <View style={{ flex: 1, flexDirection: 'row', width: '100%' }}>
          <View style={{ width: 100, flexDirection: 'row', alignItems: 'center' }}>
            <Switch
              onValueChange={() => {
                const stream = this.props.device.streams[this.props.stream];
                if (this.stream.ready) {
                  this.props.device.setStream(this.props.stream, {
                    enabled: !this.stream.enabled,
                  });
                  this.setState({});
                }
              }}
              value={
                this.stream.ready && this.stream.enabled
              }/>
            <Text
              style={{
                color: 'black',
                fontSize: 16,
                fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier'
              }}>
              { desc.label }
            </Text>
            <View style={{
              marginLeft: 'auto',
              width: 8,
              height: 8,
              borderRadius: 50,
              backgroundColor: this.state.blinking ? '#ffa500' : '#ccc',
            }}>
            </View>
          </View>

          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end' }}>
            <ExpandToggle
              style={{ marginLeft: 'auto' }}
              size="35"
              enabled={this.stream.displaying}
              onPress={enabled => {
                this.props.device.setStream(this.props.stream, {
                  displaying: enabled,
                });
                this.setState({});
              }}/>
          </View>
        </View>

        <View style={{ flex: 1, width: '100%' }}>
          <AnimatedView
            style={{ flex: 1, position: 'relative', borderRadius: 17.5, overflow: 'hidden' }}
            /*
            animation={{
              prop: 'opacity',
              mount: 0,
              active: 1,
              unmount: 0,
              duration: 1000,
            }}
            //*/
            show={this.stream.displaying}>

            { dimensions }

          </AnimatedView>
        </View>

      </View>
    );

    /*
    return (
      <View style={styles.stream}>
        <Text style={[
          mainStyles.text,
          mainStyles.subtitle,
          styles.title
        ]}>
          { desc.label }
        </Text>
        <View style={styles.dimensions}>
          { dimensions }
        </View>
      </View>
    );
    //*/
  }
};

const styles = StyleSheet.create({
  title: {
    padding: 10,
    color: 'black',
  },
  stream: {
    marginTop: 10,
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderRadius: 10,
    overflow: 'hidden',
  },
  dimensions: { // dimensions wrapper
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    overflow: 'hidden',
  },
  dimensionName: {
    left: 10,
    top: 2,
    fontSize: 12,
  },
  dimension: {
    height: 66,
    backgroundColor: '#eee',
    borderWidth: 1.5,
    borderColor: 'white',
  }
});