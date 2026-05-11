# Development

## Run app locally

The default development config points `REACT_APP_REGIONS_GEOJSON_URL` at
`data/BC-regions-FNLF-84.geojson`, so the app expects the regions GeoJSON at
`public/data/BC-regions-FNLF-84.geojson`.

One way to do that is a bind mount:

```bash
sudo mount --bind /path/to/regions "$(pwd)/public/data"
```

An easier local-only option is a symlink:

```bash
ln -sf /path/to/regions/BC-regions-FNLF-84.geojson \
  public/data/BC-regions-FNLF-84.geojson
```

After either setup, start the app:

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
     docker pull pcic/plan2adapt-v2-frontend:<tag>
     ```

     Typically `<tag>` is your current branch name.

   - To build:

     `make image`

     This automatically builds an image tagged with the current branch name.

2. Run container:

   `make up`

3. Stop and remove container:

   `make down`
