import React, { Component } from 'react';
// import Svg, { Circle, Line } from 'react-native-svg';
import { StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import DotsLoader from './DotsLoader';

export default class AddButton extends Component {
  constructor(props) {
    super(props);
    this.state = { pressed: false };
    this.releasedStroke = 'white';
    this.pressedStroke = 'black';
    this.releasedFill = 'black';
    this.pressedFill = 'white';
  }

  // see https://reactnative.dev/docs/pressable

  onPressIn() {
    this.setState({ pressed: true });
  }

  onPressOut() {
    this.setState({ pressed: false });
  } 

  render() {
    return (
      <TouchableHighlight
        activeOpacity={1}
        underlayColor={'transparent'}
        onPressIn={this.onPressIn.bind(this)}
        onPressOut={this.onPressOut.bind(this)}
        onPress={this.props.onPress}
        style={{ flex: 1 }}
      >

        <View style={[
          styles.buttonBase,
          this.props.scanning ? styles.buttonDisabled : 
          (this.state.pressed ? styles.buttonPressed : styles.button),
        ]}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'center',            
          }}>
            <Text style={[
              styles.buttonTextBase,
              this.props.scanning ? styles.buttonTextDisabled : 
              (this.state.pressed ? styles.buttonTextPressed : styles.buttonText),
            ]}>
              {this.props.scanning ? 'Scanning' : 'Scan'}
            </Text>
            <DotsLoader width="30" color="rgba(255,255,255,0.66)" show={this.props.scanning}/>
          </View>
        </View>
      </TouchableHighlight>
    );
  }
};

const styles = StyleSheet.create({
  // todo : migrate style definitions here 
  buttonBase: {
    flex: 1,
    // width: '100%',
    // height: '100%',
    flexDirection: 'row',
    // alignSelf: 'stretch',
    alignItems: 'center',
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
    backgroundColor: 'transparent',
    // backgroundColor: 'rgba(255,255,255,0.2)',
    // borderColor: 'rgba(255,255,255,0.3)',
  },
  buttonTextBase: {
    fontSize: 25,
    // fontWeight: 'bold',
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier',    
  },
  buttonText: {
    color: 'white',
  },
  buttonTextPressed: {
    color: 'black',
  },
  buttonTextDisabled: {
    marginRight: 5,
    color: 'rgba(255,255,255,0.66)',
  },
});