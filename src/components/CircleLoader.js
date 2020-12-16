import React, { Component } from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { Animated, Easing, StyleSheet, View } from 'react-native';

const AnimatedPath = Animated.createAnimatedComponent(Path);

export default class CircleLoader extends Component {
  constructor(props) {
    super(props);

    this.state = {
      a: new Animated.Value(-1),
    };

    this.state.a.addListener(({ value }) => {
      this.state.a._value = value;
      this.setState({});
    });

    const config = {
      useNativeDriver: false,
      easing: Easing.linear,
    };

    this.loop = Animated.loop(
      Animated.timing(this.state.a, {
        ...config, duration: 6000, toValue: 1
      })
    ); 
  }

  componentDidMount() {
    this.loop.start();
  }

  componentWillUnmount() {
    this.loop.stop();
  }

  render() {
    const a = this.state.a._value * Math.PI * 2;

    const x1 = Math.cos(a) * 45 + 50;
    const y1 = Math.sin(a) * 45 + 50;
    const x2 = 95;
    const y2 = 50;

    const direction = a < 0;
    const distance = Math.abs(a);

    const path = `
      M ${x1} ${y1}
      A 45 45 0
      ${distance < Math.PI  ? 1 : 0}
      ${direction ? 0 : 1}
      ${x2} ${y2}
    `;

    return (
      <Svg
        width={this.props.size || 80}
        height={this.props.size || 80}
        viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
        <AnimatedPath
          d={path}
          stroke={this.props.color || 'white'}
          strokeLinecap="round"
          strokeWidth="2"/>
      </Svg>
    );
  }
};