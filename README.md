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
