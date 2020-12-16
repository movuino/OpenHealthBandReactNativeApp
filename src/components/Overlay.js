import React, { Component } from 'react';
import { Animated, StyleSheet, Pressable } from 'react-native';

export default class Overlay extends Component {

  constructor(props) {
    super(props);
    this.state = {
      show: false,
      fadeAnim: new Animated.Value(0),
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.props.show && prevProps.show) {
      this.animateAndHide();
    }

    if (this.props.show && !prevProps.show) {
      this.setState({ show: true });
    }

    if (this.state.show && !prevState.show) {
      Animated.timing(this.state.fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }

  animateAndHide() {
    Animated.timing(this.state.fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(( { finished }) => {
      this.setState({ show: false });
    });
  }

  transitionEnd() {
    console.log('transition end');
    if (!this.props.show) {
      this.setState({ show: false });
    }
  }

  render() {
    return this.state.show &&
      // Special animatable View
      <Animated.View
        style={[ styles.container, { opacity: this.state.fadeAnim }]}
        onTransitionEnd={this.transitionEnd}>
        {this.props.children}
      </Animated.View>
    ;
  }
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.8)',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
});
