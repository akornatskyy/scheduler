.PHONY: install install-api install-web api web dev dev-api dev-web test \
	test-api test-web lint lint-api lint-web build build-api build-web clean

ifeq ($(OS),Windows_NT)
  BINARY_EXT := .exe
else
  BINARY_EXT :=
endif

BINARY_NAME=scheduler$(BINARY_EXT)
API_DIR=apps/api
WEB_DIR=apps/web
BUILD_DIR=$(API_DIR)/static

export PATH := $(shell pwd)/$(WEB_DIR)/node_modules/.bin:$(PATH)

default: api web

install: install-api install-web

install-api:
	cd $(API_DIR) && go mod download

install-web:
	cd $(WEB_DIR) \
	&& npm --no-update-notifier --no-fund --no-audit --loglevel=error ci

api: test-api build-api

web: lint-web test-web build-web

dev:
	@$(MAKE) -j2 dev-api dev-web

dev-api:
	cd $(API_DIR) && go run cmd/server/main.go

dev-web:
	cd $(WEB_DIR) && webpack serve

test: test-api test-web

test-api:
	cd $(API_DIR) && go test ./...

test-web:
	cd $(WEB_DIR) && jest

lint: lint-api lint-web

lint-api:
	cd $(API_DIR) && golangci-lint run ./...

lint-web:
	cd $(WEB_DIR) && npm run lint

build: build-web build-api

build-api:
	cd $(API_DIR) \
	&& CGO_ENABLED=0 go build -ldflags="-s -w \
  	-X github.com/akornatskyy/scheduler/internal/domain.Version=$${VERSION}" \
	  -o ../../$(BINARY_NAME) cmd/server/main.go

build-web:
	cd $(WEB_DIR) && npm run build -- --mode=production

image:
	docker build -t akorn/scheduler \
		--build-arg BUILD_DATE=$(shell date -u +"%Y-%m-%dT%H:%M:%SZ") \
		--build-arg VERSION=${VERSION} \
  	-f deployments/docker/Dockerfile .

clean:
	rm -rf $(BINARY_NAME) $(BUILD_DIR)
