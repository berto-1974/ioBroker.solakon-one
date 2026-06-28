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
    0: {
        en: 'Off',
        de: 'Aus',
        ru: 'Выкл',
        pt: 'Desligado',
        nl: 'Uit',
        fr: 'Désactivé',
        it: 'Spento',
        es: 'Apagado',
        pl: 'Wyłączone',
        uk: 'Вимк.',
        'zh-cn': '关闭',
    },
    1: {
        en: 'Inverter export (PV priority)',
        de: 'Wechselrichter Export (PV Priorität)',
        ru: 'Экспорт инвертора (приоритет PV)',
        pt: 'Exportação do inversor (prioridade PV)',
        nl: 'Omvormer export (PV-prioriteit)',
        fr: 'Export onduleur (priorité PV)',
        it: 'Esportazione inverter (priorità PV)',
        es: 'Exportación del inversor (prioridad PV)',
        pl: 'Eksport falownika (priorytet PV)',
        uk: 'Експорт інвертора (пріоритет PV)',
        'zh-cn': '逆变器输出（光伏优先）',
    },
    3: {
        en: 'Inverter import (PV priority)',
        de: 'Wechselrichter Import (PV Priorität)',
        ru: 'Импорт инвертора (приоритет PV)',
        pt: 'Importação do inversor (prioridade PV)',
        nl: 'Omvormer import (PV-prioriteit)',
        fr: 'Import onduleur (priorité PV)',
        it: 'Importazione inverter (priorità PV)',
        es: 'Importación del inversor (prioridad PV)',
        pl: 'Import falownika (priorytet PV)',
        uk: 'Імпорт інвертора (пріоритет PV)',
        'zh-cn': '逆变器输入（光伏优先）',
    },
    5: {
        en: 'Battery discharge',
        de: 'Batterie Entladen',
        ru: 'Разряд батареи',
        pt: 'Descarga da bateria',
        nl: 'Batterij ontladen',
        fr: 'Décharge de la batterie',
        it: 'Scarica batteria',
        es: 'Descarga de la batería',
        pl: 'Rozładowanie baterii',
        uk: 'Розряд батареї',
        'zh-cn': '电池放电',
    },
    7: {
        en: 'Battery charge',
        de: 'Batterie Laden',
        ru: 'Заряд батареи',
        pt: 'Carga da bateria',
        nl: 'Batterij opladen',
        fr: 'Charge de la batterie',
        it: 'Carica batteria',
        es: 'Carga de la batería',
        pl: 'Ładowanie baterii',
        uk: 'Заряд батареї',
        'zh-cn': '电池充电',
    },
    9: {
        en: 'Grid export',
        de: 'Netz Export',
        ru: 'Экспорт в сеть',
        pt: 'Exportação para a rede',
        nl: 'Netexport',
        fr: 'Export réseau',
        it: 'Esportazione rete',
        es: 'Exportación a la red',
        pl: 'Eksport do sieci',
        uk: 'Експорт у мережу',
        'zh-cn': '电网输出',
    },
    11: {
        en: 'Grid import',
        de: 'Netz Import',
        ru: 'Импорт из сети',
        pt: 'Importação da rede',
        nl: 'Netimport',
        fr: 'Import réseau',
        it: 'Importazione rete',
        es: 'Importación de la red',
        pl: 'Import z sieci',
        uk: 'Імпорт із мережі',
        'zh-cn': '电网输入',
    },
    13: {
        en: 'Inverter export (grid priority)',
        de: 'Wechselrichter Export (Netz Priorität)',
        ru: 'Экспорт инвертора (приоритет сети)',
        pt: 'Exportação do inversor (prioridade rede)',
        nl: 'Omvormer export (netprioriteit)',
        fr: 'Export onduleur (priorité réseau)',
        it: 'Esportazione inverter (priorità rete)',
        es: 'Exportación del inversor (prioridad red)',
        pl: 'Eksport falownika (priorytet sieci)',
        uk: 'Експорт інвертора (пріоритет мережі)',
        'zh-cn': '逆变器输出（电网优先）',
    },
    15: {
        en: 'Inverter import (grid priority)',
        de: 'Wechselrichter Import (Netz Priorität)',
        ru: 'Импорт инвертора (приоритет сети)',
        pt: 'Importação do inversor (prioridade rede)',
        nl: 'Omvormer import (netprioriteit)',
        fr: 'Import onduleur (priorité réseau)',
        it: 'Importazione inverter (priorità rete)',
        es: 'Importación del inversor (prioridad red)',
        pl: 'Import falownika (priorytet sieci)',
        uk: 'Імпорт інвертора (пріоритет мережі)',
        'zh-cn': '逆变器输入（电网优先）',
    },
};

const EPS_OUTPUT_MODES = {
    0: {
        en: 'Off',
        de: 'Aus',
        ru: 'Выкл',
        pt: 'Desligado',
        nl: 'Uit',
        fr: 'Désactivé',
        it: 'Spento',
        es: 'Apagado',
        pl: 'Wyłączone',
        uk: 'Вимк.',
        'zh-cn': '关闭',
    },
    2: {
        en: 'Emergency power supply (EPS)',
        de: 'Notstromversorgung (EPS)',
        ru: 'Аварийное питание (EPS)',
        pt: 'Alimentação de emergência (EPS)',
        nl: 'Noodstroomvoorziening (EPS)',
        fr: 'Alimentation de secours (EPS)',
        it: 'Alimentazione di emergenza (EPS)',
        es: 'Alimentación de emergencia (EPS)',
        pl: 'Zasilanie awaryjne (EPS)',
        uk: 'Аварійне живлення (EPS)',
        'zh-cn': '紧急电源（EPS）',
    },
    3: {
        en: 'Uninterruptible power supply (UPS)',
        de: 'Unterbrechungsfreie Stromversorgung (UPS)',
        ru: 'Источник бесперебойного питания (UPS)',
        pt: 'Fonte de alimentação ininterrupta (UPS)',
        nl: 'Ononderbroken stroomvoorziening (UPS)',
        fr: 'Alimentation sans interruption (UPS)',
        it: 'Gruppo di continuità (UPS)',
        es: 'Sistema de alimentación ininterrumpida (UPS)',
        pl: 'Zasilacz bezprzerwowy (UPS)',
        uk: 'Джерело безперебійного живлення (UPS)',
        'zh-cn': '不间断电源（UPS）',
    },
};

const OPERATING_MODES = {
    0: {
        en: 'Unspecified',
        de: 'Nicht festgelegt',
        ru: 'Не указано',
        pt: 'Não especificado',
        nl: 'Niet gespecificeerd',
        fr: 'Non spécifié',
        it: 'Non specificato',
        es: 'No especificado',
        pl: 'Nieokreślone',
        uk: 'Не вказано',
        'zh-cn': '未指定',
    },
    1: {
        en: 'Self-consumption',
        de: 'Eigenverbrauch',
        ru: 'Собственное потребление',
        pt: 'Autoconsumo',
        nl: 'Eigen verbruik',
        fr: 'Autoconsommation',
        it: 'Autoconsumo',
        es: 'Autoconsumo',
        pl: 'Zużycie własne',
        uk: 'Власне споживання',
        'zh-cn': '自发自用',
    },
    2: {
        en: 'Feed-in priority',
        de: 'Einspeisepriorität',
        ru: 'Приоритет подачи в сеть',
        pt: 'Prioridade de injeção',
        nl: 'Terugleverprioriteit',
        fr: "Priorité d'injection",
        it: 'Priorità di immissione',
        es: 'Prioridad de inyección',
        pl: 'Priorytet wprowadzania do sieci',
        uk: 'Пріоритет подачі в мережу',
        'zh-cn': '上网优先',
    },
    3: {
        en: 'Backup',
        de: 'Backup',
        ru: 'Резерв',
        pt: 'Backup',
        nl: 'Backup',
        fr: 'Sauvegarde',
        it: 'Backup',
        es: 'Respaldo',
        pl: 'Zapasowy',
        uk: 'Резерв',
        'zh-cn': '备用',
    },
    4: {
        en: 'Peak shaving',
        de: 'Spitzenlastkappung',
        ru: 'Срезание пиков нагрузки',
        pt: 'Corte de picos',
        nl: 'Piekafvlakking',
        fr: 'Écrêtage de pointe',
        it: 'Riduzione dei picchi',
        es: 'Reducción de picos',
        pl: 'Ścinanie szczytów obciążenia',
        uk: 'Зрізання піків навантаження',
        'zh-cn': '削峰',
    },
    6: {
        en: 'Force charge',
        de: 'Laden erzwingen',
        ru: 'Принудительный заряд',
        pt: 'Forçar carga',
        nl: 'Geforceerd opladen',
        fr: 'Charge forcée',
        it: 'Carica forzata',
        es: 'Forzar carga',
        pl: 'Wymuszone ładowanie',
        uk: 'Примусовий заряд',
        'zh-cn': '强制充电',
    },
    7: {
        en: 'Force discharge',
        de: 'Entladen erzwingen',
        ru: 'Принудительный разряд',
        pt: 'Forçar descarga',
        nl: 'Geforceerd ontladen',
        fr: 'Décharge forcée',
        it: 'Scarica forzata',
        es: 'Forzar descarga',
        pl: 'Wymuszone rozładowanie',
        uk: 'Примусовий розряд',
        'zh-cn': '强制放电',
    },
};

const NETWORK_STATUS = {
    0: {
        en: 'Off',
        de: 'Aus',
        ru: 'Выкл',
        pt: 'Desligado',
        nl: 'Uit',
        fr: 'Désactivé',
        it: 'Spento',
        es: 'Apagado',
        pl: 'Wyłączone',
        uk: 'Вимк.',
        'zh-cn': '关闭',
    },
    1: {
        en: 'Disconnected',
        de: 'Getrennt',
        ru: 'Отключено',
        pt: 'Desligado',
        nl: 'Verbinding verbroken',
        fr: 'Déconnecté',
        it: 'Disconnesso',
        es: 'Desconectado',
        pl: 'Rozłączono',
        uk: "Від'єднано",
        'zh-cn': '已断开',
    },
    2: {
        en: 'Connected',
        de: 'Verbunden',
        ru: 'Подключено',
        pt: 'Ligado',
        nl: 'Verbonden',
        fr: 'Connecté',
        it: 'Connesso',
        es: 'Conectado',
        pl: 'Połączono',
        uk: "З'єднано",
        'zh-cn': '已连接',
    },
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
