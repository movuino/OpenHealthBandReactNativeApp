import React from 'react';
import { Pressable, View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setNextRoute } from '../store/navigationActions';

class Share extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <Pressable
          style={{ flex: 1 }}
          onPress={() => {
            this.props.setNextRoute('devices');
          }}>
          <View style={{ flex: 1, backgroundColor: 'black' }}>
          </View>
        </Pressable>
      </View>
    );
  }
};

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    setNextRoute,
  }, dispatch)
);

export default connect(null, mapDispatchToProps)(Share);
