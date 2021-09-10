# Goals and product requirements

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

For more information on this app's architecture and design, see
[Plan2Adapt v2 Architecture and Development Plan](https://pcic.uvic.ca/confluence/display/CSG/Plan2Adapt+v2+Architecture+and+Development+Plan)
