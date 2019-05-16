"use strict";
const Generator = require("yeoman-generator");
const chalk = require("chalk");
const yosay = require("yosay");

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

const machines = new Set();

const storeMachine = input =>
  new Promise(function(resolve) {
    if (input.match(domainRe) && input !== "other") {
      if (!machines.has(input)) machines.add(input);
      if (debug) console.log(machines);
    }
    resolve(input);
  });

function PromptSubdomainFor(name, subdomain) {
  this.store = defaultStore;
  this.type = "confirm";
  const varName = `LA_${name}_uses_subdomain`;
  this.name = varName;
  this.message = function(a) {
    return defUseSubdomainPrompt(a, subdomain);
  };
  this.default = function(a) {
    return defUseSubdomain(a);
  };
}

function PromptHostnameFor(name, subdomain, when) {
  this.store = defaultStore;
  this.type = "list";
  const varName = `LA_${name}_hostname`;
  const varUsesSubdomain = `LA_${name}_uses_subdomain`;
  this.name = varName;
  this.message = `LA ${subdomain} hostname`;
  this.choices = function(a) {
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
  this.filter = input => storeMachine(input);
  this.validate = input => validateDomain(input);
}

function PromptHostnameInputFor(name) {
  this.store = defaultStore;
  this.type = "input";
  const varName = `LA_${name}_hostname`;
  this.name = varName;
  this.when = a => a[varName] === "other";
  this.filter = input => storeMachine(input);
  this.validate = input => validateDomain(input);
}

function PromptPathFor(name, path, when) {
  this.store = defaultStore;
  const varName = `LA_${name}_path`;
  const varUsesSubdomain = `LA_${name}_uses_subdomain`;
  this.type = "input";
  this.name = varName;
  this.message = `LA ${path} /path`;
  this.default = "/" + path;
  if (when) {
    this.when = when;
  } else {
    this.when = function(a) {
      return !a[varUsesSubdomain];
    };
  }
}

function PromptBaseUrlFor(varName, subdomain, when) {
  // TODO
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
        message: "Your LA Project Long Name",
        default: "Living Atlas of Wakanda"
      },
      {
        store: true,
        type: "input",
        name: "LA_project_shortname",
        message: "Your LA Project Shortname",
        default: function(answers) {
          return answers.LA_project_name.replace(/Living Atlas of /g, "LA ");
        }
      },
      {
        store: true,
        type: "input",
        name: "LA_pkg_name",
        message: "Your LA short-lowercase-name",
        default: function(answers) {
          return answers.LA_project_name.toLowerCase().replace(/' '/g, "-");
        },
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
        message: "What is your LA node main domain",
        default: function(answers) {
          return `${answers.LA_pkg_name}.org`;
        },
        filter: input => storeMachine(input),
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
        store: defaultStore,
        type: "list",
        name: "LA_collectory_uses_subdomain",
        message: function(a) {
          return `Will the ${chalk.keyword("orange")(
            "collectory"
          )} service use a http${a.LA_enable_ssl ? "s" : ""}://${chalk.keyword(
            "orange"
          )("subdomain")}.${a.LA_domain} or a http${
            a.LA_enable_ssl ? "s" : ""
          }://${a.LA_domain}${chalk.keyword("orange")("/service-path/")} ?`;
        },
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
       *   default: function(a) {
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
      new PromptHostnameFor("lists", "lists", function(a) {
        return a.LA_use_species_lists;
      }),
      new PromptHostnameInputFor("lists"),
      new PromptPathFor("lists", "specieslists", function(a) {
        return a.LA_use_species_lists && !a.LA_lists_uses_subdomain;
      }),
      new PromptSubdomainFor("images", "images"),
      new PromptHostnameFor("images", "images"),
      new PromptHostnameInputFor("images"),
      new PromptPathFor("images", "images"),
      new PromptSubdomainFor("regions", "regions"),
      new PromptHostnameFor("regions", "regions", function(a) {
        return a.LA_use_regions;
      }),
      new PromptHostnameInputFor("LA_regions_hostname"),
      new PromptPathFor("regions", "regions", function(a) {
        return a.LA_use_regions && !a.LA_regions_uses_subdomain;
      }),
      new PromptSubdomainFor("logger", "logger"),
      new PromptHostnameFor("logger", "logger"),
      new PromptHostnameInputFor("logger"),
      new PromptPathFor("logger", "logger-service"),
      {
        store: defaultStore,
        type: "confirm",
        name: "LA_solr_uses_subdomain",
        message: function(a) {
          return defUseSubdomainPrompt(a, "solr");
        },
        default: function(a) {
          return defUseSubdomain(a);
        }
      },
      {
        store: defaultStore,
        type: "input",
        name: "LA_solr_hostname",
        message: "LA solr hostname",
        default: function(a) {
          return a.LA_solr_uses_subdomain
            ? `index.${a.LA_domain}`
            : a.LA_domain;
        }
      },
      {
        store: defaultStore,
        type: "input",
        name: "LA_solr_path",
        default: "/solr",
        when: function(a) {
          return !a.LA_solr_uses_subdomain;
        }
      },

      {
        store: true,
        type: "input",
        name: "LA_cas_hostname",
        message: "LA CAS hostname",
        default: function(a) {
          return `auth.${a.LA_domain}`;
        }
      }
    ]);
  }

  writing() {
    if (this.answers.LA_collectory_uses_subdomain) {
      this.answers.LA_collectory_path = "";
    }
    if (this.answers.LA_ala_hub_uses_subdomain) {
      this.answers.LA_ala_hub_path = "";
    }
    if (this.answers.LA_biocache_service_uses_subdomain) {
      this.answers.LA_biocache_service_path = "";
    }
    if (this.answers.LA_ala_bie_uses_subdomain) {
      this.answers.LA_ala_bie_path = "";
    }
    if (this.answers.LA_bie_index_uses_subdomain) {
      this.answers.LA_bie_index_path = "";
    }
    if (this.answers.LA_images_uses_subdomain) {
      this.answers.LA_images_path = "";
    }
    if (this.answers.LA_logger_uses_subdomain) {
      this.answers.LA_logger_path = "";
    }
    if (this.answers.LA_solr_uses_subdomain) {
      this.answers.LA_solr_path = "";
    }
    if (
      this.answers.LA_use_species_lists &&
      this.answers.LA_lists_uses_subdomain
    ) {
      this.answers.LA_lists_path = "";
    }
    if (this.answers.LA_use_regions && this.answers.LA_regions_uses_subdomain) {
      this.answers.LA_regions_path = "";
    }
    this.answers.LA_urls_prefix = this.answers.LA_enable_ssl
      ? "https://"
      : "http://";

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
    // TODO: Maybe here we can check for some ansible install dependency
  }
};
