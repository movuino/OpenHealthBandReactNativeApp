import React from 'react';
import { View, Switch, Text } from 'react-native';

export default class DeviceSwitch extends React.Component {
  constructor(props) {
    super(props);

    this.state = { blinking: false };
    this.timeout = null;
    
    this.dataStreamId = `stream:${this.props.stream}:data`;
    this.onNewData = this.onNewData.bind(this);
  }

  onNewData(data) {
    if (this.timeout !== null) {
      clearTimeout(this.timeout);
    }

    this.setState({ blinking: true });

    this.timeout = setTimeout(() => {
      this.setState({ blinking: false });
      this.timeout = null;
    }, 100);
  }

  componentDidMount() {
    this.props.device.addListener(this.dataStreamId, this.onNewData);
  }

  componentWillUnmount() {
    if (this.timeout !== null) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    this.props.device.removeListener(this.dataStreamId, this.onNewData);
  }

  render() {
    return (
      <View style={{ width: 100, flexDirection: 'row', alignItems: 'center' }}>
        <Switch
          onValueChange={() => {
            const stream = this.props.device.streams[this.props.stream];
            if (stream.ready) {
              this.props.device.setStream(this.props.stream, {
                enabled: !stream.enabled,
              });
              this.setState({});
            }
          }}
          value={
            this.props.device.streams[this.props.stream].enabled &&
            this.props.device.streams[this.props.stream].ready
          }
        />
        <Text> { this.props.label } </Text>
        <View style={{
          marginLeft: 'auto',
          width: 8,
          height: 8,
          borderRadius: 50,
          backgroundColor: this.state.blinking ? '#ffa500' : '#ccc',
        }}>
        </View>
      </View>
    );
  }
};
