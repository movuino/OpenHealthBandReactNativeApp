export const setNextRoute = route => ({
  type: 'setNextRoute',
  payload: route,
});

export const goToNextRoute = () => ({
  type: 'goToNextRoute',
  payload: null,
});