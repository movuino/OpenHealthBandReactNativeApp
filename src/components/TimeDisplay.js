import React, { Component } from 'react';
import { Platform, StyleSheet, View, Text } from 'react-native';

export default class Recorder extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentDuration: '00:00:00.000',
    };

    this.rafId = null;
    this.startDate = 0;
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevProps.enable && this.props.enable) {
      this.start();
    } else if (prevProps.enable && !this.props.enable) {
      this.stop();
    }
  }

  start() {
    const now = Date.now();
    this.startDate = now;
    this.rafId = requestAnimationFrame(this.updateTimer.bind(this));
  }

  updateTimer(msDuration = null) {
    const d = Date.now() - this.startDate;

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

  stop() {
    cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }

  componentWillUnmount() {
    if (!this.rafId === null) cancelAnimationFrame(this.rafId);
  }

  render() {
    return (
      <Text style={[ styles.text, { fontSize: 30 } ]}>
       {this.state.currentDuration}
      </Text>
    );
  }
};

const styles = StyleSheet.create({
  text: {
    textAlign: 'center',
    padding: 20,
    color: 'white',
    fontSize: 30,
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier',
  },
});