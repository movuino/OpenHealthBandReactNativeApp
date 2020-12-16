import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setNextRoute } from '../store/navigationActions';
import { View, Text, Button } from 'react-native';

class MenuBar extends React.Component {
  render() {
    return (
      <View style={{
        flex: 1,
        flexDirection: 'column',
      }}>
        <View style={{ flex: 1 }}>
          {this.props.children}
        </View>
        <View style={{
          flex: 0,
          zIndex: 10,
          elevation: 10,
          backgroundColor: 'blue',
        }}>
          <Text style={{
            fontSize: 30,
            color: 'white',
          }}>
            Coucou
          </Text>
          <Button
            title="Go home"
            onPress={() => {
              this.props.setNextRoute('home');
            }}/>
          <Button
            title="Go somewhere"
            onPress={() => {
              this.props.setNextRoute('somewhere');
            }}/>
          <Button
            title="Go devices"
            onPress={() => {
              this.props.setNextRoute('devices');
            }}/>
        </View>
      </View>
    );
  }
};

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    setNextRoute,
  }, dispatch)
);

export default connect(null, mapDispatchToProps)(MenuBar);
