import React, { Component } from 'react';
import { StyleSheet, Text, Pressable, View } from 'react-native';

export default class DevicePreview extends Component {
  constructor(props) {
    super(props);
    this.state = { disabled: false, pressed: false };
  }

  onPressIn() {
    this.setState({ pressed: true });
  }

  onPressOut() {
    this.setState({ pressed: false });
  }

  render() {
    return (
      <Pressable style={styles.pressable}
        disabled={this.state.disabled}
        onPressIn={this.onPressIn.bind(this)}
        onPressOut={this.onPressOut.bind(this)}
        onPress={() => {
          this.setState({ disabled: true }, this.props.onPress);
        }}>

        <View style={[
          styles.view,
          this.state.pressed ? styles.pressed : styles.released,
        ]}>
          <Text style={styles.text}>
            { this.props.device.name }
          </Text>
        </View>

      </Pressable>
    );
  }
};

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
  },
  view: {
    borderRadius: 10,
    marginBottom: 10,
    padding: 20,
  },
  pressed: {
    backgroundColor: '#ccc',
  },
  released: {
    backgroundColor: 'white',
  },
  text: {
    fontSize: 20,
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier',
  },
});