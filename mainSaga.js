'use strict'

const { take, put, call, race, cancelled } = require('redux-saga/effects')
const { eventChannel, END } = require('redux-saga')
const { spawn } = require('child_pty')
const createProcessLogger = require('./createProcessLogger')

const status = (app, status, message) => ({
  type: 'RECEIVE_STATUS', app, status, message
})

function * mainSaga () {
  yield [
    processManagerSaga('WEBPACK_TEST_BUTTON_CLICK', 'webpackTest',
      'npm', [ 'run', 'build:karma', '--', '--watch' ], { cwd: 'client' }
    ),
    processManagerSaga('WEBPACK_BUTTON_CLICK', 'webpackDev',
      'npm', [ 'run', 'dev' ], { cwd: 'client' }
    ),
    processManagerSaga('KARMA_BUTTON_CLICK', 'karma',
      'npm', [ 'run', 'karma' ], { cwd: 'client' }
    ),
    processManagerSaga('DEV_SERVER_BUTTON_CLICK', 'devServer',
      'npm', [ 'run', 'dev' ], { cwd: 'server' }
    ),
    processManagerSaga('DEV_SERVER_PROD_BUTTON_CLICK', 'devServerProd',
      'npm', [ 'run', 'dev:prod' ], { cwd: 'server' }
    )
  ]
}

function * pty (name, command, args, options) {
  return eventChannel(listener => {
    console.log('==> Launching process %s', name)
    const pty = spawn(command, args, {
      columns: 96,
      rows: 24,
      cwd: options.cwd
    })
    const log = createProcessLogger(name)
    pty.pty.on('data', data => {
      log(data.toString('utf8'))
    })
    pty.on('close', code => {
      console.log('==> Process %s exit %s', name, code)
      listener({ type: 'exit', code })
      listener(END)
    })
    return () => {
      console.log('==> Sending SIGHUP to %s', name)
      pty.kill('SIGHUP')
    }
  })
}

function * runCommand (name, command, args, options) {
  yield put(status(name, 'starting'))
  const process = yield call(pty, name, command, args, options)
  try {
    while (true) {
      const message = yield take(process)
      if (message.type === 'exit') {
        const result = options.oneShot ? (message.code === 0 ? 'completed' : 'error') : 'killed'
        yield put(status(name, result, message.code ? 'exit ' + message.code : ''))
      }
    }
  } finally {
    if (yield cancelled()) {
      yield put(status(name, 'stopped'))
      process.close()
    }
  }
}

function * processManagerSaga (eventName, stateName, command, args, options) {
  while (true) {
    yield take(eventName)
    yield race({
      runCommand: call(runCommand, stateName, command, args, options),
      cancel: take(eventName)
    })
  }
}

module.exports = mainSaga
