/* eslint camelcase: ["error", {properties: "never"}], no-warning-comments: 0 */

const services = [
  'collectory',
  'ala_hub',
  'biocache_service',
  'biocache_backend',
  'biocache_cli',
  'nameindexer',
  'ala_bie',
  'bie_index',
  'images',
  'logger',
  'lists',
  'regions',
  'webapi',
  'alerts',
  'doi',
  'dashboard',
  'sds',
  'branding',
  /* 'biocollect', */
];

const servicesRolesMap = {
  branding: {
    name: 'branding',
    group: 'branding',
    playbook: 'branding',
    desc: 'LA branding (header and footer theme)',
  },
  collectory: {
    name: 'collectory',
    group: 'collectory',
    playbook: 'collectory-standalone',
    desc: 'biodiversity collections',
  },
  ala_hub: {
    name: 'ala_hub',
    group: 'biocache-hub',
    playbook: 'biocache-hub-standalone',
    desc: 'occurrences search frontend',
  },
  biocache_service: {
    name: 'biocache_service',
    group: 'biocache-service-clusterdb',
    playbook: 'biocache-service-clusterdb',
    desc: 'occurrences web service',
  },
  ala_bie: {
    name: 'ala_bie',
    group: 'bie-hub',
    playbook: 'bie-hub',
    desc: 'species search frontend',
  },
  bie_index: {
    name: 'bie_index',
    group: 'bie-index',
    playbook: 'bie-index',
    desc: 'species web service',
  },
  images: {
    name: 'images',
    group: 'image-service',
    playbook: 'image-service',
    desc: '',
  },
  lists: {
    name: 'lists',
    group: 'species-list',
    playbook: 'species-list-standalone',
    desc: '',
  },
  regions: {
    name: 'regions',
    group: 'regions',
    playbook: 'regions-standalone',
    desc: 'regional data frontend',
  },
  logger: {
    name: 'logger',
    group: 'logger-service',
    playbook: 'logger-standalone',
    desc: 'event logging',
  },
  solr: {
    name: 'solr',
    group: 'solr7-server',
    playbook: 'solr7-standalone',
    desc: 'indexing',
  },
  cas: {
    name: 'cas',
    group: 'cas-servers',
    playbook: 'cas5-standalone',
    desc: 'authentication system',
  },
  biocache_backend: {
    name: 'biocache_backend',
    group: 'biocache-db',
    playbook: 'biocache-db',
    desc: 'cassandra',
  },
  biocache_cli: {
    name: 'biocache_cli',
    group: 'biocache-cli',
    playbook: 'biocache-cli',
    desc:
      'manages the loading, sampling, processing and indexing of occurrence records',
  },
  spatial: {
    name: 'spatial',
    group: 'spatial',
    playbook: 'spatial',
    desc: 'spatial front-end',
  },
  webapi: {
    name: 'webapi',
    group: 'webapi_standalone',
    playbook: 'webapi_standalone',
    desc: 'API front-end',
  },
  dashboard: {
    name: 'dashboard',
    group: 'dashboard',
    playbook: 'dashboard',
    desc: 'dashboard',
  },
  alerts: {
    name: 'alerts',
    group: 'alerts-service',
    playbook: 'alerts-standalone',
    desc: 'alerts',
  },
  doi: {
    name: 'doi',
    group: 'doi-service',
    playbook: 'doi-service-standalone',
    desc: 'DOI service',
  },
  nameindexer: {
    name: 'nameindexer',
    group: 'nameindexer',
    playbook: 'nameindexer-standalone',
    desc: 'nameindexer',
  },
  sds: {
    name: 'sds',
    group: 'sds',
    playbook: 'sds',
    desc: 'Sensitive Data Service',
  },
  /* Disabled for now us depends in many ALA service
     biocollect: {
     name: 'biocollect',
     group: 'biocollect',
     playbook: 'biocollect-standalone',
     desc: 'advanced data collection tool for biodiversity science',
     }, */
};

module.exports = {
  services,
  servicesRolesMap
};
