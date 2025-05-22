# News / Release Notes

## 2.4.1

_2025-Mar-13_

- Corrected an incorrect URL used for loading vector basemap tiles.(#283)
- Precision Handling Updates
  - Projected Change: Now uses whole number precision for all variables except temperature. (#282)
  - Baseline Values: Updated to use two-decimal precision for pr and prsn variables. (#279)
  - Added logic to allow separate precision settings for baseline and projected values per variable.

## 2.4.0

_2025-Mar-13_

This release updates dependencies, refactors map handling, and enhances development workflows.

- **Update dependencies:** React 18, react-leaflet v4, pcic-react-leaflet-components
  - Refactor map handling: Use useMap(), improve prop drilling, and fix zoom/pan behavior
  - Improve rendering & resizing: Use invalidateSize() for proper window resizing and reloads
  - Refactor StaticControl: Now a functional component
  - [Details 1](https://github.com/pacificclimate/plan2adapt-v2/pull/273)
- **Development & build improvements**
  - New devcontainer configuration
  - Faster Docker startup by pre-building static files
  - Move ENV variables to config.js
  - Optimize Dockerfile with Debian minimal & health check
  - [Details 2](https://github.com/pacificclimate/plan2adapt-v2/pull/277)

## 2.3.0

_2024-May-21_

- Use CanDCS-M6 future climate scenarios and PCIC-Blend Baseline datasets
  - [Details 1](https://github.com/pacificclimate/plan2adapt-v2/pull/269/files)
  - [Details 2](https://github.com/pacificclimate/plan2adapt-v2/pull/268)
- [Add new First Nations Territories and Language Families](https://github.com/pacificclimate/plan2adapt-v2/pull/265)
- [Update Map tab UI](https://github.com/pacificclimate/plan2adapt-v2/pull/266)
- [Improvements to Stats and graphs tabs](https://github.com/pacificclimate/plan2adapt-v2/pull/269/files)
- Security, Environment variables, and dependency updates
  - [Details 1](https://github.com/pacificclimate/plan2adapt-v2/pull/258)
  - [Details 2](https://github.com/pacificclimate/plan2adapt-v2/pull/264)

## 2.2.0

_2021-Oct-18_

- [Use BC Albers basemap ](https://github.com/pacificclimate/plan2adapt-v2/pull/234)
- [Update deployment infrastructure](https://github.com/pacificclimate/plan2adapt-v2/pull/238)
- [Add IE detection and deprecation message ](https://github.
  com/pacificclimate/plan2adapt-v2/pull/210)
- Update DevOps infrastructure

## 2.1.0

_2020-Aug-19_

This release adds the option to request climate layers from ncWMS as dynamic
datasets.

- [Add capability for dynamic dataset map layers](https://github.com/pacificclimate/plan2adapt-v2/pull/200)

Backend requirements:

- Climate Explorer Backend
  - if using dynamic datasets CEB >= 3.1.0
  - otherwise CEB >= 3.0.1

## 2.0.0

_2020-Aug-07_

This release makes Plan2Adapt compatible with the updated Climate Explorer backend,
version 3.0.1. This version of Plan2Adapt is not compatible with CE backend < 2.0.0.

- [Update to accept new `/percentilanomaly` response format](https://github.com/pacificclimate/plan2adapt-v2/pull/204)

Backend requirements:

- Climate Explorer Backend >= 3.0.1

## 1.2.0

_2020-Jul-24_

This release improves the behaviour of the UI in several ways, with particular
attention to map behaviour. It also provides for converting variable values to
user-friendly units, and that facility is used to present precip and snowfall values
in cumulative units (mm) over the selected season (e.g., annual, winter). Finally,
it includes some major internal code improvements that provide much better
error handling (which should rarely be seen by users) and that make maintenance and
configuration simpler.

- [Display warnings with relative values based on low baseline values](https://github.com/pacificclimate/plan2adapt-v2/issues/159)
- [Add new variables; change pr, prsn units](https://github.com/pacificclimate/plan2adapt-v2/issues/183)
- [Use lethargic map scrolling](https://github.com/pacificclimate/plan2adapt-v2/issues/144).
  Fixes awkward map scrolling behaviour with certain touchpads and mice.
- [Present precip and snowfall in cumulative units](https://github.com/pacificclimate/plan2adapt-v2/issues/173)
- Improve labels for [seasons](https://github.com/pacificclimate/plan2adapt-v2/issues/180), variables
- [Improve speed and responsiveness of UI](https://github.com/pacificclimate/plan2adapt-v2/issues/149)
- [Improve map and map tab behaviour](https://github.com/pacificclimate/plan2adapt-v2/pull/193)
- [Make app more robust to missing or invalid config data](https://github.com/pacificclimate/plan2adapt-v2/issues/85)
- Miscellaneous code maintainability improvements.

Backend requirements:

- Climate Explorer Backend <= 1.3.0

## 1.1.0

_2020-Jun-17_

- Implement the Graphs tab. This is our big accomplishment
  for this release. There are still some refinements to
  come, but the essential functionality is present now.
- Update some variable labelling and units.
- Handle case of zero baseline values.
- Fix colourbar tab-change glitch.
- Behave gracefully when data/metadata are not avilable.
- Reset map viewport only when new region selected.
- Automatically set version in image build.

## 1.0.1

_2020-May-22_

- Remove beta release notice.

## 1.0.0

_2020-May-22_

First public release.
