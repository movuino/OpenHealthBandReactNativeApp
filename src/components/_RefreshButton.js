import React, { Component } from 'react';
import Svg, { G, Path, Circle, Rect } from 'react-native-svg';
import { Animated, Easing, StyleSheet, TouchableHighlight } from 'react-native';

const AnimatedG = Animated.createAnimatedComponent(G);

export default class AddButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pressed: false,
      angle: new Animated.Value(0),
    };

    this.loop = Animated.loop(
      Animated.timing(this.state.angle, {
        useNativeDriver: true,
        toValue: 3.141592,
        duration: 1250,
        easing: Easing.linear,
      })
    );

    // this.startLoop = this.startLoop.bind(this);
    // this.startLoop();
  }

  // startLoop() {
  //   this.loop.start();
  // }

  onPressIn() {
    this.setState({ pressed: true });
  }

  onPressOut() {
    this.setState({ pressed: false });
  } 

  componentDidMount() {
    if (this.props.animate) {
      this.loop.start();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevProps.animate && this.props.animate) {
      console.log('starting animation');
      // this.setState({ angle: new Animated.Value(0) });
      const { angle } = this.state;
      angle.setValue(0);
      this.setState({ angle });
      // this.startLoop();
      this.loop.start();
    } else if (prevProps.animate && !this.props.animate) {
      console.log('stopping animation');
      this.loop.stop();
    }
  }

  componentWillUnmout() {
    // this.loop.stop();
  }

  render() {
    return (
      <TouchableHighlight
        underlayColor={'transparent'}
        onPressIn={this.onPressIn.bind(this)}
        onPressOut={this.onPressOut.bind(this)}
        onPress={this.props.onPress}>
        <Svg
          width={this.props.size} height={this.props.size}
          // viewBox="0 0 492.883 492.883"
          viewBox="-100 -100 692.883 692.883"
          fill="white"
          strokeWidth="0">
          <Circle cx="246.44" cy="246.44" r="346.44" strokeWidth="0" fill={this.state.pressed ? 'rgba(255,255,255,0.5)' : 'none'}/>
          <AnimatedG style={{ transform: [
            { translateX: 246.44 },
            { translateY: 246.44 },
            { rotate: this.state.angle },
            { translateX: -246.44 },
            { translateY: -246.44 },
          ]}}>
            <Path d="M122.941,374.241c-20.1-18.1-34.6-39.8-44.1-63.1c-25.2-61.8-13.4-135.3,35.8-186l45.4,45.4c2.5,2.5,7,0.7,7.6-3
              l24.8-162.3c0.4-2.7-1.9-5-4.6-4.6l-162.4,24.8c-3.7,0.6-5.5,5.1-3,7.6l45.5,45.5c-75.1,76.8-87.9,192-38.6,282
              c14.8,27.1,35.3,51.9,61.4,72.7c44.4,35.3,99,52.2,153.2,51.1l10.2-66.7C207.441,421.641,159.441,407.241,122.941,374.241z"/>
            <Path d="M424.941,414.341c75.1-76.8,87.9-192,38.6-282c-14.8-27.1-35.3-51.9-61.4-72.7c-44.4-35.3-99-52.2-153.2-51.1l-10.2,66.7
              c46.6-4,94.7,10.4,131.2,43.4c20.1,18.1,34.6,39.8,44.1,63.1c25.2,61.8,13.4,135.3-35.8,186l-45.4-45.4c-2.5-2.5-7-0.7-7.6,3
              l-24.8,162.3c-0.4,2.7,1.9,5,4.6,4.6l162.4-24.8c3.7-0.6,5.4-5.1,3-7.6L424.941,414.341z"/>
          </AnimatedG>

        </Svg>
      </TouchableHighlight>
    );
  }
};

const styles = StyleSheet.create({
  // todo : migrate style definitions here 
});
