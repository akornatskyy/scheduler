FROM golang:alpine as g

ADD . /src
WORKDIR /src

RUN set -ex \
    \
    && apk add --no-cache git upx \
    \
    && go get -v -d \
    && CGO_ENABLED=0 go build -ldflags '-s -w -extldflags "-static"' \
    && upx -q /src/scheduler

FROM node:alpine as n

ADD . /src
WORKDIR /src

RUN set -ex \
    \
    && npm i \
    && NODE_ENV=production npm run build

FROM scratch

LABEL maintainer="Andriy Kornatskyy <andriy.kornatskyy@live.com>"

COPY --from=g /src/scheduler /
COPY --from=n /src/static /static
COPY --from=n /etc/passwd /etc/passwd

USER nobody
STOPSIGNAL SIGINT
EXPOSE 8080

CMD ["/scheduler"]
