# Plan2Adapt Version 2

![Node CI](https://github.com/pacificclimate/plan2adapt-v2/workflows/Node%20CI/badge.svg)
![Docker Publishing](https://github.com/pacificclimate/plan2adapt-v2/workflows/Docker%20Publishing/badge.svg)

Plan2Adapt Version 2 is an updated and improved version of the original
[Plan2Adapt v1](https://pacificclimate.org/analysis-tools/plan2adapt).

## Documentation

- [Goals and product requirements](docs/goals-and-product-requirements.md)
- [Installation](docs/installation.md)
- [Configuration](docs/configuration.md)
- [Development](docs/development.md)
- [Build Process](docs/build.md)
- [Production](docs/production.md)
- [Developer notes](docs/developer-notes.md)

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
