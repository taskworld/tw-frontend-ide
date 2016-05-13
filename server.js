#!/usr/bin/env node
'use strict'
const fs = require('fs')

if (!fs.existsSync('client/package.json') || !fs.existsSync('server/package.json')) {
  throw new Error('tw-frontend-ide must be run inside frontend project directory.')
}

process.env.IDESUNE_URL = 'http://127.0.0.1:1435'

const { createSelector } = require('reselect')
const { default: createSagaMiddleware } = require('redux-saga')
const renderUi = require('./renderUi')
const configureStore = require('./configureStore')
const mainSaga = require('./mainSaga')

const http = require('http')
const server = http.createServer()
server.listen(1435, 'localhost', function () {
  console.log('Listening at ' + process.env.IDESUNE_URL)
})

const io = require('socket.io')(server)
const sagas = createSagaMiddleware()
const store = configureStore(sagas)
const selectState = state => state
const selectUi = createSelector(selectState, renderUi)

sagas.run(mainSaga)

// The main part!
io.on('connection', function (socket) {
  socket.on('dispatch', (action) => store.dispatch(action))
  socket.emit('ui', selectUi(store.getState()))
})

store.subscribe(() => io.emit('ui', selectUi(store.getState())))
