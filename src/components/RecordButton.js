import React from 'react';
import { Pressable, Animated, StyleSheet, View, Text } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

export default class RecordButton extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      pressed: false,
      recording: false,
      glowValue: new Animated.Value(1),
    };

    const config = {
      useNativeDriver: true,
      duration: 1000,
    };

    this.anim = Animated.sequence([
      Animated.timing(this.state.glowValue, { ...config, toValue: 0.5 }),
      Animated.timing(this.state.glowValue, { ...config, toValue: 1 }),
    ]);
  }

  componentDidMount() {
    const { glowValue } = this.state;
    glowValue.setValue(0);
    this.setState({ glowValue });
  }

  render() {
    return (
      <Pressable
        onPressIn={() => { this.setState({ pressed: true }); }}
        onPressOut={() => { this.setState({ pressed: false }); }}
        onPress={() => {
          this.setState({ recording: !this.state.recording }, () => {
            if (this.state.recording) {
              this.props.onPress('start');
              const { glowValue } = this.state;
              glowValue.setValue(1);
              this.setState({ glowValue }, () => {
                this.glow = Animated.loop(this.anim);
                this.glow.start();
              });
            } else {
              this.props.onPress('stop');
              this.glow.stop();
              const { glowValue } = this.state;
              glowValue.setValue(0);
              this.setState({ glowValue });
            }
          });
        }}>
        <Svg
          width={this.props.size} height={this.props.size}
          viewBox="0 0 100 100"
          fill="white"
          stroke="white"
          strokeWidth={2 * 100 / this.props.size}>

          <AnimatedCircle
            cx="50" cy="50" r="47"
            fill={this.state.pressed ? '#f99' : 'red'}
            fillOpacity={this.state.glowValue}/>

          {
            !this.state.recording &&
            <Circle
              cx="50" cy="50" r="44"
              fill={this.state.pressed ? '#f99' : 'white'}
              stroke="none"/>
          }
          {
            this.state.recording &&
            <Rect
              x="30" y="30" width="40" height="40"
              fill="white"
              stroke="none"/>
          }
        </Svg>
      </Pressable>
    );
  }
}