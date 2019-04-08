# Plan2Adapt Version 2

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

## Externalized text content

This project is very text-heavy. We'd rather not release a new version every time we tweak some punctuation,
so instead of embedding all the text in the app, we externalize it into a resource file and use the (PCIC-developed)
`external-texts` package to provide the text content. `external-texts` processes Markdown, so the resource file can
contain Markdown for complex content, of which we have quite a bit in this app.

The external texts file is loaded from the 
[public folder](https://facebook.github.io/create-react-app/docs/using-the-public-folder),
from a file whose path within that directory is specified by the environment variable `REACT_APP_EXTERNAL_TEXTS`.

The public folder is outside the module system managed by Webpack, and its contents are transferred when the app
is built (`npm run build`) to `/build/static`. The content of `/build/static` can therefore be updated at any time,
meaning that the external texts file can be changed after the application is built and deployed, and the updated
external texts content will be uploaded whenever the app is refreshed or launched anew after that point.

We will keep a semi-up-to-date version of the external texts file in the `/public` folder of this project for the
convenience of the developers. However the truly up-to-date content in the deployed app seen by our users is 
managed in a separate repo (`plan2adapt-external-text`?).  
When we wish to make between-release updates to the text content of the app, we update the separate repo and
deploy its contents to `/build/static`.

IMPORTANT: This means that 
**we must [deploy](https://facebook.github.io/create-react-app/docs/deployment) this app 
as a [production build](https://facebook.github.io/create-react-app/docs/production-build)**, 
and abandon our present lazy ways of just spinning up a development server with `npm start` for our production apps. 
Fortunately, this is easy.

This approach can be tested easily in a development environment:

First, install `serve` (once, globally):

```bash
npm install -g serve
```

Then build the app and serve it:

```bash
npm run build
serve -s build
```

Open this app in the browser. 
You can change the content of the external text file in `/build/static` and refresh the app in the browser to see the
changed content.

## [Project initialization](docs/Project-initialization.md)

## Package dependencies security vulnerabilities

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
