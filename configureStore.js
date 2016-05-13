
const { createStore, applyMiddleware } = require('redux')
const State = require('./State')
const debug = require('debug')('reducer')

// Create the store…
module.exports = function configureStore (sagaMiddleware) {
  const store = createStore(reducer, applyMiddleware(sagaMiddleware))
  return store
}

// The reducer…
function reducer (state = State.initial, action) {
  debug('Received action %o', action)
  switch (action.type) {
    case 'RECEIVE_STATUS':
      return State.receiveStatus(action.app, action.status, action.message)(state)
    case 'RECEIVE_TEST_EVENT':
      return State.receiveTestEvent(action.event)(state)
  }
  return state
}
