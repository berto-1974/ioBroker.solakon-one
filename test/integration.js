'use strict';

const path = require('node:path');
const { expect } = require('chai');
const { tests } = require('@iobroker/testing');

// Run integration tests - this starts js-controller and the adapter, then runs the tests
tests.integration(path.join(__dirname, '..'), {
    defineAdditionalTests({ suite }) {
        suite('Test adapter startup', getHarness => {
            it('Should start without throwing', async function () {
                this.timeout(60000);

                const harness = getHarness();
                await harness.startAdapterAndWait();

                const isRunning = await harness.isAdapterRunning();
                expect(isRunning).to.be.true;
            });
        });
    },
});
