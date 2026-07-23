'use strict';

const assert = require('node:assert');
const {
    REMOTE_CONTROL_MODES_I18N,
    EPS_OUTPUT_MODES_I18N,
    OPERATING_MODES_I18N,
    NETWORK_STATUS_I18N,
    resolveStates,
} = require('../../lib/registers');

const I18N_STATES_CONSTANTS = {
    REMOTE_CONTROL_MODES_I18N,
    EPS_OUTPUT_MODES_I18N,
    OPERATING_MODES_I18N,
    NETWORK_STATUS_I18N,
};

describe('ioBroker.solakon-one – lib/registers.js states', () => {

    it('every i18n states entry has a non-empty English fallback', () => {
        for (const [constName, i18nStates] of Object.entries(I18N_STATES_CONSTANTS)) {
            for (const [key, entry] of Object.entries(i18nStates)) {
                assert.strictEqual(typeof entry.en, 'string', `${constName}[${key}].en must be a string`);
                assert.ok(entry.en.length > 0, `${constName}[${key}].en must not be empty`);
            }
        }
    });

    it('resolveStates() only returns plain strings, never objects', () => {
        const resolved = resolveStates(OPERATING_MODES_I18N, 'de');
        for (const value of Object.values(resolved)) {
            assert.strictEqual(typeof value, 'string');
        }
    });

    it('resolveStates() falls back to English for unsupported languages', () => {
        const fallback = resolveStates(OPERATING_MODES_I18N, 'xx-does-not-exist');
        const english = resolveStates(OPERATING_MODES_I18N, 'en');
        assert.deepStrictEqual(fallback, english);
    });

    it('resolveStates() preserves the (sparse) key set unchanged', () => {
        const resolved = resolveStates(OPERATING_MODES_I18N, 'en');
        assert.deepStrictEqual(Object.keys(resolved), Object.keys(OPERATING_MODES_I18N));
    });
});
