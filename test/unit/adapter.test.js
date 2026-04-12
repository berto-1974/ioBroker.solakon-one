'use strict';

const { expect } = require('@iobroker/testing').unit;
const path = require('path');
const fs   = require('fs');

describe('ioBroker.solakon-one – Package validation', () => {

    let pkg;
    let ioPkg;

    before(() => {
        pkg   = JSON.parse(fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8'));
        ioPkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../../io-package.json'), 'utf8'));
    });

    it('package.json must have a valid name', () => {
        expect(pkg.name).to.match(/^iobroker\./);
    });

    it('package.json must have a version', () => {
        expect(pkg.version).to.match(/^\d+\.\d+\.\d+$/);
    });

    it('package.json author must have name and email', () => {
        expect(pkg.author).to.be.an('object');
        expect(pkg.author.name).to.be.a('string').that.is.not.empty;
        expect(pkg.author.email).to.be.a('string').that.includes('@');
    });

    it('io-package.json version must match package.json version', () => {
        expect(ioPkg.common.version).to.equal(pkg.version);
    });

    it('io-package.json must have required common fields', () => {
        const common = ioPkg.common;
        expect(common.name).to.be.a('string').that.is.not.empty;
        expect(common.title).to.be.a('string').that.is.not.empty;
        expect(common.desc).to.be.an('object');
        expect(common.desc.en).to.be.a('string').that.is.not.empty;
        expect(common.authors).to.be.an('array').that.is.not.empty;
        expect(common.license).to.be.a('string').that.is.not.empty;
        expect(common.mode).to.be.a('string').that.is.not.empty;
        expect(common.type).to.be.a('string').that.is.not.empty;
    });

    it('io-package.json must have news for current version', () => {
        expect(ioPkg.common.news).to.be.an('object');
        expect(ioPkg.common.news).to.have.property(pkg.version);
    });

    it('io-package.json must declare js-controller dependency', () => {
        const deps = ioPkg.common.dependencies;
        expect(deps).to.be.an('array').that.is.not.empty;
        const jsCtrl = deps.find(d => d['js-controller']);
        expect(jsCtrl).to.not.be.undefined;
    });

    it('admin/jsonConfig.json must be valid JSON', () => {
        const jsonConfigPath = path.join(__dirname, '../../admin/jsonConfig.json');
        expect(() => JSON.parse(fs.readFileSync(jsonConfigPath, 'utf8'))).to.not.throw();
    });

});
