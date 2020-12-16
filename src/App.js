import React from 'react';
import { BackHandler, Dimensions, Easing, View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setNextRoute } from './store/navigationActions';

import AnimatedView from './components/AnimatedView';
import Toast from './components/Toast';
import { checkAndRequestPermissions } from './utils/permissions';
import pageComponents from './pages';

const window = Dimensions.get('window');

const animations = {
  translateX: {
    prop: 'translateX',
    mount: window.width,
    active: 0,
    unmount: 0,
    duration: 120,
    //easing: Easing.poly(0.2),
  },
  translateMinusX: {
    prop: 'translateX',
    mount: 0,
    active: 0,
    unmount: window.width,
    duration: 120,
    //easing: Easing.poly(0.2),
  },
  translateY: {
    prop: 'translateY',
    mount: -window.height,
    active: 0,
    unmount: window.height,
    duration: 200,
  }
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { toast: {} };
    this.initialized = false;
    this.backAction = this.backAction.bind(this);
  }

  async componentDidMount() {
    this.backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      this.backAction
    );

    await checkAndRequestPermissions();
  }

  componentWillUnmount() {
    this.backHandler.remove();
  }

  backAction() {
    if (this.props.navigation.nextRoute !== 'devices') {
      this.props.setNextRoute('devices');
    }

    console.log('about to exit, preventing closing');
    return true;
  }

  render() {
    const { currentRoute, nextRoute } = this.props.navigation;
    const pages = [];

    const goingHome = currentRoute !== nextRoute && nextRoute === 'devices'
    const highestRoute = goingHome ? currentRoute : nextRoute;

    const routes = Object.keys(pageComponents);
    const i = routes.indexOf(highestRoute);
    routes.splice(i, 1);
    routes.push(highestRoute);

    routes.forEach((page, index) => {
      const Page = pageComponents[page];

      // shouldn't be necessary if order of view define their zIndex as in Android :
      // const isHighest = page === highestRoute;
      // const z = isHighest ? 2 : 1;

      pages.push(
        <AnimatedView
          key={page}
          // syle={{ zIndex: z, elevation: z }}
          animation={
            goingHome ?
            animations.translateMinusX :
            animations.translateX
          }
          show={page === nextRoute}
          goToNextRouteOnHide={true}
          immediate={!this.initialized}>

          <Page toast={data => { this.toast.show(data); }}/>
        </AnimatedView>
      );
    });

    this.initialized = true;

    return (
      <View style={{ flex: 1, backgroundColor: 'black' }}>
        { pages }
        <Toast ref={instance => { this.toast = instance; }}/>
      </View>
    );
  }
};

const mapStateToProps = (state) => {
  const { navigation } = state;
  return { navigation };
};

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    setNextRoute,
  }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(App);
