import React from 'react';
import { connect } from 'react-redux';

import {
  Animated,
  View,
  ScrollView,
  Text,
  // TouchableWithoutFeedback,
  Platform,
  PermissionsAndroid,
  AppState,
  // useWindowDimensions,
  Dimensions,
} from 'react-native';

import AnimatedView from './components/AnimatedView';
import layoutComponents from './layouts';
import pageComponents from './pages';
import routes from './routes';

const window = Dimensions.get('window');

const offset = window.width;

const translationXAnimation = {
  prop: 'translateX',
  mount: window.width,
  active: 0,
  unmount: 0, // -window.width,
  duration: 200,
};

const translationYAnimation = {
  prop: 'translateY',
  mount: 0,
  active: 0,
  unmount: window.height,
  duration: 200,
};

const opacityAnimation = {
  prop: 'opacity',
  mount: 0,
  active: 1,
  unmount: 0,
  duration: 200,
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.initialized = false;
  }

  render() {
    const { currentRoute, nextRoute } = this.props.navigation;
    const current = routes[currentRoute];
    const next = routes[nextRoute];

    const showPages = [ next.page ];
    let switchingLayouts = false;

    // if we are switching layouts, show both nextPage and currentPage
    // so that we see currentLayout disappear but not the page within.
    // also show nextPage immediately as if it was already mounted in nextLayout
    if (current.layout !== next.layout) {
      showPages.push(current.page);
      switchingLayouts = true;
    }

    const l = [];
    Object.keys(layoutComponents).forEach(layout => {
      const Layout = layoutComponents[layout];

      const p = [];
      Object.keys(routes).forEach(route => {
        if (routes[route].layout === layout) {
          const Page = pageComponents[routes[route].page];
          const z = route === currentRoute ? 2 : 1;
          p.push(
            <AnimatedView
              style={{ zIndex: z, elevation: z }}
              key={`${routes[route].layout}/${routes[route].page}`}
              show={showPages.indexOf(routes[route].page) !== -1}
              immediate={
                routes[route].page === next.page &&
                (!this.initialized || switchingLayouts)
              }
              animation={translationYAnimation}
            >
              <Page/>
            </AnimatedView>
          );
        }
      });

      const z = layout === next.layout ? 2 : 1;
      l.push(
        <AnimatedView
          style={{ zIndex: z, elevation: z }}
          key={layout}
          show={layout === next.layout}
          immediate={!this.initialized}
          animation={opacityAnimation}>
          <Layout>
            { p }
          </Layout>
        </AnimatedView>
      )
    });

    this.initialized = true;

    return (
      <View style={{ flex: 1 }}>
        { l }
      </View>
    );
  }
};

const mapStateToProps = (state) => {
  const { navigation } = state;
  return { navigation };
};
 
export default connect(mapStateToProps)(App);