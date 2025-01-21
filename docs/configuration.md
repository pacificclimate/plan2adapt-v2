# Configuration

Most configuration of the Station Data Portal frontend is done via a YAML
file, `public/config.js`. For details, see below.

For technical reasons, a few configuration parameters must be supplied via
environment variables.

## Configuration via `public/config.js`

This file must be a key-value map. It overrides the default configuration
values, which are given below. Certain keys do not have default values and
_must_ be specified in `public/config.js` during development. This file
contains general defaults for getting started.

Configuration values in `config.js`:

`PUBLIC_URL`

- Base URL for for Plan2Adapt frontend app.
- For production, set this to the URL for Plan2Adapt configured in our proxy
  server.

`REACT_APP_CE_BACKEND_URL`

- Publicly accessible URL for backend climate data.

`REACT_APP_TILECACHE_URL`

- URL of tilecache providing basemap layers.

`REACT_APP_ENSEMBLE_NAME`

- Ensemble name to use for CE backend requests.

`REACT_APP_MODEL_ID`

- Identifiers of model(s) to be requested from the CE backend.
- A semicolon-separated list of identifiers; spaces are part of identifiers.
- Standard value: `REACT_APP_MODEL_ID=PCIC12;PCIC_BLEND_v1`

`REACT_APP_EMISSIONS_SCENARIOS`

- Identifiers of emissions scenarios to request from the CE backend.
- A semicolon-separated list of identifiers; spaces are part of identifiers.
- Standard value: `REACT_APP_EMISSIONS_SCENARIOS=historical,ssp585;historical, ssp585;historical`

`REACT_APP_REGIONS_SERVICE_URL`

- URL of geographic regions service.

`REACT_APP_RULES_ENGINE_URL`

- URL of rules engine service.

`REACT_APP_STATS_URL`

- URL of stats service responsible for serving up precalculated regional statistics.

`REACT_APP_NCWMS_URL`

- URL of ncWMS instance providing climate layers.

`REACT_APP_MAP_LAYER_ID_TYPE`

- Type of identifier used by the app in requests for map climate layers.
  - Value `dynamic` selects the dynamic dataset identifier type.
    A dynamic dataset identifier is formed by prefixing the value of
    `REACT_APP_MAP_LAYER_ID_PREFIX` to the filepath of the dataset
    (obtained from the metadata).
  - Any other values selects static (preconfigured) dataset identifier type.
    A simple dataset identifier is the unqiue_id of the dataset
    (obtained from the metadata).

`REACT_APP_MAP_LAYER_ID_PREFIX`

- Prefix used to form a dynamic dataset identifier, if requested.
  (See item above.)

`REACT_APP_EXTERNAL_TEXT`

- Path within the `public` folder of the external text file.

## Yaml Configuration

Much of of Plan2Adapt is configured in external configuration files.
These configuration files are stored in [the `public` folder](https://facebook.github.io/create-react-app/docs/using-the-public-folder).
The path to each configuration file inside this folder specified by an environment variable.
Specifically:

| Configuration  | Env variable              | Default value              |
| -------------- | ------------------------- | -------------------------- |
| External texts | `REACT_APP_EXTERNAL_TEXT` | external-text/default.yaml |

For more details on external text, see the section "External text" below.

During a build (`npm run build`),
files in the `public` folder are copied directly, without bundling, to the build directory (normally, `./build`).
Files in the `build` folder can be updated on the fly, so that changes to them can be made without creating
a new release of Climate Explorer.

When running the app in a production environment, we mount an external configuration file as a volume
in the docker container. (See section above.)
This external file can be modified, and the container restarted, to provide an updated version of the
variable options file without needing to modify source code, create a new release, or rebuild the image.

To change the configuration file without creating a new release of the app:

- Update the configuration file in the external file system.
- Restart the container (`docker restart plan2adapt-v2-frontend`)

Alternatives:

- Stop the app and start it again with a different value for the
  associated environment variable, and a corresponding volume mount for
  this new file.

To prevent tears, hair loss, and the cursing of your name down the generations,
we **strongly recommend also updating the configuration files
in the repo** (in the `public` folder) with any changes made, so that
they are in fact propagated to later versions. "Hot updates" should not
be stored more than briefly outside the version control system.

## Environment variables (Build Time)

CRA also provides a convenient system for setting default values of  
environment variables in various contexts (development, production, etc.).

Brief summary:

- `.env`: Global default settings
- `.env.development`: Development-specific settings (`npm start`)
- `.env.production`: Production-specific settings (`npm run build`)

In a Create React App app, [environment variables are managed carefully](https://facebook.github.io/create-react-app/docs/adding-custom-environment-variables).
Therefore, most of the environment variables below begin with
`REACT_APP_`, as required by CRA.

For more details, see the
[CRA documentation](https://facebook.github.io/create-react-app/docs/adding-custom-environment-variables)).

`REACT_APP_VERSION`

- Version of the app.
- This value should be set using `generate-commitish.sh` when the Docker image
  is built (see below).
- It is _not_ recommended to manually override the automatically generated
  value when the image is run.
- No default value for this variable is provided in any `.env` file.

`NODE_ENV`

- [**Automatically set; cannot be overridden manually.**](https://facebook.github.io/create-react-app/docs/adding-custom-environment-variables)
