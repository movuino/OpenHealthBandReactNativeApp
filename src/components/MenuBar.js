import React, { Component } from 'react';
import { StyleSheet, Pressable, text, View } from 'react-native';
import Svg, { Circle, Line, Polyline, Rect } from 'react-native-svg';

export default class MenuBar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      enabledItem: null,
      recordPressed: false,
      signalPressed: false,
      sharePressed: false,
    };
  }

  render() {
    return (
      <View style={{
        flex: 1,
        flexDirection: 'row'
      }}>
        <View style={ styles.global }>
        <Pressable
          onPressIn={() => { this.setState({ signalPressed: true }); }}
          onPressOut={() => { this.setState({ signalPressed: false }); }}
          onPress={() => {
            this.setState({
              enabledItem: this.state.enabledItem !== 'signal' ? 'signal' : null
            }, () => {
              this.props.onPress(this.state.enabledItem);
            });
          }}>
          <View style={[
            styles.normal,
            this.state.enabledItem === 'signal' ? styles.enabled : styles.normal,
            this.state.signalPressed ? styles.pressed : {},
          ]}>
          <Svg
            width="40" height="40"
            viewBox="0 0 100 100"
            fill="none"
            stroke="white"
            strokeLinecap="round"
            strokeWidth="3">
            {/*<Rect x="2" y="2" width="96" height="96" rx="20" ry="20" fill="none"/>*/}
            <Circle x="7" y="50" r="7" fill="white"/>
            <Circle x="93" y="50" r="7" fill="white"/>
            <Polyline
              points="0,50 22,50 30,40 40,60 50,20 62,80 72,40 78,50 100,50"/>
          </Svg>
          </View>
        </Pressable>
        </View>

        <View style={ styles.global }>
        <Pressable
          onPressIn={() => { this.setState({ recordPressed: true }); }}
          onPressOut={() => { this.setState({ recordPressed: false }); }}
          onPress={() => {
            this.setState({
              enabledItem: this.state.enabledItem !== 'record' ? 'record' : null
            }, () => {
              this.props.onPress(this.state.enabledItem);
            });
          }}>
          <View style={[
            styles.normal,
            this.state.enabledItem === 'record' ? styles.enabled : styles.normal,
            this.state.recordPressed ? styles.pressed : {},
          ]}>
          {/*
          <Svg
            width="40" height="40"
            viewBox="0 0 100 100"
            fill="none"
            stroke="white"
            strokeWidth="3">
            <Circle cx="25" cy="50" r="15" />
            <Circle cx="75" cy="50" r="15" />
            <Line x1="25" y1="65" x2="75" y2="65" />
          </Svg>
          */}
          <Svg
            width="40" height="40"
            viewBox="0 0 100 100"
            fill="white"
            stroke="white"
            strokeWidth="3">
            <Circle cx="50" cy="50" r="40" stroke="none"/>
            <Circle cx="50" cy="50" r="45" fill="none" />
          </Svg>
          </View>
        </Pressable>
        </View>

        <View style={ styles.global }>
        <Pressable
          onPressIn={() => { this.setState({ sharePressed: true }); }}
          onPressOut={() => { this.setState({ sharePressed: false }); }}
          onPress={() => {
            this.setState({
              enabledItem: this.state.enabledItem !== 'share' ? 'share' : null
            }, () => {
              this.props.onPress(this.state.enabledItem);
            });
          }}>
          <View style={[
            styles.normal,
            this.state.enabledItem === 'share' ? styles.enabled : styles.normal,
            this.state.sharePressed ? styles.pressed : {},
          ]}>
          <Svg
            width="40" height="40"
            viewBox="0 0 100 100"
            fill="white"
            stroke="white"
            strokeWidth="3">
            <Circle cx="65" cy="25" r="7" />
            <Circle cx="65" cy="75" r="7" />
            <Circle cx="25" cy="50" r="7" />
            <Line x1="25" y1="50" x2="65" y2="25" />
            <Line x1="25" y1="50" x2="65" y2="75" />
          </Svg>
          </View>
        </Pressable>
        </View>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  global: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: 'blue',
  },
  normal: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    padding: 5,
    borderRadius: 40,
    backgroundColor: 'transparent',
  },
  pressed: {
    backgroundColor: 'rgba(255,255,255,0.09)',
  },
  released: {
    backgroundColor: 'black',
  },
  enabled: {
    backgroundColor: 'rgba(255,255,255,0.21)',
  },
});