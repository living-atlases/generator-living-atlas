/* eslint camelcase: ["error", {properties: "never"}], no-warning-comments: 0 */

// For Prompt options:
// https://github.com/SBoudrias/Inquirer.js

'use strict';
const Generator = require('yeoman-generator');

const yosay = require('onionsay');
const niceware = require('niceware');
const fsN = require('fs');
const {v4: uuidv4} = require('uuid');
const bcrypt = require('bcrypt');
const Base64 = require('js-base64');
const {
  defUseSubdomain,
  defUseSubdomainPrompt,
  isCorrectHostname,
  isDefined,
  em,
  validateDomain,
} = require('./libs.js');
const {services, servicesRolesMap} = require('./services.js');

let defaultStore = false;
let logger;
let debug = false;
let replay = false;
let dontAsk = false;
let previousConfig;
let firstRun;

/*
   Set of used machines
 */
const machines = [];
const machinesSorted = [];

/*
   We store used `context` like this:

   machinesAndPaths["machine"]["url"]["path"] = true;

   so we can check that in a same machine we don't configure two servers
   with the same domain and the same path

 */
const machinesAndPaths = {};

const servicesAndMachines = [];

const vhostsSet = new Set(); // use for nginx_vhost_fragments_to_clear

const storeMachine = (name, machine) =>
  new Promise((resolve, reject) => {
    if (debug) logger(`Store: ${name} -> ${machine}`);
    if (isCorrectHostname(machine) === true) {
      if (debug) logger('We add to the first position');
      if (!machines.includes(machine)) machines.push(machine);
      if (!machinesSorted.includes(machine)) machinesSorted.unshift(machine);
      servicesAndMachines.push({
        service: name,
        machine,
        map: servicesRolesMap[name],
      });
    } else {
      reject(new Error(`Invalid hostname '${machine}' for '${name}'`));
    }
    if (debug) logger(machines);
    if (debug) logger(machinesSorted);
    resolve(machine);
  });

function PromptSubdomainFor(name, subdomain, when, force) {
  this.store = defaultStore;
  this.type = 'confirm';
  const varName = `LA_${name}_uses_subdomain`;
  this.name = varName;
  this.message = (a) => defUseSubdomainPrompt(a, name);
  this.default = (a) => defUseSubdomain(a);
  if (force) {
    this.when = (a) =>
      new Promise((resolve) => {
        a[varName] = true;
        resolve(false);
      });
  } else {
    if (when) {
      this.when = when;
    }
  }
}

function urlDefValue(a, varUsesSubdomain, subdomain, varName) {
  const hasPrevious =
    typeof previousConfig !== 'undefined' &&
    typeof previousConfig[varName] !== 'undefined';
  if (replay && hasPrevious) {
    return previousConfig[varName];
  }
  if (typeof varUsesSubdomain !== 'undefined' && a[varUsesSubdomain]) {
    return `${subdomain}.${a['LA_domain']}`;
  }
  return `${a['LA_domain']}`;
}

function hostChoices(a, varUsesSubdomain, subdomain, varName) {
  let choices;
  if (typeof varUsesSubdomain !== 'undefined' && a[varUsesSubdomain]) {
    choices = [...machinesSorted, `${subdomain}.${a['LA_domain']}`, 'other'];
  } else {
    choices = [...machinesSorted, 'other'];
  }
  // Add previous selected hostname at the start of the array
  const hasPrevious =
    typeof previousConfig !== 'undefined' &&
    typeof previousConfig[varName] !== 'undefined';
  const previousHostname = hasPrevious ? previousConfig[varName] : null;
  if (debug) logger(`hasPrevious: ${hasPrevious} ${previousHostname}`);
  if (replay && hasPrevious) {
    if (choices.includes(previousHostname)) {
      // Remove and later put in the first position
      for (let i = 0; i < choices.length; i++) {
        if (choices[i] === previousHostname) {
          choices.splice(i, 1);
        }
      }
    }
    choices.unshift(previousHostname);
  }
  if (debug) logger(choices);
  return choices;
}

function PromptHostnameFor(name, subdomain, when) {
  this.store = defaultStore;
  this.type = 'list';
  const varName = `LA_${name}_hostname`;
  const varUsesSubdomain = `LA_${name}_uses_subdomain`;
  this.name = varName;
  this.message = `LA ${em(
    name
  )} hostname (like myvm1, somehost.amazonaws.com, ...) ?`;
  this.choices = (a) => hostChoices(a, varUsesSubdomain, subdomain, varName);
  if (when) {
    this.when = when;
  }
  // This does not work with list:
  // this.filter = input => storeMachine(name, input);
  // https://github.com/SBoudrias/Inquirer.js/issues/383
}

function PromptHostnameInputFor(name, when) {
  this.store = defaultStore;
  this.type = 'input';
  const varName = `LA_${name}_hostname`;
  this.name = varName;
  this.message = `LA ${em(name)} hostname ?`;
  this.when = (a) => {
    if (debug) logger(`We ask for other ${name}/${a[varName]}?`);
    if (typeof when !== 'undefined' && !when(a)) {
      if (debug) logger("We don't ask for other hostname");
      return false;
    }
    if (a[varName] === 'other') {
      if (debug) logger("We ask for 'other' hostname");
      return true;
    }
    // And don't ask again
    return false;
  };
  this.validate = (input) => isCorrectHostname(input);
}

function PromptUrlFor(name, subdomain, when) {
  this.store = defaultStore;
  this.type = 'input';
  const varName = `LA_${name}_url`;
  const varUsesSubdomain = `LA_${name}_uses_subdomain`;
  this.name = varName;
  this.message = `LA ${em(name)} base url ?`;
  if (when) {
    this.when = when;
  }
  this.default = (a) => urlDefValue(a, varUsesSubdomain, subdomain, varName);
  this.validate = async (input, a) => {
    // Store previous hostname from choices or input request for later use
    const varHostName = `LA_${name}_hostname`;
    const varUrl = `LA_${name}_url`;
    if (debug) logger(`We store ${name} hostname with ${a[varHostName]}`);
    await storeMachine(name, a[varHostName]);
    vhostsSet.add(a[varUrl]);
    // Now we verify the url
    return validateDomain(input, name, logger);
  };
}

function PromptPathFor(name, path, when) {
  this.store = defaultStore;
  const varName = `LA_${name}_path`;
  const varUsesSubdomain = `LA_${name}_uses_subdomain`;
  const varHostname = `LA_${name}_hostname`;
  const varUrl = `LA_${name}_url`;
  this.type = 'input';
  this.name = varName;
  this.message = (a) => {
    // Warn: dup code below
    const samplePath = a[varUsesSubdomain]
      ? '/'
      : `/${typeof path === 'undefined' ? '' : path}`;
    return `Which context ${em('/path')} you wanna use for this service (like ${
      a[varUrl]
    }${em(samplePath)}) ?`;
  };
  this.default = (a) => {
    if (a[varUsesSubdomain]) {
      const hostname = a[varHostname];
      const url = a[varUrl];
      const rootUsed =
        typeof machinesAndPaths[hostname] !== 'undefined' &&
        typeof machinesAndPaths[hostname][url] !== 'undefined' &&
        machinesAndPaths[hostname][url]['/'];
      return rootUsed ? `/${typeof path === 'undefined' ? '' : path}` : '/';
    }
    return typeof path === 'undefined' ? '' : `/${path}`;
  };
  if (when) {
    this.when = when;
  }
  this.validate = (path, answers) =>
    new Promise((resolve) => {
      // Check if in this machine this path is already used
      if (!path.startsWith('/')) {
        resolve("Please enter something like '/path'");
      }
      // FIXME check better url here
      const hostname = answers[`LA_${name}_hostname`];
      const url = answers[`LA_${name}_url`];
      const used =
        machinesAndPaths[hostname] &&
        machinesAndPaths[hostname][url] &&
        machinesAndPaths[hostname][url][path];
      if (used) {
        resolve(`This context /path is already in use in this machine`);
      }
      if (!machinesAndPaths[hostname]) {
        machinesAndPaths[hostname] = {};
      }
      if (!machinesAndPaths[hostname][url]) {
        machinesAndPaths[hostname][url] = {};
      }
      machinesAndPaths[hostname][url][path] = true;
      resolve(true);
    });
}


function replaceLine(filePath, oldContent, newContent) {
  let content = this.fs.read(this.destinationPath(filePath));
  const regexp = new RegExp(`^[ \\t]*${oldContent}.+$`, 'm');
  content = content.replace(regexp, newContent);
  this.fs.write(this.destinationPath(filePath), content);
}

function generateBranding(conf, brandDest) {
  const brandSettings = `${brandDest}/app/js/settings.js`;
  const brandDeployDest = `${brandDest}/deploy.sh`;

  // noinspection JSUnresolvedFunction
  this.fs.copyTpl(
    this.templatePath('deploy-branding.sh'),
    this.destinationPath(brandDeployDest),
    conf
  );
  if (this.fs.exists(brandSettings)) {
    if (
      conf['LA_theme'] != null &&
      conf['LA_theme'] !== 'custom'
    ) {
      // try to change the theme in the settings
      logger(
        'INFO: trying to setup the theme of current branding settings'
      );
      replaceLine.call(this,
        brandSettings,
        'theme:',
        `  theme: '${conf['LA_theme']}',`
      );
    } else {
      // just copy a sample
      logger('INFO: copying a branding settings sample');
      // noinspection JSUnresolvedFunction
      this.fs.copyTpl(
        this.templatePath('base-branding-settings.js'),
        this.destinationPath(`${brandSettings}.sample`),
        conf
      );
    }
  } else {
    logger(
      `INFO: Generating a sample branding in '${brandDest}' directory. Please wait`
    );

    // noinspection JSCheckFunctionSignatures
    let cmdResult = this.spawnCommandSync(
      'git',
      [
        'clone',
        '--depth=1',
        'https://github.com/living-atlases/base-branding.git',
        brandDest,
      ],
      {
        // accessing this._destinationRoot
        cwd: this.destinationRoot(),
        shell: true,
        stdio: null,
        // stdio: "inherit",
      }
    );
    if (cmdResult.status === 0) {
      // Async update submodules
      logger(
        `INFO: Do a "git submodule update --init --recursive --depth=1" in '${brandDest}' directory later`
      );
      // we remove the default branding settings
      this.spawnCommandSync('rm', ['-f', brandSettings], {
        cwd: this.destinationPath(),
        shell: true,
        stdio: null,
      });
      // noinspection JSUnresolvedFunction
      this.fs.copyTpl(
        this.templatePath('base-branding-settings.js'),
        this.destinationPath(brandSettings),
        conf
      );
    } else {
      logger(
        `Error: Failed to clone base-branding, error: ${JSON.stringify(
          cmdResult
        )}`
      );
    }
  }
}

function generateAnsiblew(conf, dest) {
  // noinspection JSUnresolvedFunction
  this.fs.copyTpl(
    this.templatePath('ansiblew'),
    this.destinationPath(`${dest}/ansiblew`),
    conf
  );
}

function generate(conf, dest, filePrefix) {
  const useBranding = conf['LA_generate_branding'];
  if (useBranding) {
    const brandDest = `${conf['LA_pkg_name']}-branding`;
    generateBranding.call(this, conf, brandDest);
  }

  if (conf['LA_additionalVariables'] != null) {
    let additionalVariables = Base64.decode(
      conf['LA_additionalVariables']
    );
    additionalVariables =
      '\n' +
      '#'.repeat(80) +
      '\n' +
      '#                                                                              #\n' +
      '#                          GENERATED BY THE la-toolkit                         #\n' +
      "#                          Please don't edit this file                         #\n" +
      '#                          use the la-toolkit tune tool                        #\n' +
      '#                                                                              #\n' +
      '#'.repeat(80) +
      '\n\n\n\n' +
      additionalVariables;
    this.fs.write(
      this.destinationPath(`${dest}/${filePrefix}-toolkit.ini`),
      additionalVariables
    );
  }

  const preDeployDest = `${conf['LA_pkg_name']}-pre-deploy`;
  const postDeployDest = `${conf['LA_pkg_name']}-post-deploy`;

  // noinspection JSUnresolvedFunction
  this.fs.copyTpl(
    this.templatePath('pre-deploy'),
    this.destinationPath(preDeployDest),
    conf
  );

  // noinspection JSUnresolvedFunction
  this.fs.copyTpl(
    this.templatePath('post-deploy'),
    this.destinationPath(postDeployDest),
    conf
  );
}

// noinspection JSUnusedGlobalSymbols
module.exports = class extends Generator {
  // noinspection JSUnresolvedVariable
  constructor(args, opts) {
    super(args, opts);

    this.argument('debug', {type: Boolean, required: false});
    this.argument('replay', {type: Boolean, required: false});
    this.argument('replay-dont-ask', {type: Boolean, required: false});

    debug = this.options.debug;
    replay = this.options['replay'] || this.options['replay-dont-ask'];
    dontAsk = this.options['replay-dont-ask'];

    const previousConfigAll = this.config.getAll();
    previousConfig =
      typeof previousConfigAll === 'undefined'
        ? []
        : previousConfigAll['promptValues'];

    firstRun = previousConfigAll.firstRun !== false;
    if (firstRun) {
      // Set firstRun so in the future we can check it
      this.config.set('firstRun', false);
    }

    logger = this.log;

    let cmdResult = this.spawnCommandSync('which', ['git'], {
      shell: true,
      stdio: null,
    });
    if (cmdResult.status !== 0) {
      logger(
        `${em('Error')}: Please install git before running this generator`
      );
      process.exit(1);
    }

    // We always store in the first run
    if (debug && firstRun) {
      logger('Running generator for the first time in this location');
    }
    defaultStore = firstRun || this.options['replay'];
    if (debug) logger('Current config:');
    if (debug) logger(previousConfig);
    if (typeof previousConfig === 'undefined' && replay) {
      logger(
        `${em('Error')}: We cannot replay without a previous configuration`
      );
      process.exit(1);
    }
  }

  async prompting() {
    // Have Yeoman greet the user.
    logger(
      yosay(
        `Welcome to the ${em('Living Atlas')} Quick-Start Ansible Generator`
      )
    );

    this.answers = dontAsk
      ? previousConfig
      : await this.prompt([
        {
          store: true,
          type: 'input',
          name: 'LA_project_name',
          message: `Your LA Project ${em('Long Name')}:`,
          default: 'Living Atlas of Wakanda',
        },
        {
          store: true,
          type: 'input',
          name: 'LA_project_shortname',
          message: `Your LA Project ${em('Shortname')}:`,
          default: (answers) =>
            answers['LA_project_name'].replace(/Living Atlas of /g, 'LA '),
        },
        {
          store: true,
          type: 'input',
          name: 'LA_pkg_name',
          message: `Your LA ${em(
            'short-lowercase-name'
          )} (we'll put your inventories in that directory):`,
          default: (answers) =>
            answers['LA_project_name'].toLowerCase().replace(/ /g, '-'),
          validate: (input) =>
            new Promise((resolve) => {
              if (input.match(/^[a-z0-9-]+$/g)) {
                resolve(true);
              } else {
                resolve('You need to provide some-example-short-name');
              }
            }),
        },
        {
          store: true,
          type: 'input',
          name: 'LA_domain',
          message: `What is your LA node ${em('main domain')}?`,
          default: (answers) => `${answers['LA_pkg_name']}.org`,
          validate: (input) => validateDomain(input, 'branding', logger),
        },
        {
          store: true,
          type: 'confirm',
          name: 'LA_use_species',
          message: `Use ${em('species')} service?`,
          default: true,
        },
        {
          store: true,
          type: 'confirm',
          name: 'LA_use_species_lists',
          message: `Use ${em('specieslists')} service?`,
          when: (a) => a['LA_use_species'],
          default: true,
        },
        {
          store: true,
          type: 'confirm',
          name: 'LA_use_images',
          message: `Use ${em('images')} service?`,
          default: true,
        },
        {
          store: true,
          type: 'confirm',
          name: 'LA_use_spatial',
          message: `Use ${em('spatial')} service?`,
          default: true,
        },
        {
          store: true,
          type: 'confirm',
          name: 'LA_use_regions',
          message: `Use ${em('regions')} service?`,
          default: true,
        },

        {
          store: true,
          type: 'confirm',
          name: 'LA_use_webapi',
          message: `Use ${em(
            'webapi'
          )} an API documentation service (similar to api.ala.org.au but empty)?`,
          default: false,
        },
        {
          store: true,
          type: 'confirm',
          name: 'LA_use_dashboard',
          message: `Use ${em(
            'dashboard'
          )} view stats service (similar to dashboard.ala.org.au)?`,
          default: false,
        },
        {
          store: true,
          type: 'confirm',
          name: 'LA_use_alerts',
          message: `Use ${em('alerts')} service?`,
          default: false,
        },
        {
          store: true,
          type: 'confirm',
          name: 'LA_use_doi',
          message: `Use ${em('doi')} service?`,
          default: false,
        },
        {
          store: true,
          type: 'confirm',
          name: 'LA_use_sds',
          message: `Use ${em(
            'sds'
          )} sensitive data service (similar to sds.ala.org.au)?`,
          default: false,
        },
        /* {
          store: true,
          type: 'confirm',
          name: 'LA_use_biocollect',
          message: `Use ${em(
            'biocollect'
          )}  data collection tool (similar to biocollect.ala.org.au/acsa)?`,
          default: false,
        }, */
        {
          store: true,
          type: 'confirm',
          name: 'LA_use_CAS',
          message: `Use ${em('CAS')} Auth service?`,
          default: true,
        },
        {
          store: true,
          type: 'confirm',
          name: 'LA_enable_ssl',
          message: `Enable ${em('SSL')}?`,
          default: true,
        },
        {
          store: defaultStore,
          type: 'input',
          name: 'check-ssl',
          message: '',
          default: '',
          when: (a) =>
            new Promise((resolve) => {
              // noinspection HttpUrlsUsage
              a['LA_urls_prefix'] = a['LA_enable_ssl'] ? 'https://' : 'http://';
              resolve(false);
            }),
        },
        {
          store: defaultStore,
          type: 'list',
          name: 'LA_collectory_uses_subdomain',
          message: (a) =>
            `Will the ${em('collectory')} service use a ${
              a['LA_urls_prefix']
            }${em('subdomain')}.${a['LA_domain']} or a ${a['LA_urls_prefix']}${
              a['LA_domain']
            }${em('/service-path')} ?`,
          choices: [
            {name: 'subdomain', value: true},
            {name: 'service-path', value: false},
          ],
        },
        new PromptHostnameFor('collectory', 'collections'),
        new PromptHostnameInputFor('collectory'),
        new PromptUrlFor('collectory', 'collections'),
        new PromptPathFor('collectory', 'collections'),

        new PromptSubdomainFor('ala_hub', 'records'),
        new PromptHostnameFor('ala_hub', 'records'),
        new PromptHostnameInputFor('ala_hub'),
        new PromptUrlFor('ala_hub', 'records'),
        new PromptPathFor('ala_hub', 'records'),

        new PromptSubdomainFor('biocache_service', 'records-ws'),
        new PromptHostnameFor('biocache_service', 'records-ws'),
        new PromptHostnameInputFor('biocache_service'),
        new PromptUrlFor('biocache_service', 'records-ws'),
        new PromptPathFor('biocache_service', 'records-ws'),

        new PromptSubdomainFor('ala_bie', 'species', (a) => a['LA_use_species']),
        new PromptHostnameFor('ala_bie', 'species', (a) => a['LA_use_species']),
        new PromptHostnameInputFor('ala_bie', (a) => a['LA_use_species']),
        new PromptUrlFor('ala_bie', 'species', (a) => a['LA_use_species']),
        new PromptPathFor('ala_bie', 'species', (a) => a['LA_use_species']),

        new PromptSubdomainFor(
          'bie_index',
          'species-service',
          (a) => a['LA_use_species']
        ),
        new PromptHostnameFor(
          'bie_index',
          'species-ws',
          (a) => a['LA_use_species']
        ),
        new PromptHostnameInputFor('bie_index', (a) => a['LA_use_species']),
        new PromptUrlFor('bie_index', 'species-ws', (a) => a['LA_use_species']),
        new PromptPathFor('bie_index', 'species-ws', (a) => a['LA_use_species']),

        new PromptSubdomainFor('images', 'images', (a) => a['LA_use_images']),
        new PromptHostnameFor('images', 'images', (a) => a['LA_use_images']),
        new PromptHostnameInputFor('images', (a) => a['LA_use_images']),
        new PromptUrlFor('images', 'images', (a) => a['LA_use_images']),
        new PromptPathFor('images', 'images', (a) => a['LA_use_images']),

        new PromptSubdomainFor(
          'lists',
          'specieslists',
          (a) => a['LA_use_species_lists']
        ),
        new PromptHostnameFor(
          'lists',
          'lists',
          (a) => a['LA_use_species_lists']
        ),
        new PromptHostnameInputFor('lists', (a) => a['LA_use_species_lists']),
        new PromptUrlFor('lists', 'lists', (a) => a['LA_use_species_lists']),
        new PromptPathFor(
          'lists',
          'specieslists',
          (a) => a['LA_use_species_lists']
        ),

        new PromptSubdomainFor('regions', 'regions', (a) => a['LA_use_regions']),
        new PromptHostnameFor('regions', 'regions', (a) => a['LA_use_regions']),
        new PromptHostnameInputFor('regions', (a) => a['LA_use_regions']),
        new PromptUrlFor('regions', 'regions', (a) => a['LA_use_regions']),
        new PromptPathFor('regions', 'regions', (a) => a['LA_use_regions']),

        new PromptSubdomainFor('logger', 'logger'),
        new PromptHostnameFor('logger', 'logger'),
        new PromptHostnameInputFor('logger'),
        new PromptUrlFor('logger', 'logger'),
        new PromptPathFor('logger', 'logger-service'),

        new PromptSubdomainFor('webapi', 'webapi', (a) => a['LA_use_webapi']),
        new PromptHostnameFor('webapi', 'api', (a) => a['LA_use_webapi']),
        new PromptHostnameInputFor('webapi', (a) => a['LA_use_webapi']),
        new PromptUrlFor('webapi', 'api', (a) => a['LA_use_webapi']),
        new PromptPathFor('webapi', 'webapi', (a) => a['LA_use_webapi']),

        new PromptSubdomainFor(
          'dashboard',
          'dashboard',
          (a) => a['LA_use_dashboard']
        ),
        new PromptHostnameFor(
          'dashboard',
          'dashboard',
          (a) => a['LA_use_dashboard']
        ),
        new PromptHostnameInputFor('dashboard', (a) => a['LA_use_dashboard']),
        new PromptUrlFor('dashboard', 'dashboard', (a) => a['LA_use_dashboard']),
        new PromptPathFor(
          'dashboard',
          'dashboard',
          (a) => a['LA_use_dashboard']
        ),

        new PromptSubdomainFor('alerts', 'alerts', (a) => a['LA_use_alerts']),
        new PromptHostnameFor('alerts', 'alerts', (a) => a['LA_use_alerts']),
        new PromptHostnameInputFor('alerts', (a) => a['LA_use_alerts']),
        new PromptUrlFor('alerts', 'alerts', (a) => a['LA_use_alerts']),
        new PromptPathFor('alerts', 'alerts', (a) => a['LA_use_alerts']),

        new PromptSubdomainFor('doi', 'doi', (a) => a['LA_use_doi']),
        new PromptHostnameFor('doi', 'doi', (a) => a['LA_use_doi']),
        new PromptHostnameInputFor('doi', (a) => a['LA_use_doi']),
        new PromptUrlFor('doi', 'doi', (a) => a['LA_use_doi']),
        new PromptPathFor('doi', 'doi', (a) => a['LA_use_doi']),

        new PromptSubdomainFor('sds', 'sds', (a) => a['LA_use_sds']),
        new PromptHostnameFor('sds', 'sds', (a) => a['LA_use_sds']),
        new PromptHostnameInputFor('sds', (a) => a['LA_use_sds']),
        new PromptUrlFor('sds', 'sds', (a) => a['LA_use_sds']),
        new PromptPathFor('sds', 'sds', (a) => a['LA_use_sds']),

        /* Disabled for now
         new PromptSubdomainFor(
         'biocollect',
         'biocollect',
         (a) => a['LA_use_biocollect']
         ),
         new PromptHostnameFor(
         'biocollect',
         'biocollect',
         (a) => a['LA_use_biocollect']
         ),
         new PromptHostnameInputFor('biocollect', (a) => a['LA_use_biocollect']),
         new PromptUrlFor(
         'biocollect',
         'biocollect',
         (a) => a['LA_use_biocollect']
         ),
         new PromptPathFor(
         'biocollect',
         'biocollect',
         (a) => a['LA_use_biocollect']
         ), */

        new PromptSubdomainFor('solr', 'solr'),
        new PromptHostnameFor('solr', 'index'),
        new PromptHostnameInputFor('solr'),
        new PromptUrlFor('solr', 'index'),
        new PromptPathFor('solr', 'solr'),

        new PromptSubdomainFor('cas', 'auth', true, true),
        new PromptHostnameFor('cas', 'auth'),
        new PromptHostnameInputFor('cas'),
        new PromptUrlFor('cas', 'auth'),
        {
          store: true,
          type: 'input',
          name: 'LA_biocache_backend_hostname',
          message: `LA ${em('biocache-backend')} hostname`,
          validate: (input) => isCorrectHostname(input),
          filter: (input) =>
            new Promise((resolve) => {
              storeMachine('biocache_backend', input).then((input) =>
                storeMachine('biocache_cli', input).then((input) =>
                  storeMachine('nameindexer', input).then((input) =>
                    resolve(input)
                  )
                )
              );
            }),
          default: (a) => `${a['LA_main_hostname']}`,
        },

        new PromptSubdomainFor(
          'spatial',
          'spatial',
          (a) => a['LA_use_spatial'],
          true
        ),
        new PromptHostnameFor('spatial', 'spatial', (a) => a['LA_use_spatial']),
        new PromptHostnameInputFor('spatial', (a) => a['LA_use_spatial']),
        new PromptUrlFor('spatial', 'spatial', (a) => a['LA_use_spatial']),

        new PromptSubdomainFor('branding', 'branding'),
        new PromptHostnameFor('branding', 'branding'),
        new PromptHostnameInputFor('branding'),
        new PromptUrlFor('branding', 'branding'),
        new PromptPathFor('branding', 'branding'),

        {
          store: true,
          type: 'confirm',
          name: 'LA_generate_branding',
          message: `Do you want to generate also a sample compatible ${em(
            'LA branding'
          )}? (Recommended to start, later you can improve it with your site style)`,
          default: true,
        },
        {
          store: true,
          type: 'confirm',
          name: 'LA_use_git',
          message: `Use ${em(
            'git'
          )} in your generated inventories to track their changes? (Very recommended)`,
          default: true,
        },
      ]);

    // For back-compatibility
    if (typeof this.answers['LA_main_hostname'] === 'undefined') {
      this.answers['LA_main_hostname'] = this.answers['LA_domain'];
    }
    this.answers['LA_biocache_cli_hostname'] = this.answers['LA_biocache_backend_hostname'];
    this.answers['LA_nameindexer_hostname'] = this.answers['LA_biocache_backend_hostname'];

    if (typeof this.answers['LA_spatial_uses_subdomain'] === 'undefined')
      this.answers['LA_spatial_uses_subdomain'] = true;
    if (typeof this.answers['LA_cas_uses_subdomain'] === 'undefined')
      this.answers['LA_cas_uses_subdomain'] = true;

    if (typeof this.answers['LA_use_images'] === 'undefined')
      this.answers['LA_use_images'] = true;
    if (typeof this.answers['LA_use_species_lists'] === 'undefined')
      this.answers['LA_use_species_lists'] = false;
    if (typeof this.answers['LA_use_species'] === 'undefined')
      this.answers['LA_use_species'] = true;

    if (dontAsk) {
      // Compatible with old generated inventories and don-ask
      if (typeof this.answers['LA_use_webapi'] === 'undefined')
        this.answers['LA_use_webapi'] = false;

      if (typeof this.answers['LA_use_alerts'] === 'undefined')
        this.answers['LA_use_alerts'] = false;

      if (typeof this.answers['LA_use_doi'] === 'undefined')
        this.answers['LA_use_doi'] = false;

      if (typeof this.answers['LA_use_dashboard'] === 'undefined')
        this.answers['LA_use_dashboard'] = false;

      if (typeof this.answers['LA_use_sds'] === 'undefined')
        this.answers['LA_use_sds'] = false;

      if (typeof this.answers['LA_use_biocollect'] === 'undefined')
        this.answers['LA_use_biocollect'] = false;

      if (typeof this.answers['LA_generate_branding'] === 'undefined')
        this.answers['LA_generate_branding'] = false;

      if (typeof this.answers['LA_branding_hostname'] === 'undefined')
        this.answers['LA_branding_hostname'] = this.answers['LA_domain'];
      if (typeof this.answers['LA_branding_path'] === 'undefined')
        this.answers['LA_branding_path'] = '/';
      if (typeof this.answers['LA_branding_url'] === 'undefined')
        this.answers['LA_branding_url'] = this.answers['LA_domain'];

      // noinspection HttpUrlsUsage
      this.answers['LA_urls_prefix'] = this.answers['LA_enable_ssl']
        ? 'https://'
        : 'http://';

      vhostsSet.add(this.answers['LA_domain']);

      if (debug) logger(this.answers);

      Object.keys(servicesRolesMap).forEach((service) => {
        if (service === 'spatial' && !this.answers['LA_use_spatial']) return;
        if (service === 'regions' && !this.answers['LA_use_regions']) return;
        if (service === 'ala_bie' && !this.answers['LA_use_species']) return;
        if (service === 'bie_index' && !this.answers['LA_use_species']) return;
        if (service === 'lists' && !this.answers['LA_use_species_lists']) return;
        if (service === 'images' && !this.answers['LA_use_images']) return;
        if (service === 'webapi' && !this.answers['LA_use_webapi']) return;
        if (service === 'alerts' && !this.answers['LA_use_alerts']) return;
        if (service === 'doi' && !this.answers['LA_use_doi']) return;
        if (service === 'dashboard' && !this.answers['LA_use_dashboard']) return;
        if (service === 'sds' && !this.answers['LA_use_sds']) return;
        if (service === 'biocollect' && !this.answers['LA_use_biocollect']) return;

        const hostVar = `LA_${service}_hostname`;
        const serviceUrl = this.answers[`LA_${service}_url`];
        const hostname = this.answers[hostVar];
        if (debug)
          logger(`${service}: ${hostVar} -> ${hostname}, url: ${serviceUrl}`);
        storeMachine(service, hostname);
        if (typeof serviceUrl !== 'undefined') vhostsSet.add(serviceUrl);
      });

      if (debug) logger(machines);
      if (debug) logger(servicesAndMachines);
    }
  }

  writing() {
    const conf = this.answers;
    let dest = conf['LA_pkg_name'];
    // Old destination check, for back compatibility
    // For now we use with "LA_pkg_name-inventories"
    if (!fsN.existsSync(dest)) dest = `${conf['LA_pkg_name']}-inventories`;

    const isHub = isDefined(conf['LA_is_hub']);
    const hasHubs = isDefined(conf['LA_hubs']);

    const cmdOpts = {
      cwd: this.destinationPath(dest),
      shell: true,
      stdio: 'inherit',
    };

    // accessing this._destinationRoot
    if (debug) { // noinspection JSCheckFunctionSignatures
      logger(`Destination root: ${this.destinationRoot()}`);
    }
    if (debug) logger(`cmdOpts: ${JSON.stringify(cmdOpts)}`);

    services.forEach((service) => {
      const path = conf[`LA_${service}_path`];
      if (path === '/') {
        conf[`LA_${service}_path`] = '';
      }
      // url var is new, so we use hostname for old generated inventories
      if (typeof conf[`LA_${service}_url`] === 'undefined') {
        conf[`LA_${service}_url`] = conf[
          `LA_${service}_hostname`
          ];
      }
    });
    if (conf['LA_solr_uses_subdomain']) {
      conf['LA_solr_path'] = '';
    }
    // Backward compatibility
    if (typeof conf['LA_solr_url'] === 'undefined') {
      conf['LA_solr_url'] = conf['LA_solr_hostname'];
    }
    if (typeof conf['LA_cas_url'] === 'undefined') {
      conf['LA_cas_url'] = conf['LA_cas_hostname'];
    }
    if (typeof conf['LA_spatial_url'] === 'undefined') {
      conf['LA_spatial_url'] = conf['LA_spatial_hostname'];
    }
    if (typeof conf['LA_generate_branding'] === 'undefined') {
      conf['LA_generate_branding'] = false;
    }
    conf['LA_machines'] = machines;
    conf['LA_services_machines'] = servicesAndMachines;

    const filePrefix = conf['LA_pkg_name'];
    const useCAS = conf['LA_use_CAS'];
    const useSpatial = conf['LA_use_spatial'];

    conf['LA_nginx_vhosts'] = [...new Set(vhostsSet)];

    if (debug) logger(conf);
    // noinspection JSUnresolvedFunction
    this.fs.copyTpl
    (
      this.templatePath('README-main.md'),
      this.destinationPath('README.md'),
      conf
    );

    // noinspection JSUnresolvedFunction
    this.fs.copyTpl(
      this.templatePath('README.md'),
      this.destinationPath(`${dest}/README.md`),
      conf
    );

    if (!this.fs.exists(`${dest}/dot-ssh-config`)) {
      // noinspection JSUnresolvedFunction
      this.fs.copyTpl(
        this.templatePath('dot-ssh-config.sample'),
        this.destinationPath(`${dest}/dot-ssh-config`),
        conf
      );
    }

    // Migrate old quick-start generated inventory files to pkg_name named
    const templateFiles = [
      'inventory.yml',
      'local-extras.yml',
      'spatial-inventory.yml',
      'spatial-local-extras.yml',
    ];
    for (let i = 0; i < templateFiles.length; i++) {
      const currentFile = `${dest}/quick-start-${templateFiles[i]}`;
      if (this.fs.exists(currentFile)) {
        // noinspection JSUnresolvedFunction
        this.fs.move(currentFile, `${dest}/${filePrefix}-${templateFiles[i]}`);
      }
    }

    // Rename old .yml to correct .ini extension
    if (!firstRun) {
      const oldFile = `${dest}/${filePrefix}-inventory.yml`;
      if (debug) logger(`Trying to rename yml to ini: ${oldFile}`);
      if (this.fs.exists(oldFile)) {
        let inventories = ['inventory', 'local-extras', 'local-passwords'];
        if (useSpatial) {
          inventories.push('spatial-inventory', 'spatial-local-extras');
        }
        if (useCAS) {
          inventories.push('cas-inventory', 'cas-local-extras');
        }
        let cmdResult;
        for (let i = 0; i < inventories.length; i++) {
          const currentFile = `${filePrefix}-${inventories[i]}.yml`;
          const destFile = `${filePrefix}-${inventories[i]}.ini`;

          if (this.fs.exists(`${dest}/${currentFile}`)) {
            if (debug) logger(`Moving ${currentFile} to ${destFile}`);
            const useGit = conf['LA_use_git'];
            if (useGit) {
              cmdResult = this.spawnCommandSync(
                'git',
                ['mv', currentFile, destFile],
                cmdOpts
              );
              if (debug) logger(`git mv result ${JSON.stringify(cmdResult)}`);
            } else {
              cmdResult = this.spawnCommandSync(
                'mv',
                [currentFile, destFile],
                cmdOpts
              );
              if (debug) logger(`mv result ${JSON.stringify(cmdResult)}`);
            }
          }
        }
      }
    }

    const localPassDest = `${dest}/${filePrefix}-local-passwords.ini`;
    if (firstRun || !this.fs.exists(localPassDest)) {
      // We'll generate some easy but strong passwords for our new database, etc

      conf['LA_passwords'] = [];
      for (let num = 0; num < 50; num++) {
        // noinspection JSUnresolvedFunction
        conf['LA_passwords'].push(niceware.generatePassphrase(6).join(''));
      }

      const salt = bcrypt.genSaltSync(10, 'a');
      conf['LA_admin_bcrypt_password'] = bcrypt.hashSync(
        conf['LA_passwords'][23],
        salt
      );

      logger(
        `Important: We'll create an admin user with email: support@${conf['LA_domain']} and password: ${conf['LA_passwords'][23]}`
      );

      logger(`To create a different one modify this in: ${localPassDest}`);
      logger('prior to deploy the CAS auth system.');
    }

    conf['LA_apikeys'] = [];
    for (let num = 0; num < 50; num++) {
      conf['LA_apikeys'].push(uuidv4());
    }

    if (!this.fs.exists(`${dest}/${filePrefix}-local-extras.ini`)) {
      // When only create the extras inventory in the first run
      // noinspection JSUnresolvedFunction
      // noinspection JSUnresolvedFunction
      this.fs.copyTpl(
        this.templatePath(`quick-start-local-extras.ini`),
        this.destinationPath(`${dest}/${filePrefix}-local-extras.ini`),
        conf
      );
    }

    // .sample is always updated with new versions
    // noinspection JSUnresolvedFunction
    // noinspection JSUnresolvedFunction
    this.fs.copyTpl(
      this.templatePath(`quick-start-local-extras.ini`),
      this.destinationPath(`${dest}/${filePrefix}-local-extras.sample`),
      conf
    );

    if (
      useSpatial &&
      this.fs.exists(`${dest}/${filePrefix}-spatial-inventory.ini`)
    ) {
      this.fs.delete(`${dest}/${filePrefix}-spatial-inventory.ini`);
    }

    if (
      useSpatial &&
      this.fs.exists(`${dest}/${filePrefix}-spatial-local-extras.sample`)
    ) {
      this.fs.delete(`${dest}/${filePrefix}-spatial-local-extras.sample`);
    }

    if (useCAS && this.fs.exists(`${dest}/${filePrefix}-cas-inventory.ini`)) {
      this.fs.delete(`${dest}/${filePrefix}-cas-inventory.ini`);
    }

    if (
      useCAS &&
      this.fs.exists(`${dest}/${filePrefix}-cas-local-extras.sample`)
    ) {
      this.fs.delete(`${dest}/${filePrefix}-cas-local-extras.sample`);
    }

    // noinspection JSUnresolvedFunction
    this.fs.copyTpl(
      this.templatePath(`quick-start-inventory.ini`),
      this.destinationPath(`${dest}/${filePrefix}-inventory.ini`),
      conf
    );

    if (
      this.fs.exists(`${dest}/${filePrefix}-spatial-local-extras.ini`) ||
      this.fs.exists(`${dest}/${filePrefix}-cas-local-extras.ini`)
    ) {
      logger(
        '-----------------------------------------------------------------------------------------------'
      );
      logger(
        `${em(
          'WARNING'
        )}: We are joining our inventories in a single one + a single local-extras.ini:`
      );
      logger(
        `Please join all your local-extras.ini files into a single ${dest}/${filePrefix}-local-extras.ini`
      );
      logger(
        `Take into account that other old local-extras.ini will be ignored. Please delete them.`
      );
      logger(
        '-----------------------------------------------------------------------------------------------'
      );
      logger('');
    }

    if (!isHub && !this.fs.exists(localPassDest)) {
      // noinspection JSUnresolvedFunction
      // noinspection JSUnresolvedFunction
      this.fs.copyTpl(
        this.templatePath(`quick-start-local-passwords.ini`),
        this.destinationPath(localPassDest),
        conf
      );
    }

    if (isDefined(conf['LA_variable_google_api_key']))
      replaceLine.call(this,
        localPassDest,
        'google_apikey[ ]*=',
        `google_apikey = ${conf['LA_variable_google_api_key']}`
      );

    if (isDefined(conf['LA_variable_google_api_key']))
      replaceLine.call(this,
        localPassDest,
        'google_api_key[ ]*=',
        `google_api_key = ${conf['LA_variable_google_api_key']}`
      );

    if (isDefined(conf['LA_variable_maxmind_account_id']))
      replaceLine.call(this,
        localPassDest,
        'maxmind_account_id[ ]*=',
        `maxmind_account_id = ${conf['LA_variable_maxmind_account_id']}`
      );

    if (isDefined(conf['LA_variable_maxmind_license_key']))
      replaceLine.call(this,
        localPassDest,
        'maxmind_license_key[ ]*=',
        `maxmind_license_key = ${conf['LA_variable_maxmind_license_key']}`
      );

    generate.call(this, conf, dest, filePrefix);
    generateAnsiblew.call(this, conf, dest);

    if (hasHubs) {
      for (let hub of conf['LA_hubs']) {
        // const hubBrandDest = `${hub['LA_pkg_name']}-branding`;
        const hubDest = `${hub['LA_pkg_name']}-inventories`;
        const filePrefix = hub['LA_pkg_name'];
        let joinedConf = {
          ...conf, // the portal conf
          ...hub
        };

        // noinspection JSUnresolvedFunction
        this.fs.copyTpl(
          this.templatePath(`data-hub/data-hub-inventory.ini`),
          this.destinationPath(`${hubDest}/${filePrefix}-inventory.ini`),
          joinedConf
        );
        let ansiblewHubConf = {};
        ansiblewHubConf.LA_pkg_name = conf['LA_pkg_name'];
        ansiblewHubConf.LA_hub_pkg_name = hub['LA_pkg_name'];
        ansiblewHubConf.LA_is_hub = true;
        ansiblewHubConf.LA_services_machines = [];
        for (let name of ['branding', 'ala_hub', 'ala_bie', 'regions'])
          ansiblewHubConf.LA_services_machines.push({
          service: name,
          map: servicesRolesMap[name],
        });
        joinedConf.LA_services_machines = ansiblewHubConf.LA_services_machines;

        if (typeof hub['LA_additionalVariables'] === 'undefined') {
          joinedConf['LA_additionalVariables'] = null;
        }
        generateAnsiblew.call(this, ansiblewHubConf, hubDest);
        generate.call(this, joinedConf, hubDest, filePrefix);
      }
    }
}

install() {
let dest = this.answers['LA_pkg_name'];
// For now we use with "LA_pkg_name-inventories"
if (!fsN.existsSync(dest)) dest = `${this.answers['LA_pkg_name']}-inventories`;
const useGit = this.answers['LA_use_git'];
const cmdOpts = {
cwd: this.destinationPath(dest),
shell: true,
stdio: null,
};

// Should be useful in the future but we don't have dependencies in the
// generated code (more than ansible):
// this.installDependencies();

if (firstRun && useGit) {
let cmdResult = this.spawnCommandSync('which', ['git'], cmdOpts);

if (cmdResult.status === 0) {
  cmdResult = this.spawnCommandSync('git', ['status'], cmdOpts);

  if (cmdResult !== 0) {
    cmdResult = this.spawnCommandSync('git', ['init'], cmdOpts);
    if (cmdResult === 0) {
      cmdResult = this.spawnCommandSync('git', ['add', '--all'], cmdOpts);
      if (cmdResult === 0) {
        this.spawnCommandSync(
          'git',
          ['commit', '-am', '"Initial commit"'],
          cmdOpts
        );
      }
    }
  }
} else {
  logger(
    'Error: Please install git to track changes in your inventories'
  );
}
}
}
};
