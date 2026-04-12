'use strict';

const assert = require('node:assert');
const path   = require('node:path');
const fs     = require('node:fs');

describe('ioBroker.solakon-one – Package validation', () => {

    let pkg;
    let ioPkg;

    before(() => {
        pkg   = JSON.parse(fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8'));
        ioPkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../../io-package.json'), 'utf8'));
    });

    it('package.json must have a valid name', () => {
        assert.match(pkg.name, /^iobroker\./);
    });

    it('package.json must have a valid version', () => {
        assert.match(pkg.version, /^\d+\.\d+\.\d+$/);
    });

    it('package.json author must have name and email', () => {
        assert.strictEqual(typeof pkg.author, 'object');
        assert.ok(pkg.author.name && pkg.author.name.length > 0);
        assert.ok(pkg.author.email && pkg.author.email.includes('@'));
    });

    it('io-package.json version must match package.json version', () => {
        assert.strictEqual(ioPkg.common.version, pkg.version);
    });

    it('io-package.json must have required common fields', () => {
        const c = ioPkg.common;
        assert.ok(c.name && c.name.length > 0,          'name missing');
        assert.strictEqual(typeof c.desc, 'object',      'desc must be object');
        assert.ok(c.desc.en && c.desc.en.length > 0,    'desc.en missing');
        assert.ok(Array.isArray(c.authors) && c.authors.length > 0, 'authors missing');
        assert.ok(c.licenseInformation,                  'licenseInformation missing');
        assert.ok(c.mode && c.mode.length > 0,           'mode missing');
        assert.ok(c.type && c.type.length > 0,           'type missing');
        assert.ok(typeof c.tier === 'number',            'tier missing');
    });

    it('io-package.json must have news for current version', () => {
        assert.strictEqual(typeof ioPkg.common.news, 'object');
        assert.ok(ioPkg.common.news[pkg.version], `news entry for ${pkg.version} missing`);
    });

    it('io-package.json must declare js-controller dependency', () => {
        const deps = ioPkg.common.dependencies;
        assert.ok(Array.isArray(deps) && deps.length > 0, 'dependencies missing');
        const jsCtrl = deps.find(d => d['js-controller']);
        assert.ok(jsCtrl, 'js-controller dependency missing');
    });

    it('admin/jsonConfig.json must be valid JSON', () => {
        const jsonConfigPath = path.join(__dirname, '../../admin/jsonConfig.json');
        assert.doesNotThrow(() => JSON.parse(fs.readFileSync(jsonConfigPath, 'utf8')));
    });

});
