import React, { Component } from 'react';
import Svg, { Circle } from 'react-native-svg';
import { Animated, Easing, StyleSheet, View } from 'react-native';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default class Loader extends Component {
  constructor(props) {
    super(props);

    this.minr = this.props.minr || 7;
    this.maxr = this.props.maxr || 13;
    this.animDuration = this.props.animDuration || 500;
    this.animInterval = this.props.animInterval || this.animDuration * 0.25;
    this.animPause = this.props.animPause || this.animDuration;

    this.state = {
      // dots: [
      //   new Animated.Value(this.minr),
      //   new Animated.Value(this.minr),
      //   new Animated.Value(this.minr),
      // ],
      dot1: new Animated.Value(this.minr),
      dot2: new Animated.Value(this.minr),
      dot3: new Animated.Value(this.minr),
    };

    const config = {
      useNativeDriver: true,
      duration: this.animDuration * 0.5,
      easing: Easing.linear,
    };

    const animations = Animated.stagger(this.animInterval, [
      Animated.sequence([
        Animated.timing(this.state.dot1, { ...config, toValue: this.maxr }),
        Animated.timing(this.state.dot1, { ...config, toValue: this.minr }),
      ]),
      Animated.sequence([
        Animated.timing(this.state.dot2, { ...config, toValue: this.maxr }),
        Animated.timing(this.state.dot2, { ...config, toValue: this.minr }),
      ]),
      Animated.sequence([
        Animated.timing(this.state.dot3, { ...config, toValue: this.maxr }),
        Animated.timing(this.state.dot3, { ...config, toValue: this.minr }),
      ]),
    ]);

    this.loop = Animated.loop(
      Animated.sequence([
        animations,
        Animated.delay(500),
      ])
    );
  }

  componentDidMount() {
    this.loop.start();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.show && !prevProps.show) {
      this.loop.start();
    }
  }

  componentWillUnmount() {
    this.loop.stop();
  }

  render() {
    // const nbDots = 3;
    // const circles = [];
    // for (let i = 0; i < nbDots; i++) {
    //   circles.push(
    //     <AnimatedCircle cx="20" cy="20" r={this.state.dot1} />
    //   );
    // }

    return (this.props.show || false) && (
      <Svg
        width={this.props.width || 120} height={this.props.width / 3 || 40}
        viewBox="0 0 120 40"
        fill={this.props.color || 'white'}
        strokeWidth="0"
      >
        <AnimatedCircle cx="20" cy="20" r={this.state.dot1} />
        <AnimatedCircle cx="60" cy="20" r={this.state.dot2} />
        <AnimatedCircle cx="100" cy="20" r={this.state.dot3} />
      </Svg>
    );
  }
};

const styles = StyleSheet.create({

});