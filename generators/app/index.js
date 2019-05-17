/* eslint camelcase: ["error", {properties: "never"}], no-warning-comments: 0 */

"use strict";
const Generator = require("yeoman-generator");
const chalk = require("chalk");
const yosay = require("onionsay");
const parseDomain = require("parse-domain");

let defaultStore = false;
let logger;

const defUseSubdomain = a => {
  return a.LA_collectory_uses_subdomain;
};

let debug = false;
let replay = false;
let previousConfig;

const parseDomainOpts = {};
const isCorrectDomain = domain => parseDomain(domain, parseDomainOpts) !== null;
const isASubDomain = domain =>
  isCorrectDomain(domain) &&
  parseDomain(domain, parseDomainOpts).subdomain !== "";

const defUseSubdomainPrompt = (a, service) => {
  return `Will the ${chalk.keyword("orange")(service)} module use a http${
    a.LA_enable_ssl ? "s" : ""
  }://${chalk.keyword("orange")("subdomain")}.${a.LA_domain} or not?`;
};

const validateDomain = (input, name, store) =>
  new Promise(resolve => {
    logger(`Validate ${input} ${name}`);
    const isValid = isCorrectDomain(input);
    if (isValid && store) storeMachine(name, input);
    if (isValid || input === "other") {
      resolve(true);
    } else {
      if (debug) logger(input);
      resolve("You need to provide some-example-domain.org");
    }
  });

/*
  Set of used machines
*/
const machines = new Set();

/*
   We store used `context` like this:

   machinesAndPaths["machine"]["url"]["path"] = true;

   so we can check that in a same machine we don't configure two servers
   with the same domain and the same path

*/
const machinesAndPaths = {};

const servicesAndMachines = [];

const servicesRolsMap = {
  ala_bie: { group: "bie-hub", playbook: "bie-hub" },
  bie_index: { group: "bie-index", playbook: "bie-index" },
  ala_hub: { group: "biocache-hub", playbook: "biocache-hub-standalone" },
  biocache_service: {
    group: "biocache-service-clusterdb",
    playbook: "biocache-service-clusterdb"
  },
  collectory: { group: "collectory", playbook: "collectory-standalone" },
  images: { group: "image-service", playbook: "image-service" },
  logger: { group: "logger-service", playbook: "logger-standalone" },
  regions: { group: "regions", playbook: "regions-standalone" },
  solr: { group: "solr7-server", playbook: "solr7-standalone" },
  lists: { group: "species-list", playbook: "species-list-standalone" }
};

const storeMachine = (name, machine) =>
  new Promise(resolve => {
    if (debug) logger(`Store: ${name} -> ${machine}`);
    if (isCorrectDomain(machine)) {
      if (!machines.has(machine)) machines.add(machine);
      // TODO map main in servicesRolMap also
      if (name !== "main") {
        servicesAndMachines.push({
          service: name,
          machine,
          map: servicesRolsMap[name]
        });
      }
      if (debug) logger(machines);
    }
    resolve(machine);
  });

function PromptSubdomainFor(name, subdomain) {
  this.store = defaultStore;
  this.type = "confirm";
  const varName = `LA_${name}_uses_subdomain`;
  this.name = varName;
  this.message = a => defUseSubdomainPrompt(a, subdomain);
  this.default = a => defUseSubdomain(a);
}

function PromptHostnameFor(name, subdomain, previous, when) {
  this.store = defaultStore;
  this.type = "list";
  const varName = `LA_${name}_hostname`;
  const varUsesSubdomain = `LA_${name}_uses_subdomain`;
  this.name = varName;
  this.message = `LA ${subdomain} hostname ?`;
  this.choices = a => {
    let choices;
    if (a[varUsesSubdomain]) {
      choices = [`${subdomain}.${a.LA_domain}`, ...machines, "other"];
    } else {
      choices = [...machines, "other"];
    }
    // Add previous selected hostname at the start of the array
    const previousHostname = previousConfig[varName];
    if (
      replay &&
      typeof previousHostname !== "undefined" &&
      !choices.includes(previousHostname)
    ) {
      choices.unshift(previousHostname);
    }
    if (debug) logger(choices);
    return choices;
  };
  if (when) {
    this.when = when;
  }
  // This does not work:
  // this.filter = input => storeMachine(name, input);
  // https://github.com/SBoudrias/Inquirer.js/issues/383
  // this.validate = input => validateDomain(input, name, true);
}

function PromptHostnameInputFor(name) {
  this.store = defaultStore;
  this.type = "input";
  const varName = `LA_${name}_hostname`;
  this.name = varName;
  this.when = a => {
    if (a[varName] === "other") {
      return true;
    }
    // Store previous hostname
    storeMachine(name, a[varName]);
    return false;
  };
  this.validate = input => validateDomain(input, name, true);
}

function PromptUrlFor(name, path, when) {
  this.store = defaultStore;
  this.type = "input";
  const varName = `LA_${name}_url`;
  const varUsesSubdomain = `LA_${name}_uses_subdomain`;
  const varHostname = `LA_${name}_hostname`;
  this.name = varName;
  this.message = `LA ${name} base url?`;
  this.default = a => {
    const http = a.LA_urls_prefix;
    const usesSubdomain = a[varUsesSubdomain];
    const samplePrefix = usesSubdomain ? `${path}.` : "";
    // Was: const sampleSuffix = usesSubdomain ? "/" : `/${path}`;
    const sampleSuffix = "";
    return `${http}${samplePrefix}${a.LA_domain}${sampleSuffix}`;
  };
  this.when = a => {
    const hostname = a[varHostname];
    const hostnameIsASubdomain = isASubDomain(hostname);
    const hostnameIsNotASubdomain = !hostnameIsASubdomain;
    if (hostnameIsASubdomain) {
      a[varName] = a[varHostname];
    }
    const usedMachine =
      typeof machinesAndPaths[hostname] !== "undefined" &&
      machinesAndPaths[hostname].length > 0;
    const shouldIAsk = hostnameIsNotASubdomain || usedMachine;
    if (when) return shouldIAsk && when(a);
    return shouldIAsk;
  };
  this.validate = input => validateDomain(input, name, false);
}

function PromptPathFor(name, path, when) {
  this.store = defaultStore;
  const varName = `LA_${name}_path`;
  const varUrl = `LA_${name}_url`;
  const varUsesSubdomain = `LA_${name}_uses_subdomain`;
  const varHostname = `LA_${name}_hostname`;
  this.type = "input";
  this.name = varName;
  this.message = a => {
    // Warn: dup code below
    const samplePath = a[varUsesSubdomain]
      ? "/"
      : `/${typeof path === "undefined" ? "" : path}`;
    return `Which context /path you wanna use for this service (like ${
      a[varUrl]
    }${chalk.keyword("orange")(samplePath)}) ?`;
  };
  this.default = a => {
    const hostname = a[varHostname];
    const rootUsed =
      typeof machinesAndPaths[hostname] !== "undefined" &&
      machinesAndPaths[hostname]["/"];
    return rootUsed ? `/${typeof path === "undefined" ? "" : path}` : "/";
  };
  if (when) {
    this.when = when;
  }
  this.validate = (path, answers) =>
    new Promise(resolve => {
      // Check if in this machine this path is already used
      if (!path.startsWith("/")) {
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

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.argument("debug", { type: Boolean, required: false });
    this.argument("replay", { type: Boolean, required: false });
    debug = this.options.debug;
    replay = this.options.replay;
    defaultStore = this.options.replay;

    const previousConfigAll = this.config.getAll();
    previousConfig =
      typeof previousConfigAll === "undefined"
        ? []
        : previousConfigAll.promptValues;
    if (debug) this.log("Current config:");
    if (debug) this.log(previousConfig);
    logger = this.log;
  }

  async prompting() {
    // Have Yeoman greet the user.
    this.log(
      yosay(
        `Welcome to the ${chalk.keyword("orange")(
          "Living Atlas"
        )} Quick-Start Ansible Generator`
      )
    );

    this.answers = await this.prompt([
      {
        store: true,
        type: "input",
        name: "LA_project_name",
        message: "Your LA Project Long Name:",
        default: "Living Atlas of Wakanda"
      },
      {
        store: true,
        type: "input",
        name: "LA_project_shortname",
        message: "Your LA Project Shortname:",
        default: answers =>
          answers.LA_project_name.replace(/Living Atlas of /g, "LA ")
      },
      {
        store: true,
        type: "input",
        name: "LA_pkg_name",
        message: "Your LA short-lowercase-name:",
        default: answers =>
          answers.LA_project_name.toLowerCase().replace(/' '/g, "-"),
        validate: input =>
          new Promise(resolve => {
            if (input.match(/^[a-z0-9-]+$/g)) {
              resolve(true);
            } else {
              resolve("You need to provide some-example-short-name");
            }
          })
      },
      {
        store: true,
        type: "input",
        name: "LA_domain",
        message: "What is your LA node main domain?",
        default: answers => `${answers.LA_pkg_name}.org`,
        validate: input => validateDomain(input, "main", true)
      },
      {
        store: true,
        type: "confirm",
        name: "LA_use_spatial",
        message: "Use spatial service?",
        default: false
      },
      {
        store: true,
        type: "confirm",
        name: "LA_use_regions",
        message: "Use regions service?",
        default: false
      },
      {
        store: true,
        type: "confirm",
        name: "LA_use_species_lists",
        message: "Use specieslists service?",
        default: false
      },
      {
        store: true,
        type: "confirm",
        name: "LA_use_CAS",
        message:
          "Use CAS Auth service? (WIP: Right now it only sets auth urls)",
        default: false
      },
      {
        store: true,
        type: "confirm",
        name: "LA_enable_ssl",
        message:
          "Enable SSL? (Warn: this only set the urls correctly, but it doesn't manage the certicates)",
        default: false
      },
      {
        store: defaultStore,
        type: "input",
        name: "check-ssl",
        message: "",
        default: "",
        when: a =>
          new Promise(resolve => {
            a.LA_urls_prefix = a.LA_enable_ssl ? "https://" : "http://";
            resolve(false);
          })
      },
      {
        store: defaultStore,
        type: "list",
        name: "LA_collectory_uses_subdomain",
        message: a =>
          `Will the ${chalk.keyword("orange")("collectory")} service use a ${
            a.LA_urls_prefix
          }${chalk.keyword("orange")("subdomain")}.${a.LA_domain} or a ${
            a.LA_urls_prefix
          }${a.LA_domain}${chalk.keyword("orange")("/service-path")} ?`,
        choices: [
          { name: "subdomain", value: true },
          { name: "service-path", value: false }
        ]
      },

      new PromptHostnameFor("collectory", "collectory"),
      new PromptHostnameInputFor("collectory"),
      new PromptUrlFor("collectory", "collectory"),
      new PromptPathFor("collectory", "collectory"),

      new PromptSubdomainFor("ala_hub", "biocache"),
      new PromptHostnameFor("ala_hub", "biocache"),
      new PromptHostnameInputFor("ala_hub"),
      new PromptUrlFor("ala_hub", "ala-hub"),
      new PromptPathFor("ala_hub", "ala-hub"),

      new PromptSubdomainFor("biocache_service", "biocache-service"),
      new PromptHostnameFor("biocache_service", "biocache-ws"),
      new PromptHostnameInputFor("biocache_service"),
      new PromptUrlFor("biocache_service", "biocache-service"),
      new PromptPathFor("biocache_service", "biocache-service"),

      new PromptSubdomainFor("ala_bie", "bie"),
      new PromptHostnameFor("ala_bie", "bie"),
      new PromptHostnameInputFor("ala_bie"),
      new PromptUrlFor("ala_bie", "ala-bie"),
      new PromptPathFor("ala_bie", "ala-bie"),

      new PromptSubdomainFor("bie_index", "bie-service"),
      new PromptHostnameFor("bie_index", "bie-ws"),
      new PromptHostnameInputFor("bie_index"),
      new PromptUrlFor("bie_index", "bie-index"),
      new PromptPathFor("bie_index", "bie-index"),

      new PromptSubdomainFor("lists", "specieslists"),
      new PromptHostnameFor("lists", "lists", a => a.LA_use_species_lists),
      new PromptHostnameInputFor("lists"),
      new PromptUrlFor("lists", "specieslists", a => a.LA_use_species_lists),
      new PromptPathFor("lists", "specieslists", a => a.LA_use_species_lists),

      new PromptSubdomainFor("images", "images"),
      new PromptHostnameFor("images", "images"),
      new PromptHostnameInputFor("images"),
      new PromptUrlFor("images", "images"),
      new PromptPathFor("images", "images"),

      new PromptSubdomainFor("regions", "regions"),
      new PromptHostnameFor("regions", "regions", a => a.LA_use_regions),
      new PromptHostnameInputFor("regions"),
      new PromptUrlFor("regions", "regions", a => a.LA_use_regions),
      new PromptPathFor("regions", "regions", a => a.LA_use_regions),

      new PromptSubdomainFor("logger", "logger"),
      new PromptHostnameFor("logger", "logger"),
      new PromptHostnameInputFor("logger", "logger"),
      new PromptUrlFor("logger"),
      new PromptPathFor("logger", "logger-service"),

      new PromptSubdomainFor("solr", "solr"),
      new PromptHostnameFor("solr", "index"),
      new PromptHostnameInputFor("solr"),
      new PromptUrlFor("solr"),
      new PromptPathFor("solr", "solr"),

      // TODO ask for spatial subdomain
      {
        store: true,
        type: "input",
        name: "LA_cas_hostname",
        message: "LA CAS hostname",
        default: a => `auth.${a.LA_domain}`
      }
    ]);
  }

  writing() {
    const services = [
      "collectory",
      "ala_hub",
      "biocache_service",
      "ala_bie",
      "bie_index",
      "images",
      "logger",
      "lists",
      "regions"
    ];
    services.forEach(service => {
      const path = this.answers[`LA_${service}_path`];
      if (path === "/") {
        this.answers[`LA_${service}_path`] = "";
      }
    });

    if (this.answers.LA_solr_uses_subdomain) {
      this.answers.LA_solr_path = "";
    }

    this.answers.LA_machines = machines;
    this.answers.LA_services_machines = servicesAndMachines;

    if (debug) this.log(this.answers);

    this.fs.copyTpl(
      this.templatePath("README.md"),
      this.destinationPath("README.md"),
      this.answers
    );

    this.fs.copyTpl(
      this.templatePath("quick-start-inventory.yml"),
      this.destinationPath("quick-start-inventory.yml"),
      this.answers
    );

    if (this.answers.LA_use_spatial) {
      this.fs.copyTpl(
        this.templatePath("quick-start-spatial-inventory.yml"),
        this.destinationPath("quick-start-spatial-inventory.yml"),
        this.answers
      );
    }
  }

  install() {
    // Should be useful in the future:
    // this.installDependencies();
    // clone ala-install
    //
    // Maybe here we can check for some ansible install dependency
  }
};
