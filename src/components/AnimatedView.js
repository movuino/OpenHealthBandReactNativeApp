import React from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { goToNextRoute } from '../store/navigationActions';

const styles = StyleSheet.create({
  animatedView: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  }
});

class AnimatedView extends React.Component {
  constructor(props) {
    super(props);

    this.animation = Object.assign({
      prop: 'opacity',
      mount: 0,
      active: 1,
      unmount: 0,
      duration: 200,
      easing: Easing.linear,
    }, this.props.animation);

    this.state = {
      show: false,
      value: new Animated.Value(this.animation.mount),
    };
  }

  componentDidMount() {
    if (this.props.show) {
      this.setState({ show: true });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.animation !== prevProps.animation) {
      this.animation = Object.assign(this.animation, this.props.animation);
      const { value } = this.state;
      const v = this.state.show
              ? this.animation.active
              : this.animation.mount;
      value.setValue(v);
      this.setState({ value });
    }

    if (!this.props.show && prevProps.show) {
      this.animateAndHide();
    }

    if (this.props.show && !prevProps.show) {
      this.setState({ show: true });
    }

    if (this.state.show && !prevState.show) {
      this.anim = Animated.timing(this.state.value, {
        toValue: this.animation.active,
        duration: this.props.immediate ? 0 : this.animation.duration,
        easing: this.animation.easing,
        useNativeDriver: true,
      });
      this.anim.start(({ finished }) => {
        this.anim = null;
      });
    }
  }

  animateAndHide() {
    this.anim = Animated.timing(this.state.value, {
      toValue: this.animation.unmount,
      duration: this.props.immediate ? 0 : this.animation.duration,
      easing: this.animation.easing,
      useNativeDriver: true,
    });
    this.anim.start(({ finished }) => {
      this.anim = null;
      this.setState({ show: false }, () => {
        // if (this.props.goToNextRouteOnHide) {
          this.props.goToNextRoute();
        // }
      });
    });
  }

  transitionEnd() {
    if (!this.props.show) {
      this.setState({ show: false }, () => {
        // if (this.props.goToNextRouteOnHide) {
          this.props.goToNextRoute();
        // }
      });
    }
  }

  render() {
    return this.state.show &&
      <Animated.View
        onTransitionEnd={this.transitionEnd}
        style={[
          styles.animatedView,
          this.props.style,
          { [this.animation.prop]: this.state.value }
        ]}>
        {this.props.children}
      </Animated.View>
    ;
  }
};

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    goToNextRoute,
  }, dispatch)
);

export default connect(null, mapDispatchToProps)(AnimatedView);
