import React from 'react';
import { StyleSheet, View, Text, TouchableHighlight } from 'react-native';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setNextRoute } from '../store/navigationActions';

class Home extends React.Component {
  render() {
    return (
      <View style={{ flex: 1, backgroundColor: 'orange' }}>
        <Text style={{ flex: 1 }}> Hello ! </Text>
        <TouchableHighlight
          onPress={() => {
            this.props.setNextRoute('devices');
          }}
          style={{
            flex: 1,
            // bottom: 0,
            backgroundColor: 'blue',
          }}>

          <Text> Go to devices </Text>
        </TouchableHighlight>
      </View>
    );
  }
};

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    setNextRoute,
  }, dispatch)
);

export default connect(null, mapDispatchToProps)(Home);

