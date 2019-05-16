/* eslint camelcase: ["error", {allow: ["^LA_*"]}] */

"use strict";
const Generator = require("yeoman-generator");
const chalk = require("chalk");
const yosay = require("onionsay");

const defaultStore = false;

const defUseSubdomain = a => {
  return a.LA_collectory_uses_subdomain;
};

let debug = false;

const defUseSubdomainPrompt = (a, service) => {
  return `Will the ${chalk.keyword("orange")(service)} module use a http${
    a.LA_enable_ssl ? "s" : ""
  }://${chalk.keyword("orange")("subdomain")}.${a.LA_domain} or not?`;
};

const domainRe = /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/g;

const validateDomain = input =>
  new Promise(resolve => {
    if (input.match(domainRe) || input === "other") {
      resolve(true);
    } else {
      resolve("You need to provide some-example-domain.org");
    }
  });

/*
  Set of used machines
*/
const machines = new Set();

/*
   We store used `context` like this:

   machinesAndPaths["machine"]["path"] = true;
*/
const machinesAndPaths = {};

const storeMachine = name =>
  new Promise(resolve => {
    if (name.match(domainRe) && name !== "other") {
      if (!machines.has(name)) machines.add(name);
      if (debug) console.log(machines);
    }
    resolve(name);
  });

function PromptSubdomainFor(name, subdomain) {
  this.store = defaultStore;
  this.type = "confirm";
  const varName = `LA_${name}_uses_subdomain`;
  this.name = varName;
  this.message = a => defUseSubdomainPrompt(a, subdomain);
  this.default = a => defUseSubdomain(a);
}

function PromptHostnameFor(name, subdomain, when) {
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
    if (debug) console.log(choices);
    return choices;
  };
  if (when) {
    this.when = when;
  }
  this.filter = name => storeMachine(name);
  this.validate = input => validateDomain(input);
}

function PromptHostnameInputFor(name) {
  this.store = defaultStore;
  this.type = "input";
  const varName = `LA_${name}_hostname`;
  this.name = varName;
  this.when = a => a[varName] === "other";
  this.filter = name => storeMachine(name);
  this.validate = input => validateDomain(input);
}

function PromptPathFor(name, path, when) {
  this.store = defaultStore;
  const varName = `LA_${name}_path`;
  const varUsesSubdomain = `LA_${name}_uses_subdomain`;
  this.type = "input";
  this.name = varName;
  this.message = a => {
    const host = a[`LA_${name}_hostname`];
    return `Which context path you wanna use for this service (like ${
      a.LA_urls_prefix
    }${host}${chalk.keyword("orange")("/path")}) ?`;
  };
  this.default = a =>
    a[varUsesSubdomain] ? "/" : `/${typeof path === "undefined" ? "" : path}`;
  if (when) {
    this.when = when;
  }
  /*
   * Previosly:
   * else {
   *   this.when = a => !a[varUsesSubdomain];
   * } */
  this.validate = (path, answers) =>
    new Promise(resolve => {
      // Check if in this machine this path is already used
      if (!path.startsWith("/")) {
        resolve("Please enter something like '/path'");
      }
      const hostname = answers[`LA_${name}_hostname`];
      const used =
        machinesAndPaths[hostname] && machinesAndPaths[hostname][path];
      if (used) {
        resolve(`This context /path is already in use in this machine`);
      }
      if (!machinesAndPaths[hostname]) {
        machinesAndPaths[hostname] = {};
      }
      machinesAndPaths[hostname][path] = true;
      resolve(true);
    });
}

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.argument("debug", { type: Boolean, required: false });

    debug = this.options.debug;
  }

  async prompting() {
    // Have Yeoman greet the user.
    this.log(
      yosay(
        `Welcome to the ${chalk.keyword("orange")(
          "Living Atlas"
        )} Quick-Start Ansible Inventories Generator`
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
        filter: name => storeMachine(name),
        validate: input => validateDomain(input)
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
        store: false,
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
          }${a.LA_domain}${chalk.keyword("orange")("/service-path/")} ?`,
        choices: [
          { name: "subdomain", value: true },
          { name: "service-path", value: false }
        ]
      },
      /* {
       *   store: defaultStore,
       *   type: "choices",
       *   name: "LA_collectory_base_url",
       *   message: "LA collectory url",
       *   default: a => {
       *     return a.LA_collectory_uses_subdomain
       *       ? `collectory.${a.LA_domain}`
       *       : a.LA_domain;
       *   }
       * }, */
      new PromptHostnameFor("collectory", "collectory"),
      new PromptHostnameInputFor("collectory"),
      new PromptPathFor("collectory", "collectory"),

      new PromptSubdomainFor("ala_hub", "biocache"),
      new PromptHostnameFor("ala_hub", "biocache"),
      new PromptHostnameInputFor("ala_hub"),
      new PromptPathFor("ala_hub", "ala-hub"),

      new PromptSubdomainFor("biocache_service", "biocache-service"),
      new PromptHostnameFor("biocache_service", "biocache-ws"),
      new PromptHostnameInputFor("biocache_service"),
      new PromptPathFor("biocache_service", "biocache-service"),

      new PromptSubdomainFor("ala_bie", "bie"),
      new PromptHostnameFor("ala_bie", "bie"),
      new PromptHostnameInputFor("ala_bie"),
      new PromptPathFor("ala_bie", "ala-bie"),

      new PromptSubdomainFor("bie_index", "bie-service"),
      new PromptHostnameFor("bie_index", "bie-ws"),
      new PromptHostnameInputFor("bie_index"),
      new PromptPathFor("bie_index", "bie-index"),

      new PromptSubdomainFor("lists", "specieslists"),
      new PromptHostnameFor("lists", "lists", a => a.LA_use_species_lists),
      new PromptHostnameInputFor("lists"),
      new PromptPathFor("lists", "specieslists", a => a.LA_use_species_lists),

      new PromptSubdomainFor("images", "images"),
      new PromptHostnameFor("images", "images"),
      new PromptHostnameInputFor("images"),
      new PromptPathFor("images", "images"),

      new PromptSubdomainFor("regions", "regions"),
      new PromptHostnameFor("regions", "regions", a => a.LA_use_regions),
      new PromptHostnameInputFor("LA_regions_hostname"),
      new PromptPathFor("regions", "regions", a => a.LA_use_regions),

      new PromptSubdomainFor("logger", "logger"),
      new PromptHostnameFor("logger", "logger"),
      new PromptHostnameInputFor("logger"),
      new PromptPathFor("logger", "logger-service"),
      {
        store: defaultStore,
        type: "confirm",
        name: "LA_solr_uses_subdomain",
        message: a => defUseSubdomainPrompt(a, "solr"),
        default: a => defUseSubdomain(a)
      },
      {
        store: defaultStore,
        type: "input",
        name: "LA_solr_hostname",
        message: "LA solr hostname",
        default: a =>
          a.LA_solr_uses_subdomain ? `index.${a.LA_domain}` : a.LA_domain
      },
      {
        store: defaultStore,
        type: "input",
        name: "LA_solr_path",
        default: "/solr",
        when: a => !a.LA_solr_uses_subdomain
      },

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
