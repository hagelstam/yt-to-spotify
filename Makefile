build: # Build the application
	@go build -o main ./cmd/main.go

run: # Run the application
	@go run ./cmd/main.go

test: # Run tests
	@go test -v ./...

test-coverage: # Run tests with coverage
	@go test -v -coverprofile=coverage.out ./...
	@go tool cover -func=coverage.out

docker-run: # Build and run docker container
	@docker compose up --build

docker-down: # Shutdown docker container
	@docker compose down

clean: # Clean the binary
	@rm -rf main

lint: # Lint
	@if command -v golangci-lint > /dev/null; then \
		golangci-lint run ./...; \
	else \
		echo "installing golangci-lint..."; \
		go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest; \
		golangci-lint run ./...; \
	fi

help: # Print help
	@grep -E '^[a-zA-Z0-9 -]+:.*#'  Makefile | sort | while read -r l; do printf "\033[1;32m$$(echo $$l | cut -f 1 -d':')\033[00m:$$(echo $$l | cut -f 2- -d'#')\n"; done

.PHONY: build run test clean watch lint help