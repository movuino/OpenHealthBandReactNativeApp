import React from 'react';
import { View, Text } from 'react-native';
import AnimatedView from './AnimatedView';

export default class Toast extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      message: '',
    };
  }

  show({ message, duration }) {
    this.setState({ message, show: true });
    setTimeout(() => {
      this.setState({ show: false });
    }, duration);    
  }

  render() {
    return (
      <AnimatedView
        show={this.state.show}
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.8)',
        }}>
        <View
          style={{
            position: 'absolute',
            width: '50%',
            backgroundColor: 'white',
            borderRadius: 60,
            padding: 10,
            bottom: 120,
            //marginTop: '50%',
          }}>
          <Text style={{
            textAlign: 'center',
            fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier',
          }}>
            {this.state.message}
          </Text>
        </View>
      </AnimatedView>
    );
  }
}