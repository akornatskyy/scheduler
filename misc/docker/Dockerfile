ARG VERSION=0.0.0-dev

FROM golang:alpine AS g
ARG VERSION

ADD ./apps/api /src
WORKDIR /src

RUN set -ex \
    \
    && apk add --no-cache upx \
    \
    && CGO_ENABLED=0 go build -ldflags="-s -w \
      -X github.com/akornatskyy/scheduler/internal/domain.Version=${VERSION}" \
      -o scheduler cmd/server/main.go \
    \
    && upx -q /src/scheduler \
    \
    && apk --no-cache add ca-certificates \
    && update-ca-certificates

FROM node:alpine AS n
ARG VERSION

ADD ./apps/web /src
WORKDIR /src

RUN set -ex \
    \
    && npm --no-update-notifier --no-fund --no-audit --loglevel=error ci \
    && npm --no-update-notifier run build -- --mode=production

FROM scratch AS p

COPY --from=g /src/scheduler /
COPY --from=g /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY --from=n /api/static /static
COPY --from=n /etc/passwd /etc/passwd

FROM scratch
ARG BUILD_DATE VERSION

LABEL maintainer="Andriy Kornatskyy <andriy.kornatskyy@live.com>" \
      org.opencontainers.image.created=${BUILD_DATE} \
      org.opencontainers.image.source=https://github.com/akornatskyy/scheduler \
      org.opencontainers.image.title=scheduler \
      org.opencontainers.image.version=${VERSION}

COPY --from=p / /

USER nobody
STOPSIGNAL SIGINT
EXPOSE 8080

CMD ["/scheduler"]
