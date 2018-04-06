node-http-bypass
========================

Bypass your HTTP/HTTPS backend service configrablly in an easy way.

### Use case

Currently we are using this module to debug our new forum website, which is based on discourse API, the CORS-required
website.

CORS sometimes sometimes take you in a trap, and block your development flow, right?
Now, within node-http-bypass, you could customize anything that you wanna without configure anything, just start
writing code and put the CORS configurations after the demo is done!

### Installation

```sh
$ npm i node-http-bypass -g
```

### Usage

You need to define the following JSON under your working directory:

```json
{
  "listen": 8888,
  "targetURL": "https://github.com",
  "outgoing": {
    "access-control-allow-headers": "+Content-Type"
  }
}
```

This JSON should be named as `.bypassconfig` and under your `CWD`. Run `bypass` or `http-bypass` in your shell,
the program reads this config file, and do the followings:

- start the proxy server on `listen` as its port.
- when requesting to proxy server, it do request based on the `targetURL`.
- when the target responds to proxy server finally, we will rewrites the response headers by the field `outgoing`.
  - for the `+s` rule, it inserts the given string to the header.
  - for the `s`(string) rule, it replaces the whole value of the specific header.

### License

MIT @ Rokid, Inc.
