<div align="center">
  <img src="./docs/logo.png" height="128px" width="128px"/>
  <h1>YouTube to Spotify</h1>
  <a href="https://github.com/hagelstam/yt-to-spotify/actions">
    <img src="https://github.com/hagelstam/yt-to-spotify/actions/workflows/web-ci.yaml/badge.svg" alt="actions" />
  </a>
 <a href="https://github.com/hagelstam/yt-to-spotify/actions">
    <img src="https://github.com/hagelstam/yt-to-spotify/actions/workflows/api-ci.yaml/badge.svg" alt="actions" />
  </a>
  <a href="https://github.com/hagelstam/yt-to-spotify/commits/main">
    <img src="https://img.shields.io/github/last-commit/hagelstam/yt-to-spotify" alt="last commit" />
  </a>
</div>

### Screenshot

<img src="./docs/screenshot.png" alt="screenshot" width="800"/>

### About

Tool for downloading YouTube with rich metadata. Makes listening to songs with [Spotify local files](https://support.spotify.com/us/article/local-files/) a better experience, by embedding .mp3 files with artist name, song title and cover art metadata.

<img src="./docs/example.png" alt="example" width="600"/>

### Getting started

1. Make sure you have [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed.

2. Build and run the frontend and backend containers:

```shell
docker compose up
```

3. Open `http://localhost:3000` in a browser.

### Built with

- [Go](https://go.dev/)
- [ffmpeg](https://www.ffmpeg.org/)
- [yt-dlp](https://github.com/yt-dlp/yt-dlp)
- [Astro](https://www.cockroachlabs.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [Docker](https://www.docker.com/)

### License

This project is licensed under the terms of the [MIT](https://choosealicense.com/licenses/mit/) license.
