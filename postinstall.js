'use strict';

/**
 * Postinstall-Script: Legt automatisch eine Instanz von solakon-one an.
 * Wird nach "iobroker url ..." ausgeführt.
 */

const path       = require('path');
const { spawnSync } = require('child_process');

// Pfad zum iobroker-Script (liegt 2 Ebenen über dem Adapter in node_modules/.bin/)
const iobScript = path.resolve(__dirname, '../.bin/iobroker');

console.log('Lege Instanz solakon-one an...');

const result = spawnSync(process.execPath, [iobScript, 'add', 'solakon-one'], {
    stdio:   'inherit',
    timeout: 30000,
});

if (result.status !== 0) {
    console.log('Hinweis: Instanz bitte manuell anlegen: iobroker add solakon-one');
}
