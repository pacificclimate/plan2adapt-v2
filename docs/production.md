## Production

### Docker

We currently deploy all apps using Docker.
This project contains [Docker infrastructure](docker) and a
[GitHub action](.github/workflows/docker-publish.yml) that automatically
builds and tags a Docker image on each commit. The image name is
`pcic/station-data-portal-frontend`.

### Configuration, environment variables, and Docker

It is best practice to configure a web app externally, at
run-time, typically using environment variables for any simple
(atomic, e.g., string) configuration values.

CRA makes this a little challenging, but we use the following
build flow to allow us to inject this configuration.

1. Configuration information is stored in `public/config.js`.
   This file is mounted in our docker containers with environment
   specific configuration options.
2. Avoid use of `process.env`. While convenient, these variables
   are build time required so can't be used for environments unless
   we build at run time. Building at runtime incurs a significant
   time delay, so shouldbe avoided.
3. Use `window.env` (defined in config.js) as an alternative, any
   environment specific information is appropriate here.
4. `PUBLIC_URL` is special and is handled using a replacement
   during docker container startup. A full explanation can be found
   in the [build](./build.md) documentation.

### Deployment

See the contents of the [`docker`](docker) directory for an example of how
to run the SDP Docker image. The [Makefile](Makefile) shows how to run the
image using `docker-compose`. You may wish to copy and modify
`docker-compose.yaml` to construct a production deployment.

Note: All **deployment environment variables**, except `REACT_APP_APP_VERSION`,
are provided by `docker/docker-compose.yaml` via the `/app/config.js` file mount.
