# Older Changelog

This file contains older changelog entries.
Recent changes are documented in [README.md](README.md#changelog).

### 1.0.3 (2026-05-30)
- Add Node.js 24 to CI test matrix; use Node 24 for lint and deploy

### 1.0.2 (2026-04-13)
- Fix: add changelog to README, remove obsolete .eslintrc.json, add release-script packages, VS Code schema, automerge workflow

### 1.0.1 (2026-04-13)
- Fix: compact mode enabled, ESLint migrated to @iobroker/eslint-config, node: prefix for built-in modules, automated deploy workflow added

### 1.0.0 (2026-04-12)
- Initial release
- Modbus TCP communication
- All sensor data points (PV, battery, grid, inverter, EPS)
- All control data points (operating mode, SoC limits, remote control, EPS)
- Admin UI with jsonConfig
## 1.0.14 (2026-06-28)
- Address manual review feedback: remove postinstall script, English log messages, i18n state labels and instanceObjects, translatable admin labels, sequential polling, README fixes, integration tests

## 1.0.13 (2026-06-11)
- Fix invalid role 'level.power' for power setpoint states (E1008)

## 1.0.12 (2026-06-10)
- Update @tsconfig/node22 to ^22.0.5 (W0083); migrate i18n to short format (S5601)

## 1.0.11 (2026-06-10)
- Add CHANGELOG_OLD.md for older entries (W6020); add tsconfig.json and @tsconfig/node22 (S0085/S0087); add README link to CHANGELOG_OLD.md

## 1.0.10 (2026-06-10)
- Fix W5005: use adapter.setTimeout in modbus.js; update eslint-config to 2.3.4; remove CHANGELOG_OLD.md

## 1.0.9 (2026-06-09)
- Fix JSON syntax error in io-package.json; limit news entries to 7 (E1032)

## 1.0.7 (2026-06-09)
- Fix @types/node version specifier: change >=22 to ^22.0.0 (W0066)

## 1.0.6 (2026-06-09)
- Fix Node.js requirement in README (>=22); add @types/node devDependency

## 1.0.5 (2026-06-09)
- Fix repo checker errors: require Node.js >=22, update release-script packages, remove redundant eslint devDependency, add macOS to CI test matrix, use this.setInterval/clearTimeout correctly

## 1.0.4 (2026-06-09)
- Add multilingual names (11 languages) to all datapoints

## 1.0.3 (2026-05-30)
- Add Node.js 24 to CI test matrix; use Node 24 for lint and deploy

## 1.0.2 (2026-04-13)
- Fix: add changelog to README, remove obsolete .eslintrc.json, add release-script packages, VS Code schema, automerge workflow

## 1.0.1 (2026-04-13)
- Fix: compact mode enabled, ESLint migrated to @iobroker/eslint-config, node: prefix for built-in modules, automated deploy workflow added

## 1.0.0 (2026-04-12)
- Initial release
- Modbus TCP communication
- All sensor data points (PV, battery, grid, inverter, EPS)
- All control data points (operating mode, SoC limits, remote control, EPS)
- Admin UI with jsonConfig

For older changelog entries see [CHANGELOG_OLD.md](CHANGELOG_OLD.md).

---
