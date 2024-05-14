# This Dockerfile adapted from https://mherman.org/blog/dockerizing-a-react-app/

# This Dockerfile can (and should) be used to pass through automatically generated
# version information to the build which is triggered when the image is run.
# To do this, issue the following build command:
#
# docker build --build-arg REACT_APP_CE_CURRENT_VERSION="$(./generate-commitish.sh)" -t <tag> .

FROM node:22-alpine

WORKDIR /app
RUN chown node /app
COPY --chown=node:node . /app

ENV PATH /app/node_modules/.bin:$PATH

RUN apk add --no-cache git bash && \
    npm install --quiet && \
    npm install -g serve@13.0.0

RUN mkdir -p /app/node_modules/.cache && \
    chown -R node:node /app/node_modules/.cache

EXPOSE 8080

# Move the Docker build arg REACT_APP_VERSION into an
# environment variable of the same name, for consumption
# by the npm build process in ./entrypoint.sh
ARG REACT_APP_VERSION
ENV REACT_APP_VERSION $REACT_APP_VERSION

USER node
CMD ["/bin/bash", "docker/entrypoint.sh"]
