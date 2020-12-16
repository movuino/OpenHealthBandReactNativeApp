import React, { Component } from 'react';
import { Platform, Pressable, Animated, Dimensions, StyleSheet, View, Text } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle)
const { width } = Dimensions.get('window');
const btnSize = width * 0.33;

export default class Recorder extends Component {
  constructor(props) {
    super(props);

    this.state = {
      text: 'Start\nrecording',
      pressed: false,
      recording: false,
      currentDuration: '00:00:00.000',
      glowValue: new Animated.Value(1),
    };

    this.rafId = null;
    this.startRecDate = 0;

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

  startRecording() {
    const now = Date.now();
    this.startRecDate = now;
    this.rafId = requestAnimationFrame(this.updateTimer.bind(this));
  }

  updateTimer(msDuration = null) {
    const d = Date.now() - this.startRecDate;

    let ms = d % 1000;
    ms = ms < 10 ? `00${ms}` : (ms < 100 ? `0${ms}` : `${ms}`);

    let sec = Math.floor(d / 1000) % 60;
    sec = sec < 10 ? `0${sec}` : `${sec}`;

    let min = Math.floor(d / 60000) % 60;
    min = min < 10 ? `0${min}` : `${min}`;

    let hr = Math.floor(d / 3600000) % 24;
    hr = hr < 10 ? `0${hr}` : `${hr}`;

    const currentDuration = `${hr}:${min}:${sec}.${ms}`;
    this.setState({ currentDuration });
    this.rafId = requestAnimationFrame(this.updateTimer.bind(this));
  }

  stopRecording() {
    cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }

  // formatDuration(ms) {

  // }

  componentWillUnmount() {
    if (!this.rafId === null) cancelAnimationFrame(this.rafId);
  }

  render() {
    return (
      <View style={ styles.container }>
        {/*
        <Text style={styles.text}>
          {this.state.text}
        </Text>
        */}
        <Pressable
          onPressIn={() => { this.setState({ pressed: true }); }}
          onPressOut={() => { this.setState({ pressed: false }); }}
          onPress={() => {
            this.setState({ recording: !this.state.recording }, () => {
              if (this.state.recording) {
                this.startRecording();
                const { glowValue } = this.state;
                glowValue.setValue(1);
                this.setState({ glowValue }, () => {
                  this.glow = Animated.loop(this.anim);
                  this.glow.start();
                });
              } else {
                this.stopRecording();
                this.glow.stop();
                const { glowValue } = this.state;
                glowValue.setValue(0);
                this.setState({ glowValue });
              }
            });
          }}>
          <Svg
            width={btnSize} height={btnSize}
            viewBox="0 0 100 100"
            fill="white"
            stroke="white"
            strokeWidth={2 * 100 / btnSize}>

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
        <Text style={[ styles.text, { fontSize: 30 } ]}>
         {/*0'0"*/}
         {/*00:00:00.000*/}
         {this.state.currentDuration}
        </Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
    padding: 20,
    color: 'white',
    fontSize: 30,
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier',
  },
});