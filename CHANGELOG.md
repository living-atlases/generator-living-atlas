<a name="unreleased"></a>

<a name="v1.7.2"></a>
## v1.7.2 - 2025-10-09
- If biocache store is not in use, don't use nameindexer

<a name="v1.7.1"></a>
## v1.7.1 - 2025-07-21
- Use new generic solr playbook

<a name="v1.7.0"></a>
## v1.7.0 - 2025-07-11
- Update deps and generator as a ESM module to use with latest yeoman-generator
- Set default values for some variables defined by the LA Toolkit but not defined in the command line

<a name="v1.6.22"></a>
## v1.6.22 - 2025-06-18
- Update deploy script for different build systems for backward compatibility

<a name="v1.6.21"></a>
## v1.6.21 - 2025-06-18
- Migrate deploy script to use vite instead of brunch

<a name="v1.6.20"></a>
## v1.6.20 - 2025-06-10
- Hot fix: Use netcat-openbsd in ubuntu 24.04 for monitoring

<a name="v1.6.19"></a>
## v1.6.19 - 2025-04-03
- Update profile service URL in quick-start inventory
- Update JDK version conditions in inventory file for SDS

<a name="v1.6.18"></a>
## v1.6.18 - 2025-04-03
- Added index_admin_url (thanks @StarBrand)
- Update ausTraits_definitions_url to new URL
- New bie variables comparing to ALA ones

<a name="v1.6.17"></a>
## v1.6.17 - 2025-02-14
- Let pick the mongodb_version in ala-install

<a name="v1.6.16"></a>
## v1.6.16 - 2025-02-14
- Fix typo in mongo version selection

<a name="v1.6.15"></a>
## v1.6.15 - 2025-02-12
- Set a default lists url to prevent deployment issues
- Update mongodb_version to support Ubuntu 24.04 with 8.0

<a name="v1.6.14"></a>
## v1.6.14 - 2025-02-06
- Update postgis_scripts_version to 3.5 in quick-start-inventory.ini

<a name="v1.6.13"></a>
## v1.6.13 - 2025-01-27
- Update dependencies with vulnerabilities

<a name="v1.6.12"></a>
## v1.6.12 - 2024-11-05
- Don't use ALA's profile service by default to prevent UI errors
- Setup extra var in logger
- Update apikey_check_enabled to use LA_use_CAS value

<a name="v1.6.11"></a>
## v1.6.11 - 2024-10-28
- Added blacklist sample
- bie_hub_collectory_service_url new variable
- Allow to setup bie blacklist file. Configure bie_hub_tabs

<a name="v1.6.10"></a>
## v1.6.10 - 2024-10-16
- Fix typo.
- New variables for alerts, doi and dashboard services

<a name="v1.6.9"></a>
## v1.6.9 - 2024-10-16
- New alerts variables

<a name="v1.6.8"></a>
## v1.6.8 - 2024-10-16
- java 17 support

<a name="v1.6.7"></a>
## v1.6.7 - 2024-10-14
- New GBIF backbone with lucene 6 index fixed
- Fix urls in alerts service
- More work with Ubuntu 24.04 

<a name="v1.6.6"></a>
## v1.6.6 - 2024-09-06
- Trying to fix the use of tomcat10 with ubuntu 24.04

<a name="v1.6.5"></a>
## v1.6.5 - 2024-09-06
- Add setfacts tags to -p properties option
- Added tomcat10 to ubuntu 24.04

<a name="v1.6.4"></a>
## v1.6.4 - 2024-07-22
- Correct biocache.queryContext depending on the biocache version

<a name="v1.6.3"></a>
## v1.6.3 - 2024-07-02
- Correct download directory
- image_service_logfile variable for image-service >= 3

<a name="v1.6.2"></a>
## v1.6.2 - 2024-06-07
- Allow to run docker-common playbook by ansiblew for installing common services (nginx, postfix)

<a name="v1.6.1"></a>
## v1.6.1 - 2024-05-21
- Improvements in ala security variables
- Enable/disable events in the la-toolkit
- Generate oidc/jwt keys for userdetails and generalize key generation

<a name="v1.6.0"></a>
## v1.6.0 - 2024-05-14
- JWT new variable 
- nginx for docker filter for cas 
- Correct host names for cas/spatial that caused docker to not get their variables

<a name="v1.5.9"></a>
## v1.5.9 - 2024-04-29
- Let the pick the default pg version in images using common/set-facts

<a name="v1.5.8"></a>
## v1.5.8 - 2024-04-04
- Workaround for sds-layers untar issues

<a name="v1.5.7"></a>
## v1.5.7 - 2024-04-02
- Correct lucene 6 sha1sum

<a name="v1.5.6"></a>
## v1.5.6 - 2024-04-02
- Added new species_list_ws_url

<a name="v1.5.5"></a>
## v1.5.5 - 2024-03-28
- added cas_extra_scopes

<a name="v1.5.4"></a>
## v1.5.4 - 2024-03-28
- Removing duplicate values. More work for #10
- lint_ini.py utitlity to detect duplicate values in inventories
- Review of generated inventory and review with ALA ones
- spatial new variables
- regions new variables
- docker swarm groups added
- new nameindex using GBIF new taxonomy

<a name="v1.5.3"></a>
## v1.5.3 - 2023-11-07
- Fix for missing docker group

<a name="v1.5.2"></a>
## v1.5.2 - 2023-10-11
- Added logout_action used for cognito

<a name="v1.5.1"></a>
## v1.5.1 - 2023-10-11
- Improved docker support
- Fix undefined new auth variable

<a name="v1.5.0"></a>
## v1.5.0 - 2023-10-05
- Added docker support

<a name="v1.4.3"></a>
## v1.4.3 - 2023-09-05
- Extra inventory argument for data generation
- Use service variables

<a name="v1.4.2"></a>
## v1.4.2 - 2023-07-12
- Use quotes in extra-args for multi args
- Add data quality url for OIDC keys generation
- Fix for regions layout in modern versions
- Mapbox variable. OIDC variable

<a name="v1.4.1"></a>
## v1.4.1 - 2023-06-16
- Generation of OIDC clientId and clientSecret

<a name="v1.4.0"></a>
## v1.4.0 - 2023-06-14
- Events extended data model support
- Correct skin in new regions versions

<a name="v1.3.16"></a>
## v1.3.16 - 2023-04-10
- Fix x_request_id missing variable

<a name="v1.3.15"></a>
## v1.3.15 - 2023-03-29
- Improvements in biocache-service config
- Add etckeeper as pre-deploy dep

<a name="v1.3.14"></a>
## v1.3.14 - 2023-02-20
- Use pg10 for image-service to avoid https://github.com/AtlasOfLivingAustralia/ala-install/issues/610

<a name="v1.3.13"></a>
## v1.3.13 - 2023-02-02
- Added `bie_ws_base_url` but for biocollect

<a name="v1.3.12"></a>
## v1.3.12 - 2022-12-29
- Use tomcat9 in recent biocache-service or collectory

<a name="v1.3.11"></a>
## v1.3.11 - 2022-12-29
- Disable oidc and enable cas by default while we develop something to configure keys and enable/disable
- Security dep fixes

<a name="v1.3.10"></a>
## v1.3.10 - 2022-12-29
- Correct layout in data-quality service for each version
- New biocache variables

<a name="v1.3.9"></a>
## v1.3.9 - 2022-12-21
- Removed hardcoded data-quality version

<a name="v1.3.8"></a>
## v1.3.8 - 2022-12-21
- Updated backbone with last changes in living-atlases/gbif-taxonomy-for-la
- ala-bie google link in literature configuration
- Security fixes in dependencies

<a name="v1.3.7"></a>
## v1.3.7 - 2022-12-14
- Extra variables used by BIE service

<a name="v1.3.6"></a>
## v1.3.6 - 2022-12-13
- Added sensitive-data-service to upptime configuration
- Update to new GBIF Backbone Taxonomy (23-11-2022)

<a name="v1.3.5"></a>
## v1.3.5 - 2022-11-10
- Move tomcat selection to the la-toolkit

<a name="v1.3.4"></a>
## v1.3.4 - 2022-11-8
- Added oidc_discovery_url and other oidc related variables

<a name="v1.3.3"></a>
## v1.3.3 - 2022-11-7
- Added tomcat_user for biocache-service > 3

<a name="v1.3.2"></a>
## v1.3.2 - 2022-11-7
- Add data-quality check profiles
- Added java 8/11 for newers versions of ala-hub/biocache-service (same with tomcat)

<a name="v1.3.1"></a>
## v1.3.1 - 2022-10-13
- Fix typo in species_list_version

<a name="v1.3.0"></a>
## v1.3.0 - 2022-10-13
- Added java 8 and 11 dependencies to each module
- Terms of service configuration
- CAS/OIDC enable/disable

<a name="v1.2.55"></a>
## v1.2.55 - 2022-09-26
- postgres/postgis versions now selected by ala-install via https://github.com/AtlasOfLivingAustralia/ala-install/pull/614

<a name="v1.2.54"></a>
## v1.2.54 - 2022-09-16
- Disable some userdetails profile tools (digivol, sandbox and optionally biocollect). 
- CAS logo variable `loginLogo`. 
- Userdetails creation account support articles

<a name="v1.2.53"></a>
## v1.2.53 - 2022-09-15
- Disable spring mongo sessions in cas < 6
- Disable Flickr in userdetails by default

<a name="v1.2.52"></a>
## v1.2.52 - 2022-09-12
- CAS db uris configuration 
- CAS spring session db support

<a name="v1.2.51"></a>
## v1.2.51 - 2022-09-07
- Added OICD url for auth/cas >= 6

<a name="v1.2.50"></a>
## v1.2.50 - 2022-08-04
- Configure geonetwork_db_username with a different username than spatial-ws one

<a name="v1.2.49"></a>
## v1.2.49 - 2022-08-03
- Added new CAS oauth keys variables
- Changed postgresql username for spatial different than postgres

<a name="v1.2.48"></a>
## v1.2.48 - 2022-07-20
- server_tz to general section (used now by collectory and logger)

<a name="v1.2.47"></a>
## v1.2.47 - 2022-07-13
- Remove duplicated and hardcode software versions

<a name="v1.2.46"></a>
## v1.2.46 - 2022-07-12
- Set geoserver_password to the default one (ala-install#556)

<a name="v1.2.45"></a>
## v1.2.45 - 2022-07-11
- Added sensitive-data-service support
- Don't change geoserver password via ansible (ala-install#556)

<a name="v1.2.44"></a>
## v1.2.44 - 2022-06-30
- Added biocache-service >=3 variables

<a name="v1.2.43"></a>
## v1.2.43 - 2022-06-16
- Added ssl-certs to add snake-oil self certs in SSL testing portals

<a name="v1.2.42"></a>
## v1.2.42 - 2022-06-14
- Added upptime support, see: https://upptime.js.org/

<a name="v1.2.41"></a>
## v1.2.41 - 2022-06-07
- Pin a previous version of ala-sensitive-data-service til some issues are fixed

<a name="v1.2.40"></a>
## v1.2.40 - 2022-06-06
- Pin ala-sensitive-data-service version til some issues are fixed

<a name="v1.2.39"></a>
## v1.2.39 - 2022-06-06
- Correct sds_url (for ala-sensitive-data-service)
- Correct solr_url when solrcloud is used

<a name="v1.2.38"></a>
## v1.2.38 - 2022-06-02
- Fix ecodata_apikey generation (thx Naama Arkin for the feedback)

<a name="v1.2.37"></a>
## v1.2.37 - 2022-05-24
- Revert fix for too many redirections bug in spatial (trying to fix in ala-install instead)

<a name="v1.2.36"></a>
## v1.2.36 - 2022-05-19
- Fix zookeeper config generation in clusters
 
<a name="v1.2.35"></a>
## v1.2.35 - 2022-05-11
- Fix too many redirections bug in spatial

<a name="v1.2.34"></a>
## v1.2.34 - 2022-05-11
- Fix for living-atlases/la-toolkit#9

<a name="v1.2.33"></a>
## v1.2.33 - 2022-05-09
- Added `ala-bie-hub` support

<a name="v1.2.32"></a>
## v1.2.32 - 2022-04-18
- Added biocollect and ecodata support

<a name="v1.2.31"></a>
## v1.2.31 - 2022-04-08
- More work to use collectory >= 3

<a name="v1.2.30"></a>
## v1.2.30 - 2022-03-18
- Pipelines jenkins jobs new variables

<a name="v1.2.29"></a>
## v1.2.29 - 2022-03-02
- Alerts my annotations configuration
- Set def species list when not in use

<a name="v1.2.28"></a>
## v1.2.28 - 2022-02-14
- Pin pipelines version. Set new variables different that default ALA ones
- set new vars different that default ALA ones
- Added extra dashboard variables
- Extra alerts switchs
- Added branding cors variable to setup cors in l-a branding only

<a name="v1.2.27"></a>
## v1.2.27 - 2022-01-31
- Added correct gbif API url and testing one, following: https://github.com/AtlasOfLivingAustralia/ala-install/commit/d7f0ad48529a34d522f5a205d1d2d70cbac49dba
- Fix for https://github.com/living-atlases/generator-living-atlas/issues/19 pipelines is selected for testing without solrcloud. Comment that pipelines needs a solrcloud/zookeeper cluster in inventories.

<a name="v1.2.26"></a>
## v1.2.26 - 2022-01-19
- Move BIE and Spatial lat/lon to inventory from local-extras so can be configured correctly from the toolkit. Please comment default spatial and bie lat/lon from your inventories local-extra.

<a name="v1.2.25"></a>
## v1.2.25 - 2022-01-18
- Partial fix for #10. Use of different collectory variables depending on the version

<a name="v1.2.24"></a>
## v1.2.24 - 2022-01-15
- Use of gbif-backbone of 2021-11-26 (correct, as the previously was the backbone from Sep-2021 incorrectly zip/tar) 

<a name="v1.2.23"></a>
## v1.2.23 - 2022-01-13
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
