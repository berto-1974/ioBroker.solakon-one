'use strict';

/**
 * Solakon ONE - Modbus Register-Definitionen
 * Konvertiert aus dem Home Assistant Integration (const.py)
 *
 * type:  'u16'  = uint16 (vorzeichenlos 16-Bit)
 *        'i16'  = int16  (vorzeichenbehaftet 16-Bit, Zweierkomplement)
 *        'u32'  = uint32 (vorzeichenlos 32-Bit, Big-Endian, 2 Register)
 *        'i32'  = int32  (vorzeichenbehaftet 32-Bit, Big-Endian, 2 Register)
 *        'string' = ASCII-String über mehrere Register
 *        'bitfield32' = 32-Bit Bitfeld, ein einzelnes Bit wird gelesen
 *
 * scale: Divisor für den Rohwert (z.B. 10 → Rohwert / 10 = Realwert)
 * rw:    true = les- und schreibbar (Steuerregister)
 */

const REGISTERS = {
    // --- Geräteinformationen (Tabelle 3-1) ---
    model_name: { address: 30000, count: 16, type: 'string' },
    serial_number: { address: 30016, count: 16, type: 'string' },
    mfg_id: { address: 30032, count: 16, type: 'string' },

    // --- Versionsinformationen (Tabelle 3-2) ---
    master_version: { address: 36001, count: 1, type: 'u16' },
    slave_version: { address: 36002, count: 1, type: 'u16' },
    manager_version: { address: 36003, count: 1, type: 'u16' },

    // --- Batterie BMS Informationen (Tabelle 3-3) ---
    bms1_design_energy: {
        address: 37635,
        count: 1,
        type: 'i16',
        scale: 0.1,
        unit: 'Wh',
    },
    bms1_soh: { address: 37624, count: 1, type: 'u16', scale: 1, unit: '%' },
    bms2_soh: { address: 38322, count: 1, type: 'u16', scale: 1, unit: '%' },
    bms1_soc: { address: 37612, count: 1, type: 'i16', scale: 1, unit: '%' },
    bms2_soc: { address: 38310, count: 1, type: 'i16', scale: 1, unit: '%' },

    // --- Status ---
    status_1: { address: 39063, count: 1, type: 'u16' },
    status_3: { address: 39065, count: 2, type: 'u32' },
    grid_status: { address: 39065, count: 2, type: 'bitfield32', bit: 0 }, // true=Inselbetrieb, false=Netzbetrieb
    alarm_1: { address: 39067, count: 1, type: 'u16' },
    alarm_2: { address: 39068, count: 1, type: 'u16' },
    alarm_3: { address: 39069, count: 1, type: 'u16' },
    grid_standard_code: { address: 49079, count: 1, type: 'u16' },

    // --- PV Eingang ---
    pv1_voltage: { address: 39070, count: 1, type: 'i16', scale: 10, unit: 'V' },
    pv1_current: { address: 39071, count: 1, type: 'i16', scale: 100, unit: 'A' },
    pv1_power: { address: 39279, count: 2, type: 'i32', scale: 1, unit: 'W' },
    pv2_voltage: { address: 39072, count: 1, type: 'i16', scale: 10, unit: 'V' },
    pv2_current: { address: 39073, count: 1, type: 'i16', scale: 100, unit: 'A' },
    pv2_power: { address: 39281, count: 2, type: 'i32', scale: 1, unit: 'W' },
    pv3_voltage: { address: 39074, count: 1, type: 'i16', scale: 10, unit: 'V' },
    pv3_current: { address: 39075, count: 1, type: 'i16', scale: 100, unit: 'A' },
    pv3_power: { address: 39283, count: 2, type: 'i32', scale: 1, unit: 'W' },
    pv4_voltage: { address: 39076, count: 1, type: 'i16', scale: 10, unit: 'V' },
    pv4_current: { address: 39077, count: 1, type: 'i16', scale: 100, unit: 'A' },
    pv4_power: { address: 39285, count: 2, type: 'i32', scale: 1, unit: 'W' },
    total_pv_power: {
        address: 39118,
        count: 2,
        type: 'i32',
        scale: 1,
        unit: 'W',
    },
    pv_total_energy: {
        address: 39601,
        count: 2,
        type: 'u32',
        scale: 100,
        unit: 'kWh',
    },

    // --- EPS / Notstrom ---
    eps_voltage: { address: 39201, count: 1, type: 'i16', scale: 10, unit: 'V' },
    eps_current: { address: 39204, count: 1, type: 'i16', scale: 10, unit: 'A' },
    eps_power: { address: 39216, count: 2, type: 'i32', scale: 1, unit: 'W' },

    // --- Netz ---
    grid_r_voltage: {
        address: 39123,
        count: 1,
        type: 'i16',
        scale: 10,
        unit: 'V',
    },
    grid_s_voltage: {
        address: 39124,
        count: 1,
        type: 'i16',
        scale: 10,
        unit: 'V',
    },
    grid_t_voltage: {
        address: 39125,
        count: 1,
        type: 'i16',
        scale: 10,
        unit: 'V',
    },
    grid_frequency: {
        address: 39139,
        count: 1,
        type: 'i16',
        scale: 100,
        unit: 'Hz',
    },
    active_power: { address: 39134, count: 2, type: 'i32', scale: 1, unit: 'W' },
    reactive_power: {
        address: 39136,
        count: 2,
        type: 'i32',
        scale: 1000,
        unit: 'kvar',
    },
    power_factor: { address: 39138, count: 1, type: 'i16', scale: 1000 },
    grid_total_export_energy: {
        address: 39621,
        count: 2,
        type: 'u32',
        scale: 100,
        unit: 'kWh',
    },
    grid_total_import_energy: {
        address: 39625,
        count: 2,
        type: 'u32',
        scale: 100,
        unit: 'kWh',
    },

    // --- Wechselrichter ---
    inverter_r_current: {
        address: 39126,
        count: 2,
        type: 'i32',
        scale: 1000,
        unit: 'A',
    },
    inverter_s_current: {
        address: 39128,
        count: 2,
        type: 'i32',
        scale: 1000,
        unit: 'A',
    },
    inverter_t_current: {
        address: 39130,
        count: 2,
        type: 'i32',
        scale: 1000,
        unit: 'A',
    },
    inverter_r_frequency: {
        address: 39272,
        count: 1,
        type: 'i16',
        scale: 100,
        unit: 'Hz',
    },
    inverter_s_frequency: {
        address: 39273,
        count: 1,
        type: 'i16',
        scale: 100,
        unit: 'Hz',
    },
    inverter_t_frequency: {
        address: 39274,
        count: 1,
        type: 'i16',
        scale: 100,
        unit: 'Hz',
    },

    // --- Temperaturen ---
    internal_temp: {
        address: 39141,
        count: 1,
        type: 'i16',
        scale: 10,
        unit: '°C',
    },
    bms1_ambient_temp: {
        address: 37611,
        count: 1,
        type: 'i16',
        scale: 10,
        unit: '°C',
    },
    bms1_max_temp: {
        address: 37617,
        count: 1,
        type: 'i16',
        scale: 10,
        unit: '°C',
    },
    bms1_min_temp: {
        address: 37618,
        count: 1,
        type: 'i16',
        scale: 10,
        unit: '°C',
    },
    bms2_ambient_temp: {
        address: 38309,
        count: 1,
        type: 'i16',
        scale: 10,
        unit: '°C',
    },
    bms2_max_temp: {
        address: 38315,
        count: 1,
        type: 'i16',
        scale: 10,
        unit: '°C',
    },
    bms2_min_temp: {
        address: 38316,
        count: 1,
        type: 'i16',
        scale: 10,
        unit: '°C',
    },

    // --- Energiestatistiken ---
    cumulative_generation: {
        address: 39149,
        count: 2,
        type: 'u32',
        scale: 100,
        unit: 'kWh',
    },
    daily_generation: {
        address: 39151,
        count: 2,
        type: 'u32',
        scale: 100,
        unit: 'kWh',
    },

    // --- Batterie ---
    battery1_voltage: {
        address: 39227,
        count: 1,
        type: 'i16',
        scale: 10,
        unit: 'V',
    },
    battery1_current: {
        address: 39228,
        count: 2,
        type: 'i32',
        scale: 1000,
        unit: 'A',
    },
    battery1_power: {
        address: 39230,
        count: 2,
        type: 'i32',
        scale: 1,
        unit: 'W',
    },
    battery_combined_power: {
        address: 39237,
        count: 2,
        type: 'i32',
        scale: 1,
        unit: 'W',
    },
    battery_soc: { address: 39424, count: 1, type: 'i16', scale: 1, unit: '%' },
    battery_total_charge_energy: {
        address: 39605,
        count: 2,
        type: 'u32',
        scale: 100,
        unit: 'kWh',
    },
    battery_total_discharge_energy: {
        address: 39609,
        count: 2,
        type: 'u32',
        scale: 100,
        unit: 'kWh',
    },

    // --- Steuerregister (Lesen/Schreiben) ---
    remote_control: { address: 46001, count: 1, type: 'u16', scale: 1, rw: true },
    remote_timeout_set: {
        address: 46002,
        count: 1,
        type: 'u16',
        scale: 1,
        unit: 's',
        rw: true,
    },
    remote_active_power: {
        address: 46003,
        count: 2,
        type: 'i32',
        scale: 1,
        unit: 'W',
        rw: true,
    },
    remote_reactive_power: {
        address: 46005,
        count: 2,
        type: 'i32',
        scale: 1,
        unit: 'var',
        rw: true,
    },
    remote_timeout_countdown: {
        address: 46007,
        count: 1,
        type: 'u16',
        scale: 1,
        unit: 's',
    },

    eps_output: { address: 46613, count: 1, type: 'u16', scale: 1, rw: true },
    minimum_soc: {
        address: 46609,
        count: 1,
        type: 'u16',
        scale: 1,
        unit: '%',
        rw: true,
    },
    maximum_soc: {
        address: 46610,
        count: 1,
        type: 'u16',
        scale: 1,
        unit: '%',
        rw: true,
    },
    minimum_soc_ongrid: {
        address: 46611,
        count: 1,
        type: 'u16',
        scale: 1,
        unit: '%',
        rw: true,
    },
    battery_max_charge_current: {
        address: 46607,
        count: 1,
        type: 'i16',
        scale: 10,
        unit: 'A',
        rw: true,
    },
    battery_max_discharge_current: {
        address: 46608,
        count: 1,
        type: 'i16',
        scale: 10,
        unit: 'A',
        rw: true,
    },
    operating_mode: { address: 49203, count: 1, type: 'u16', scale: 1, rw: true },
    network_status: { address: 49240, count: 1, type: 'u16', scale: 1 },
};

/**
 * Remote Control Modi (Register 46001)
 * Bit 0: Remote Control Enable (0=Aus, 1=An)
 * Bit 1: Richtung (0=Erzeugung/Entladen, 1=Verbrauch/Laden)
 * Bits 3:2: Ziel (00=AC, 01=Batterie, 10=Netz, 11=AC Netz zuerst)
 */
const REMOTE_CONTROL_MODES = {
    0: 'Aus',
    1: 'Wechselrichter Export (PV Priorität)',
    3: 'Wechselrichter Import (PV Priorität)',
    5: 'Batterie Entladen',
    7: 'Batterie Laden',
    9: 'Netz Export',
    11: 'Netz Import',
    13: 'Wechselrichter Export (Netz Priorität)',
    15: 'Wechselrichter Import (Netz Priorität)',
};

const EPS_OUTPUT_MODES = {
    0: 'Aus',
    2: 'Notstromversorgung (EPS)',
    3: 'Unterbrechungsfreie Stromversorgung (UPS)',
};

const OPERATING_MODES = {
    0: 'Nicht festgelegt',
    1: 'Eigenverbrauch',
    2: 'Einspeisepriorität',
    3: 'Backup',
    4: 'Spitzenlastkappung',
    6: 'Laden erzwingen',
    7: 'Entladen erzwingen',
};

const NETWORK_STATUS = {
    0: 'Aus',
    1: 'Getrennt',
    2: 'Verbunden',
};

const GRID_STANDARD = {
    6: 'VDE0126',
    7: 'VDE4105_DE',
};

/**
 * Kodiert den Remote Control Registerwert aus Einzelkomponenten
 *
 * @param {boolean} enabled - Remote Control aktiv
 * @param {number} direction - 0=Erzeugung, 1=Verbrauch
 * @param {number} target - 0=AC, 1=Batterie, 2=Netz, 3=AC Netz zuerst
 * @returns {number} 16-Bit Registerwert
 */
function encodeRemoteControl(enabled, direction, target) {
    let value = 0;
    if (enabled) {
        value |= 0b0001;
    }
    if (direction === 1) {
        value |= 0b0010;
    }
    value |= (target & 0b11) << 2;
    return value;
}

/**
 * Konvertiert Remote Control Modus-Nummer in Registerwert
 *
 * @param {number} mode - Modusnummer (0, 1, 3, 5, 7, 9, 11, 13, 15)
 * @returns {number} Registerwert
 */
function modeToRegisterValue(mode) {
    return mode; // Die Moduswerte entsprechen direkt dem Registerwert
}

module.exports = {
    REGISTERS,
    REMOTE_CONTROL_MODES,
    EPS_OUTPUT_MODES,
    OPERATING_MODES,
    NETWORK_STATUS,
    GRID_STANDARD,
    encodeRemoteControl,
    modeToRegisterValue,
};
