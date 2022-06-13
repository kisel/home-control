FROM node:alpine as builder
WORKDIR /opt/app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src/ ./src/
COPY public/ ./public/
RUN npm run build

CMD node app/main.js

