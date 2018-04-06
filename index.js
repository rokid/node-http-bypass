#!/usr/bin/env node

'use strict'

const fs = require('fs')
const url = require('url')
const http = require('http')
const https = require('https')

let config
let request
let port

function abort(msg) {
  console.error(msg)
  process.exit()
}
try {
  const cwd = process.cwd()
  config = JSON.parse(fs.readFileSync(cwd + '/.bypassconfig'))
  port = config.listen || 8080
} catch (err) {
  return abort('.bypassconfig not found')
}

if (!config.targetURL)
  return abort('targetURL required')

const targetURL = url.parse(config.targetURL || '')

if (targetURL.protocol === 'http:') {
  request = http.request.bind(http)
} else if (targetURL.protocol === 'https:') {
  request = https.request.bind(https)
} else {
  return abort('invalid protocol, only supports http & https')
}

function postOutgoingHeaders(source, target) {
  const headers = config.outgoing
  for (let name in headers) {
    const oldValue = source.headers[name]
    const value = headers[name]
    const op = value[0]
    if (op === '+') {
      target.setHeader(name, `${oldValue}, ${value.slice(1)}`)
    } else if (op === '-') {
      // TODO
    } else {
      target.setHeader(name, value)
    }
    console.log(` ${op}${name}`, target.getHeaders()[name])
  }
}

http.createServer((incomingRequest, outgoingResponse) => {
  var options = {
    host: targetURL.host,
    method: incomingRequest.method,
    path: incomingRequest.url,
    headers: {
      ...(incomingRequest.headers),
      'Host': targetURL.host,
    }
  }
  const proxyRequest = https.request(options, (proxyResponse) => {
    console.log(`${proxyResponse.statusCode} ${options.method} ${options.path}`)
    for (let name in proxyResponse.headers) {
      outgoingResponse.setHeader(name, proxyResponse.headers[name])
    }
    outgoingResponse.statusCode = proxyResponse.statusCode
    postOutgoingHeaders(proxyResponse, outgoingResponse)
    proxyResponse.pipe(outgoingResponse, { end: true })
  })
  incomingRequest.pipe(proxyRequest, { end: true })
}).listen(port)

console.log(`The ByPass server is listening on http://0.0.0.0:${port} for ${config.targetURL}`)

