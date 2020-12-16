import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import iconComponents from './Icons';

/**
 * usage example :
 * <BottomMenu
 *   items={[
 *     { icon: 'record', onPress: () => setNextRoute('record') },
 *     { icon: 'share', onPress: () => setNextRoute('share') },
 *     { icon: ... }
 *   ]}/>
 */

class ItemContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = { pressed: false };
  }

  render() {
    return (
      <View
        style={{ flex: 4, alignItems: 'center', justifyContent: 'center' }}>
        <Pressable
          onPressIn={() => { this.setState({ pressed: true }); }}
          onPressOut={() => { this.setState({ pressed: false }); }}
          onPress={this.props.onPress}>
          <View style={[
            styles.iconContainer,
            this.state.pressed ? styles.iconContainerPressed : {}
          ]}>
            {this.props.children}
          </View>
        </Pressable>
      </View>
    );
  }
};

export default class BottomMenu extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let i = 0;
    const items = [];

    items.push(
      <View key="itam-a" style={{ flex: 1 }}></View>
    );

    this.props.items.forEach(item => {
      const { icon, onPress } = item;
      const Icon = iconComponents[icon];

      i++;
      items.push(
        <ItemContainer
          key={`item-${i}`}
          onPress={onPress}>
          <Icon
            size="40"
            color="white"/>
        </ItemContainer>
      );
    });

    items.push(
      <View key="item-z" style={{ flex: 1 }}></View>
    );    

    return (
      <View 
        style={{
          flex: 1, 
          flexDirection: 'row',
          // backgroundColor: 'transparent',
          backgroundColor: 'black',
          // backgroundColor: '#696969',
          borderColor: 'white',
          // borderTopWidth: 2,
        }}>
        { items }
      </View>
    );
  }
};

const styles = StyleSheet.create({
  iconContainer: {
    padding: 5,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconContainerPressed: {
    backgroundColor: 'rgba(255,255,255,0.3)'
  },
})