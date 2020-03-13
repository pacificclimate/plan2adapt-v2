FROM node:latest

ADD . /app
WORKDIR /app

RUN npm install --quiet

EXPOSE 3000

CMD npm start
