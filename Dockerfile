FROM node:20-alpine

WORKDIR /app

RUN apt-get install ffmpeg

COPY package*.json .

RUN npm ci

COPY . .

RUN npm run build

CMD [ "npm", "start" ]