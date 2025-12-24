ARG VERSION=0.0.0-dev

FROM golang:alpine AS g
ARG VERSION

ADD . /src
WORKDIR /src

RUN set -ex \
    \
    && apk add --no-cache git upx \
    \
    && go get -v -d \
    && CGO_ENABLED=0 go build -ldflags="-s -w \
      -X github.com/akornatskyy/scheduler/domain.Version=${VERSION}" \
    && upx -q /src/scheduler \
    \
    && apk --no-cache add ca-certificates \
    && update-ca-certificates

FROM node:alpine AS n
ARG VERSION

ADD . /src
WORKDIR /src

RUN set -ex \
    \
    && npm --no-update-notifier --no-fund --no-audit --omit=optional ci \
    && npm --no-update-notifier run build -- --mode=production

FROM scratch
ARG BUILD_DATE VERSION

LABEL maintainer="Andriy Kornatskyy <andriy.kornatskyy@live.com>" \
      org.opencontainers.image.created=${BUILD_DATE} \
      org.opencontainers.image.source=https://github.com/akornatskyy/scheduler \
      org.opencontainers.image.title=scheduler \
      org.opencontainers.image.version=${VERSION}

COPY --from=g /src/scheduler /
COPY --from=g /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY --from=n /src/static /static
COPY --from=n /etc/passwd /etc/passwd

USER nobody
STOPSIGNAL SIGINT
EXPOSE 8080

CMD ["/scheduler"]
