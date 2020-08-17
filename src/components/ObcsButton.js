import React, { Component } from 'react';
import { StyleSheet, Text, TouchableHighlight, View } from 'react-native';

export default class ObcsButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pressed: false,
      text: '',
    };
  }

  getText() {
    return this.state.text;
  }

  setText(text) {
    this.setState({ text });
  }

  /*
  onPress() {
    if (typeof this.props.onPress !== 'object') {
      console.log('press');
      this.props.onPress();
    }
  }
  //*/

  // onLongPress() {
  //   console.log('long press');
  // }

  onHideUnderlay() {
    this.setState({ pressed: false });
  }

  onShowUnderlay() {
    this.setState({ pressed: true });
  }

  render() {
    const { stuff } = this.state;
    return (
      <View style={this.props.style}>
        <TouchableHighlight
          disabled={this.props.disabled}
          activeOpacity={1}
          underlayColor={'#fce5b9'}
          style={[
            styles.buttonBase,
            this.props.disabled ? styles.buttonDisabled : 
            (this.state.pressed ? styles.buttonPressed : styles.button),
          ]}
          onHideUnderlay={ this.onHideUnderlay.bind(this) }
          onShowUnderlay={ this.onShowUnderlay.bind(this) }
          onPress={ this.props.onPress }
          //onPress={ this.onPress.bind(this) }
          //onLongPress={ this.onLongPress.bind(this) }
        >
          <Text style={ this.props.disabled ? styles.buttonDisabledText : styles.buttonText }>
            {this.props.text}
          </Text>
        </TouchableHighlight>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // justifyContent: 'center',
    // paddingHorizontal: 10,
  },
  buttonBase: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    paddingLeft: 20,
    paddingRight: 20,
    borderRadius: 50,
  },
  button: {
    backgroundColor: '#f7b42a',
  },
  buttonPressed: {
    // backgroundColor: '#ffc63c',
  },
  buttonDisabled: {
    backgroundColor: '#fce5b9',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1c29',
  },
  buttonDisabledText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#afb0b4',
  },
});