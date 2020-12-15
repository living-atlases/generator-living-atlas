<a name="unreleased"></a>
## [Unreleased]

<a name="v1.1.18"></a>
## v1.1.18 - 2020-12-15
- Downgrade biocache-service to `2.2.3` as newer versions require tomcat8/9

<a name="v1.1.17"></a>
## v1.1.17 - 2020-12-14
- LA software versions updated

<a name="v1.1.16"></a>
## v1.1.16 - 2020-12-14
- Partial improvements for #9 adding more documentation in `local-extras` about how to configure the api_keys

<a name="v1.1.15"></a>
## v1.1.15 - 2020-12-11
- Fix typo in `locahost` (#8) and `mail_smtp_host` instead of `mail_smtp_port` instead of `mail.smtp.host` etc
- Update README recommending to use `ala-install` `2.0.3`

<a name="v1.1.14"></a>
## v1.1.14 - 2020-12-04
- Increased download offline queue values to default ones

<a name="v1.1.13"></a>
## v1.1.13 - 2020-12-02
- Changed comment of `prod` to `production` as doi deployment_env
- Update README recommending to use `ala-install` `2.0.2`

<a name="v1.1.12"></a>
## v1.1.12 - 2020-11-27
- Added `alerts_apikey` variable for `biocache-hubs`.

<a name="v1.1.11"></a>
## v1.1.11 - 2020-11-25
- Added `skip_demo_etc_hosts` variable to skip `/etc/hosts` modification

<a name="v1.1.10"></a>
## v1.1.10 - 2020-11-20
- Added additional options to `ansiblew` (`-n` abbreviation, `--extra` and `--continue` on failure)

<a name="v1.1.9"></a>
## v1.1.9 - 2020-11-20
- Added slash to doi api url that made biocache-service to not start

<a name="v1.1.8"></a>
## v1.1.8 - 2020-11-19
- Removed wrong variable

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
