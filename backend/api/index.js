// Polyfill SlowBuffer for Node.js 22/24/26 compatibility (fixes buffer-equal-constant-time in jwa/jsonwebtoken)
const _buf = require('buffer');
if (!_buf.SlowBuffer) {
    _buf.SlowBuffer = _buf.Buffer;
}

const { app } = require('../src/index');

module.exports = app;
