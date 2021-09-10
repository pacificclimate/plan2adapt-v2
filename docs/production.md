# Production

## Docker

We currently deploy all apps using Docker. 
This project contains [Docker infrastructure](docker) and a 
[GitHub action](.github/workflows/docker-publish.yml) that automatically 
builds and tags a Docker image on each commit. The image name is
`pcic/station-data-portal-frontend`.

## Configuration, environment variables, and Docker

It is best practice to configure a web app externally, at run-time, 
typically using environment variables for any simple (atomic, e.g., 
string) configuration values.

Here we run into a problem introduced by CRA:
CRA injects environment variables only at _build time_, not at run time.
["The environment variables are embedded during the build time. Since Create React App produces a static
HTML/CSS/JS bundle, it can’t possibly read them at runtime."](https://facebook.github.io/create-react-app/docs/adding-custom-environment-variables).

We containerize our apps with Docker. A natural approach to deploying 
apps with Docker is to build the app as part of the image build, and 
then just serve it from a container. However, because of CRA's 
build-time injection of environment variables, this means that such 
Docker images cannot be configured at run-time, that is, when a 
container is run. Only static, build-time environment variables are 
available to CRA apps inside such images.

It therefore takes some extra effort to inject run-time environment 
variables (or configuration generally) into these Dockerized 
applications. There are two basic approaches:

1. Build the app, and inject run-time environment variables, as part of 
   the image run (i.e., the command run by the image includes building 
   the app, which then has access to environment variables provided via 
   the `docker run` command).
   - This is simple but it means that containers are slow to start up 
     and contain a lot of infrastructure (Node.js, etc.) needed to 
     build the image. This isn't an issue for us, because we don't 
     start many instances and we don't start them often.

2. Fetch the environment variables (or a configuration file) from the server.
    - This approach has several variants, which are outlined in this
      [CRA issue](https://github.com/facebook/create-react-app/issues/2353).

A key requirement is to be able to configure at run time the the URL at 
which  the app is deployed. CRA provides a (build-time) environment 
variable for this, `PUBLIC_URL`.

Option 2 makes setting `PUBLIC_URL` _much_ harder to accomplish, and 
would require significant changes to the codebase.

Option 1 makes setting `PUBLIC_URL` simple and requires no change to 
the codebase; as noted we don't care about the cost of using such containers.

Therefore we have chosen option 1.

## Deployment

See the contents of the [`docker`](docker) directory for an example of how
to run the Docker image. The [Makefile](Makefile) shows how to run the
image using `docker-compose`. You may wish to copy and modify
`docker-compose.yaml` to construct a production deployment.
