FROM golang:alpine as b

ENV APPDIR=/src

ADD . $APPDIR
WORKDIR $APPDIR

RUN set -ex \
    \
    && apk add --no-cache git upx \
    \
    && go get -v -d \
    && CGO_ENABLED=0 go build -ldflags '-s -w -extldflags "-static"' \
      -o /scheduler \
    && upx -q --brute /scheduler

FROM scratch

LABEL maintainer="Andriy Kornatskyy <andriy.kornatskyy@live.com>"

COPY --from=b /scheduler /

EXPOSE 8080

CMD ["/scheduler"]
