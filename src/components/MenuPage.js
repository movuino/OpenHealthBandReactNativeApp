import React, { Component } from 'react';
import {
  Dimensions,
  Animated,
  Easing,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';

const menuHeight = 60;
// const offset = Dimensions.get('window').height - menuHeight;
const offset = Dimensions.get('window').width;

export default class MenuPage extends Component {

  constructor(props) {
    super(props);

    this.fadeInDuration = 200;
    this.fadeOutDuration = 200,

    // this.before = offset;
    // this.during = 0;
    // this.after = -offset;
    // this.animatedProp = 'translateX';

    this.before = 0;
    this.during = 1;
    this.after = 0;
    this.animatedProp = 'opacity';

    this.state = {
      show: false,
      fadeAnim: new Animated.Value(this.before),
    };
  }

  componentDidMount() {
    this.render();
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
        toValue: this.during,
        duration: this.fadeInDuration,
        useNativeDriver: true,
        easing: Easing.poly(0.25),
      }).start();
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    // return this.state.show;
    return true;
  }

  animateAndHide() {
    Animated.timing(this.state.fadeAnim, {
      toValue: this.after,
      duration: this.fadeOutDuration,
      useNativeDriver: true,
      easing: Easing.poly(4),
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
    return (
    // return this.state.show &&
      // Special animatable View
      <TouchableWithoutFeedback disabled={this.state.show}>
      <Animated.View
        style={[
          styles.container,
          this.props.style || {},
          { width: this.state.show ? 'auto' : 0 },
          { [this.animatedProp]: this.state.fadeAnim }
        ]}
        onTransitionEnd={this.transitionEnd}>
        {this.props.children}
      </Animated.View>
      </TouchableWithoutFeedback>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    backgroundColor: 'black', // rgba(255,255,255,0.3)',
    top: 0,
    left: 0,
    bottom: menuHeight,
    right: 0,
    // margin: 10,
    // borderRadius: 50,
  },
});
