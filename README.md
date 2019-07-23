# Scheduler

[![Build Status](https://travis-ci.org/akornatskyy/scheduler.svg?branch=master)](https://travis-ci.org/akornatskyy/scheduler)

Scheduler is a fully managed cron job scheduler. It allows you to schedule
virtually any job (e.g. such as calling HTTP/S endpoints). You can automate
everything, including retries in case of failure, run jobs right away, on a recurring
schedule, or at some point in the future.

Scheduler allows you to manage all of your automation tasks in a single place via
simple UI or command line.

## Docker

Build docker images.

```sh
docker build -t akorn/scheduler -f misc/docker/Dockerfile .
```

Docker componse.

```sh
cd misc/docker

docker-compose up -d
docker-compose logs -f --tail=10
docker-compose down
```

Update api with a fresh image.

```sh
docker-compose stop api
docker-compose up -d api
docker rmi $(docker images | grep "^<none>" | awk "{print $3}")
```
