# node disco

[![Build Status](https://travis-ci.org/silent-disco/node-disco.svg?branch=master)](https://travis-ci.org/silent-disco/node-disco)

A [silent disco](https://en.wikipedia.org/wiki/Silent_disco) backend written in [NodeJS](https://nodejs.org/).


## Database

The disco uses [Redis](http://redis.io/) as a database backend.


#### Setup

Provide a database listening on `localhost:6379`, i.e. via [Docker](https://www.docker.com/):

```
mkdir -p ../lib/redis/data
```

Run the container:

```
(cd ../lib/redis && docker run -p 6379:6379 -v $(pwd)/data:/data -d redis:2.6 redis-server \
    --appendonly yes)
```


## NodeJS

This disco requires [NodeJS](https://nodejs.org/) with the `--harmony` flag or [io.js](https://iojs.org/) to run.