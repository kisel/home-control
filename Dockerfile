FROM node:alpine as builder
WORKDIR /opt/app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src/ ./src/
COPY public/ ./public/

CMD node -r ts-node/register src/main

