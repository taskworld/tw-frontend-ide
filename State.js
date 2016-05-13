'use strict'
const u = require('updeep')
const TestState = require('./TestState')
const { flowRight, identity } = require('lodash')

exports.initial = {
  webpackDev: { status: 'stopped' },
  webpackTest: { status: 'stopped' },
  karma: { status: 'stopped' },
  devServer: { status: 'stopped' },
  devServerProd: { status: 'stopped' },
  test: TestState.initial
}

const when = (truthy) => (update) => truthy ? update : identity

exports.receiveStatus = (app, status, message) => flowRight(
  u({
    [app]: (previousState) => {
      if (previousState.status === 'stopped' && status === 'running') {
        return previousState
      } else {
        return u({
          status: () => status,
          message: () => message
        }, previousState)
      }
    }
  }),
  when(app === 'karma' && status === 'starting')(u({
    test: () => TestState.initial
  }))
)

exports.receiveTestEvent = (event) => u({
  test: TestState.receiveEvent(event)
})

exports.getKarmaStatus = (state) => {
  const karma = state.karma
  if (karma.status === 'stopped') return karma
  const test = state.test
  const changes = [ ]
  if (test.running) {
    changes.push({ status: test.failed ? 'warning' : 'running' })
  } else if (test.success && !test.failed) {
    changes.push({ status: 'completed' })
  } else if (test.failed) {
    changes.push({ status: 'error' })
  }
  if (test.success || test.skipped || test.failed) {
    const fail = test.failed ? ` (${test.failed} failed)` : ''
    changes.push({ message: `${test.success + test.skipped + test.failed} tests` + fail })
  }
  return changes.reduce((state, change) => u(change)(state), karma)
}
