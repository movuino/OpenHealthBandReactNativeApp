import React from 'react';
import { Animated, Easing, Pressable, View } from 'react-native';
import Svg, {
  Circle,
  Line,
  Polyline,
  Polygon,
  Path,
  G,
} from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const defaultSize = 100;
const defaultColor = 'white';
const defaultStrokeWidth = 4;

////////// QRS SIGNAL

class SignalIcon extends React.Component {
  render() {
    const size = this.props.size || defaultSize;
    const color = this.props.color || defaultColor;
    const strokeWidth = this.props.strokeWidth || defaultStrokeWidth;
    const sizeRatio = 100 / size;

    const points = `
      ${strokeWidth * 0.5 * sizeRatio},50
      22,50 30,40 40,60 50,20 62,80 72,40 78,50
      ${100 - strokeWidth * 0.5 * sizeRatio},50    
    `;

    return (
      <Svg
        width={size} height={size}
        viewBox="0 0 100 100"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth * sizeRatio}>
        {/*
        <Circle x="7" y="50" r="7" fill={this.props.color} stroke="none"/>
        <Circle x="93" y="50" r="7" fill={this.props.color} stroke="none"/>
        */}
        <Polyline
          points={points}/>
      </Svg>
    );
  }
};

////////// ADD BUTTON

class AddIcon extends React.Component {
  render() {
    const size = this.props.size || defaultSize;
    const color = this.props.color || defaultColor;
    const strokeWidth = this.props.strokeWidth || defaultStrokeWidth;
    const sizeRatio = 100 / size;
    const radius = 50 - (strokeWidth * sizeRatio * 0.5);

    return (
      <Svg
        width={size} height={size}
        viewBox="0 0 100 100"
        fill={color}
        stroke={color}
        strokeLinecap="round"
        strokeWidth={strokeWidth * sizeRatio}>
        <Circle cx="50" cy="50" r={radius} fill="none"/>
        <Line x1="30" y1="50" x2="70" y2="50"/>
        <Line x1="50" y1="30" x2="50" y2="70"/>
      </Svg>
    );
  }
};

////////// RECORD BUTTON

class RecordIcon extends React.Component {
  render() {
    const size = this.props.size || defaultSize;
    const color = this.props.color || defaultColor;
    const strokeWidth = this.props.strokeWidth || defaultStrokeWidth;
    const sizeRatio = 100 / size;
    const radius = 50 - (strokeWidth * sizeRatio * 0.5);

    return (
      <Svg
        width={size} height={size}
        viewBox="0 0 100 100"
        fill={color}
        stroke={color}
        strokeWidth={strokeWidth * sizeRatio}>
        <Circle cx="50" cy="50" r={radius - (strokeWidth + 1) * sizeRatio} stroke="none"/>
        <Circle cx="50" cy="50" r={radius} fill="none"/>
      </Svg>
    );
  }
};

////////// SHARE ICON

class ShareIcon extends React.Component {
  render() {
    const size = this.props.size || defaultSize;
    const color = this.props.color || defaultColor;
    const strokeWidth = 2; // this.props.strokeWidth || defaultStrokeWidth;
    const sizeRatio = 100 / size;

    return (
      <Svg
        width={size} height={size}
        viewBox="0 0 100 100"
        fill={color}
        stroke={color}
        strokeWidth={strokeWidth * sizeRatio}>
        <Circle cx="75" cy="15" r="15" stroke="none"/>
        <Circle cx="75" cy="85" r="15" stroke="none"/>
        <Circle cx="20" cy="50" r="15" stroke="none"/>
        <Line x1="20" y1="50" x2="75" y2="15"/>
        <Line x1="20" y1="50" x2="75" y2="85"/>
      </Svg>
    );
  }
};

////////// BACK ARROW

class BackIcon extends React.Component {
  render() {
    const size = this.props.size || defaultSize;
    const color = this.props.color || defaultColor;
    const strokeWidth = this.props.strokeWidth || defaultStrokeWidth;
    const sizeRatio = 100 / size;

    return (
      <Svg
        width={size} height={size}
        viewBox="0 0 100 100"
        fill={color}
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth * sizeRatio}>
        {/*<Polyline points="75,15 20,50 75,85"/>*/}
        <Polygon points="75,15 20,50 75,85"/>
      </Svg>
    );
  }
};

////////// RELOAD CIRCULAR ARROW

class ReloadIcon extends React.Component {
  constructor(props) {
    super(props);
  
    this.radius = 40;
    const angle = Math.PI * 0.2;

    this.x1 = Math.cos(angle) * this.radius + 50;
    this.y1 = Math.sin(angle) * this.radius + 50;
    this.x2 = Math.cos(-angle) * this.radius + 50;
    this.y2 = Math.sin(-angle) * this.radius + 50;
    this.rotation = angle * -180 / Math.PI + 90;
  }

  render() {
    const size = this.props.size || defaultSize;
    const color = this.props.color || defaultColor;
    const strokeWidth = this.props.strokeWidth || defaultStrokeWidth;
    const sizeRatio = 100 / size;

    const path = `
      M ${this.x1} ${this.y1}
      A ${this.radius} ${this.radius} 0
      1 1
      ${this.x2} ${this.y2}
    `;

    return (
      <Svg
        width={size} height={size}
        viewBox="0 0 100 100"
        fill={color}
        stroke={color}
        strokeLinecap="round"
        strokeWidth={strokeWidth * sizeRatio}>

        <Path d={path} fill="none"/>

        {
        <G rotation={this.rotation} origin={`${this.x2},${this.y2}`}>
          <Polygon
            strokeLinejoin="round"
            points={`
              ${this.x2},${this.y2 + 10}
              ${this.x2},${this.y2 - 10}
              ${this.x2 + 18},${this.y2}
            `}
            />
        </G>
        }
      </Svg>
    );
  }
};

////////// ANIMATED DOTS

// TODO : add "animate" boolean prop

class AnimatedDotsIcon extends React.Component {
  constructor(props) {
    super(props);

    this.minr = this.props.minr || 10;
    this.maxr = this.props.maxr || 18;
    this.animDuration = this.props.animDuration || 500;
    this.animInterval = this.props.animInterval || this.animDuration * 0.25;
    this.animPause = this.props.animPause || this.animDuration;

    this.state = {
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

  componentWillUnmount() {
    this.loop.stop();
  }

  render() {
    const size = this.props.size || defaultSize;
    const color = this.props.color || defaultColor;

    return (
      <Svg
        width={size} height={size}
        viewBox="0 0 120 120"
        fill={color}
        stroke="none">
        <AnimatedCircle cx={this.maxr} cy="60" r={this.state.dot1} />
        <AnimatedCircle cx="60" cy="60" r={this.state.dot2} />
        <AnimatedCircle cx={120 - this.maxr} cy="60" r={this.state.dot3} />
      </Svg>
    );
  }
};

export default {
  signal: SignalIcon,
  add: AddIcon,
  record: RecordIcon,
  share: ShareIcon,
  back: BackIcon,
  reload: ReloadIcon,
  animatedDots: AnimatedDotsIcon,
};
