"use strict";
const Generator = require("yeoman-generator");
const chalk = require("chalk");
const yosay = require("yosay");
const defaultStore = false;
const defUseSubdomain = function(a) {
  return a.LA_collectory_uses_subdomain;
};

const defUseSubdomainPrompt = function(a, service) {
  return `Will the ${service} service use a http://${chalk.red("subdomain")}.${a.LA_domain} or not?`;
};

module.exports = class extends Generator {
  prompting() {
    // Have Yeoman greet the user.
    this.log(
      yosay(`Welcome to the ${chalk.red("Living Atlas Ansible Assistant")} for new LA nodes!`, 15)
    );

    const prompts = [
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
      {
        store: defaultStore,
        type: "list",
        name: "LA_collectory_uses_subdomain",
        message: function(answers) {
          return `Will the collectory service use a http://${chalk.red("subdomain")}.${answers.LA_domain} or a http://${answers.LA_domain}${chalk.red("/service-path/")} ?`;
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
        message: "Collectory hostname",
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
      {
        store: defaultStore,
        type: "confirm",
        name: "LA_ala_hub_uses_subdomain",
        message: function(a) {
          return defUseSubdomainPrompt(a, "ala-hub");
        },
        default: function(a) { return defUseSubdomain(a); }
      },
      {
        store: defaultStore,
        type: "input",
        name: "LA_ala_hub_hostname",
        message: "LA hub hostname",
        default: function(a) {
          return a.LA_ala_hub_uses_subdomain ? `biocache.${a.LA_domain}`: a.LA_domain;
        }
      },
      {
        store: defaultStore,
        type: "input",
        name: "LA_ala_hub_path",
        default: "/ala-hub",
        when: function(a) {
          return !a.LA_ala_hub_uses_subdomain;
        }
      }

        /* { store: defaultStore, type: "", name: "LA_biocache_service_uses_subdomain", message: "", default: "no" },
         * { store: defaultStore, type: "", name: "LA_biocache_service_hostname", message: "", default: "{{ '%s.%s'|format('biocache-ws' }, answers.LA_domain) if answers.LA_biocache_service_uses_subdomain == 'yes' else '%s'|format(answers.LA_domain) }}",
         *   { store: defaultStore, type: "", name: "LA_biocache_service_path", message: "", default: "{{ '' if answers.LA_biocache_service_uses_subdomain == 'yes' else '/biocache-service' }}" },

         *   { store: defaultStore, type: "", name: "LA_ala_bie_uses_subdomain", message: "", default: "no" },
         *   { store: defaultStore, type: "", name: "LA_ala_bie_hostname", message: "", default: "{{ '%s.%s'|format('bie' }, answers.LA_domain) if answers.LA_ala_bie_uses_subdomain == 'yes' else '%s'|format(answers.LA_domain) }}",
         *     { store: defaultStore, type: "", name: "LA_ala_bie_path", message: "", default: "{{ '' if answers.LA_ala_bie_uses_subdomain == 'yes' else '/ala-bie' }}" },

         *     { store: defaultStore, type: "", name: "LA_bie_index_uses_subdomain", message: "", default: "no" },
         *     { store: defaultStore, type: "", name: "LA_bie_index_hostname", message: "", default: "{{ '%s.%s'|format('bie-ws' }, answers.LA_domain) if answers.LA_bie_index_uses_subdomain == 'yes' else '%s'|format(answers.LA_domain) }}",
         *       { store: defaultStore, type: "", name: "LA_bie_index_path", message: "", default: "{{ '' if answers.LA_bie_index_uses_subdomain == 'yes' else '/bie-index' }}" },

         *       { store: defaultStore, type: "", name: "LA_lists_uses_subdomain", message: "", default: "no" },
         *       { store: defaultStore, type: "", name: "LA_lists_hostname", message: "", default: "{{ '%s.%s'|format('lists' }, answers.LA_domain) if answers.LA_lists_uses_subdomain == 'yes' else '%s'|format(answers.LA_domain) }}",
         *         { store: defaultStore, type: "", name: "LA_lists_path", message: "", default: "{{ '' if answers.LA_lists_uses_subdomain == 'yes' else '/specieslists' }}" },

         *         { store: defaultStore, type: "", name: "LA_images_uses_subdomain", message: "", default: "no" },
         *         { store: defaultStore, type: "", name: "LA_images_hostname", message: "", default: "{{ '%s.%s'|format('images' }, answers.LA_domain) if answers.LA_images_uses_subdomain == 'yes' else '%s'|format(answers.LA_domain) }}",
         *           { store: defaultStore, type: "", name: "LA_images_path", message: "", default: "{{ '' if answers.LA_images_uses_subdomain == 'yes' else '/images' }}" },

         *           { store: defaultStore, type: "", name: "LA_regions_uses_subdomain", message: "", default: "no" },
         *           { store: defaultStore, type: "", name: "LA_regions_hostname", message: "", default: "{{ '%s.%s'|format('regions' }, answers.LA_domain) if answers.LA_regions_uses_subdomain == 'yes' else '%s'|format(answers.LA_domain) }}",
         *             { store: defaultStore, type: "", name: "LA_regions_path", message: "", default: "{{ '' if answers.LA_regions_uses_subdomain == 'yes' else '/regions' }}" },

         *             { store: defaultStore, type: "", name: "LA_logger_uses_subdomain", message: "", default: "no" },
         *             { store: defaultStore, type: "", name: "LA_logger_hostname", message: "", default: "{{ '%s.%s'|format('logger' }, answers.LA_domain) if answers.LA_logger_uses_subdomain == 'yes' else '%s'|format(answers.LA_domain) }}",
         *               { store: defaultStore, type: "", name: "LA_logger_path", message: "", default: "{{ '' if answers.LA_logger_uses_subdomain == 'yes' else '/logger-service' }}" },

         *               { store: defaultStore, type: "", name: "LA_solr_uses_subdomain", message: "", default: "no" },
         *               { store: defaultStore, type: "", name: "LA_solr_hostname", message: "", default: "{{ '%s.%s'|format('index' }, answers.LA_domain) if answers.LA_solr_uses_subdomain == 'yes' else '%s'|format(answers.LA_domain) }}",
         *                 { store: defaultStore, type: "", name: "LA_solr_path", message: "", default: "{{ '' if answers.LA_solr_uses_subdomain == 'yes' else '/solr' }}" },

         *                 { store: defaultStore, type: "", name: "LA_cas_hostname", message: "", default: "{{ '%s.%s'|format('auth' }, answers.LA_domain) }}",

         *                   { store: defaultStore, type: "", name: "LA_enable_ssl", message: "", default: "no" },
         *                   { store: defaultStore, type: "", name: "LA_urls_prefix", message: "", default: "{{ 'https://' if answers.LA_enable_ssl == 'yes' else 'http://' }}" },

         *                   { store: defaultStore, type: "", name: "LA_use_CAS", message: "", default: "no" },
         *                   { store: defaultStore, type: "", name: "LA_use_regions", message: "", default: "no" },
         *                   { store: defaultStore, type: "", name: "LA_use_spatial", message: "", default: "no" },
         *                   { store: defaultStore, type: "", name: "LA_use_species_lists": "no" }
         */
    ];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
      this.log(JSON.stringify(this.props), null, '\t');
      if (this.props.LA_collectory_uses_subdomain) { this.props.LA_collectory_path = ""; }
      if (this.props.LA_ala_hub_uses_subdomain)    { this.props.LA_ala_hub_path = ""; }
    });
  }

  writing() {
    this.fs.copy(
      this.templatePath("dummyfile.txt"),
      this.destinationPath("dummyfile.txt")
    );
  }

  install() {
   // this.installDependencies();
   // TODO: Maybe here we can check for some ansible install dependency
  }
};
