import Svg, {
  Circle,
  Ellipse,
  G,
  Text,
  TSpan,
  TextPath,
  Path,
  Polygon,
  Polyline,
  Line,
  Rect,
  Use,
  Image,
  Symbol,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  ClipPath,
  Pattern,
  Mask,
} from 'react-native-svg';

/* Use this if you are using Expo
import * as Svg from 'react-native-svg';
const { Circle, Rect } = Svg;
*/

import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';

export default class SignalPlotter extends Component {
  constructor(props) {
    super(props);
    this.resolution = { x: 1000, y: 500 };

    const { nbOfSamples, minInput, maxInput } = this.props;

    this.a = this.resolution.y / (maxInput - minInput);
    this.b = this.resolution.y - this.a * maxInput;

    // TODO define more props like :
    // - displayBuffer
    // - etc ...
    // for scrolling reconstructed signal

    this.currentIndex = -1;
    this.samples = [];
    this.state = { points : '' };
  }

  componentDidMount() {
    const { nbOfSamples } = this.props;
    let points = '';

    for (let i = 0; i < nbOfSamples; i++) {
      this.addSamples([ 0 ])
    }
  }

  componentDidUpdate() {
    // this is executed once setState has done its job
  }

  addSamples(newSamples) {
    const { nbOfSamples } = this.props;

    for (let i = 0; i < newSamples.length; i++) {
      this.currentIndex = (this.currentIndex + 1) % nbOfSamples;
      this.samples[this.currentIndex] = newSamples[i] * this.a + this.b;
    }

    let points = '';

    for (let i = 0; i < nbOfSamples; i++) {
      const x = i * (this.resolution.x - 1) / (nbOfSamples - 1);
      const y = this.samples[i];
      points += `${x},${y}`;
      if (i !== nbOfSamples - 1) {
        points += ' ';
      }
    }

    this.setState({ points });
  }

  render() {
    return (
      <View style={{ aspectRatio: this.resolution.x / this.resolution.y }}>
        <Svg viewBox={`0 0 ${this.resolution.x} ${this.resolution.y}`}>
          <ClipPath id="clip">
            <Rect x="0" y="0" width={`${this.resolution.x}`} height={`${this.resolution.y}`} />
          </ClipPath>

          <Rect fill="white" x="0" y="0" width={`${this.resolution.x}`} height={`${this.resolution.y}`} />
          <Line
            x1="0" y1={`${this.resolution.y * 0.5}`}
            x2={`${this.resolution.x}`} y2={`${this.resolution.y * 0.5}`}
            stroke="#000" strokeWidth="5" 
          />
          {
            /*
            () => {
              const res = [];
              // draw graduations here :
              for (let i = 0; i < )
              for (let i = 0; i < 2; i++) {
                res.push(
                  <Line
                    x1="0" y1={`${this.resolution.y * 0.5}`}
                    x2={`${this.resolution.x}`} y2={`${this.resolution.y * 0.5}`}
                    stroke="#000" strokeWidth="5" 
                  />
                );
              }

              return null;
            }
            //*/
          }
          <Polyline
            points={this.state.points}
            fill="none"
            stroke="#F00"
            strokeWidth="3"
            clipPath="url(#clip)"
          />
        </Svg>
      </View>
    );
  }
};
