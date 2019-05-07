"use strict";
const Generator = require("yeoman-generator");
const chalk = require("chalk");
const yosay = require("yosay");
const defaultStore = false;
const defUseSubdomain = function(a) {
  return a.LA_collectory_uses_subdomain;
};
const debug = false;
const defUseSubdomainPrompt = function(a, service) {
  return `Will the ${chalk.keyword('orange')(service)} module use a http${a.LA_enable_ssl? "s": ""}://${chalk.keyword('orange')("subdomain")}.${a.LA_domain} or not?`;
};

module.exports = class extends Generator {
  async prompting() {
    // Have Yeoman greet the user.
    this.log(
      yosay(`Welcome to the ${chalk.keyword('orange')("Living Atlas")} Quick-Start Ansible Inventories Generator`)
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
        message: "Your LA domain",
        default: function(answers) {
          return `${answers.LA_pkg_name}.org`;
        }
      },

      { store: true, type: "confirm", name: "LA_use_spatial", message: "Use spatial service?", default: false },
      { store: true, type: "confirm", name: "LA_use_regions", message: "Use regions service?", default: false },
      { store: true, type: "confirm", name: "LA_use_species_lists", message: "Use specieslists service?", default: false },
      { store: true, type: "confirm", name: "LA_use_CAS", message: "Use CAS Auth service? (WIP: Right now it only sets auth urls)", default: false },
      { store: true, type: "confirm", name: "LA_enable_ssl", message: "Enable SSL? (Warn: this only set the urls correctly, but it doesn't manage the certicates)", default: false },
      {
        store: defaultStore,
        type: "list",
        name: "LA_collectory_uses_subdomain",
        message: function(a) {
          return `Will the ${chalk.keyword('orange')("collectory")} service use a http${a.LA_enable_ssl? "s": ""}://${chalk.keyword('orange')("subdomain")}.${a.LA_domain} or a http${a.LA_enable_ssl? "s": ""}://${a.LA_domain}${chalk.keyword('orange')("/service-path/")} ?`;
        },
        choices: [
          { name: "subdomain", value: true },
          { name: "service-path", value: false }
        ]
      },
      {
        store: defaultStore,
        type: "input",
        name: "LA_collectory_hostname",
        message: "LA collectory hostname",
        default: function(a) {
          return a.LA_collectory_uses_subdomain ? `collectory.${a.LA_domain}`: a.LA_domain;
        }
      },
      {
        store: defaultStore,
        type: "input",
        name: "LA_collectory_path",
        message: "Collectory /path name",
        default: "/collectory",
        when: function(a) {
          return !a.LA_collectory_uses_subdomain;
        }
      },
      { store: defaultStore, type: "confirm", name: "LA_ala_hub_uses_subdomain", message: function(a) { return defUseSubdomainPrompt(a, "biocache"); }, default: function(a) { return defUseSubdomain(a); } },
      { store: defaultStore, type: "input", name: "LA_ala_hub_hostname", message: "LA biocache hostname", default: function(a) { return a.LA_ala_hub_uses_subdomain ? `biocache.${a.LA_domain}`: a.LA_domain; } },
      { store: defaultStore, type: "input", name: "LA_ala_hub_path", default: "/ala-hub", when: function(a) { return !a.LA_ala_hub_uses_subdomain; } },
      { store: defaultStore, type: "confirm", name: "LA_biocache_service_uses_subdomain", message: function(a) { return defUseSubdomainPrompt(a, "biocache-service"); }, default: function(a) { return defUseSubdomain(a); } },
      { store: defaultStore, type: "input", name: "LA_biocache_service_hostname", message: "LA biocache-service hostname", default: function(a) { return a.LA_biocache_service_uses_subdomain ? `biocache-ws.${a.LA_domain}`: a.LA_domain; } },
      { store: defaultStore, type: "input", name: "LA_biocache_service_path", default: "/biocache-service", when: function(a) { return !a.LA_biocache_service_uses_subdomain; } },

      { store: defaultStore, type: "confirm", name: "LA_ala_bie_uses_subdomain", message: function(a) { return defUseSubdomainPrompt(a, "bie"); }, default: function(a) { return defUseSubdomain(a); } },
      { store: defaultStore, type: "input", name: "LA_ala_bie_hostname", message: "LA bie hostname", default: function(a) { return a.LA_ala_bie_uses_subdomain ? `bie.${a.LA_domain}`: a.LA_domain; } },
      { store: defaultStore, type: "input", name: "LA_ala_bie_path", default: "/ala-bie", when: function(a) { return !a.LA_ala_bie_uses_subdomain; } },

      { store: defaultStore, type: "confirm", name: "LA_bie_index_uses_subdomain", message: function(a) { return defUseSubdomainPrompt(a, "bie-service"); }, default: function(a) { return defUseSubdomain(a); } },
      { store: defaultStore, type: "input", name: "LA_bie_index_hostname", message: "LA bie-service hostname", default: function(a) { return a.LA_bie_index_uses_subdomain ? `bie-ws.${a.LA_domain}`: a.LA_domain; } },
      { store: defaultStore, type: "input", name: "LA_bie_index_path", default: "/bie-index", when: function(a) { return !a.LA_bie_index_uses_subdomain; } },

      { store: defaultStore, type: "confirm", name: "LA_lists_uses_subdomain", message: function(a) { return defUseSubdomainPrompt(a, "specieslists"); }, default: function(a) { return defUseSubdomain(a); }, when: function(a) { return a.LA_use_species_lists;} },
        { store: defaultStore, type: "input", name: "LA_lists_hostname", message: "LA specieslists hostname", default: function(a) { return a.LA_lists_uses_subdomain ? `lists.${a.LA_domain}`: a.LA_domain; }, when: function(a) { return a.LA_use_species_lists;} },
      { store: defaultStore, type: "input", name: "LA_lists_path", default: "/specieslists", when: function(a) { return a.LA_use_species_lists && !a.LA_lists_uses_subdomain; } },

      { store: defaultStore, type: "confirm", name: "LA_images_uses_subdomain", message: function(a) { return defUseSubdomainPrompt(a, "images"); }, default: function(a) { return defUseSubdomain(a); } },
      { store: defaultStore, type: "input", name: "LA_images_hostname", message: "LA images hostname", default: function(a) { return a.LA_images_uses_subdomain ? `images.${a.LA_domain}`: a.LA_domain; } },
      { store: defaultStore, type: "input", name: "LA_images_path", default: "/images", when: function(a) { return !a.LA_images_uses_subdomain; } },

      { store: defaultStore, type: "confirm", name: "LA_regions_uses_subdomain", message: function(a) { return defUseSubdomainPrompt(a, "regions"); }, default: function(a) { return defUseSubdomain(a); }, when: function(a) { return a.LA_use_regions;} },
      { store: defaultStore, type: "input", name: "LA_regions_hostname", message: "LA regions hostname", default: function(a) { return a.LA_regions_uses_subdomain ? `regions.${a.LA_domain}`: a.LA_domain; }, when: function(a) { return a.LA_use_regions;} },
      { store: defaultStore, type: "input", name: "LA_regions_path", default: "/regions", when: function(a) { return a.LA_use_regions && !a.LA_regions_uses_subdomain; } },

      { store: defaultStore, type: "confirm", name: "LA_logger_uses_subdomain", message: function(a) { return defUseSubdomainPrompt(a, "logger"); }, default: function(a) { return defUseSubdomain(a); } },
      { store: defaultStore, type: "input", name: "LA_logger_hostname", message: "LA logger hostname", default: function(a) { return a.LA_logger_uses_subdomain ? `logger.${a.LA_domain}`: a.LA_domain; } },
      { store: defaultStore, type: "input", name: "LA_logger_path", default: "/logger", when: function(a) { return !a.LA_logger_uses_subdomain; } },

      { store: defaultStore, type: "confirm", name: "LA_solr_uses_subdomain", message: function(a) { return defUseSubdomainPrompt(a, "solr"); }, default: function(a) { return defUseSubdomain(a); } },
      { store: defaultStore, type: "input", name: "LA_solr_hostname", message: "LA solr hostname", default: function(a) { return a.LA_solr_uses_subdomain ? `index.${a.LA_domain}`: a.LA_domain; } },
      { store: defaultStore, type: "input", name: "LA_solr_path", default: "/solr", when: function(a) { return !a.LA_solr_uses_subdomain; } },

      { store: true, type: "input", name: "LA_cas_hostname", message: "LA CAS hostname", default: function(a) { return `auth.${a.LA_domain}`; }}

    ]);
  }

  writing() {
    if (this.answers.LA_collectory_uses_subdomain)       { this.answers.LA_collectory_path = ""; }
    if (this.answers.LA_ala_hub_uses_subdomain)          { this.answers.LA_ala_hub_path = ""; }
    if (this.answers.LA_biocache_service_uses_subdomain) { this.answers.LA_biocache_service_path = ""; }
    if (this.answers.LA_ala_bie_uses_subdomain)          { this.answers.LA_ala_bie_path = ""; }
    if (this.answers.LA_bie_index_uses_subdomain)        { this.answers.LA_bie_index_path = ""; }
    if (this.answers.LA_images_uses_subdomain)           { this.answers.LA_images_path = ""; }
    if (this.answers.LA_logger_uses_subdomain)           { this.answers.LA_logger_path = ""; }
    if (this.answers.LA_solr_uses_subdomain)             { this.answers.LA_solr_path = ""; }
    if (this.answers.LA_use_species_lists && this.answers.LA_lists_uses_subdomain) { this.answers.LA_lists_path = ""; }
    if (this.answers.LA_use_regions && this.answers.LA_regions_uses_subdomain) { this.answers.LA_regions_path = ""; }
    this.answers.LA_urls_prefix = this.answers.LA_enable_ssl ?
      'https://' :
      'http://';

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
    // this.installDependencies();
    // clone ala-install
    // TODO: Maybe here we can check for some ansible install dependency
  }
};
