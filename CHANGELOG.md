<a name="unreleased"></a>

<a name="v1.2.30"></a>
## v1.2.30 - 2021-03-18
- Pipelines jenkins jobs new variables

<a name="v1.2.29"></a>
## v1.2.29 - 2021-03-02
- Alerts my annotations configuration
- Set def species list when not in use

<a name="v1.2.28"></a>
## v1.2.28 - 2021-02-14
- Pin pipelines version. Set new variables different that default ALA ones
- set new vars different that default ALA ones
- Added extra dashboard variables
- Extra alerts switchs
- Added branding cors variable to setup cors in l-a branding only

<a name="v1.2.27"></a>
## v1.2.27 - 2021-01-31
- Added correct gbif API url and testing one, following: https://github.com/AtlasOfLivingAustralia/ala-install/commit/d7f0ad48529a34d522f5a205d1d2d70cbac49dba
- Fix for https://github.com/living-atlases/generator-living-atlas/issues/19 pipelines is selected for testing without solrcloud. Comment that pipelines needs a solrcloud/zookeeper cluster in inventories.

<a name="v1.2.26"></a>
## v1.2.26 - 2021-01-19
- Move BIE and Spatial lat/lon to inventory from local-extras so can be configured correctly from the toolkit. Please comment default spatial and bie lat/lon from your inventories local-extra.

<a name="v1.2.25"></a>
## v1.2.25 - 2021-01-18
- Partial fix for #10. Use of different collectory variables depending on the version

<a name="v1.2.24"></a>
## v1.2.24 - 2021-01-15
- Use of gbif-backbone of 2021-11-26 (correct, as the previously was the backbone from Sep-2021 incorrectly zip/tar) 

<a name="v1.2.23"></a>
## v1.2.23 - 2021-01-13
- Use of gbif-backbone of 2021-11-26

<a name="v1.2.22"></a>
## v1.2.22 - 2021-12-28
- Added namematching current datestamp
- Don't fail on wrong or undeployed branding urls
- Overwrite branding settings always

<a name="v1.2.21"></a>
## v1.2.21 - 2021-12-10
- Correct data-quality variable names

<a name="v1.2.20"></a>
## v1.2.20 - 2021-12-10
- Added namematching webservice and data-quality support
- Enable my annotations
- Added default biocache-hub skin layout
- Added api urls and spark params

<a name="v1.2.19"></a>
## v1.2.19 - 2021-12-01
- Use timestamps for each namedata items

<a name="v1.2.18"></a>
## v1.2.18 - 2021-12-01
- Update namedata and nameindex for latest GBIF Backbone Taxonomy

<a name="v1.2.17"></a>
## v1.2.17 - 2021-11-29
- Updated GBIF Backbone Taxonomy compatible with pipelines

<a name="v1.2.16"></a>
## v1.2.16 - 2021-11-24
- Move biocache_base_url variable to all:vars so when lists are not used is defined

<a name="v1.2.15"></a>
## v1.2.15 - 2021-11-23
- Correct hostname selection for branding if replay and is not defined (for old inventories compatibility)

<a name="v1.2.14"></a>
## v1.2.14 - 2021-11-23
- Set default hostname for branding if replay and is not defined (for old inventories compatibility)

<a name="v1.2.13"></a>
## v1.2.13 - 2021-11-23
- LA_use_solrcloud defaults to false (for old inventories compatibility)

<a name="v1.2.12"></a>
## v1.2.12 - 2021-11-23
- Removed master as worker (following Dave Martin recomendation)
- Added namematching gbif taxonomy to pipelines services. 
- Zookeeper with openjdk 11
- Added pre-deploy limit tasks. Cleanup solr pre-deploy tasks

<a name="v1.2.11"></a>
## v1.2.11 - 2021-11-18
- Use master as slave/worker too in pipelines

<a name="v1.2.10"></a>
## v1.2.10 - 2021-11-18
- Fix README documentation
- Improve branding deployment cache clearing (fix wrong url parsing)
- Correct hadoop slaves creation

<a name="v1.2.9"></a>
## v1.2.9 - 2021-11-05
- Restore solr standalone vars to all servers as is used in several roles

<a name="v1.2.8"></a>
## v1.2.8 - 2021-11-01
- Solrcloud support
- Sort services to avoid other orders caused by the use of sets and unnecessary differences in inventories
- Better support of 20.04 in pre-deploy tasks

<a name="v1.2.7"></a>
## v1.2.7 - 2021-10-28
- Fix for #19 (thanks @therobyouknow)

<a name="v1.2.6"></a>
## v1.2.6 - 2021-10-28
- Fix bug when pipelines jenkins is selected in new portals (thanks @therobyouknow)

<a name="v1.2.5"></a>
## v1.2.5 - 2021-10-27
- Fixed issue that prevent correct creation of new LA projects
- Added new SDS variables

<a name="v1.2.4"></a>
## v1.2.4 - 2021-10-26
- Better pipelines support
- Added jenkins pipelines support

<a name="v1.2.3"></a>
## v1.2.3 - 2021-10-19
- Support to multiple deploy host per service. This changed the generator quite deeply so verify your changes in your inventories to review that all is ok.
- Pipelines support. 
- Fix bug that prevent to generate .yo-rc.json correctly (so to store previous prompt answers with yeoman > 4 in the same way that versions < 4.0). 
- Preserve the extra la-toolkit variables when running from the cmd line.

<a name="v1.2.2"></a>
## v1.2.2 - 2021-10-07
- Added component version selection for the la-toolkit
- Updated all LA module versions to versions pre pipelines integration
- Added new vars for ala-hub and regions artifact selection

<a name="v1.2.1"></a>
## v1.2.1 - 2021-09-22
- Added component version selection for the la-toolkit

<a name="v1.2.0"></a>
## v1.2.0 - 2021-09-05
- Added SDS FAQ variable
- Correct isHub variable check
- Update yeoman and deps
- Remove unused deps
- Update dependencies for security vulnerabilities
- Data hubs support
- Refactor of index.js
- Postinstall of email server with correct configuration

<a name="v1.1.52"></a>
## v1.1.52 - 2021-07-21
- Postinstall of email server with correct configuration

<a name="v1.1.51"></a>
## v1.1.51 - 2021-07-19
- main task renamed to branding task. Use of new branding role.
- Branding deploy script generation

<a name="v1.1.50"></a>
## v1.1.50 - 2021-07-03
- Fix missing var because biocollect is disabled for now
- region vars commmented in local extras as gets precedence over toolkit region vars

<a name="v1.1.49"></a>
## v1.1.49 - 2021-06-16
- Image service upgrade to 1.1.5.1

<a name="v1.1.48"></a>
## v1.1.48 - 2021-06-15
- Image service downgrade

<a name="v1.1.47"></a>
## v1.1.47 - 2021-06-15
- Image service updated

<a name="v1.1.46"></a>
## v1.1.46 - 2021-06-09
- Refactor biocollect vars

<a name="v1.1.45"></a>
## v1.1.45 - 2021-06-07
- Added SDS support and biocollect (but disabled this last one for now)

<a name="v1.1.44"></a>
## v1.1.44 - 2021-06-03
- Remove unnecessary '/' in Snack Oil testing certs. Thanks @cpfaff for the feedback

<a name="v1.1.43"></a>
## v1.1.43 - 2021-05-25
- Fix lost ansiblew exec perms

<a name="v1.1.42"></a>
## v1.1.42 - 2021-05-24
- ansiblew refactor for multiple playbooks and less commands
- set limit correct tagging and reload
- Install requeriments in role dir
- Use fail2ban by default
- Use python3 in mongo-check
- Use ansible packaged limit module
- Update cache in pre-post deploy apt
    
<a name="v1.1.41"></a>
## v1.1.41 - 2021-05-17
- Update security deps
- Spatial 0.4

<a name="v1.1.40"></a>
## v1.1.40 - 2021-05-11
- Added new blacklist_source var

<a name="v1.1.39"></a>
## v1.1.39 - 2021-04-09
- Fix lint error

<a name="v1.1.38"></a>
## v1.1.38 - 2021-04-05
- Fix lint errors in pre and post-deploy roles

<a name="v1.1.37"></a>
## v1.1.37 - 2021-03-31
- Post-deploy inventories

<a name="v1.1.36"></a>
## v1.1.36 - 2021-03-30
- geonetwork_db password same that layers and pg as by default their share the same user

<a name="v1.1.35"></a>
## v1.1.35 - 2021-03-30
- Layers and pg should share the same password as by default their share the same user
- Don't set google-keys/maxmind keys if undefined or empty

<a name="v1.1.34"></a>
## v1.1.34 - 2021-03-30
- More work in pre-deploy inventories

<a name="v1.1.33"></a>
## v1.1.33 - 2021-03-29
- Simplify newServer playbook call
- Pre-deploy inventories
- Passwords of spatial service moved from all:vars section

<a name="v1.1.32"></a>
## v1.1.32 - 2021-03-24
- Removed default passwords/apikeys that are now in -local-passwords.ini
- More variables from la-toolkit
- Theme configuration
- Change .yml extensions to new .ini in README. Thanks Deniss Marinuks for the feedback
- Add extra and optional inventory -toolkit.ini generated by the la-toolkit to the ansiblew
- Replace apikeys in -local-password.ini from the la-toolkit
- Use of spatial 0.4-SNAPSHOT compatible with tomcat 8
- Echo the ansible resulting ansible-playbook cmd on when no dry run

<a name="v1.1.31"></a>
## v1.1.31 - 2021-03-04
- Migration to tomcat8
- Upgrade of biocache-service for tomcat8

<a name="v1.1.30"></a>
## v1.1.30 - 2021-03-04
- Breaking change: We are joining our inventories in a single one + a single local-extras.ini.
Please join yourportal-cas-local-extras.ini and yourportal-spatial-local-extra.ini into yourportal-local-extras.ini. Follow the generator suggestions. 
- Added new variables to inventories when provided by the la-toolkit.
- Fix parse-domain call.
- Stable logger version.
- Reenable apikey generation and admin user generation (as the ala-install PR where merged)

<a name="v1.1.29"></a>
## v1.1.29 - 2021-02-16
- New versions of alerts and bie-hub

<a name="v1.1.28"></a>
## v1.1.28 - 2021-02-11
- Disable admin user generation while the last ala-install PR are merged

<a name="v1.1.27"></a>
## v1.1.27 - 2021-02-05
- Disable apikey generation while the last ala-install PR are merged

<a name="v1.1.26"></a>
## v1.1.26 - 2021-02-03
- Serveral fixes in apikeys autogeneration and db insertion
- apikeys moved to local-password.ini
- Fix for replay-dont-ask (apikeys missed)

<a name="v1.1.25"></a>
## v1.1.25 - 2021-02-03
- First admin user creation for new LA deployments: https://github.com/AtlasOfLivingAustralia/ala-install/pull/460
- apikeys autogeneration and db insertion: https://github.com/AtlasOfLivingAustralia/ala-install/pull/461

<a name="v1.1.24"></a>
## v1.1.24 - 2021-01-27
- `ansiblew` now admits to exec multiple modules instead of one, for instance: `ansiblew cas spatial lists`

<a name="v1.1.23"></a>
## v1.1.23 - 2021-01-26
- Update our README recommending to use `ala-install` `2.0.5`

<a name="v1.1.22"></a>
## v1.1.22 - 2021-01-26
- Add some news vars to run `dashboard` correctly

<a name="v1.1.21"></a>
## v1.1.21 - 2020-12-17
- Fixes in some `dashboard` service urls

<a name="v1.1.20"></a>
## v1.1.20 - 2020-12-16
- Fixes in `dashboard` service

<a name="v1.1.19"></a>
## v1.1.19 - 2020-12-15
- Upgrade `doi` and `alerts` service

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
