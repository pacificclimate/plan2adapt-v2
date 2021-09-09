# Development

## Run app locally

```bash
npm start
```

For building and running a production app, see below.

## Run tests locally

```bash
npm test
```

Tests are also automatically run by a GitHub action on each commit.

## Test Docker infrastructure

It can be useful to test the Docker infrastructure locally before
deployment on a server. To do so:

1. Pull or build image.
    - To pull:

      ```
      docker pull pcic/station-data-portal-frontend:<tag>
      ```

      Typically `<tag>` is your current branch name.

    - To build:

      `make image`

      This automatically builds an image tagged with the current branch name.

2. Run container: 
   
   `make up`

3. Stop and remove container:  
   
   `make down`

