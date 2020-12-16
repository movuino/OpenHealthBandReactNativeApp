/*
at some point, check actual { layout, page } and next { layout, page }

if (next layout != actual layout) {
  hide layout and wait for end of animation to call setCurrentRoute (which should also set showLayout & showPage true BTW)
} else if (next page != actual page) {
  do the same with page (hide and wait for end of animation to update everything)
}
*/

const defaultRoute = 'devices';

const initialState = {
  currentRoute: defaultRoute,
  nextRoute: defaultRoute,
  lastRequestedRoute: defaultRoute,
  // todo : update and check this flag in pages
  // for android backHandler management
  canGoBack: false,
};

export default (state = initialState, action) => {
  const res = {};

  switch (action.type) {
    case 'setNextRoute':
      res.lastRequestedRoute = action.payload;

      if (state.currentRoute !== state.nextRoute) {
        // discard message if we are already transitioning :
        // we leave state unchanged, except we store the last route request
        // to process it after current transition ends
        res.currentRoute = state.currentRoute;
        res.nextRoute = state.nextRoute;
      } else {
        res.currentRoute = state.currentRoute;
        res.nextRoute = action.payload;
      }

      return res;
    case 'goToNextRoute':
      res.lastRequestedRoute = state.lastRequestedRoute;

      if (state.lastRequestedRoute !== state.nextRoute) {
        res.currentRoute = state.nextRoute;
        res.nextRoute = state.lastRequestedRoute;
      } else {
        res.currentRoute = state.nextRoute;
        res.nextRoute = state.nextRoute;
      }

      return res;
    default:
      return state;
  }
};
