# News / Release Notes

## 1.2.0
*2020-Jul-24*

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


## 1.1.0
*2020-Jun-17*

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
*2020-May-22*

- Remove beta release notice.
## 1.0.0
*2020-May-22*

First public release.
