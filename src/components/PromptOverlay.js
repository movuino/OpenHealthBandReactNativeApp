/*
import React, { useRef, useEffect } from 'react';
import { Animated, Text, View } from 'react-native';

const PromptOverlay = (props) => {
  const fadeAnim = useRef(new Animated.Value(0)).current  // Initial value for opacity: 0

  React.useEffect(() => {
    Animated.timing(
      fadeAnim,
      {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }
    ).start();
  }, [fadeAnim])

  return (
    <Animated.View                 // Special animatable View
      style={{
        ...props.style,
        opacity: fadeAnim,         // Bind opacity to animated value
      }}
    >
      {props.children}
    </Animated.View>
  );
}

export default PromptOverlay;
//*/

// You can then use your `FadeInView` in place of a `View` in your components:
// export default () => {
//   return (
//     <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
//       <FadeInView style={{width: 250, height: 50, backgroundColor: 'powderblue'}}>
//         <Text style={{fontSize: 28, textAlign: 'center', margin: 10}}>Fading in</Text>
//       </FadeInView>
//     </View>
//   )
// }

//*
import React, { Component } from 'react';
import { Animated, StyleSheet } from 'react-native';

export default class PromptOverlay extends Component {

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
      <Animated.View                 // Special animatable View
        style={[ styles.container, { opacity: this.state.fadeAnim }]}
        onTransitionEnd={this.transitionEnd}
      >
        {this.props.children}
      </Animated.View>
    ;
  }
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.9)',
    top: 50,
    left: 0,
    bottom: 0,
    right: 0,
  },
});
//*/
