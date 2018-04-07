#!/usr/bin/env node

'use strict'

const url = require('url')
const http = require('http')
const https = require('https')

class ByPassServer {
  constructor(config) {
    if (!config.targetURL)
      throw new Error('targetURL is required.')

    this.config = config
    this.targetURL = url.parse(config.targetURL || '')
    this.port = config.listen || 8080
    this.requestFunc = null

    if (this.targetURL.protocol === 'http:')
      this.requestFunc = http.request.bind(http)
    else if (this.targetURL.protocol === 'https:')
      this.requestFunc = https.request.bind(https)
    else
      throw new Error('invalid protocol, only supports http/https')
  }
  postOutgoingHeaders(source, target) {
    const headers = this.config.outgoing
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
  start() {
    http.createServer((incomingRequest, outgoingResponse) => {
      var options = {
        host: this.targetURL.host,
        method: incomingRequest.method,
        path: incomingRequest.url,
        headers: {
          ...(incomingRequest.headers),
          'Host': this.targetURL.host,
        }
      }
      const proxyRequest = this.requestFunc(options, (proxyResponse) => {
        console.log(`${proxyResponse.statusCode} ${options.method} ${options.path}`)
        for (let name in proxyResponse.headers) {
          outgoingResponse.setHeader(name, proxyResponse.headers[name])
        }
        outgoingResponse.statusCode = proxyResponse.statusCode
        this.postOutgoingHeaders(proxyResponse, outgoingResponse)
        proxyResponse.pipe(outgoingResponse, { end: true })
      })
      incomingRequest.pipe(proxyRequest, { end: true })
    }).listen(this.port)
  }
}

exports.ByPassServer = ByPassServer
