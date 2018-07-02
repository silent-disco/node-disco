# node disco

[![Build Status](https://travis-ci.org/silent-disco/node-disco.svg?branch=master)](https://travis-ci.org/silent-disco/node-disco)

A [silent disco](https://en.wikipedia.org/wiki/Silent_disco) backend written in [NodeJS](https://nodejs.org/).


## Runtime Environment

This section gives you a short overview on the required run environment. Have a look at the [setup instructions](https://github.com/silent-disco/node-disco/blob/master/resources/DEV_SETUP.md) if you would like to know how run the node disco on your machine.


### Redis

The disco uses [Redis](http://redis.io/) as a database backend. It expects Redis to be up and running at `localhost:6379`.


### NodeJS

This disco runs on [NodeJS](https://nodejs.org/) with the `--harmony` flag or [io.js](https://iojs.org/).
