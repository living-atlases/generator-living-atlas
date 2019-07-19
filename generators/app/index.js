/* eslint camelcase: ["error", {properties: "never"}], no-warning-comments: 0 */

"use strict";
const Generator = require("yeoman-generator");
const chalk = require("chalk");
const yosay = require("onionsay");
const parseDomain = require("parse-domain");
const niceware = require("niceware");

let defaultStore = false;
let logger;

const defUseSubdomain = a => {
  return a.LA_collectory_uses_subdomain;
};

let debug = false;
let replay = false;
let dontAsk = false;
let previousConfig;
let firstRun;

const parseDomainOpts = {};
const isCorrectDomain = domain => parseDomain(domain, parseDomainOpts) !== null;
const isASubDomain = domain =>
  isCorrectDomain(domain) &&
  parseDomain(domain, parseDomainOpts).subdomain !== "";

const em = text => chalk.keyword("orange")(text);

const defUseSubdomainPrompt = (a, service) => {
  return `Will the ${em(service)} module use a http${
    a.LA_enable_ssl ? "s" : ""
  }://${em("subdomain")}.${a.LA_domain} or not?`;
};

const validateDomain = (input, name, store) =>
  new Promise(resolve => {
    if (debug) logger(`Validate ${input} ${name}`);
    const isValid = isCorrectDomain(input);
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
  main: { name: "main", group: "ala-demo", playbook: "ala-demo" },
  collectory: {
    name: "collectory",
    group: "collectory",
    playbook: "collectory-standalone"
  },
  ala_hub: {
    name: "ala_hub",
    group: "biocache-hub",
    playbook: "biocache-hub-standalone"
  },
  biocache_service: {
    name: "biocache_service",
    group: "biocache-service-clusterdb",
    playbook: "biocache-service-clusterdb"
  },
  ala_bie: { name: "ala_bie", group: "bie-hub", playbook: "bie-hub" },
  bie_index: { name: "bie_index", group: "bie-index", playbook: "bie-index" },
  images: { name: "images", group: "image-service", playbook: "image-service" },
  lists: {
    name: "lists",
    group: "species-list",
    playbook: "species-list-standalone"
  },
  regions: {
    name: "regions",
    group: "regions",
    playbook: "regions-standalone"
  },
  logger: {
    name: "logger",
    group: "logger-service",
    playbook: "logger-standalone"
  },
  solr: { name: "solr", group: "solr7-server", playbook: "solr7-standalone" },
  cas: { name: "cas", group: "cas-servers", playbook: "aws-cas-5" },
  biocache_backend: {
    name: "biocache_backend",
    group: "biocache",
    playbook: "biocache-backend"
  },
  biocache_cli: {
    name: "biocache_cli",
    group: "biocache-cli",
    playbook: "biocache-cli"
  },
  spatial: { name: "spatial", group: "spatial", playbook: "spatial" }
};

const mapMachine = (name, machine) => {
  if (debug) logger(`Store: ${name} -> ${machine}`);
  if (isCorrectDomain(machine)) {
    if (!machines.has(machine)) machines.add(machine);
    if (name !== "main") {
      servicesAndMachines.push({
        service: name,
        machine,
        map: servicesRolsMap[name]
      });
    }
    if (debug) logger(machines);
  } else {
    logger(`WARN: Wrong hostname ${machine}`);
  }
};

function PromptSubdomainFor(name, subdomain, when) {
  this.store = defaultStore;
  this.type = "confirm";
  const varName = `LA_${name}_uses_subdomain`;
  this.name = varName;
  this.message = a => defUseSubdomainPrompt(a, name);
  this.default = a => defUseSubdomain(a);
  if (when) {
    this.when = when;
  }
}

function PromptHostnameFor(name, subdomain, when) {
  this.store = defaultStore;
  this.type = "list";
  const varName = `LA_${name}_hostname`;
  const varUsesSubdomain = `LA_${name}_uses_subdomain`;
  this.name = varName;
  this.message = `LA ${em(name)} hostname ?`;
  this.choices = a => {
    let choices;
    if (a[varUsesSubdomain]) {
      choices = [`${subdomain}.${a.LA_domain}`, ...machines, "other"];
    } else {
      choices = [...machines, "other"];
    }
    // Add previous selected hostname at the start of the array
    const hasPrevious =
      typeof previousConfig !== "undefined" &&
      typeof previousConfig[varName] !== "undefined";
    const previousHostname = hasPrevious ? previousConfig[varName] : null;
    if (debug) logger(`hasPrevious: ${hasPrevious} ${previousHostname}`);
    if (replay && hasPrevious) {
      if (choices.includes(previousHostname)) {
        // Remove and later put in the first position
        for (var i = 0; i < choices.length; i++) {
          if (choices[i] === previousHostname) {
            choices.splice(i, 1);
          }
        }
      }
      choices.unshift(previousHostname);
    }
    if (debug) logger(choices);
    return choices;
  };
  if (when) {
    this.when = when;
  }
}

function PromptHostnameInputFor(name, when) {
  this.store = defaultStore;
  this.type = "input";
  const varName = `LA_${name}_hostname`;
  this.name = varName;
  this.when = a => {
    if (typeof when !== "undefined" && !when(a)) {
      return false;
    }
    if (a[varName] === "other") {
      return true;
    }
    // And don't ask again
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
  this.message = `LA ${em(name)} base url?`;
  this.default = a => {
    const usesSubdomain = a[varUsesSubdomain];
    const samplePrefix = usesSubdomain ? `${path}.` : "";
    // Was: const sampleSuffix = usesSubdomain ? "/" : `/${path}`;
    const sampleSuffix = "";
    return `${samplePrefix}${a.LA_domain}${sampleSuffix}`;
  };
  this.when = a => {
    if (when && !when(a)) {
      return false;
    }
    const hostname = a[varHostname];
    const hostnameIsASubdomain = isASubDomain(hostname);
    const hostnameIsNotASubdomain = !hostnameIsASubdomain;
    if (hostnameIsASubdomain) {
      a[varName] = a[varHostname];
    }
    const usedMachine = typeof machinesAndPaths[hostname] !== "undefined";
    if (debug) logger(machinesAndPaths[hostname]);
    const shouldIAsk = hostnameIsNotASubdomain || usedMachine;
    if (debug) {
      logger(
        `hostname: ${hostname} hostnameIsASubdomain: ${hostnameIsASubdomain}`
      );
    }
    if (debug) logger(`usedMachine: ${usedMachine} shouldIAsk: ${shouldIAsk}`);
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
    return `Which context ${em(
      "/path"
    )} you wanna use for this service (like ${em(a[varUrl])}${em(
      samplePath
    )}) ?`;
  };
  this.default = a => {
    if (a[varUsesSubdomain]) {
      const hostname = a[varHostname];
      const rootUsed =
        typeof machinesAndPaths[hostname] !== "undefined" &&
        machinesAndPaths[hostname]["/"];
      return rootUsed ? `/${typeof path === "undefined" ? "" : path}` : "/";
    }
    return typeof path === "undefined" ? "" : `/${path}`;
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
    this.argument("replay-dont-ask", { type: Boolean, required: false });

    debug = this.options.debug;
    replay = this.options.replay || this.options["replay-dont-ask"];
    dontAsk = this.options["replay-dont-ask"];

    const previousConfigAll = this.config.getAll();
    previousConfig =
      typeof previousConfigAll === "undefined"
        ? []
        : previousConfigAll.promptValues;

    firstRun = previousConfigAll.firstRun !== false;
    if (firstRun) {
      // Set firstRun so in the future we can check it
      this.config.set("firstRun", false);
    }
    logger = this.log;

    // We always store in the first run
    if (debug && firstRun) {
      logger("Running generator for the first time in this location");
    }
    defaultStore = firstRun || this.options.replay;
    if (debug) logger("Current config:");
    if (debug) logger(previousConfig);
  }

  async prompting() {
    // Have Yeoman greet the user.
    logger(
      yosay(
        `Welcome to the ${em("Living Atlas")} Quick-Start Ansible Generator`
      )
    );

    this.answers = dontAsk
      ? previousConfig
      : await this.prompt([
          {
            store: true,
            type: "input",
            name: "LA_project_name",
            message: `Your LA Project ${em("Long Name")}:`,
            default: "Living Atlas of Wakanda"
          },
          {
            store: true,
            type: "input",
            name: "LA_project_shortname",
            message: `Your LA Project ${em("Shortname")}:`,
            default: answers =>
              answers.LA_project_name.replace(/Living Atlas of /g, "LA ")
          },
          {
            store: true,
            type: "input",
            name: "LA_pkg_name",
            message: `Your LA ${em(
              "short-lowercase-name"
            )} (we'll put your inventories in that directory):`,
            default: answers =>
              answers.LA_project_name.toLowerCase().replace(/ /g, "-"),
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
            message: `What is your LA node ${em("main domain")}?`,
            default: answers => `${answers.LA_pkg_name}.org`,
            validate: input => validateDomain(input, "main", true)
          },
          {
            store: true,
            type: "confirm",
            name: "LA_use_spatial",
            message: `Use ${em("spatial")} service?`,
            default: true
          },
          {
            store: true,
            type: "confirm",
            name: "LA_use_regions",
            message: `Use ${em("regions")} service?`,
            default: true
          },
          {
            store: true,
            type: "confirm",
            name: "LA_use_species_lists",
            message: `Use ${em("specieslists")} service?`,
            default: true
          },
          {
            store: true,
            type: "confirm",
            name: "LA_use_CAS",
            message: `Use ${em("CAS")} Auth service?`,
            default: true
          },
          {
            store: true,
            type: "confirm",
            name: "LA_enable_ssl",
            message: `Enable ${em("SSL")}?`,
            default: false
          },
          {
            store: defaultStore,
            type: "list",
            name: "LA_collectory_uses_subdomain",
            message: a =>
              `Will the ${em("collectory")} service use a ${
                a.LA_urls_prefix
              }${em("subdomain")}.${a.LA_domain} or a ${a.LA_urls_prefix}${
                a.LA_domain
              }${em("/service-path")} ?`,
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

          new PromptSubdomainFor("images", "images"),
          new PromptHostnameFor("images", "images"),
          new PromptHostnameInputFor("images"),
          new PromptUrlFor("images", "images"),
          new PromptPathFor("images", "images"),

          new PromptSubdomainFor(
            "lists",
            "specieslists",
            a => a.LA_use_species_lists
          ),
          new PromptHostnameFor("lists", "lists", a => a.LA_use_species_lists),
          new PromptHostnameInputFor("lists", a => a.LA_use_species_lists),
          new PromptUrlFor(
            "lists",
            "specieslists",
            a => a.LA_use_species_lists
          ),
          new PromptPathFor(
            "lists",
            "specieslists",
            a => a.LA_use_species_lists
          ),

          new PromptSubdomainFor("regions", "regions", a => a.LA_use_regions),
          new PromptHostnameFor("regions", "regions", a => a.LA_use_regions),
          new PromptHostnameInputFor("regions", a => a.LA_use_regions),
          new PromptUrlFor("regions", "regions", a => a.LA_use_regions),
          new PromptPathFor("regions", "regions", a => a.LA_use_regions),

          new PromptSubdomainFor("logger", "logger"),
          new PromptHostnameFor("logger", "logger"),
          new PromptHostnameInputFor("logger"),
          new PromptUrlFor("logger"),
          new PromptPathFor("logger", "logger-service"),

          new PromptSubdomainFor("solr", "solr"),
          new PromptHostnameFor("solr", "index"),
          new PromptHostnameInputFor("solr"),
          new PromptUrlFor("solr"),
          new PromptPathFor("solr", "solr"),

          {
            store: true,
            type: "input",
            name: "LA_cas_hostname",
            message: `LA ${em("CAS")} subdomain`,
            default: a => `auth.${a.LA_domain}`
          },
          {
            store: true,
            type: "input",
            name: "LA_biocache_backend_hostname",
            message: `LA ${em("biocache-backend")} hostname`,
            default: a => `${a.LA_domain}`
          },
          {
            store: true,
            type: "input",
            name: "LA_spatial_hostname",
            message: `LA ${em("spatial")} subdomain`,
            when: a => a.LA_use_spatial,
            default: a => `spatial.${a.LA_domain}`
          },
          {
            store: true,
            type: "confirm",
            name: "LA_use_git",
            message: `Use ${em(
              "git"
            )} in your generated inventories to track their changes? (Very recommended)`,
            default: true
          }
        ]);

    this.answers.LA_biocache_cli_hostname = this.answers.LA_biocache_backend_hostname;
    this.answers.LA_main_hostname = this.answers.LA_domain;
    this.answers.LA_urls_prefix = this.answers.LA_enable_ssl
      ? "https://"
      : "http://";

    Object.keys(servicesRolsMap).forEach(service => {
      if (debug) logger(this.answers);
      const hostVar = `LA_${service}_hostname`;
      const hostname = this.answers[hostVar];
      if (debug) logger(`${hostVar} -> ${hostname}`);
      mapMachine(service, hostname);
    });

    if (debug) logger(machines);
    if (debug) logger(servicesAndMachines);
  }

  writing() {
    const services = [
      "collectory",
      "ala_hub",
      "biocache_service",
      "biocache_backend",
      "biocache_cli",
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
    const dest = this.answers.LA_pkg_name;
    const filePrefix = dest;

    if (
      firstRun ||
      !this.fs.exists(`${dest}/${filePrefix}-local-passwords.yml`)
    ) {
      // We'll generate some easy but strong passwords for our new database, etc

      this.answers.LA_passwords = [];
      for (let num = 0; num < 20; num++) {
        this.answers.LA_passwords.push(niceware.generatePassphrase(4).join(""));
      }
    }

    if (debug) this.log(this.answers);

    this.fs.copyTpl(
      this.templatePath("README.md"),
      this.destinationPath(`${dest}/README.md`),
      this.answers
    );

    // Migrate old quick-start generated inventory files to pkg_name named
    const templateFiles = [
      "inventory.yml",
      "local-extras.yml",
      "spatial-inventory.yml",
      "spatial-local-extras.yml"
    ];
    for (var i = 0; i < templateFiles.length; i++) {
      const currentFile = `${dest}/quick-start-${templateFiles[i]}`;
      if (this.fs.exists(currentFile)) {
        this.fs.move(currentFile, `${dest}/${filePrefix}-${templateFiles[i]}`);
      }
    }

    if (!this.fs.exists(`${dest}/${filePrefix}-local-extras.yml`)) {
      // When only create the extras inventory in the first run
      this.fs.copyTpl(
        this.templatePath(`quick-start-local-extras.yml`),
        this.destinationPath(`${dest}/${filePrefix}-local-extras.yml`),
        this.answers
      );
    }

    // .sample is always updated with new versions
    this.fs.copyTpl(
      this.templatePath(`quick-start-local-extras.yml`),
      this.destinationPath(`${dest}/${filePrefix}-local-extras.sample`),
      this.answers
    );

    if (this.answers.LA_use_spatial) {
      if (!this.fs.exists(`${dest}/${filePrefix}-spatial-local-extras.yml`)) {
        // When only create the extras inventory in the first run
        this.fs.copyTpl(
          this.templatePath(`quick-start-spatial-local-extras.yml`),
          this.destinationPath(
            `${dest}/${filePrefix}-spatial-local-extras.yml`
          ),
          this.answers
        );
      }
      // .sample is always updated with new versions
      this.fs.copyTpl(
        this.templatePath(`quick-start-spatial-local-extras.yml`),
        this.destinationPath(
          `${dest}/${filePrefix}-spatial-local-extras.sample`
        ),
        this.answers
      );
    }

    if (this.answers.LA_use_CAS) {
      if (!this.fs.exists(`${dest}/${filePrefix}-cas-local-extras.yml`)) {
        // When only create the extras inventory in the first run
        this.fs.copyTpl(
          this.templatePath(`quick-start-cas-local-extras.yml`),
          this.destinationPath(`${dest}/${filePrefix}-cas-local-extras.yml`),
          this.answers
        );
      }
      // .sample is always updated with new versions
      this.fs.copyTpl(
        this.templatePath(`quick-start-cas-local-extras.yml`),
        this.destinationPath(`${dest}/${filePrefix}-cas-local-extras.sample`),
        this.answers
      );
    }

    this.fs.copyTpl(
      this.templatePath(`quick-start-inventory.yml`),
      this.destinationPath(`${dest}/${filePrefix}-inventory.yml`),
      this.answers
    );

    if (this.answers.LA_use_spatial) {
      this.fs.copyTpl(
        this.templatePath("quick-start-spatial-inventory.yml"),
        this.destinationPath(`${dest}/${filePrefix}-spatial-inventory.yml`),
        this.answers
      );
    }

    if (this.answers.LA_use_CAS) {
      this.fs.copyTpl(
        this.templatePath("quick-start-cas-inventory.yml"),
        this.destinationPath(`${dest}/${filePrefix}-cas-inventory.yml`),
        this.answers
      );
    }

    if (!this.fs.exists(`${dest}/${filePrefix}-local-passwords.yml`)) {
      this.fs.copyTpl(
        this.templatePath(`quick-start-local-passwords.yml`),
        this.destinationPath(`${dest}/${filePrefix}-local-passwords.yml`),
        this.answers
      );
    }

    this.fs.copyTpl(
      this.templatePath("ansiblew"),
      this.destinationPath(`${dest}/ansiblew`),
      this.answers
    );
  }

  install() {
    const dest = this.answers.LA_pkg_name;
    const useGit = this.answers.LA_use_git;
    const gitOpts = {
      cwd: this.destinationRoot(dest),
      shell: true,
      stdio: null
    };

    // Should be useful in the future but we don't have dependencies in the
    // generated code (more than ansible):
    // this.installDependencies();

    if (useGit) {
      let cmdResult = this.spawnCommandSync("which", ["git"], gitOpts);

      if (cmdResult.status === 0) {
        cmdResult = this.spawnCommandSync("git", ["status"], gitOpts);

        if (cmdResult !== 0) {
          cmdResult = this.spawnCommandSync("git", ["init"], gitOpts);
          if (cmdResult === 0) {
            // TODO: git add does not work?
            cmdResult = this.spawnCommandSync("git", ["add", "--all"], gitOpts);
            this.spawnCommandSync(
              "git",
              ["commit", "-am", '"Initial commit"'],
              gitOpts
            );
          }
        }
      } else {
        logger(
          "Error: Please install git to track changes in your inventories"
        );
      }
    }
  }
};
