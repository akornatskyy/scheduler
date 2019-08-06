# Docker

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
