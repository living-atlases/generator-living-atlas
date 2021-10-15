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
};
