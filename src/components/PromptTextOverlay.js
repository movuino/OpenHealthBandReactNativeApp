import React, { Component } from 'react';
import { Animated, StyleSheet, Text, TextInput, View } from 'react-native';
import ObcsButton from './ObcsButton';
import PromptOverlay from './PromptOverlay';

export default class PromptTextOverlay extends Component {
  constructor(props) {
    super(props);
    this.deviceId = '';
    this.state = {
      show: false,
    };
  }

  componentDidUpdate(prevProps, prevState) {
    // if (!this.props.show && prevProps.show) {
    //   this.setState({ show: false });
    // }

    // if (this.props.show && !prevProps.show) {
    //   this.setState({ show: true });
    // }
  }

  onPress() {
    if (this.props.onPress) {
      this.props.onPress(this.deviceId);
    }

    // this.setState({ show: false });
  }

  render() {
    return (
      <PromptOverlay show={this.props.show}>
        <View styles={{ margin: 10, width: '100%' }}>
          <Text
            style={{
              marginTop: 20,
              textAlign: 'center',
              fontSize: 20,
              fontWeight: 'bold',
              color: 'white',
            }}
          > Enter new ID : </Text>
        </View>

        <View style={{ margin: 10 }}>
          <TextInput
            style={styles.textfield}
            title="type in your H10 ID ..." onChangeText={(text) => {
              this.deviceId = text;
            }}
          />
        </View>

        <View style={{ flex: 0, flexDirection: 'row', margin: 10, justifyContent: 'center' }}>
          <ObcsButton
            style={{ flex: 0, alignSelf: 'center', marginRight: 10 }}
            text='Cancel'
            onPress={() => {
              this.deviceId = '';
              this.onPress();
            }}
          />

          <ObcsButton
            style={{ flex: 0, alignSelf: 'center' }}
            text='OK'
            onPress={() => {
              if (this.deviceId !== '') {
                this.onPress();
              }
            }}
          />
        </View>
      </PromptOverlay>
    );
  }
}

const styles = StyleSheet.create({
  textfield: {
    margin: 0,
    lineHeight: 0,
    marginTop: 10,
    padding: 10,
    borderColor: '#000',
    backgroundColor: '#fff',
    borderWidth: 1,
    fontSize: 20,
  },  
})