"use strict";
const Generator = require("yeoman-generator");
const chalk = require("chalk");
const yosay = require("yosay");
const defaultStore = false;
const defUseSubdomain = a => {
  return a.LA_collectory_uses_subdomain;
};
const debug = false;
const defUseSubdomainPrompt = (a, service) => {
  return `Will the ${chalk.keyword("orange")(service)} module use a http${
    a.LA_enable_ssl ? "s" : ""
  }://${chalk.keyword("orange")("subdomain")}.${a.LA_domain} or not?`;
};
const domainRe = /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/g;
const validateDomain = input => {
  return new Promise(function(resolve, reject) {
    if (!input.match(domainRe)) {
      reject(new Error("You need to provide some-example-domain.org"));
    } else {
      resolve(true);
    }
  });
};
const machines = new Set();

const storeMachine = input => {
  return new Promise(function(resolve) {
    if (!machines.has(input)) machines.add(input);
    resolve(input);
  });
};

function PromptSubdomainFor(varName, subdomain) {
  this.store = defaultStore;
  this.type = "confirm";
  this.name = varName;
  this.message = function(a) {
    return defUseSubdomainPrompt(a, subdomain);
  };
  this.default = function(a) {
    return defUseSubdomain(a);
  };
}

function PromptHostnameFor(varName, varUsesSubdomain, subdomain, when) {
  this.store = defaultStore;
  // TODO choices
  this.type = "input";
  this.name = varName;
  this.message = `LA ${subdomain} hostname`;
  this.default = function(a) {
    return a[varUsesSubdomain] ? `${subdomain}.${a.LA_domain}` : a.LA_domain;
  };
  if (when) {
    this.when = when;
  }
  this.filter = input => storeMachine(input);
  this.validate = input => validateDomain(input);
}

function PromptPathFor(varName, varUsesSubdomain, path, when) {
  this.store = defaultStore;
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
        message: "Your LA Project Name",
        default: "Living Atlas"
      },
      {
        store: true,
        type: "input",
        name: "LA_repo_name",
        message: "Repository Name",
        default: function(answers) {
          return answers.LA_project_name.replace(/ /g, "-");
        }
      },
      {
        store: true,
        type: "input",
        name: "LA_pkg_name",
        message: "repository-short-lowercase-name",
        default: function(answers) {
          return answers.LA_repo_name.toLowerCase().replace(/' '/g, "-");
        }
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
      {
        store: defaultStore,
        type: "choices",
        name: "LA_collectory_base_url",
        message: "LA collectory url",
        default: function(a) {
          return a.LA_collectory_uses_subdomain
            ? `collectory.${a.LA_domain}`
            : a.LA_domain;
        }
      },
      new PromptHostnameFor(
        "LA_collectory_hostname",
        "LA_collectory_uses_subdomain",
        "collectory"
      ),
      new PromptPathFor(
        "LA_collectory_path",
        "LA_collectory_uses_subdomain",
        "collectory"
      ),
      new PromptSubdomainFor("LA_ala_hub_uses_subdomain", "biocache"),
      new PromptHostnameFor(
        "LA_ala_hub_hostname",
        "LA_ala_hub_uses_subdomain",
        "biocache"
      ),
      new PromptPathFor(
        "LA_ala_hub_path",
        "LA_ala_hub_uses_subdomain",
        "ala-hub"
      ),
      new PromptSubdomainFor(
        "LA_biocache_service_uses_subdomain",
        "biocache-service"
      ),
      new PromptHostnameFor(
        "LA_biocache_service_hostname",
        "LA_biocache_service_uses_subdomain",
        "biocache-ws"
      ),
      new PromptPathFor(
        "LA_biocache_service_path",
        "LA_biocache_service_uses_subdomain",
        "biocache-service"
      ),
      new PromptSubdomainFor("LA_ala_bie_uses_subdomain", "bie"),
      new PromptHostnameFor(
        "LA_ala_bie_hostname",
        "LA_ala_bie_uses_subdomain",
        "bie"
      ),
      new PromptPathFor(
        "LA_ala_bie_path",
        "LA_ala_bie_uses_subdomain",
        "ala-bie"
      ),
      new PromptSubdomainFor("LA_bie_index_uses_subdomain", "bie-service"),
      new PromptHostnameFor(
        "LA_bie_index_hostname",
        "LA_bie_index_uses_subdomain",
        "bie-ws"
      ),
      new PromptPathFor(
        "LA_bie_index_path",
        "LA_bie_index_uses_subdomain",
        "bie-index"
      ),
      new PromptSubdomainFor("LA_lists_uses_subdomain", "specieslists"),
      new PromptHostnameFor(
        "LA_lists_hostname",
        "LA_lists_uses_subdomain",
        "lists",
        function(a) {
          return a.LA_use_species_lists;
        }
      ),
      new PromptPathFor(
        "LA_lists_path",
        "LA_lists_uses_subdomain",
        "specieslists",
        function(a) {
          return a.LA_use_species_lists && !a.LA_lists_uses_subdomain;
        }
      ),
      new PromptSubdomainFor("LA_images_uses_subdomain", "images"),
      new PromptHostnameFor(
        "LA_images_hostname",
        "LA_images_uses_subdomain",
        "images"
      ),
      new PromptPathFor("LA_images_path", "LA_images_uses_subdomain", "images"),
      new PromptSubdomainFor("LA_regions_uses_subdomain", "regions"),
      new PromptHostnameFor(
        "LA_regions_hostname",
        "LA_regions_uses_subdomain",
        "regions",
        function(a) {
          return a.LA_use_regions;
        }
      ),
      new PromptPathFor(
        "LA_regions_path",
        "LA_regions_uses_subdomain",
        "regions",
        function(a) {
          return a.LA_use_regions && !a.LA_regions_uses_subdomain;
        }
      ),
      new PromptSubdomainFor("LA_logger_uses_subdomain", "logger"),
      new PromptHostnameFor(
        "LA_logger_hostname",
        "LA_logger_uses_subdomain",
        "logger"
      ),
      new PromptPathFor(
        "LA_logger_path",
        "LA_logger_uses_subdomain",
        "logger-service"
      ),
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
