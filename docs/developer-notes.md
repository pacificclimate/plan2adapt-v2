# Developer notes

## Error handling in the app

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

### Caveat

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

## Externalized text content

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
