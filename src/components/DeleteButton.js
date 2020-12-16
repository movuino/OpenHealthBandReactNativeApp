import React, { Component } from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { StyleSheet, TouchableHighlight } from 'react-native';

export default class AddButton extends Component {
  constructor(props) {
    super(props);
    this.state = { pressed: false };
    this.releasedStroke = 'black';
    this.pressedStroke = 'white';
    this.releasedFill = 'white';
    this.pressedFill = 'black';

    // this.pressedOffset = Math.max(0, 80 - this.props.size) * 0.5;
    this.pressedOffset = this.props.size * 0.25;
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
        style={this.props.style}
        activeOpacity={1}
        underlayColor={'transparent'}
        onPressIn={this.onPressIn.bind(this)}
        onPressOut={this.onPressOut.bind(this)}
        onPress={this.props.onPress}
        hitSlop={{
          top: this.pressedOffset,
          bottom: this.pressedOffset,
          left: this.pressedOffset,
          right: this.pressedOffset,
        }}>
        <Svg
          width={this.props.size || 80} height={this.props.size || 80}
          viewBox="0 0 100 100"
          // stroke={this.releasedStroke}
          stroke="white"
          strokeWidth={2 * 100 / (this.props.size || 80)}>
          <Circle 
            cx="50"
            cy="50"
            r="47"
            fill={
              this.state.pressed ? this.pressedFill : this.releasedFill
            }/>
          <Line
            x1="35" y1="35"
            x2="65" y2="65"
            stroke={
              this.state.pressed ? this.pressedStroke : this.releasedStroke
            }/>
          <Line
            x1="35" y1="65"
            x2="65" y2="35"
            stroke={
              this.state.pressed ? this.pressedStroke : this.releasedStroke
            }/>
        </Svg>
      </TouchableHighlight>
    );
  }
};

const styles = StyleSheet.create({
  // todo : migrate style definitions here 
});