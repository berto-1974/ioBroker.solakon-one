'use strict';

const path   = require('node:path');
const { tests } = require('@iobroker/testing');

// Validate that all required package files are present and correct
tests.packageFiles(path.join(__dirname, '../..'));
