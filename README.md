# generator-living-atlas [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]
> An experimental Yeoman Generator for Living Atlas Ansible Inventories

## Intro

This is a super simple yeoman generator trying to facilitate a quick start with Living Atlas `ansible` inventories.

So with the inventories produced by this `yeoman` generator and the [ala-install](https://github.com/AtlasOfLivingAustralia/ala-install/) `ansible` playbooks you should deploy a demo with the main LA services quickly and without too much pain.

Also, thanks to `yeoman`, you can rerun the assistant enabling, for instance, some new module reusing your previous settings and comparing the differences (se the screenshot).

This is only a Proof of Concept. If we think that some tool like this can be useful, we can add more funcionality like:
- Better comments of properties in generated inventories for easy operation & tunning
- CAS deployment
- Allow deployment in multiple machines (right now this is only tested using two VMs)

## Installation

First, install [Yeoman](http://yeoman.io) and generator-living-atlas using [npm](https://www.npmjs.com/) (we assume you have pre-installed [node.js](https://nodejs.org/)).

```bash
npm install -g yo
```

This generator is experimental and it's not published in npm. So if you want to test it, you can clone this repo and:

```bash
npm link
cd /tmp # or other directory
yo living-atlas
```

If we publish this generator in some the future:

```bash
npm install -g yo
npm install -g generator-living-atlas
```

Then generate your new project:

```bash
yo living-atlas
```
## Screenshots

![](yo-living-atlas.png)

After runing the inventories following the instructions from the generated README over two VMs (like in the Paris 2019 Workshop):

![](after-running-inventories.png)

## Getting To Know Yeoman

 * Yeoman has a heart of gold.
 * Yeoman is a person with feelings and opinions, but is very easy to work with.
 * Yeoman can be too opinionated at times but is easily convinced not to be.
 * Feel free to [learn more about Yeoman](http://yeoman.io/).

## License

Apache-2.0 © [Living Atlases](https://living-atlases.gbif.org)


[npm-image]: https://badge.fury.io/js/generator-living-atlas.svg
[npm-url]: https://npmjs.org/package/generator-living-atlas
[travis-image]: https://travis-ci.org/vjrj/generator-living-atlas.svg?branch=master
[travis-url]: https://travis-ci.org/vjrj/generator-living-atlas
[daviddm-image]: https://david-dm.org/vjrj/generator-living-atlas.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/vjrj/generator-living-atlas
