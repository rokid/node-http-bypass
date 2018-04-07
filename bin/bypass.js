#!/usr/bin/env node

'use strict'

const fs = require('fs')
const ByPassServer = require('../').ByPassServer

let config

function abort(msg) {
  console.error(msg)
  process.exit()
}

try {
  const cwd = process.cwd()
  config = JSON.parse(fs.readFileSync(cwd + '/.bypassconfig'))
} catch (err) {
  return abort('.bypassconfig not found')
}

try {
  const server = new ByPassServer(config)
  server.start()
  console.log(`The ByPass server is listening on http://0.0.0.0:${server.port} for ${config.targetURL}`)
} catch (err) {
  console.log(err.message)
  abort(err && err.message)
}



