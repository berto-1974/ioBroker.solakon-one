'use strict';

const net    = require('net');
const Modbus = require('jsmodbus');
const { REGISTERS } = require('./registers');

/**
 * SolakonModbusHub
 * Verwaltet die Modbus TCP Verbindung zum Solakon ONE Wechselrichter.
 * Verwendet jsmodbus als Modbus TCP Client.
 */
class SolakonModbusHub {

    /**
     * @param {string} host       - IP-Adresse des Geräts
     * @param {number} port       - Modbus TCP Port (Standard: 502)
     * @param {number} unitId     - Modbus Slave/Unit ID (Standard: 1)
     * @param {object} log        - ioBroker Logger-Objekt
     */
    constructor(host, port, unitId, log) {
        this.host   = host;
        this.port   = port   || 502;
        this.unitId = unitId || 1;
        this.log    = log;

        this.socket = null;
        this.client = null;
        this._connected = false;
        this._connecting = false;
    }

    /** Gibt an ob aktuell verbunden */
    isConnected() {
        return this._connected && this.socket && !this.socket.destroyed;
    }

    /**
     * Baut die Verbindung zum Gerät auf.
     * @returns {Promise<void>}
     */
    connect() {
        if (this._connecting) {
            return Promise.reject(new Error('Verbindungsaufbau läuft bereits'));
        }
        if (this.isConnected()) {
            return Promise.resolve();
        }

        this._connecting = true;

        return new Promise((resolve, reject) => {
            this.socket = new net.Socket();
            this.client = new Modbus.client.TCP(this.socket, this.unitId, 5000);

            const onError = (err) => {
                this._connected  = false;
                this._connecting = false;
                this.log.warn(`Modbus Verbindungsfehler: ${err.message}`);
                reject(err);
            };

            const onConnect = () => {
                this._connected  = true;
                this._connecting = false;
                this.log.info(`Modbus TCP verbunden: ${this.host}:${this.port} (Unit ID: ${this.unitId})`);
                // Test-Lesen des ersten Registers
                this.client.readHoldingRegisters(30000, 1)
                    .then(() => resolve())
                    .catch((err) => {
                        this.log.warn(`Test-Lesen fehlgeschlagen: ${err.message || err}`);
                        // Verbindung ist trotzdem aufgebaut – kein reject
                        resolve();
                    });
            };

            const onClose = () => {
                this._connected  = false;
                this._connecting = false;
                this.log.debug('Modbus Socket geschlossen');
            };

            this.socket.once('error',   onError);
            this.socket.once('connect', onConnect);
            this.socket.on('close',     onClose);
            this.socket.on('error',     (err) => {
                this._connected = false;
                this.log.debug(`Socket-Fehler (nach Verbindung): ${err.message}`);
            });

            this.socket.connect({ host: this.host, port: this.port });

            // Timeout nach 10 Sekunden
            setTimeout(() => {
                if (this._connecting) {
                    this._connecting = false;
                    this.socket.destroy();
                    reject(new Error(`Verbindungs-Timeout nach 10s (${this.host}:${this.port})`));
                }
            }, 10000);
        });
    }

    /** Trennt die Verbindung */
    disconnect() {
        this._connected  = false;
        this._connecting = false;
        if (this.socket) {
            try { this.socket.destroy(); } catch (e) { /* ignorieren */ }
            this.socket = null;
        }
        this.client = null;
    }

    /**
     * Liest einen Bereich von Holding Registers.
     * @param {number} address  - Startadresse
     * @param {number} count    - Anzahl Register
     * @returns {Promise<number[]>} Array mit Registerwerten (uint16)
     */
    async readHoldingRegisters(address, count) {
        if (!this.isConnected()) {
            throw new Error('Nicht verbunden');
        }
        try {
            const resp = await this.client.readHoldingRegisters(address, count);
            return Array.from(resp.response.body.valuesAsArray);
        } catch (err) {
            throw new Error(`Lesen von Register ${address} (x${count}) fehlgeschlagen: ${err.message || err}`);
        }
    }

    /**
     * Schreibt einen einzelnen Holding Register.
     * @param {number} address - Registeradresse
     * @param {number} value   - Wert (uint16)
     * @returns {Promise<void>}
     */
    async writeSingleRegister(address, value) {
        if (!this.isConnected()) {
            throw new Error('Nicht verbunden');
        }
        try {
            await this.client.writeSingleRegister(address, value);
        } catch (err) {
            throw new Error(`Schreiben auf Register ${address} fehlgeschlagen: ${err.message || err}`);
        }
    }

    /**
     * Schreibt mehrere aufeinanderfolgende Holding Register.
     * @param {number}   address - Startadresse
     * @param {number[]} values  - Array mit uint16-Werten
     * @returns {Promise<void>}
     */
    async writeMultipleRegisters(address, values) {
        if (!this.isConnected()) {
            throw new Error('Nicht verbunden');
        }
        const buf = Buffer.alloc(values.length * 2);
        values.forEach((v, i) => buf.writeUInt16BE(v & 0xFFFF, i * 2));
        try {
            await this.client.writeMultipleRegisters(address, buf);
        } catch (err) {
            throw new Error(`Schreiben auf Register ${address} fehlgeschlagen: ${err.message || err}`);
        }
    }

    /**
     * Liest alle definierten Register und gibt ein Objekt mit aufbereiteten Werten zurück.
     * @returns {Promise<object>} Objekt mit Registername → Wert
     */
    async readAllRegisters() {
        const data = {};

        for (const [key, config] of Object.entries(REGISTERS)) {
            try {
                const rawRegs = await this.readHoldingRegisters(config.address, config.count);
                const value   = processRegisterValue(rawRegs, config);
                if (value !== null && value !== undefined) {
                    data[key] = value;
                }
            } catch (err) {
                // Einzelne Register-Fehler werden nur geloggt, nicht abgebrochen
                this.log.debug(`Register '${key}' (${config.address}): ${err.message}`);
            }
        }

        return data;
    }

    /**
     * Schreibt einen Wert auf ein benanntes Register aus REGISTERS.
     * Kümmert sich automatisch um 32-Bit Register (2 Register schreiben).
     * @param {string} regName - Registername aus REGISTERS
     * @param {number} value   - Zu schreibender Wert (skaliert, d.h. Realwert)
     * @returns {Promise<boolean>} true bei Erfolg
     */
    async writeNamedRegister(regName, value) {
        const config = REGISTERS[regName];
        if (!config) {
            throw new Error(`Unbekanntes Register: ${regName}`);
        }
        if (!config.rw) {
            throw new Error(`Register '${regName}' ist nicht schreibbar`);
        }

        // Wert rückwärts skalieren (Realwert → Rohwert)
        const scale    = config.scale || 1;
        const rawValue = Math.round(value * scale);

        if (config.count === 1) {
            // 16-Bit Register
            const regVal = rawValue < 0
                ? (rawValue + 0x10000) & 0xFFFF
                : rawValue & 0xFFFF;
            await this.writeSingleRegister(config.address, regVal);
        } else if (config.count === 2) {
            // 32-Bit Register → 2 Register (High Word zuerst)
            let raw32 = rawValue;
            if (raw32 < 0) raw32 += 0x100000000;
            const highWord = (raw32 >>> 16) & 0xFFFF;
            const lowWord  =  raw32         & 0xFFFF;
            await this.writeMultipleRegisters(config.address, [highWord, lowWord]);
        } else {
            throw new Error(`Schreiben auf Register '${regName}' mit count=${config.count} nicht unterstützt`);
        }

        return true;
    }
}

// ─────────────────────────────────────────────────────────────
// Hilfsfunktionen zur Wertverarbeitung
// ─────────────────────────────────────────────────────────────

/**
 * Verarbeitet rohe Registerwerte gemäß der Register-Konfiguration.
 * @param {number[]} registers - Array mit uint16-Rohwerten
 * @param {object}   config    - Register-Konfiguration aus REGISTERS
 * @returns {*} Aufbereiteter Wert oder null
 */
function processRegisterValue(registers, config) {
    if (!registers || registers.length === 0) return null;

    const type  = config.type  || 'u16';
    const scale = config.scale || 1;
    let value;

    try {
        switch (type) {
            case 'u16':
                value = registers[0];
                break;

            case 'i16':
                value = registers[0];
                if (value > 0x7FFF) value -= 0x10000;
                break;

            case 'u32':
                if (registers.length < 2) return null;
                value = ((registers[0] << 16) | registers[1]) >>> 0; // unsigned
                break;

            case 'i32':
                if (registers.length < 2) return null;
                value = (registers[0] << 16) | registers[1];
                if (value > 0x7FFFFFFF) value -= 0x100000000;
                break;

            case 'bitfield32': {
                if (registers.length < 2) return null;
                const raw32 = ((registers[0] << 16) | registers[1]) >>> 0;
                const bit   = config.bit || 0;
                value = Boolean((raw32 >> bit) & 1);
                return value; // Boolean – kein Scale
            }

            case 'string':
                return convertString(registers);

            default:
                value = registers[0];
        }

        // Scale anwenden
        if (scale !== 1 && value !== null) {
            value = parseFloat((value / scale).toFixed(4));
        }

        return value;

    } catch (err) {
        return null;
    }
}

/**
 * Konvertiert Register-Array in einen ASCII-String.
 * Jedes Register enthält 2 Zeichen (High-Byte, Low-Byte).
 */
function convertString(registers) {
    const chars = [];
    for (const val of registers) {
        chars.push(String.fromCharCode((val >> 8) & 0xFF));
        chars.push(String.fromCharCode( val        & 0xFF));
    }
    const text = chars.join('').replace(/\x00/g, '').trim();
    return text || null;
}

module.exports = { SolakonModbusHub, processRegisterValue, convertString };
