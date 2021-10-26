/* eslint camelcase: ["error", {properties: "never"}], no-warning-comments: 0 */

const { parseDomain } = require('parse-domain');
const chalk = require('chalk');
const { servicesDesc } = require('./services.js');

const defUseSubdomain = (a) => {
  return a['LA_collectory_uses_subdomain'];
};

const hostnameRegexp = /^[._\-a-z0-9A-Z, ]+$/;
const debug = false;

const isCorrectDomain = (domain) =>
  parseDomain(domain) !== null;
const isCorrectHostname = (hostname) => {
  let isCorrect = hostnameRegexp.test(hostname);
  return isCorrect
    ? true
    : 'Invalid hostname: should be something like host.example.org, myvm1, or somehost.amazonaws.com';
};

const isDefined = (someString) => {
  return (
    someString != null && someString.length > 0
  );
};

const em = (text) => chalk.keyword('orange')(text);

const defUseSubdomainPrompt = (a, service) => {
  let desc =
    servicesDesc[service].desc.length > 0
      ? ` (${servicesDesc[service].desc})`
      : '';
  return `Will the ${em(service)} module${desc} use a http${
    a['LA_enable_ssl'] ? 's' : ''
  }://${em('subdomain')}.${a['LA_domain']} or not?`;
};

const validateDomain = (input, name, logger) =>
  new Promise((resolve) => {
    if (debug) logger(`Validate ${input} ${name}`);
    // It's a domain not a https://url
    const isValid = isCorrectDomain(input) && input.split('/').length === 1;
    // As is a url we don't store now
    // if (isValid && store) storeMachine(name, input);
    if (isValid || input === 'other') {
      resolve(true);
    } else {
      if (debug) logger(input);
      resolve('You need to provide some-example-domain.org');
    }
  });

function removeOnce(arr, value) {
  let index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

function addOnce(arr, value) {
  let index = arr.indexOf(value);
  if (index === -1) {
    arr.push(value);
  }
  return arr;
}


const additionalToolkitVariables = [
  "LA_etc_hosts",
  "LA_hostnames",
  "LA_ssh_keys",
  "LA_variable_ansible_user",
  "LA_variable_caches_auth_enabled",
  "LA_variable_caches_collections_enabled",
  "LA_variable_caches_layers_enabled",
  "LA_variable_caches_logs_enabled",
  "LA_variable_cas_webflow_encryption_key",
  "LA_variable_cas_webflow_signing_key",
  "LA_variable_email_sender",
  "LA_variable_email_sender_password",
  "LA_variable_email_sender_server",
  "LA_variable_email_sender_server_port",
  "LA_variable_email_sender_server_tls",
  "LA_variable_favicon_url",
  "LA_variable_google_api_key",
  "LA_variable_header_and_footer_baseurl",
  "LA_variable_map_zone_name",
  "LA_variable_maxmind_account_id",
  "LA_variable_maxmind_license_key",
  "LA_variable_orgAddress",
  "LA_variable_orgCountry",
  "LA_variable_orgEmail",
  "LA_variable_pac4j_cookie_encryption_key",
  "LA_variable_pac4j_cookie_signing_key",
  "LA_variable_support_email",
  "LA_variable_sds_faq_url",
  "LA_is_hub",
  "LA_software_versions",
  "LA_variable_pipelines_master",
  "LA_variable_pipelines_ssh_key",
  "LA_use_pipelines_jenkins"
];

function additionalToolkitPrompts() {
  let addPrompt = [];
  for(let variable in additionalToolkitVariables) {
    // we store it but we do not show it, so we don't lost these variables configured by the la-toolkit
    addPrompt.push({store: true, when: (a)=> false, type: 'input', name: variable });
  }
  return addPrompt;
}

module.exports = {
  defUseSubdomain,
  defUseSubdomainPrompt,
  isCorrectDomain,
  isCorrectHostname,
  isDefined,
  validateDomain,
  em,
  removeOnce,
  addOnce,
  additionalToolkitPrompts
};
