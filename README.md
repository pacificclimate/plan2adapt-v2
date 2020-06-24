# Plan2Adapt Version 2

[![Build Status](https://travis-ci.org/pacificclimate/plan2adapt-v2.svg?branch=master)](https://travis-ci.org/pacificclimate/plan2adapt-v2)
![Image Scan](https://github.com/pacificclimate/plan2adapt-v2/workflows/Image%20Scan/badge.svg?branch=master)

Plan2Adapt Version 2 is an updated and improved version of the original
[Plan2Adapt v1](https://pacificclimate.org/analysis-tools/plan2adapt)
with the following general requirements and goals:

1. Provide a functional superset of Plan2Adapt v1
1. Drive with CMIP5 data (from CE backend infrastructure)
1. Improve the user interface
   1. Improved layout and aesthetics (e.g., by adopting Bootstrap)
   1. Context and context-changing controls (e.g., selectors) always visible
      and immediately accessible, with immediate response.
   1. Improved client-side map (Leaflet)
   1. Interactive graphs (D3/C3 or similar)
   1. Replace overlay "dialogs" for data presentation with tabbed or similar interfaces
   1. Replace individual map elements per variable
      (e.g., Temp, Precip, Snowfall, ...) with a single map view that changes
      according to variable selection.
   1. Likewise for graphs.
   1. Generally similar to the design of the CE interface, but much simplified.
1. Improve maintainability
   1. Implement with a modern framework (React)
   1. Use library components wherever possible
      (including pcic-react-components, pcic-react-leaflet-components)

For more information on architecture and design, see
[Plan2Adapt v2 Architecture and Development Plan](https://pcic.uvic.ca/confluence/display/CSG/Plan2Adapt+v2+Architecture+and+Development+Plan)

## Production

### Docker

We use Docker for production deployment.

It can also be useful in development; for example, to test a proposed volume mounting for the container.

#### Manual processes

In general, PCIC DevOps automates Docker image building in our repositories. However, it can be useful
to manually build and run a production Docker image.

#### Building the docker image

```bash
docker build -t plan2adapt-v2-frontend \
    --build-arg REACT_APP_VERSION="$(./generate-commitish.sh)" .
```

**IMPORTANT**: Setting the build arg `REACT_APP_VERSION` as above is the most reliable
way to inject an accurate version id into the final app. This value can be overridden
when the image is run (by specifying the environment variable of the same name),
but it is not recommended, as it invites error.

#### Tag docker image

For manual build procedures,
[tagging with `latest` is not considered a good idea](https://medium.com/@mccode/the-misunderstood-docker-tag-latest-af3babfd6375).
It is better (and easy and immediately obvious) to tag with version/release
numbers. In this example, we will tag with version 1.2.3.

TODO: Ensure this documentation matches the current DevOps process.

1. Determine the recently built image's ID:

   ```bash
   $ docker images
   REPOSITORY                            TAG                 IMAGE ID            CREATED             SIZE
   plan2adapt-v2-frontend                latest              14cb66d3d145        22 seconds ago      867MB

   ```

1. Tag the image:

   ```bash
   $ docker tag 1040e7f07e5d docker-registry01.pcic.uvic.ca:5000/plan2adapt-v2-frontend:1.2.3
   ```

#### Push docker image to PCIC docker registry

[PCIC maintains its own docker registry](https://pcic.uvic.ca/confluence/pages/viewpage.action?pageId=3506599).
We place manual builds in this registry:

```bash
docker push docker-registry01.pcic.uvic.ca:5000/plan2adapt-v2-frontend:1.2.3
```

#### Run docker image

As described above, environment variables configure the app.
All are given default development and production values in the files
`.env`, `.env.development`, and `.env.production`.

These can be overridden at run time by providing them in the `docker run` command (`-e` option),
or, equivalently, in the appropriate `docker-compose.yaml` element.

In addition, we mount configuration file(s) as volumes in the container.
This enables us to update these files without rebuilding or redeploying the app.
See the section below for details.

Typical production run:

```bash
docker run --restart=unless-stopped -d \
  -p <external port>:8080 \
  --name plan2adapt-v2-frontend \
  - v /path/to/external/external-texts/default.yaml:/app/build/external-text/default.yaml \
  plan2adapt-v2-frontend:<tag>
```

### Updating configuration files

Certain parts of Plan2Adapt are configured in external configuration files.
These configuration files are stored in [the `public` folder](https://facebook.github.io/create-react-app/docs/using-the-public-folder).
The path to each configuration file inside this folder specified by an environment variable.
Specifically:

| Configuration     | Env variable                  | Default value                 |
| ----------------- | ----------------------------- | ------------------------------|
| External texts    | `REACT_APP_EXTERNAL_TEXT`     |  external-text/default.yaml   |

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

* Update the configuration file in the external file system.
* Restart the container (`docker restart plan2adapt-v2-frontend`)

Alternatives:

* Stop the app and start it again with a different value for the associated environment variable,
  and a corresponding volume mount for this new file.

To prevent tears, hair loss, and the cursing of your name down the generations,
we **strongly recommend also updating** the source configuration files in the repo (in the `public` folder)
with any changes made, so that they are in fact propagated to later versions. "Hot updates" should not be stored
outside of the version control system.

## Releasing

To create a release version:

1. Increment `version` in `package.json`
2. Summarize the changes from the last version in `NEWS.md`
3. Commit these changes, then tag the release:

  ```bash
git add package.json NEWS.md
git commit -m"Bump to version x.x.x"
git tag -a -m"x.x.x" x.x.x
git push --follow-tags
  ```

## [Project initialization](docs/Project-initialization.md)

## Developer notes

### Error handling in the app

React provides a very useful feature called an 
[error boundaries](https://reactjs.org/docs/error-boundaries.html)
for catching and handling errors raised inside app components. 
It's a declarative version of a try-catch block, and allows rendering an
alternate UI when an error occurs in a component subtree enclosed by
an error boundary component.

We use this feature in Plan2Adapt.
Our error boundary component is `components/misc/ErrorBoundary`, and it is pretty
standard. It renders an error message that includes a little information about
the error caught. It logs more information to the console for debugging.

#### Caveat

_**In development mode**_ (i.e., `npm start`), a React feature called 
[strict mode](https://reactjs.org/docs/strict-mode.html) appears to be in force,
despite documentation stating that it is optional and none of our code opting in.
The consequence for error boundaries is that strict mode causes component `render` 
(and other lifecylce methods) to be called twice for each nominal render. 
(Read about why in the documentation.) 
Unfortunately, this has the effect of making most errors (exceptions) thrown in a
component subtree be thrown twice, and the second time somehow evades the error boundary.

What you will see is: 

1. The error boundary fallback (error) UI appears. The app is still running.
2. A short time later (second render), a standard JavaScript error appears, replacing
the entire app (which has crashed).

This is annoying and makes it hard to develop error boundary code, because you only see
the results briefly. 

However, _**in production mode**_ (i.e., `npm build`), strict mode is off, and the UI
renders properly, including error boundary fallbacks. To make it easier on developers,
we have added an npm script `npm run build-serve` that builds the app and serves it on 
`localhost:3001`. It doesn't hot update like `npm start`, but it does allow you to see
production behaviour. When you want to see the effects of code changes, stop the script
and re-run it.

### Externalized text content

TL;DR: We've externalized almost all the text in this app. That text can be hot-updated
in production by changing the contents of a file not managed by Webpack, specifically 
`/build/external-text/default.yaml`, and restarting the Docker image.

This project is very text-heavy. We'd rather not release a new version every time we tweak some punctuation,
so instead of embedding all the text in the app, we externalize it into a resource file and use the (PCIC-developed)
`pcic-react-external-text` package to provide the text content. `pcic-react-external-text` processes Markdown,
so the resource file can contain Markdown for complex content, of which we have quite a bit in this app.

The external text resource file is loaded from the project's
[public folder](https://facebook.github.io/create-react-app/docs/using-the-public-folder),
from a file whose path within that folder is specified by the environment variable `REACT_APP_EXTERNAL_TEXT`.
The present setting for this path is `external-text/default.yaml`.

In a Create React App app (which this is), the
public folder is outside the module system managed by Webpack, and its contents are transferred to `/build/static`
when the app is built (`npm run build`).
Being outside the module system, the content of `/build/static` can be updated at any time,
meaning that the external texts file can be changed after the application is built and deployed.
The updated external text content will be used whenever the app is refreshed or launched anew after that point.

During development, you can update the external text file and refresh the app to see the effect of the new content.

### Package dependencies security vulnerabilities

Since npm@6, npm has included a tool,
[`npm audit`](https://blog.npmjs.org/post/173719309445/npm-audit-identify-and-fix-insecure)
to protect code from known security risks in package dependencies.

`npm audit` runs automatically whenever `npm install` is run, and can also
be run independently from the command line.

`npm audit` shows, at the time of this writing, 63 low-concern
vulnerabilities, all due to package `braces`. Given the low concern and the
nature of the vulnerability, it is not worth addressing at this time.

The output of `npm audit` should be heeded, and if other vulnerabilities
are flagged, they should be evaluated and addressed if necessary.
