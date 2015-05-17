# Development Environment

This page lists the required development environment with hints on how to set it up.


## Redis

Provide a database listening on `localhost:6379`, i.e. via [Docker](https://www.docker.com/):

#### Setup

```
mkdir -p ../lib/redis/data
```

#### Run the container

Run the container:

```
(cd ../lib/redis && docker run -p 6379:6379 -v $(pwd)/data:/data -d redis:2.6 redis-server --appendonly yes)
```