import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Animated, StyleSheet, Pressable } from 'react-native';

export default class AddButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pressed: false,
      enabled: this.props.enabled || false,
      // size: new Animated.Value(1),
    };
    this.releasedStroke = 'black';
    this.pressedStroke = '#ccc';
    this.releasedFill = '#eee';
    this.pressedFill = '#fff';
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
      <Pressable
        style={this.props.style || {}}
        onPressIn={this.onPressIn.bind(this)}
        onPressOut={this.onPressOut.bind(this)}
        onPress={() => {
          this.setState({ enabled: !this.state.enabled }, () => {
            this.props.onPress(this.state.enabled);
          });
        }}>
        <Svg
          width={this.props.size || 80} height={this.props.size || 80}
          viewBox="0 0 100 100"
          stroke={this.releasedStroke}
          strokeWidth={2 * 100 / (this.props.size || 80)}>
          <Circle
            cx="50" cy="50" r="47"
            stroke="none"
            fill={
              this.state.pressed ? this.pressedFill : this.releasedFill
            }/>
          <Line
            x1="50" y1={this.state.enabled ? 50 : 30}
            x2="50" y2={this.state.enabled ? 50 : 70}
            stroke={
              this.state.pressed ? this.pressedStroke : this.releasedStroke
            }/>
          <Line
            x1="30" y1="50"
            x2="70" y2="50"
            stroke={
              this.state.pressed ? this.pressedStroke : this.releasedStroke
            }/>
        </Svg>
      </Pressable>
    );
  }
};

const styles = StyleSheet.create({
  // todo : migrate style definitions here 
});