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
  'data_quality',
  'namematching_service',
  'sensitive_data_service',
  'biocollect',
  'pdfgen',
  'ecodata',
  'ecodata_reporting',
  'events',
  'events_elasticsearch',
  'docker_swarm'
];

const servicesDesc = {
  collectory: {
    name: 'collectory',
    group: 'collectory',
    playbook: 'collectory-by-type',
    desc: 'biodiversity collections',
    allowMultipleDeploys: false,
  },
  ala_hub: {
    name: 'ala_hub',
    group: 'biocache-hub',
    playbook: 'biocache-hub-by-type',
    desc: 'occurrences search frontend',
    allowMultipleDeploys: true,
  },
  biocache_service: {
    name: 'biocache_service',
    group: 'biocache-service-clusterdb',
    playbook: 'biocache-service-by-type',
    desc: 'occurrences web service',
    allowMultipleDeploys: true,
  },
  ala_bie: {
    name: 'ala_bie',
    group: 'bie-hub',
    playbook: 'bie-hub-by-type',
    desc: 'species search frontend',
    allowMultipleDeploys: true,
  },
  bie_index: {
    name: 'bie_index',
    group: 'bie-index',
    playbook: 'bie-index-by-type',
    desc: 'species web service',
    allowMultipleDeploys: false,
  },
  images: {
    name: 'images',
    group: 'image-service',
    playbook: 'image-service-by-type',
    desc: '',
    allowMultipleDeploys: false,
  },
  lists: {
    name: 'lists',
    group: 'species-list',
    playbook: 'species-list-by-type',
    desc: '',
    allowMultipleDeploys: false,
  },
  regions: {
    name: 'regions',
    group: 'regions',
    playbook: 'regions-by-type',
    desc: 'regional data frontend',
    allowMultipleDeploys: true, // ALA does not uses redundant regions
  },
  logger: {
    name: 'logger',
    group: 'logger-service',
    playbook: 'logger-service-by-type',
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
    playbook: 'solrcloud-by-type',
    desc: 'pipelines indexing',
    allowMultipleDeploys: true,
  },
  zookeeper: {
    name: 'zookeeper',
    group: 'zookeeper',
    playbook: 'solrcloud-by-type',
    desc: 'zookeeper, for solrcloud coordination',
    allowMultipleDeploys: true,
  },
  cas: {
    name: 'cas',
    group: 'cas-servers',
    playbook: 'auth-by-type',
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
    playbook: 'spatial-by-type',
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
  data_quality: {
    name: 'data_quality',
    group: 'data_quality_filter_service',
    playbook: 'data_quality_filter_service',
    desc:
      'Data Quality Filter Service',
    allowMultipleDeploys: false,
  },
  namematching_service: {
    name: 'namematching_service',
    group: 'namematching-service',
    playbook: 'namematching-service-by-type',
    desc:
      'namematching service',
    allowMultipleDeploys: true,
  },
  sensitive_data_service: {
    name: 'sensitive_data_service',
    group: 'sensitive-data-service',
    playbook: 'sensitive-data-service-by-type',
    desc:
      'web services for sensitive data evaluation',
    allowMultipleDeploys: true,
  },
  branding: {
    name: 'branding',
    group: 'branding',
    playbook: 'branding',
    desc: 'LA branding (header and footer theme)',
    allowMultipleDeploys: true,
  },
  biocollect: {
     name: 'biocollect',
     group: 'biocollect',
     playbook: 'biocollect-standalone',
     allowMultipleDeploys: false,
     desc: 'advanced data collection tool for biodiversity science',
  },
  pdfgen: {
     name: 'pdfgen',
     group: 'pdfgen',
     playbook: 'pdf-service',
     allowMultipleDeploys: false,
     desc: 'Service for turning .docs into .pdfs',
  },
  ecodata: {
    name: 'ecodata',
    group: 'ecodata',
    playbook: 'ecodata',
    allowMultipleDeploys: false,
    desc: 'provides primarily data services for BioCollect applications'
  },
  ecodata_reporting: {
    name: 'ecodata_reporting',
    group: 'ecodata-reporting',
    playbook: 'ecodata',
    allowMultipleDeploys: false,
    desc: 'provides reporting service for ecodata'
  },
  events: {
    name: 'events',
    group: 'events',
    playbook: 'events',
    allowMultipleDeploys: false,
    desc: 'events extended-data-model'
  },
  events_elasticsearch: {
    name: 'events_elasticsearch',
    group: 'events_elasticsearch',
    playbook: 'events',
    allowMultipleDeploys: true,
    desc: 'events elasticsearch'
  },
  docker_swarm: {
    name: 'docker_swarm',
    group: 'docker_swarm',
    playbook: 'docker-swarm',
    allowMultipleDeploys: true,
    desc: 'docker swarm'
  },
  gatus: {
    name: 'gatus',
    group: 'gatus',
    playbook: 'gatus',
    allowMultipleDeploys: true,
    desc: 'gatus status service'
  },
  portainer: {
    name: 'portainer',
    group: 'portainer',
    playbook: 'portainer',
    allowMultipleDeploys: true,
    desc: 'portainer docker management service'
  }
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
    case "pdfgen":
      return confExistOrFalse(conf,`LA_use_biocollect`);
    case "ecodata":
      return confExistOrFalse(conf,`LA_use_biocollect`);
    case "ecodata_reporting":
      return confExistOrFalse(conf,`LA_use_biocollect`);
    default:
      return confExistOrFalse(conf,`LA_use_${name}`);
  }
}

module.exports = {
  services,
  servicesDesc,
  serviceUseVar
};
