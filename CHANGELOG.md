<a name="unreleased"></a>
## [Unreleased]

<a name="v1.1.7"></a>
## v1.1.7 - 2020-11-19
- Reorder doi optional service vars used by bioache and others

<a name="v1.1.6"></a>
## v1.1.6 - 2020-11-19

- Added several new variables to prevent default ALA values. Thanks to @jloomisVCE for his feedback
- New variables added to `local-extra.sample` (like additional support emails), please compare yours with the `.sample` with some tool like `meld` to see the differences.

<a name="v1.1.5"></a>
## v1.1.5 - 2020-11-03

- Fix default value of `doi_service_url` when the DOI service is not installed or enabled. Thanks to @jloomisVCE for the feedback. It seems that this brokes the downloads

<a name="v1.1.4"></a>
## v1.1.4 - 2020-10-28

- Updated README
- Set default value for `facets_cached` in `biocache-hub`.

<a name="v1.1.3"></a>
## v1.1.3 - 2020-10-27

- Updated README

<a name="v1.1.2"></a>
## v1.1.2 - 2020-10-27

- Updated README, thanks to @jloomisVCE for the feedback
- DOI service updated to version 1.1

<a name="v1.1.1"></a>
## v1.1.1 - 2020-10-19

### Layouts
- set `header_and_footer_version` to `2` as in the default in new layouts
- remove old `skin_layout` variables after PR https://github.com/AtlasOfLivingAustralia/ala-install/pull/443

<a name="v1.1.0"></a>
## v1.1.0 - 2020-10-19
### Layouts
- Configurable layouts per service. This prevents that `skin_layout` variable is overwritten when several services run in the same server
