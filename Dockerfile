# This Dockerfile adapted from https://mherman.org/blog/dockerizing-a-react-app/

# This Dockerfile can (and should) be used to pass through automatically generated
# version information to the build which is triggered when the image is run.
# To do this, issue the following build command:
#
# docker build --build-arg REACT_APP_CE_CURRENT_VERSION="$(./generate-commitish.sh)" -t <tag> .

FROM node:10-alpine

ADD . /app
WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH
COPY package.json /app/package.json

RUN apk add --no-cache git bash && \
    npm install --quiet && \
    npm install -g serve
COPY . /app

EXPOSE 8080

# Move the Docker build arg REACT_APP_VERSION into an
# environment variable of the same name, for consumption
# by the npm build process in ./entrypoint.sh
ARG REACT_APP_VERSION
ENV REACT_APP_VERSION $REACT_APP_VERSION

CMD ["/bin/bash", "./entrypoint.sh"]
