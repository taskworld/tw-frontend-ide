'use strict'
const u = require('updeep')
const debug = require('debug')('TestState')

exports.initial = { running: false }

const incrementBy = (n) => (x) => (x || 0) + n
const when = (truthy) => (updater) => truthy ? updater : state => state
const appendAll = (items) => (originalItems) => [ ...(originalItems || [ ]), ...items ]

exports.receiveEvent = (event) => {
  switch (event.type) {
    case 'RUN_START':
      return () => ({ running: true, runners: 0, success: 0, failed: 0, skipped: 0, failLogs: [ ] })
    case 'RUNNER_START':
      return u({ runners: incrementBy(1) })
    case 'TEST_COMPLETED': {
      const { skipped, success, log } = event.result
      debug('Received test result', event.result)
      return u({
        skipped: incrementBy(skipped ? 1 : 0),
        success: incrementBy(success ? 1 : 0),
        failed: incrementBy(!skipped && !success ? 1 : 0),
        failLogs: when(!skipped && !success)(appendAll(log))
      })
    }
    case 'RUN_COMPLETED':
      return u({ running: false })
  }
  return state => state
}
