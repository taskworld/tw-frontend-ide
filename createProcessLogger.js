
const { padEnd } = require('lodash')

module.exports = function createProcessLogger (name) {
  let _buffer = ''
  return (text) => {
    _buffer += text
    for (;;) {
      const idx = _buffer.indexOf('\n')
      if (idx === -1) return
      console.log('%s | %s', padEnd(name, 24), _buffer.substr(0, idx))
      _buffer = _buffer.substr(idx + 1)
    }
  }
}
