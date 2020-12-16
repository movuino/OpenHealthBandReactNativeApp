import React, { Component } from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { StyleSheet, TouchableHighlight } from 'react-native';

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
    // this.props.onPress();
  } 

  render() {
    return (
      <TouchableHighlight
        underlayColor={'transparent'}
        onPressIn={this.onPressIn.bind(this)}
        onPressOut={this.onPressOut.bind(this)}
        onPress={this.props.onPress}
      >
        <Svg
          width={this.props.size || 80} height={this.props.size || 80}
          viewBox="0 0 100 100"
          stroke={this.releasedStroke}
          strokeWidth={2 * 100 / (this.props.size || 80)}>
          <Circle 
            cx="50"
            cy="50"
            r="47"
            // stroke={this.state.pressed ? 'white' : 'black'}
            stroke="white"
            // fillOpacity={this.state.pressed ? 1 : 1}
            fill={
              this.state.pressed ? this.pressedFill : this.releasedFill
            } />
          <Line
            x1="57" y1="35"
            x2="37" y2="50"
            stroke={
              this.state.pressed ? this.pressedStroke : this.releasedStroke
            } />
          <Line
            x1="37" y1="50"
            x2="57" y2="65"
            stroke={
              this.state.pressed ? this.pressedStroke : this.releasedStroke
            } />
        </Svg>
      </TouchableHighlight>
    );
  }
};

const styles = StyleSheet.create({
  // todo : migrate style definitions here 
});