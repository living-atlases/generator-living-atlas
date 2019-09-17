# generator-living-atlas [![NPM version][npm-image]][npm-url] [![Dependency Status][daviddm-image]][daviddm-url]

> A Yeoman Generator for Living Atlas Ansible Inventories


* [Intro](#intro)
* [Installation](#installation)
* [Options](#options)
* [Screens](#screens)
* [Rerunning the generator](#rerunning-the-generator)
* [Ansible Wrapper](#ansible-wrapper)
* [TODO](#todo)
* [Caveats](#caveats)
* [Any problem with this generator?](#any-problem-with-this-generator)
* [But why this?](#but-why-this)
* [Can these quick-start inventories solve all this?](#can-these-quick-start-inventories-solve-all-this)
* [About Yeoman](#about-yeoman)
* [License](#license)

## Intro

This is a simple [yeoman](http://yeoman.io/) generator, so, just by asking some simple questions about your [Living Atlases](https://living-atlases.gbif.org/) Node, you will get a functional configuration for the setup of your Virtual Machines (VMs) using `ansible`.

The main goal of this utility is to allow you to configure, install & maintain a [Living Atlas](https://living-atlases.gbif.org/) infrastructure in a fast & smooth way.

In others words, with the `ansible` inventories produced by this `yeoman` generator and the [ala-install](https://github.com/AtlasOfLivingAustralia/ala-install/) `ansible` playbooks you should deploy the main LA services quickly and without too much pain.

Also, thanks to `yeoman`, you can rerun this generator, for instance, to enable new modules in the future, or to enable eg. SSL, etc. and reuse your previous settings and compare the differences (see the [screenshots](#screens)).

## Installation

First, install [Yeoman](http://yeoman.io) and `generator-living-atlas` using [npm](https://www.npmjs.com/) (we assume you have pre-installed [node.js](https://nodejs.org/)).

```bash
npm install -g yo
```

Wait!, as this `generator-living-atlas` is still somewhat experimental, it's not published in `npm`. So if you want to test it, you can clone this repo and just use it like:

```bash
cd this-cloned-repo
npm link
cd /tmp # or other directory
yo living-atlas
```

As this is a `yeoman` development environment you can get some `EPERM` or `EACCESS` errors, so check the [yeoman setup guide](https://yeoman.io/codelab/setup.html) for proper configuration.

If we decide to publish this generator in the future, the normal use will be like:

```bash
npm install -g yo
npm install -g generator-living-atlas
```

Then generate your new project:

```bash
yo living-atlas
```

## Options

- Use `--replay` to reuse all the previous responses and regenerate the inventories with some new modifications (or improvements if you update this repo). More info below.
- Also, you can use `--debug` to see some verbose debug info.

## Screens

A screen recording re-running the generator but using another solr hostname and switching to use SSL (see the differences in the generated inventories):

![](yo-living-atlas.gif)

After running the inventories following the instructions from the generated README over two VMs (like in the Paris 2019 Workshop):

![](after-running-inventories.png)

Differences beween two runs:

![](re-running-diff.png)

We can use these inventories as a base for extracting documentation via `doxygen` (or similar):

![](doxygen-ansible-reference.png)


## Rerunning the generator

You can rerun the generator with the option `yo living-atlas --replay` to reuse all the previous responses and regenerate the inventories with some modifications (if for instance you want to add a new service, or use a new version of this generator with improvements).

With `--replay-dont-ask` you can regenerate the playbooks with previous answers without being asked again. This is useful for new versions of this generator, or if you manually edit `.yo-rc.json` where your answers are stored, or for automated processes (like ci integrations).

We recommend to override and set variables adding then to `quick-start-local-extras.yml` and `quick-start-spatial-local-extras.yml` without modification of the generated `quick-start-inventory.yml` and `quick-start-spatial-inventory.yml`, so you can rerun the generator in the future without losing local changes.  The `*-local-extras.sample` files will be updated with future versions of this generator, so you can compare from time to time these samples with your `*-local-extras.yml` files to add new vars, etc.

## Ansible wrapper

Furthermore the utility `ansiblew` is generated. `ansiblew` is an `ansible-playbook` wrapper that can help you to use the inventories and can be easily modified by you to suit your needs. It depends on `python-docopt` package (`sudo apt install python-docopt` in debian and derivatives).

Help output:

```
$ ./ansiblew --help

This is an ansible wrapper to help you to exec the different playbooks with your
inventories.

By default don't exec anything only show the commands. With --nodryrun you can exec
the real commands.

With 'main' only operates over your main host.

Usage:
   ansiblew --alainstall=<dir_of_ala_install_repo> [options] [ main | collectory | ala_hub | biocache_service | ala_bie | bie_index | images | lists | regions | logger | solr | cas | biocache_backend | biocache_cli | spatial |  all ]
   ansiblew -h | --help
   ansiblew -v | --version

Options:
  --nodryrun             Exec the ansible-playbook commands
  -p --properties        Only update properties
  -l --limit=<hosts>     Limit to some inventories hosts
  -s --skip=<tags>       Skip tags
  -h --help              Show help options.
  -d --debug             Show debug info.
  -v --version           Show ansiblew version.
----
ansiblew 0.1.0
Copyright (C) 2019 living-atlases.gbif.org
Apache 2.0 License
```

So you can install the CAS service or the spatial service with simple commands like:

```bash
./ansiblew --alainstall=../ala-install cas --nodryrun
```

and

```bash
./ansiblew --alainstall=../ala-install spatial --nodryrun
```

or all the services with something like:

```bash
./ansiblew --alainstall=../ala-install all --nodryrun
```

Without `--nodryrun` you will get only the full `ansible-playbook` command to use these inventories .

## TODO

- [x] Add basic services (`collectory`, `ala-hub`, etc).
- [x] Add domain/context and service subdomains support
- [x] Add `http`/`https` urls support
- [x] Add `regions` service
- [x] Add `species-list` service
- [x] Add `spatial` service
- [x] Disable caches when using the same host for `collectory` & `biocache`
- [x] use `--limit` with hostnames
- [x] Improve README hosts
- [x] Improve README playbook commands
- [x] Add `ansible` wrapper
- [x] Add inventories to add extra vars without modify the generated inventories
- [x] Store = true if you running it for the first time
- [x] Add other administration info (technical_contact, orgEmail, etc)
- [x] Recommend to use git to track your inventories changes
- [x] Add `biocache-backend` and `biocache-cli` playbook and `cassandra` host selection
- [x] Add `CAS` 5 service
- [x] Fix `apikey_db_dump` location relative to `ala-install`
- [x] Add `ssl` self signed certs support when ssl enabled
- [x] Document `letsencrypt` usage
- [x] Improve generator for only a domain and `/context` use
- [x] Add `local-extras.sample` files that can be updated in the future without lost local changes in `local-extras.yml` files
- [x] Generation of passwords on first run and increase security by default
- [x] Added option `--replay-dont-ask` to regenerate the playbooks with previous answers without asking again
- [x] Improble BIE/biocache etc descriptions (records, species)
- [x] Demo index.html uses `biocache_hub_context_path` etc that does not works with multi hosts
- [ ] Set `collectroy_app = ala-collectory` in main playbook
- [ ] Use `biocache-db` instead of missing playbook
- [ ] Use a different playbook than demo that do not install by default all main services so we can choose a different host for them
- [ ] Document `--skip`
- [ ] Add `--tags` to ansible wrapper
- [ ] Better testing

## Caveats

- Currently running several services in the same machine and the same domain doesn't configure correctly `nginx` `vhosts`. See [this enhancement issue](https://github.com/AtlasOfLivingAustralia/ala-install/issues/256) in `ala-install`. **Workaround**: Use different hostnames per each service in the same machine. So, if for instance, bie and bie-ws are in the same machine, this machine receives multiple names (like bie.example.org and bie-ws.example.org) and `nginx` don't overwrite each service vhost configuration.
- As we are using the [ansible/ala-demo.yml](https://github.com/AtlasOfLivingAustralia/ala-install/blob/master/ansible/ala-demo.yml) playbook, if you are using more that two hosts (the minimal is one for main services, and another for spatial services), some services will be also configured in the main machine. As a workaround, while we fix this, you can use a different playbook for your main machine with the correct limited roles. **Workaround** Comment the roles in `ala-demo.yml` that you'll deploy in other machines.

## Any problem with this generator?

Please [add an issue](https://github.com/vjrj/generator-living-atlas/issues/new) give us details of your problem and we'll try to help you and to improve the generator. Thanks!

## But why this?

Ansible is a fantastic tool for manage LA node infrastructures. But nowadays we have some problems with our current `ala-install` inventories/roles & documentation that make their use difficult by newcomer nodes, but also for other non-Australian nodes' maintenance:
- There are many config properties that are not documented and this makes it quite difficult to tune a LA node
- Sometimes the `/data/*/config/*properties` are well commented but not their source inventories
- From time to time new properties appear but other non-ALA nodes don’t notice
- We end up using several self-made inventories, duplicate properties (like orgName, urls, etc), and many times this is a source of problems (like [code duplication](https://en.wikipedia.org/wiki/Duplicate_code)). Some minor sample:
![](dups.png)
- There is a lack of more real production-ready inventories (you have to ask for them).
- `ala-install` has a structure that sometimes is difficult to find some samples or how to start to deploy some service (think of CAS)
- Many times you have to check the `ansible` generated `config/*properties` for non configured or default properties, search the `ansible` role code to know how to configure these variables, re-run `ansible` with these new variables and re-check the `ansible` `/data/*/config/*properties`.
- The demo inventory (or the last Paris workshop inventories) are a good sample but not enough for a new production LA node (lack of inventory variables documentation, missing important services like CAS)
- We have a lack of info about services' versions compatibility
- Sometimes default module versions in inventories or `LATEST` nexus packages are not the correct/latest ones.
- It would be nice to choose strategies that are also usable by the ALA (not just LA nodes) - this might help maintenance.

## Can these quick-start inventories solve all this?

No. This is only a *Proof of Concept* that tries to mitigate some of the previous problems.

If we think that some tool like this can be useful, we can add more functionality like:

- Better comments of properties in generated inventories for easy operation & tuning
- ~CAS deployment~ done ✓
- Focus on having well maintained generators and their inventories
- Autogenerate documentation from the inventory comments with tools like `doxygen`
- etc

or maybe this experiment suggests to us another path to follow.

## About Yeoman

 * [Learn more about Yeoman](http://yeoman.io/).

## License

Apache-2.0 © [Living Atlases](https://living-atlases.gbif.org)

[npm-image]: https://badge.fury.io/js/generator-living-atlas.svg
[npm-url]: https://npmjs.org/package/generator-living-atlas
[travis-image]: https://travis-ci.org/vjrj/generator-living-atlas.svg?branch=master
[travis-url]: https://travis-ci.org/vjrj/generator-living-atlas
[daviddm-image]: https://david-dm.org/vjrj/generator-living-atlas.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/vjrj/generator-living-atlas
