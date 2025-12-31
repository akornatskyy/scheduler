# Docker

Build docker images.

```sh
docker build -t akorn/scheduler --build-arg VERSION=${VERSION} \
  -f deployments/docker/Dockerfile .
```

## Docker componse

```sh
export COMPOSE_FILE=./deployments/docker/compose.yml

docker compose up -d
docker compose logs -f --tail=10
docker compose down
```

Update api with a fresh image.

```sh
docker compose stop api
docker compose up -d api

docker image prune --all
# or
docker rmi $(docker images | grep "^<none>" | awk "{print $3}")
```
