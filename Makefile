PROJECT := checkout-sdk-web

COMPOSE_FLAGS=-f docker-compose.yml
COMPOSE_FLAGS_LOCAL=$(COMPOSE_FLAGS) -f docker-compose.local.yml

# Build Docker images:
build-images:
	docker-compose build

# Build locally:
build:
	mkdir -p dist
	docker-compose \
		$(COMPOSE_FLAGS_LOCAL) run \
		--rm sdk-build-runner

# Build locally with file watcher:
build-watch:
	mkdir -p dist
	docker-compose \
		$(COMPOSE_FLAGS_LOCAL) run \
		--rm sdk-build-watcher

# Test locally:
test:
	docker-compose \
	  $(COMPOSE_FLAGS_LOCAL) run \
		--rm sdk-test-runner

# Test locally with file watcher:
test-watch:
	docker-compose \
	  $(COMPOSE_FLAGS_LOCAL) run \
		--rm sdk-test-watcher

# CI build:
build-ci:
	docker-compose \
	  $(COMPOSE_FLAGS) run \
		--rm sdk-build-runner

# CI test:
test-ci:
	docker-compose \
	  $(COMPOSE_FLAGS) run \
		--rm sdk-test-runner
