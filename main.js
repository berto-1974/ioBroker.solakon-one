'use strict';

/*
 * Solakon ONE ioBroker Adapter
 * Liest und steuert den Solakon ONE Hybrid-Wechselrichter via Modbus TCP.
 *
 * Adapter-Name:    solakon-one
 * Protokoll:       Modbus TCP (Port 502)
 * Bibliothek:      jsmodbus
 */

const utils   = require('@iobroker/adapter-core');
const { SolakonModbusHub }   = require('./lib/modbus');
const {
    REMOTE_CONTROL_MODES,
    EPS_OUTPUT_MODES,
    OPERATING_MODES,
    NETWORK_STATUS,
    GRID_STANDARD,
} = require('./lib/registers');

// ─────────────────────────────────────────────────────────────────────────────
// State-Definitionen
// Jeder Eintrag definiert: channel, id, name, type, role, unit, min/max, states
// ─────────────────────────────────────────────────────────────────────────────

/** Lesbare Sensor-States (werden aus REGISTERS befüllt) */
const SENSOR_STATES = [
    // Gerät
    { reg: 'model_name',    ch: 'device', id: 'model',         name: 'Modellbezeichnung',     type: 'string', role: 'info.name' },
    { reg: 'serial_number', ch: 'device', id: 'serial',        name: 'Seriennummer',          type: 'string', role: 'info.serial' },
    { reg: 'master_version',ch: 'device', id: 'fw_master',     name: 'Firmware Master',       type: 'number', role: 'info.firmware' },
    { reg: 'slave_version', ch: 'device', id: 'fw_slave',      name: 'Firmware Slave',        type: 'number', role: 'info.firmware' },

    // PV
    { reg: 'total_pv_power',  ch: 'pv', id: 'total_power',   name: 'PV Gesamtleistung',     type: 'number', role: 'value.power', unit: 'W' },
    { reg: 'pv_total_energy', ch: 'pv', id: 'total_energy',  name: 'PV Energie gesamt',     type: 'number', role: 'value.energy', unit: 'kWh' },
    { reg: 'pv1_voltage',     ch: 'pv', id: 'pv1_voltage',   name: 'PV1 Spannung',          type: 'number', role: 'value.voltage', unit: 'V' },
    { reg: 'pv1_current',     ch: 'pv', id: 'pv1_current',   name: 'PV1 Strom',             type: 'number', role: 'value.current', unit: 'A' },
    { reg: 'pv1_power',       ch: 'pv', id: 'pv1_power',     name: 'PV1 Leistung',          type: 'number', role: 'value.power', unit: 'W' },
    { reg: 'pv2_voltage',     ch: 'pv', id: 'pv2_voltage',   name: 'PV2 Spannung',          type: 'number', role: 'value.voltage', unit: 'V' },
    { reg: 'pv2_current',     ch: 'pv', id: 'pv2_current',   name: 'PV2 Strom',             type: 'number', role: 'value.current', unit: 'A' },
    { reg: 'pv2_power',       ch: 'pv', id: 'pv2_power',     name: 'PV2 Leistung',          type: 'number', role: 'value.power', unit: 'W' },
    { reg: 'pv3_voltage',     ch: 'pv', id: 'pv3_voltage',   name: 'PV3 Spannung',          type: 'number', role: 'value.voltage', unit: 'V' },
    { reg: 'pv3_current',     ch: 'pv', id: 'pv3_current',   name: 'PV3 Strom',             type: 'number', role: 'value.current', unit: 'A' },
    { reg: 'pv3_power',       ch: 'pv', id: 'pv3_power',     name: 'PV3 Leistung',          type: 'number', role: 'value.power', unit: 'W' },
    { reg: 'pv4_voltage',     ch: 'pv', id: 'pv4_voltage',   name: 'PV4 Spannung',          type: 'number', role: 'value.voltage', unit: 'V' },
    { reg: 'pv4_current',     ch: 'pv', id: 'pv4_current',   name: 'PV4 Strom',             type: 'number', role: 'value.current', unit: 'A' },
    { reg: 'pv4_power',       ch: 'pv', id: 'pv4_power',     name: 'PV4 Leistung',          type: 'number', role: 'value.power', unit: 'W' },

    // Batterie
    { reg: 'battery_soc',                  ch: 'battery', id: 'soc',            name: 'Ladestand (SoC)',            type: 'number', role: 'value.battery', unit: '%' },
    { reg: 'battery1_voltage',             ch: 'battery', id: 'voltage',        name: 'Spannung',                   type: 'number', role: 'value.voltage', unit: 'V' },
    { reg: 'battery1_current',             ch: 'battery', id: 'current',        name: 'Strom',                      type: 'number', role: 'value.current', unit: 'A' },
    { reg: 'battery1_power',               ch: 'battery', id: 'power',          name: 'Leistung',                   type: 'number', role: 'value.power', unit: 'W' },
    { reg: 'battery_combined_power',       ch: 'battery', id: 'combined_power', name: 'Kombinierte Leistung',       type: 'number', role: 'value.power', unit: 'W' },
    { reg: 'battery_total_charge_energy',  ch: 'battery', id: 'total_charge',   name: 'Ladeenergie gesamt',         type: 'number', role: 'value.energy', unit: 'kWh' },
    { reg: 'battery_total_discharge_energy',ch:'battery', id: 'total_discharge',name: 'Entladeenergie gesamt',      type: 'number', role: 'value.energy', unit: 'kWh' },
    { reg: 'bms1_soh',          ch: 'battery', id: 'bms1_soh',        name: 'Gesundheitszustand (SoH)',    type: 'number', role: 'value', unit: '%' },
    { reg: 'bms1_design_energy',ch: 'battery', id: 'design_energy',   name: 'Nennkapazität',              type: 'number', role: 'value', unit: 'Wh' },
    { reg: 'bms1_ambient_temp', ch: 'battery', id: 'ambient_temp',    name: 'Umgebungstemperatur',        type: 'number', role: 'value.temperature', unit: '°C' },
    { reg: 'bms1_max_temp',     ch: 'battery', id: 'max_temp',        name: 'Max. Temperatur',            type: 'number', role: 'value.temperature', unit: '°C' },
    { reg: 'bms1_min_temp',     ch: 'battery', id: 'min_temp',        name: 'Min. Temperatur',            type: 'number', role: 'value.temperature', unit: '°C' },

    // Netz
    { reg: 'grid_status',           ch: 'grid', id: 'off_grid',      name: 'Inselbetrieb',            type: 'boolean', role: 'indicator' },
    { reg: 'grid_r_voltage',        ch: 'grid', id: 'r_voltage',     name: 'Netzspannung (R)',        type: 'number',  role: 'value.voltage', unit: 'V' },
    { reg: 'grid_s_voltage',        ch: 'grid', id: 's_voltage',     name: 'Netzspannung (S)',        type: 'number',  role: 'value.voltage', unit: 'V' },
    { reg: 'grid_t_voltage',        ch: 'grid', id: 't_voltage',     name: 'Netzspannung (T)',        type: 'number',  role: 'value.voltage', unit: 'V' },
    { reg: 'grid_frequency',        ch: 'grid', id: 'frequency',     name: 'Netzfrequenz',            type: 'number',  role: 'value.frequency', unit: 'Hz' },
    { reg: 'active_power',          ch: 'grid', id: 'active_power',  name: 'Wirkleistung',            type: 'number',  role: 'value.power', unit: 'W' },
    { reg: 'reactive_power',        ch: 'grid', id: 'reactive_power',name: 'Blindleistung',           type: 'number',  role: 'value.power', unit: 'kvar' },
    { reg: 'power_factor',          ch: 'grid', id: 'power_factor',  name: 'Leistungsfaktor',         type: 'number',  role: 'value' },
    { reg: 'grid_total_export_energy',ch:'grid',id: 'total_export',  name: 'Einspeisung gesamt',      type: 'number',  role: 'value.energy', unit: 'kWh' },
    { reg: 'grid_total_import_energy',ch:'grid',id: 'total_import',  name: 'Bezug gesamt',            type: 'number',  role: 'value.energy', unit: 'kWh' },
    { reg: 'grid_standard_code',    ch: 'grid', id: 'standard',      name: 'Netzstandard',            type: 'number',  role: 'value', states: GRID_STANDARD },

    // Wechselrichter
    { reg: 'internal_temp',         ch: 'inverter', id: 'temperature',     name: 'Temperatur',              type: 'number', role: 'value.temperature', unit: '°C' },
    { reg: 'inverter_r_frequency',  ch: 'inverter', id: 'frequency',       name: 'Wechselrichterfrequenz',  type: 'number', role: 'value.frequency', unit: 'Hz' },
    { reg: 'daily_generation',      ch: 'inverter', id: 'daily_energy',    name: 'Tagesernte',              type: 'number', role: 'value.energy', unit: 'kWh' },
    { reg: 'cumulative_generation', ch: 'inverter', id: 'total_energy',    name: 'Gesamtertrag',            type: 'number', role: 'value.energy', unit: 'kWh' },
    { reg: 'operating_mode',        ch: 'inverter', id: 'operating_mode',  name: 'Betriebsmodus',           type: 'number', role: 'value', states: OPERATING_MODES },
    { reg: 'network_status',        ch: 'inverter', id: 'network_status',  name: 'Netzwerkstatus',          type: 'number', role: 'value', states: NETWORK_STATUS },

    // EPS / Notstrom
    { reg: 'eps_voltage', ch: 'eps', id: 'voltage', name: 'EPS Spannung', type: 'number', role: 'value.voltage', unit: 'V' },
    { reg: 'eps_current', ch: 'eps', id: 'current', name: 'EPS Strom',    type: 'number', role: 'value.current', unit: 'A' },
    { reg: 'eps_power',   ch: 'eps', id: 'power',   name: 'EPS Leistung', type: 'number', role: 'value.power',   unit: 'W' },

    // Status
    { reg: 'remote_control',          ch: 'status', id: 'remote_control',   name: 'Fernsteuerung Modus',         type: 'number', role: 'value', states: REMOTE_CONTROL_MODES },
    { reg: 'remote_timeout_countdown',ch: 'status', id: 'remote_countdown', name: 'Fernsteuerung Countdown',     type: 'number', role: 'value', unit: 's' },
];

/** Schreibbare Steuer-States */
const CONTROL_STATES = [
    {
        reg: 'remote_control',
        id:  'remote_control_mode',
        name: 'Fernsteuerung Modus',
        type: 'number', role: 'level', min: 0, max: 15,
        states: REMOTE_CONTROL_MODES,
        writeReg: 'remote_control',
    },
    {
        reg: 'remote_timeout_set',
        id:  'remote_timeout',
        name: 'Fernsteuerung Timeout (s)',
        type: 'number', role: 'level', min: 0, max: 3600, unit: 's',
        writeReg: 'remote_timeout_set',
    },
    {
        reg: 'remote_active_power',
        id:  'remote_active_power',
        name: 'Fernsteuerung Wirkleistung (W)',
        type: 'number', role: 'level.power', min: -100000, max: 100000, unit: 'W',
        writeReg: 'remote_active_power',
    },
    {
        reg: 'remote_reactive_power',
        id:  'remote_reactive_power',
        name: 'Fernsteuerung Blindleistung (var)',
        type: 'number', role: 'level.power', min: -100000, max: 100000, unit: 'var',
        writeReg: 'remote_reactive_power',
    },
    {
        reg: 'eps_output',
        id:  'eps_output',
        name: 'EPS/UPS Ausgang',
        type: 'number', role: 'level', min: 0, max: 3,
        states: EPS_OUTPUT_MODES,
        writeReg: 'eps_output',
    },
    {
        reg: 'minimum_soc',
        id:  'minimum_soc',
        name: 'Minimaler Ladestand (%)',
        type: 'number', role: 'level', min: 0, max: 100, unit: '%',
        writeReg: 'minimum_soc',
    },
    {
        reg: 'maximum_soc',
        id:  'maximum_soc',
        name: 'Maximaler Ladestand (%)',
        type: 'number', role: 'level', min: 0, max: 100, unit: '%',
        writeReg: 'maximum_soc',
    },
    {
        reg: 'minimum_soc_ongrid',
        id:  'minimum_soc_ongrid',
        name: 'Minimaler Ladestand Netzbetrieb (%)',
        type: 'number', role: 'level', min: 0, max: 100, unit: '%',
        writeReg: 'minimum_soc_ongrid',
    },
    {
        reg: 'battery_max_charge_current',
        id:  'max_charge_current',
        name: 'Max. Ladestrom (A)',
        type: 'number', role: 'level', min: 0, max: 40, unit: 'A',
        writeReg: 'battery_max_charge_current',
    },
    {
        reg: 'battery_max_discharge_current',
        id:  'max_discharge_current',
        name: 'Max. Entladestrom (A)',
        type: 'number', role: 'level', min: 0, max: 40, unit: 'A',
        writeReg: 'battery_max_discharge_current',
    },
    {
        reg: 'operating_mode',
        id:  'operating_mode',
        name: 'Betriebsmodus',
        type: 'number', role: 'level', min: 0, max: 7,
        states: OPERATING_MODES,
        writeReg: 'operating_mode',
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// Adapter Klasse
// ─────────────────────────────────────────────────────────────────────────────

class SolakonOneAdapter extends utils.Adapter {

    constructor(options) {
        super({ ...options, name: 'solakon-one' });

        this.hub       = null;
        this.pollTimer = null;

        this.on('ready',       this.onReady.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        this.on('unload',      this.onUnload.bind(this));
    }

    // ─── Lifecycle ─────────────────────────────────────────────────────────

    async onReady() {
        // Verbindungsstatus initial auf false setzen
        await this.setStateAsync('info.connection', { val: false, ack: true });

        const { host, port, slaveId, scanInterval } = this.config;

        if (!host) {
            this.log.error('Keine IP-Adresse konfiguriert. Bitte im Admin-Panel einstellen.');
            return;
        }

        this.log.info(`Verbinde mit Solakon ONE: ${host}:${port || 502} (Unit ID: ${slaveId || 1})`);

        // Alle ioBroker-Objekte (Datenpunkte) anlegen
        await this.createAllObjects();

        // Modbus Hub initialisieren
        this.hub = new SolakonModbusHub(
            host,
            port        || 502,
            slaveId     || 1,
            this.log,
        );

        // Auf schreibbare States abonnieren
        this.subscribeStates('control.*');

        // Ersten Poll sofort starten
        await this.doPoll();

        // Polling-Intervall einrichten
        const interval = Math.max(1, Math.min(300, scanInterval || 30)) * 1000;
        this.pollTimer = setInterval(() => this.doPoll(), interval);

        this.log.info(`Polling gestartet – Intervall: ${interval / 1000}s`);
    }

    onUnload(callback) {
        try {
            if (this.pollTimer) {
                clearInterval(this.pollTimer);
                this.pollTimer = null;
            }
            if (this.hub) {
                this.hub.disconnect();
                this.hub = null;
            }
            this.setState('info.connection', { val: false, ack: true });
        } catch (e) {
            // ignorieren
        }
        callback();
    }

    // ─── Polling ───────────────────────────────────────────────────────────

    async doPoll() {
        try {
            if (!this.hub.isConnected()) {
                await this.hub.connect();
            }

            const data = await this.hub.readAllRegisters();

            if (Object.keys(data).length === 0) {
                this.log.warn('Keine Daten vom Gerät empfangen');
                await this.setStateAsync('info.connection', { val: false, ack: true });
                return;
            }

            await this.updateAllStates(data);
            await this.setStateAsync('info.connection', { val: true, ack: true });

        } catch (err) {
            this.log.error(`Poll-Fehler: ${err.message}`);
            await this.setStateAsync('info.connection', { val: false, ack: true });
            // Verbindung trennen, damit beim nächsten Poll neu verbunden wird
            if (this.hub) this.hub.disconnect();
        }
    }

    // ─── State-Änderungen (Schreibbefehle) ─────────────────────────────────

    async onStateChange(id, state) {
        // Ignoriere Bestätigungen (ack=true) und gelöschte States
        if (!state || state.ack) return;

        // ID-Format: solakon-one.0.control.<key>
        const parts = id.split('.');
        const key   = parts.slice(3).join('.');  // z.B. 'remote_control_mode'

        const ctrlDef = CONTROL_STATES.find(c => c.id === key);
        if (!ctrlDef) {
            this.log.warn(`Unbekannter Steuer-State: ${id}`);
            return;
        }

        if (!this.hub || !this.hub.isConnected()) {
            this.log.warn(`Schreiben nicht möglich – nicht verbunden (${key})`);
            return;
        }

        try {
            await this.hub.writeNamedRegister(ctrlDef.writeReg, state.val);
            this.log.info(`Register '${ctrlDef.writeReg}' geschrieben: ${state.val}`);
            // State mit ack bestätigen
            await this.setStateAsync(id, { val: state.val, ack: true });
        } catch (err) {
            this.log.error(`Schreiben von '${ctrlDef.writeReg}' fehlgeschlagen: ${err.message}`);
        }
    }

    // ─── Objekte anlegen ───────────────────────────────────────────────────

    async createAllObjects() {
        // Channels anlegen
        const channels = ['device', 'pv', 'battery', 'grid', 'inverter', 'eps', 'status', 'control'];
        const channelNames = {
            device:   'Geräteinformationen',
            pv:       'Photovoltaik',
            battery:  'Batterie',
            grid:     'Netz',
            inverter: 'Wechselrichter',
            eps:      'Notstrom (EPS/UPS)',
            status:   'Statuswerte',
            control:  'Steuerung',
        };

        for (const ch of channels) {
            await this.setObjectNotExistsAsync(ch, {
                type:   'channel',
                common: { name: channelNames[ch] || ch },
                native: {},
            });
        }

        // Sensor-States anlegen (nur lesen)
        for (const def of SENSOR_STATES) {
            const fullId = `${def.ch}.${def.id}`;
            const common = {
                name:  def.name,
                type:  def.type,
                role:  def.role || 'value',
                read:  true,
                write: false,
            };
            if (def.unit)   common.unit   = def.unit;
            if (def.states) common.states = def.states;

            await this.setObjectNotExistsAsync(fullId, {
                type:   'state',
                common,
                native: {},
            });
        }

        // Steuer-States anlegen (lesen und schreiben)
        for (const def of CONTROL_STATES) {
            const fullId = `control.${def.id}`;
            const common = {
                name:  def.name,
                type:  def.type,
                role:  def.role || 'level',
                read:  true,
                write: true,
            };
            if (def.unit)   common.unit   = def.unit;
            if (def.min  !== undefined) common.min = def.min;
            if (def.max  !== undefined) common.max = def.max;
            if (def.states) common.states = def.states;

            await this.setObjectNotExistsAsync(fullId, {
                type:   'state',
                common,
                native: {},
            });
        }
    }

    // ─── States aktualisieren ──────────────────────────────────────────────

    async updateAllStates(data) {
        // Sensor-States aktualisieren
        for (const def of SENSOR_STATES) {
            const rawVal = data[def.reg];
            if (rawVal === undefined || rawVal === null) continue;

            const fullId = `${def.ch}.${def.id}`;
            await this.setStateAsync(fullId, { val: rawVal, ack: true });
        }

        // Steuer-States synchronisieren (Current-Wert vom Gerät)
        for (const def of CONTROL_STATES) {
            const rawVal = data[def.reg];
            if (rawVal === undefined || rawVal === null) continue;

            const fullId = `control.${def.id}`;
            // Nur setzen wenn kein ausstehender Write-Befehl vorhanden
            await this.setStateAsync(fullId, { val: rawVal, ack: true });
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Einstiegspunkt
// ─────────────────────────────────────────────────────────────────────────────

if (require.main !== module) {
    // Wird als Modul geladen (z.B. Tests)
    module.exports = (options) => new SolakonOneAdapter(options);
} else {
    // Direkt ausgeführt
    new SolakonOneAdapter();
}
