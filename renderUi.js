'use strict'
const State = require('./State')

function renderUi (state) {
  const elements = [ ]
  elements.push(renderProcessButton('webpack(dev)', state.webpackDev, 'WEBPACK_BUTTON_CLICK'))
  elements.push(renderProcessButton('webpack(test)', state.webpackTest, 'WEBPACK_TEST_BUTTON_CLICK'))
  elements.push(renderProcessButton('karma', State.getKarmaStatus(state), 'KARMA_BUTTON_CLICK'))
  elements.push(renderProcessButton('server', state.devServer, 'DEV_SERVER_BUTTON_CLICK'))
  elements.push(renderProcessButton('server(prod)', state.devServerProd, 'DEV_SERVER_PROD_BUTTON_CLICK'))
}

function renderProcessButton (name, process, actionType) {
  return {
    type: 'button',
    props: {
      text: name + (process.message ? ': ' + process.message : ''),
      color: {
        stopped: 'default',
        starting: 'info',
        running: 'info',
        completed: 'success',
        error: 'error',
        warning: 'warning',
        killed: 'warning'
      }[process.status],
      icon: {
        stopped: 'dash',
        starting: 'circuit-board',
        running: 'clock',
        completed: 'check',
        error: 'x',
        killed: 'bug'
      }[process.status],
      action: {
        type: actionType
      }
    }
  }
}

module.exports = renderUi