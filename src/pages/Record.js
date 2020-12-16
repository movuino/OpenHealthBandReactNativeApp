import React from 'react';
import { Dimensions, View, Button, Pressable } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setNextRoute } from '../store/navigationActions';

import AnimatedView from '../components/AnimatedView';
import RecordButton from '../components/RecordButton';
import TimeDisplay from '../components/TimeDisplay';
import Devices from '../utils/Devices';

const window = Dimensions.get('window');

class Record extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      recording: false,
      showDialog: false,
    };
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <Pressable
          style={{ flex: 1 }}
          onPress={() => {
            if (!this.state.recording) {
              this.props.setNextRoute('devices');
            }
          }}>
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'black',
            }}>
            <RecordButton
              size={window.width * 0.333}
              onPress={cmd => {
                if (cmd === 'start') {
                  Devices.startRecording();
                  this.setState({ recording: true });
                } else if (cmd === 'stop') {
                  Devices.stopRecording();
                  this.setState({ recording: false, showDialog: true });
                }
              }}/>
            {/* TODO use ref instead (see signal plotter control in OldApp) */}
            <TimeDisplay
              enable={this.state.recording}/>
          </View>
        </Pressable>

        <AnimatedView
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.8)',
          }}
          show={this.state.showDialog}>
          <Button title="cancel" onPress={() => {
            this.props.setNextRoute('devices');
          }}/>
          <Button title="save" onPress={() => {
            this.props.setNextRoute('devices');
          }}/>
          <Button title="share" onPress={() => {
            this.props.setNextRoute('share');
          }}/>
        </AnimatedView>
      </View>
    );
  }
};

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    setNextRoute,
  }, dispatch)
);

export default connect(null, mapDispatchToProps)(Record);
