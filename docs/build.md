# Building the project

There are 3 modes of operation for the application which take slightly different build steps:

### Local

Everything in the project should be set up for easy development with defaults provided that allow
execution without modification to configuration. This execution is done via `npm run start`. The
project is then built via create react app and a local development server is started.

Local config is provided via [public/config.js](../public/config.js) and is loaded automatically
as a static javascript file via the local development server.

Public URL is overridden by the `.env.development` file to our expected `http://localhost:3000`

### Local Docker

Testing for deployment involves building in production mode and setting up a container as we will
in production. This allows us to ensure that dependencies are met and gives us a portable artifact
that we can set up on any docker capable machine and expect to work.

Creating the container can be done via the `make image` command. This command executes `npm run build`
creating a static version of the website. `process.env` variables are baked into the files at this
time, so it should be avoided for evironment specific configuration use. These static assests are in
the `build/` folder. Once built the [Dockerfile](../../docker/Dockerfile) pulls in these files along
with dependencies to generate a docker image.

Running the created docker image can be done via `make up`. This brings up the image based on the
specification in the [docker-compose.yaml](../../docker/docker-compose.yaml). This specification also
overrides our local development configuration values by mounting an alternative configuration. Two examples
are provided `config.bc.js` and `config.ynwt.js` representing our two common production versions. `bc`
is used by default.

`PUBLIC_URL` is handled in two steps. During the build process we define a replacement value in `.env.production`
which is injected into any locations where the public URL is required. When the container starts we replace
these instances with the public URL defined in whatever `/app/config.js` within the container has for the
`PUBLIC_URL` value. The specific implementation of this replacement can be found in the
[entrypoint.sh](../../docker/entrypoint.sh) file which is used as the default entrypoint for the container
when it starts.

### Production Docker

Production docker essentially follows the same steps as above (what good would a local test be otherwise!)
but is executed via a github workflow. The resulting image is uploaded to our
[docker hub](https://registry.hub.docker.com/r/pcic/station-data-portal-frontend) for use where desired.

Specific steps are defined in the [github workflow](../../.github/workflows/docker-publish.yml) file.

When running in production we need to provide environment specific config, this config will closely
resemble the templates defined in the `config.bc.js` and `config.ynwt.js` files noted above and should be
mounted to `/app/config.js` within the container.
