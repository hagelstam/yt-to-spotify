FROM golang:1.24.0-alpine as build

WORKDIR /app

COPY go.mod ./

COPY . .

RUN go build -o main ./cmd/main.go

FROM debian:bullseye-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    wget \
    python3 \
    python3-pip \
    ffmpeg \
    && pip3 install yt-dlp \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/main /app/main

RUN chmod +x /app/main

EXPOSE 8080

ENTRYPOINT ["./main"]
