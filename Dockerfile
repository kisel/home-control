FROM node:14.15.0-alpine3.12 as builder
WORKDIR /opt/app

COPY package*.json ./
RUN npm install

COPY src/ ./src/
COPY public/ ./public/

CMD node src/main.js

