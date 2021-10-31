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
  'spatial',
  'pipelines',
  /* 'biocollect', */
];

const servicesDesc = {
  collectory: {
    name: 'collectory',
    group: 'collectory',
    playbook: 'collectory-standalone',
    desc: 'biodiversity collections',
    allowMultipleDeploys: false,
  },
  ala_hub: {
    name: 'ala_hub',
    group: 'biocache-hub',
    playbook: 'biocache-hub-standalone',
    desc: 'occurrences search frontend',
    allowMultipleDeploys: true,
  },
  biocache_service: {
    name: 'biocache_service',
    group: 'biocache-service-clusterdb',
    playbook: 'biocache-service-clusterdb',
    desc: 'occurrences web service',
    allowMultipleDeploys: true,
  },
  ala_bie: {
    name: 'ala_bie',
    group: 'bie-hub',
    playbook: 'bie-hub',
    desc: 'species search frontend',
    allowMultipleDeploys: true,
  },
  bie_index: {
    name: 'bie_index',
    group: 'bie-index',
    playbook: 'bie-index',
    desc: 'species web service',
    allowMultipleDeploys: false,
  },
  images: {
    name: 'images',
    group: 'image-service',
    playbook: 'image-service',
    desc: '',
    allowMultipleDeploys: false,
  },
  lists: {
    name: 'lists',
    group: 'species-list',
    playbook: 'species-list-standalone',
    desc: '',
    allowMultipleDeploys: false,
  },
  regions: {
    name: 'regions',
    group: 'regions',
    playbook: 'regions-standalone',
    desc: 'regional data frontend',
    allowMultipleDeploys: true, // ALA does not uses redundant regions
  },
  logger: {
    name: 'logger',
    group: 'logger-service',
    playbook: 'logger-standalone',
    desc: 'event logging',
    allowMultipleDeploys: false,
  },
  solr: {
    name: 'solr',
    group: 'solr7-server',
    playbook: 'solr7-standalone',
    desc: 'species and/or biocache-store indexing',
    allowMultipleDeploys: false,
  },
  solrcloud: {
    name: 'solrcloud',
    group: 'solrcloud',
    playbook: 'solrcloud-monit',
    desc: 'pipelines indexing',
    allowMultipleDeploys: true,
  },
  zookeeper: {
    name: 'zookeeper',
    group: 'zookeeper',
    playbook: 'solrcloud-monit',
    desc: 'zookeeper, for solrcloud coordination',
    allowMultipleDeploys: true,
  },
  cas: {
    name: 'cas',
    group: 'cas-servers',
    playbook: 'cas5-standalone',
    desc: 'authentication system',
    allowMultipleDeploys: false,
  },
  biocache_backend: {
    name: 'biocache_backend',
    group: 'biocache-db',
    playbook: 'biocache-db',
    desc: 'cassandra',
    allowMultipleDeploys: true,
  },
  biocache_cli: {
    name: 'biocache_cli',
    group: 'biocache-cli',
    playbook: 'biocache-cli',
    desc:
      'manages the loading, sampling, processing and indexing of occurrence records',
    allowMultipleDeploys: true,
  },
  spatial: {
    name: 'spatial',
    group: 'spatial',
    playbook: 'spatial',
    desc: 'spatial front-end',
    allowMultipleDeploys: false,
  },
  webapi: {
    name: 'webapi',
    group: 'webapi_standalone',
    playbook: 'webapi_standalone',
    desc: 'API front-end',
    allowMultipleDeploys: false,
  },
  dashboard: {
    name: 'dashboard',
    group: 'dashboard',
    playbook: 'dashboard',
    desc: 'dashboard',
    allowMultipleDeploys: false,
  },
  alerts: {
    name: 'alerts',
    group: 'alerts-service',
    playbook: 'alerts-standalone',
    desc: 'alerts',
    allowMultipleDeploys: false,
  },
  doi: {
    name: 'doi',
    group: 'doi-service',
    playbook: 'doi-service-standalone',
    desc: 'DOI service',
    allowMultipleDeploys: false,
  },
  nameindexer: {
    name: 'nameindexer',
    group: 'nameindexer',
    playbook: 'nameindexer-standalone',
    desc: 'nameindexer',
    allowMultipleDeploys: true,
  },
  sds: {
    name: 'sds',
    group: 'sds',
    playbook: 'sds',
    desc: 'Sensitive Data Service',
    allowMultipleDeploys: false,
  },
  pipelines: {
    name: 'pipelines',
    group: 'pipelines',
    playbook: 'pipelines',
    desc:
      'Pipelines for data processing and indexing of biodiversity data (replacement to biocache-store)',
    allowMultipleDeploys: true,
  },
  spark: {
    name: 'spark',
    group: 'spark',
    playbook: 'spark',
    desc:
      'Spark cluster for Pipelines',
    allowMultipleDeploys: true,
  },
  hadoop: {
    name: 'hadoop',
    group: 'hadoop',
    playbook: 'hadoop',
    desc:
      'Hadoop cluster for Pipelines',
    allowMultipleDeploys: true,
  },
  jenkins: {
    name: 'jenkins',
    group: 'jenkins',
    playbook: 'jenkins',
    desc:
      'Jenkins master for Pipelines',
    allowMultipleDeploys: false,
  },
  pipelines_jenkins: {
    name: 'pipelines_jenkins',
    group: 'pipelines_jenkins',
    playbook: 'pipelines_jenkins',
    desc:
      'Jenkins slaves for Pipelines',
    allowMultipleDeploys: true,
  },
  branding: {
    name: 'branding',
    group: 'branding',
    playbook: 'branding',
    desc: 'LA branding (header and footer theme)',
    allowMultipleDeploys: true,
  },
  /* Disabled for now us depends in many ALA service
     biocollect: {
     name: 'biocollect',
     group: 'biocollect',
     playbook: 'biocollect-standalone',
     desc: 'advanced data collection tool for biodiversity science',
     }, */
};

function confExistOrFalse(conf, varName) {
  let value = conf[varName];
  return value != null ? value: false;
}

function confExistOrTrue(conf, varName) {
  let value = conf[varName];
  return value != null ? value: true;
}

function serviceUseVar(name, conf) {
  switch (name) {
    case 'collectory':
    case 'ala_hub':
    case 'biocache_service':
    case 'logger':
    case 'branding':
    case 'solr':
        return true;
    case "ala_bie":
      return  confExistOrFalse(conf, "LA_use_species");
    case "bie_index":
      return  confExistOrFalse(conf,"LA_use_species");
    case "lists":
      return  confExistOrFalse(conf,"LA_use_species_lists");
    case "cas":
      return  confExistOrFalse(conf,"LA_use_CAS");
    case "biocache_backend":
      return confExistOrTrue(conf,"LA_use_biocache_store");
    case "zookeeper":
      return confExistOrFalse(conf,`LA_use_solrcloud`);
    default:
      return confExistOrFalse(conf,`LA_use_${name}`);
  }
}

module.exports = {
  services,
  servicesDesc,
  serviceUseVar
};
