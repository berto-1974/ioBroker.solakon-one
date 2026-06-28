'use strict';

/*
 * Solakon ONE ioBroker Adapter
 * Liest und steuert den Solakon ONE Hybrid-Wechselrichter via Modbus TCP.
 *
 * Adapter-Name:    solakon-one
 * Protokoll:       Modbus TCP (Port 502)
 * Bibliothek:      jsmodbus
 */

const utils = require('@iobroker/adapter-core');
const { SolakonModbusHub } = require('./lib/modbus');
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
    {
        reg: 'model_name',
        ch: 'device',
        id: 'model',
        name: {
            en: 'Model name',
            de: 'Modellbezeichnung',
            ru: 'Наименование модели',
            pt: 'Nome do modelo',
            nl: 'Modelnaam',
            fr: 'Nom du modèle',
            it: 'Nome modello',
            es: 'Nombre del modelo',
            pl: 'Nazwa modelu',
            uk: 'Назва моделі',
            'zh-cn': '型号名称',
        },
        type: 'string',
        role: 'info.name',
    },
    {
        reg: 'serial_number',
        ch: 'device',
        id: 'serial',
        name: {
            en: 'Serial number',
            de: 'Seriennummer',
            ru: 'Серийный номер',
            pt: 'Número de série',
            nl: 'Serienummer',
            fr: 'Numéro de série',
            it: 'Numero di serie',
            es: 'Número de serie',
            pl: 'Numer seryjny',
            uk: 'Серійний номер',
            'zh-cn': '序列号',
        },
        type: 'string',
        role: 'info.serial',
    },
    {
        reg: 'master_version',
        ch: 'device',
        id: 'fw_master',
        name: {
            en: 'Firmware Master',
            de: 'Firmware Master',
            ru: 'Прошивка Master',
            pt: 'Firmware Master',
            nl: 'Firmware Master',
            fr: 'Firmware Master',
            it: 'Firmware Master',
            es: 'Firmware Master',
            pl: 'Firmware Master',
            uk: 'Прошивка Master',
            'zh-cn': '主固件',
        },
        type: 'number',
        role: 'info.firmware',
    },
    {
        reg: 'slave_version',
        ch: 'device',
        id: 'fw_slave',
        name: {
            en: 'Firmware Slave',
            de: 'Firmware Slave',
            ru: 'Прошивка Slave',
            pt: 'Firmware Slave',
            nl: 'Firmware Slave',
            fr: 'Firmware Slave',
            it: 'Firmware Slave',
            es: 'Firmware Slave',
            pl: 'Firmware Slave',
            uk: 'Прошивка Slave',
            'zh-cn': '从固件',
        },
        type: 'number',
        role: 'info.firmware',
    },

    // PV
    {
        reg: 'total_pv_power',
        ch: 'pv',
        id: 'total_power',
        name: {
            en: 'PV total power',
            de: 'PV Gesamtleistung',
            ru: 'Суммарная мощность PV',
            pt: 'Potência total PV',
            nl: 'Totaal PV-vermogen',
            fr: 'Puissance totale PV',
            it: 'Potenza totale PV',
            es: 'Potencia total PV',
            pl: 'Całkowita moc PV',
            uk: 'Загальна потужність PV',
            'zh-cn': '光伏总功率',
        },
        type: 'number',
        role: 'value.power',
        unit: 'W',
    },
    {
        reg: 'pv_total_energy',
        ch: 'pv',
        id: 'total_energy',
        name: {
            en: 'PV total energy',
            de: 'PV Energie gesamt',
            ru: 'Суммарная энергия PV',
            pt: 'Energia total PV',
            nl: 'Totale PV-energie',
            fr: 'Énergie totale PV',
            it: 'Energia totale PV',
            es: 'Energía total PV',
            pl: 'Całkowita energia PV',
            uk: 'Загальна енергія PV',
            'zh-cn': '光伏总电量',
        },
        type: 'number',
        role: 'value.energy',
        unit: 'kWh',
    },
    {
        reg: 'pv1_voltage',
        ch: 'pv',
        id: 'pv1_voltage',
        name: {
            en: 'PV1 voltage',
            de: 'PV1 Spannung',
            ru: 'Напряжение PV1',
            pt: 'Tensão PV1',
            nl: 'PV1 spanning',
            fr: 'Tension PV1',
            it: 'Tensione PV1',
            es: 'Tensión PV1',
            pl: 'Napięcie PV1',
            uk: 'Напруга PV1',
            'zh-cn': 'PV1电压',
        },
        type: 'number',
        role: 'value.voltage',
        unit: 'V',
    },
    {
        reg: 'pv1_current',
        ch: 'pv',
        id: 'pv1_current',
        name: {
            en: 'PV1 current',
            de: 'PV1 Strom',
            ru: 'Ток PV1',
            pt: 'Corrente PV1',
            nl: 'PV1 stroom',
            fr: 'Courant PV1',
            it: 'Corrente PV1',
            es: 'Corriente PV1',
            pl: 'Prąd PV1',
            uk: 'Струм PV1',
            'zh-cn': 'PV1电流',
        },
        type: 'number',
        role: 'value.current',
        unit: 'A',
    },
    {
        reg: 'pv1_power',
        ch: 'pv',
        id: 'pv1_power',
        name: {
            en: 'PV1 power',
            de: 'PV1 Leistung',
            ru: 'Мощность PV1',
            pt: 'Potência PV1',
            nl: 'PV1 vermogen',
            fr: 'Puissance PV1',
            it: 'Potenza PV1',
            es: 'Potencia PV1',
            pl: 'Moc PV1',
            uk: 'Потужність PV1',
            'zh-cn': 'PV1功率',
        },
        type: 'number',
        role: 'value.power',
        unit: 'W',
    },
    {
        reg: 'pv2_voltage',
        ch: 'pv',
        id: 'pv2_voltage',
        name: {
            en: 'PV2 voltage',
            de: 'PV2 Spannung',
            ru: 'Напряжение PV2',
            pt: 'Tensão PV2',
            nl: 'PV2 spanning',
            fr: 'Tension PV2',
            it: 'Tensione PV2',
            es: 'Tensión PV2',
            pl: 'Napięcie PV2',
            uk: 'Напруга PV2',
            'zh-cn': 'PV2电压',
        },
        type: 'number',
        role: 'value.voltage',
        unit: 'V',
    },
    {
        reg: 'pv2_current',
        ch: 'pv',
        id: 'pv2_current',
        name: {
            en: 'PV2 current',
            de: 'PV2 Strom',
            ru: 'Ток PV2',
            pt: 'Corrente PV2',
            nl: 'PV2 stroom',
            fr: 'Courant PV2',
            it: 'Corrente PV2',
            es: 'Corriente PV2',
            pl: 'Prąd PV2',
            uk: 'Струм PV2',
            'zh-cn': 'PV2电流',
        },
        type: 'number',
        role: 'value.current',
        unit: 'A',
    },
    {
        reg: 'pv2_power',
        ch: 'pv',
        id: 'pv2_power',
        name: {
            en: 'PV2 power',
            de: 'PV2 Leistung',
            ru: 'Мощность PV2',
            pt: 'Potência PV2',
            nl: 'PV2 vermogen',
            fr: 'Puissance PV2',
            it: 'Potenza PV2',
            es: 'Potencia PV2',
            pl: 'Moc PV2',
            uk: 'Потужність PV2',
            'zh-cn': 'PV2功率',
        },
        type: 'number',
        role: 'value.power',
        unit: 'W',
    },
    {
        reg: 'pv3_voltage',
        ch: 'pv',
        id: 'pv3_voltage',
        name: {
            en: 'PV3 voltage',
            de: 'PV3 Spannung',
            ru: 'Напряжение PV3',
            pt: 'Tensão PV3',
            nl: 'PV3 spanning',
            fr: 'Tension PV3',
            it: 'Tensione PV3',
            es: 'Tensión PV3',
            pl: 'Napięcie PV3',
            uk: 'Напруга PV3',
            'zh-cn': 'PV3电压',
        },
        type: 'number',
        role: 'value.voltage',
        unit: 'V',
    },
    {
        reg: 'pv3_current',
        ch: 'pv',
        id: 'pv3_current',
        name: {
            en: 'PV3 current',
            de: 'PV3 Strom',
            ru: 'Ток PV3',
            pt: 'Corrente PV3',
            nl: 'PV3 stroom',
            fr: 'Courant PV3',
            it: 'Corrente PV3',
            es: 'Corriente PV3',
            pl: 'Prąd PV3',
            uk: 'Струм PV3',
            'zh-cn': 'PV3电流',
        },
        type: 'number',
        role: 'value.current',
        unit: 'A',
    },
    {
        reg: 'pv3_power',
        ch: 'pv',
        id: 'pv3_power',
        name: {
            en: 'PV3 power',
            de: 'PV3 Leistung',
            ru: 'Мощность PV3',
            pt: 'Potência PV3',
            nl: 'PV3 vermogen',
            fr: 'Puissance PV3',
            it: 'Potenza PV3',
            es: 'Potencia PV3',
            pl: 'Moc PV3',
            uk: 'Потужність PV3',
            'zh-cn': 'PV3功率',
        },
        type: 'number',
        role: 'value.power',
        unit: 'W',
    },
    {
        reg: 'pv4_voltage',
        ch: 'pv',
        id: 'pv4_voltage',
        name: {
            en: 'PV4 voltage',
            de: 'PV4 Spannung',
            ru: 'Напряжение PV4',
            pt: 'Tensão PV4',
            nl: 'PV4 spanning',
            fr: 'Tension PV4',
            it: 'Tensione PV4',
            es: 'Tensión PV4',
            pl: 'Napięcie PV4',
            uk: 'Напруга PV4',
            'zh-cn': 'PV4电压',
        },
        type: 'number',
        role: 'value.voltage',
        unit: 'V',
    },
    {
        reg: 'pv4_current',
        ch: 'pv',
        id: 'pv4_current',
        name: {
            en: 'PV4 current',
            de: 'PV4 Strom',
            ru: 'Ток PV4',
            pt: 'Corrente PV4',
            nl: 'PV4 stroom',
            fr: 'Courant PV4',
            it: 'Corrente PV4',
            es: 'Corriente PV4',
            pl: 'Prąd PV4',
            uk: 'Струм PV4',
            'zh-cn': 'PV4电流',
        },
        type: 'number',
        role: 'value.current',
        unit: 'A',
    },
    {
        reg: 'pv4_power',
        ch: 'pv',
        id: 'pv4_power',
        name: {
            en: 'PV4 power',
            de: 'PV4 Leistung',
            ru: 'Мощность PV4',
            pt: 'Potência PV4',
            nl: 'PV4 vermogen',
            fr: 'Puissance PV4',
            it: 'Potenza PV4',
            es: 'Potencia PV4',
            pl: 'Moc PV4',
            uk: 'Потужність PV4',
            'zh-cn': 'PV4功率',
        },
        type: 'number',
        role: 'value.power',
        unit: 'W',
    },

    // Batterie
    {
        reg: 'battery_soc',
        ch: 'battery',
        id: 'soc',
        name: {
            en: 'State of Charge (SoC)',
            de: 'Ladestand (SoC)',
            ru: 'Уровень заряда (SoC)',
            pt: 'Estado de carga (SoC)',
            nl: 'Laadtoestand (SoC)',
            fr: 'État de charge (SoC)',
            it: 'Stato di carica (SoC)',
            es: 'Estado de carga (SoC)',
            pl: 'Stan naładowania (SoC)',
            uk: 'Рівень заряду (SoC)',
            'zh-cn': '荷电状态 (SoC)',
        },
        type: 'number',
        role: 'value.battery',
        unit: '%',
    },
    {
        reg: 'battery1_voltage',
        ch: 'battery',
        id: 'voltage',
        name: {
            en: 'Voltage',
            de: 'Spannung',
            ru: 'Напряжение',
            pt: 'Tensão',
            nl: 'Spanning',
            fr: 'Tension',
            it: 'Tensione',
            es: 'Tensión',
            pl: 'Napięcie',
            uk: 'Напруга',
            'zh-cn': '电压',
        },
        type: 'number',
        role: 'value.voltage',
        unit: 'V',
    },
    {
        reg: 'battery1_current',
        ch: 'battery',
        id: 'current',
        name: {
            en: 'Current',
            de: 'Strom',
            ru: 'Ток',
            pt: 'Corrente',
            nl: 'Stroom',
            fr: 'Courant',
            it: 'Corrente',
            es: 'Corriente',
            pl: 'Prąd',
            uk: 'Струм',
            'zh-cn': '电流',
        },
        type: 'number',
        role: 'value.current',
        unit: 'A',
    },
    {
        reg: 'battery1_power',
        ch: 'battery',
        id: 'power',
        name: {
            en: 'Power',
            de: 'Leistung',
            ru: 'Мощность',
            pt: 'Potência',
            nl: 'Vermogen',
            fr: 'Puissance',
            it: 'Potenza',
            es: 'Potencia',
            pl: 'Moc',
            uk: 'Потужність',
            'zh-cn': '功率',
        },
        type: 'number',
        role: 'value.power',
        unit: 'W',
    },
    {
        reg: 'battery_combined_power',
        ch: 'battery',
        id: 'combined_power',
        name: {
            en: 'Combined power',
            de: 'Kombinierte Leistung',
            ru: 'Суммарная мощность',
            pt: 'Potência combinada',
            nl: 'Gecombineerd vermogen',
            fr: 'Puissance combinée',
            it: 'Potenza combinata',
            es: 'Potencia combinada',
            pl: 'Moc łączna',
            uk: 'Сукупна потужність',
            'zh-cn': '综合功率',
        },
        type: 'number',
        role: 'value.power',
        unit: 'W',
    },
    {
        reg: 'battery_total_charge_energy',
        ch: 'battery',
        id: 'total_charge',
        name: {
            en: 'Total charge energy',
            de: 'Ladeenergie gesamt',
            ru: 'Суммарная энергия зарядки',
            pt: 'Energia total de carga',
            nl: 'Totale laadenergie',
            fr: 'Énergie de charge totale',
            it: 'Energia totale di carica',
            es: 'Energía total de carga',
            pl: 'Całkowita energia ładowania',
            uk: 'Загальна енергія заряджання',
            'zh-cn': '总充电量',
        },
        type: 'number',
        role: 'value.energy',
        unit: 'kWh',
    },
    {
        reg: 'battery_total_discharge_energy',
        ch: 'battery',
        id: 'total_discharge',
        name: {
            en: 'Total discharge energy',
            de: 'Entladeenergie gesamt',
            ru: 'Суммарная энергия разрядки',
            pt: 'Energia total de descarga',
            nl: 'Totale ontlaadenergie',
            fr: 'Énergie de décharge totale',
            it: 'Energia totale di scarica',
            es: 'Energía total de descarga',
            pl: 'Całkowita energia rozładowania',
            uk: 'Загальна енергія розряджання',
            'zh-cn': '总放电量',
        },
        type: 'number',
        role: 'value.energy',
        unit: 'kWh',
    },
    {
        reg: 'bms1_soh',
        ch: 'battery',
        id: 'bms1_soh',
        name: {
            en: 'State of Health (SoH)',
            de: 'Gesundheitszustand (SoH)',
            ru: 'Состояние здоровья (SoH)',
            pt: 'Estado de saúde (SoH)',
            nl: 'Gezondheidsconditie (SoH)',
            fr: 'État de santé (SoH)',
            it: 'Stato di salute (SoH)',
            es: 'Estado de salud (SoH)',
            pl: 'Stan zdrowia (SoH)',
            uk: "Стан здоров'я (SoH)",
            'zh-cn': '电池健康状态 (SoH)',
        },
        type: 'number',
        role: 'value',
        unit: '%',
    },
    {
        reg: 'bms1_design_energy',
        ch: 'battery',
        id: 'design_energy',
        name: {
            en: 'Design capacity',
            de: 'Nennkapazität',
            ru: 'Номинальная ёмкость',
            pt: 'Capacidade nominal',
            nl: 'Nominale capaciteit',
            fr: 'Capacité nominale',
            it: 'Capacità nominale',
            es: 'Capacidad nominal',
            pl: 'Pojemność nominalna',
            uk: 'Номінальна ємність',
            'zh-cn': '设计容量',
        },
        type: 'number',
        role: 'value',
        unit: 'Wh',
    },
    {
        reg: 'bms1_ambient_temp',
        ch: 'battery',
        id: 'ambient_temp',
        name: {
            en: 'Ambient temperature',
            de: 'Umgebungstemperatur',
            ru: 'Температура окружающей среды',
            pt: 'Temperatura ambiente',
            nl: 'Omgevingstemperatuur',
            fr: 'Température ambiante',
            it: 'Temperatura ambiente',
            es: 'Temperatura ambiente',
            pl: 'Temperatura otoczenia',
            uk: 'Температура навколишнього середовища',
            'zh-cn': '环境温度',
        },
        type: 'number',
        role: 'value.temperature',
        unit: '°C',
    },
    {
        reg: 'bms1_max_temp',
        ch: 'battery',
        id: 'max_temp',
        name: {
            en: 'Max temperature',
            de: 'Max. Temperatur',
            ru: 'Макс. температура',
            pt: 'Temperatura máx.',
            nl: 'Max. temperatuur',
            fr: 'Température max.',
            it: 'Temperatura max.',
            es: 'Temperatura máx.',
            pl: 'Maks. temperatura',
            uk: 'Макс. температура',
            'zh-cn': '最高温度',
        },
        type: 'number',
        role: 'value.temperature',
        unit: '°C',
    },
    {
        reg: 'bms1_min_temp',
        ch: 'battery',
        id: 'min_temp',
        name: {
            en: 'Min temperature',
            de: 'Min. Temperatur',
            ru: 'Мин. температура',
            pt: 'Temperatura mín.',
            nl: 'Min. temperatuur',
            fr: 'Température min.',
            it: 'Temperatura min.',
            es: 'Temperatura mín.',
            pl: 'Min. temperatura',
            uk: 'Мін. температура',
            'zh-cn': '最低温度',
        },
        type: 'number',
        role: 'value.temperature',
        unit: '°C',
    },

    // Netz
    {
        reg: 'grid_status',
        ch: 'grid',
        id: 'off_grid',
        name: {
            en: 'Off-grid mode',
            de: 'Inselbetrieb',
            ru: 'Автономный режим',
            pt: 'Modo isolado',
            nl: 'Off-grid modus',
            fr: 'Mode hors réseau',
            it: 'Modalità off-grid',
            es: 'Modo aislado',
            pl: 'Tryb wyspowy',
            uk: 'Автономний режим',
            'zh-cn': '离网模式',
        },
        type: 'boolean',
        role: 'indicator',
    },
    {
        reg: 'grid_r_voltage',
        ch: 'grid',
        id: 'r_voltage',
        name: {
            en: 'Grid voltage (R)',
            de: 'Netzspannung (R)',
            ru: 'Напряжение сети (R)',
            pt: 'Tensão de rede (R)',
            nl: 'Netspanning (R)',
            fr: 'Tension du réseau (R)',
            it: 'Tensione di rete (R)',
            es: 'Tensión de red (R)',
            pl: 'Napięcie sieci (R)',
            uk: 'Напруга мережі (R)',
            'zh-cn': '电网电压 (R)',
        },
        type: 'number',
        role: 'value.voltage',
        unit: 'V',
    },
    {
        reg: 'grid_s_voltage',
        ch: 'grid',
        id: 's_voltage',
        name: {
            en: 'Grid voltage (S)',
            de: 'Netzspannung (S)',
            ru: 'Напряжение сети (S)',
            pt: 'Tensão de rede (S)',
            nl: 'Netspanning (S)',
            fr: 'Tension du réseau (S)',
            it: 'Tensione di rete (S)',
            es: 'Tensión de red (S)',
            pl: 'Napięcie sieci (S)',
            uk: 'Напруга мережі (S)',
            'zh-cn': '电网电压 (S)',
        },
        type: 'number',
        role: 'value.voltage',
        unit: 'V',
    },
    {
        reg: 'grid_t_voltage',
        ch: 'grid',
        id: 't_voltage',
        name: {
            en: 'Grid voltage (T)',
            de: 'Netzspannung (T)',
            ru: 'Напряжение сети (T)',
            pt: 'Tensão de rede (T)',
            nl: 'Netspanning (T)',
            fr: 'Tension du réseau (T)',
            it: 'Tensione di rete (T)',
            es: 'Tensión de red (T)',
            pl: 'Napięcie sieci (T)',
            uk: 'Напруга мережі (T)',
            'zh-cn': '电网电压 (T)',
        },
        type: 'number',
        role: 'value.voltage',
        unit: 'V',
    },
    {
        reg: 'grid_frequency',
        ch: 'grid',
        id: 'frequency',
        name: {
            en: 'Grid frequency',
            de: 'Netzfrequenz',
            ru: 'Частота сети',
            pt: 'Frequência da rede',
            nl: 'Netfrequentie',
            fr: 'Fréquence du réseau',
            it: 'Frequenza di rete',
            es: 'Frecuencia de red',
            pl: 'Częstotliwość sieci',
            uk: 'Частота мережі',
            'zh-cn': '电网频率',
        },
        type: 'number',
        role: 'value.frequency',
        unit: 'Hz',
    },
    {
        reg: 'active_power',
        ch: 'grid',
        id: 'active_power',
        name: {
            en: 'Active power',
            de: 'Wirkleistung',
            ru: 'Активная мощность',
            pt: 'Potência ativa',
            nl: 'Actief vermogen',
            fr: 'Puissance active',
            it: 'Potenza attiva',
            es: 'Potencia activa',
            pl: 'Moc czynna',
            uk: 'Активна потужність',
            'zh-cn': '有功功率',
        },
        type: 'number',
        role: 'value.power',
        unit: 'W',
    },
    {
        reg: 'reactive_power',
        ch: 'grid',
        id: 'reactive_power',
        name: {
            en: 'Reactive power',
            de: 'Blindleistung',
            ru: 'Реактивная мощность',
            pt: 'Potência reativa',
            nl: 'Reactief vermogen',
            fr: 'Puissance réactive',
            it: 'Potenza reattiva',
            es: 'Potencia reactiva',
            pl: 'Moc bierna',
            uk: 'Реактивна потужність',
            'zh-cn': '无功功率',
        },
        type: 'number',
        role: 'value.power',
        unit: 'kvar',
    },
    {
        reg: 'power_factor',
        ch: 'grid',
        id: 'power_factor',
        name: {
            en: 'Power factor',
            de: 'Leistungsfaktor',
            ru: 'Коэффициент мощности',
            pt: 'Fator de potência',
            nl: 'Vermogensfactor',
            fr: 'Facteur de puissance',
            it: 'Fattore di potenza',
            es: 'Factor de potencia',
            pl: 'Współczynnik mocy',
            uk: 'Коефіцієнт потужності',
            'zh-cn': '功率因数',
        },
        type: 'number',
        role: 'value',
    },
    {
        reg: 'grid_total_export_energy',
        ch: 'grid',
        id: 'total_export',
        name: {
            en: 'Total export energy',
            de: 'Einspeisung gesamt',
            ru: 'Суммарная выработка в сеть',
            pt: 'Energia total exportada',
            nl: 'Totale exportenergie',
            fr: 'Énergie totale exportée',
            it: 'Energia totale esportata',
            es: 'Energía total exportada',
            pl: 'Całkowita energia eksportowana',
            uk: 'Загальна віддана енергія',
            'zh-cn': '总上网电量',
        },
        type: 'number',
        role: 'value.energy',
        unit: 'kWh',
    },
    {
        reg: 'grid_total_import_energy',
        ch: 'grid',
        id: 'total_import',
        name: {
            en: 'Total import energy',
            de: 'Bezug gesamt',
            ru: 'Суммарное потребление из сети',
            pt: 'Energia total importada',
            nl: 'Totale importenergie',
            fr: 'Énergie totale importée',
            it: 'Energia totale importata',
            es: 'Energía total importada',
            pl: 'Całkowita energia importowana',
            uk: 'Загальне споживання з мережі',
            'zh-cn': '总用网电量',
        },
        type: 'number',
        role: 'value.energy',
        unit: 'kWh',
    },
    {
        reg: 'grid_standard_code',
        ch: 'grid',
        id: 'standard',
        name: {
            en: 'Grid standard',
            de: 'Netzstandard',
            ru: 'Стандарт сети',
            pt: 'Norma de rede',
            nl: 'Netnorm',
            fr: 'Norme de réseau',
            it: 'Norma di rete',
            es: 'Norma de red',
            pl: 'Norma sieci',
            uk: 'Стандарт мережі',
            'zh-cn': '电网标准',
        },
        type: 'number',
        role: 'value',
        states: GRID_STANDARD,
    },

    // Wechselrichter
    {
        reg: 'internal_temp',
        ch: 'inverter',
        id: 'temperature',
        name: {
            en: 'Temperature',
            de: 'Temperatur',
            ru: 'Температура',
            pt: 'Temperatura',
            nl: 'Temperatuur',
            fr: 'Température',
            it: 'Temperatura',
            es: 'Temperatura',
            pl: 'Temperatura',
            uk: 'Температура',
            'zh-cn': '温度',
        },
        type: 'number',
        role: 'value.temperature',
        unit: '°C',
    },
    {
        reg: 'inverter_r_frequency',
        ch: 'inverter',
        id: 'frequency',
        name: {
            en: 'Inverter frequency',
            de: 'Wechselrichterfrequenz',
            ru: 'Частота инвертора',
            pt: 'Frequência do inversor',
            nl: 'Omvormerfrequentie',
            fr: "Fréquence de l'onduleur",
            it: "Frequenza dell'inverter",
            es: 'Frecuencia del inversor',
            pl: 'Częstotliwość falownika',
            uk: 'Частота інвертора',
            'zh-cn': '逆变器频率',
        },
        type: 'number',
        role: 'value.frequency',
        unit: 'Hz',
    },
    {
        reg: 'daily_generation',
        ch: 'inverter',
        id: 'daily_energy',
        name: {
            en: 'Daily generation',
            de: 'Tagesernte',
            ru: 'Суточная выработка',
            pt: 'Geração diária',
            nl: 'Dagelijkse opbrengst',
            fr: 'Production journalière',
            it: 'Produzione giornaliera',
            es: 'Generación diaria',
            pl: 'Dzienna produkcja',
            uk: 'Добова виробіток',
            'zh-cn': '日发电量',
        },
        type: 'number',
        role: 'value.energy',
        unit: 'kWh',
    },
    {
        reg: 'cumulative_generation',
        ch: 'inverter',
        id: 'total_energy',
        name: {
            en: 'Total generation',
            de: 'Gesamtertrag',
            ru: 'Суммарная выработка',
            pt: 'Geração total',
            nl: 'Totale opbrengst',
            fr: 'Production totale',
            it: 'Produzione totale',
            es: 'Generación total',
            pl: 'Całkowita produkcja',
            uk: 'Загальний виробіток',
            'zh-cn': '总发电量',
        },
        type: 'number',
        role: 'value.energy',
        unit: 'kWh',
    },
    {
        reg: 'operating_mode',
        ch: 'inverter',
        id: 'operating_mode',
        name: {
            en: 'Operating mode',
            de: 'Betriebsmodus',
            ru: 'Режим работы',
            pt: 'Modo de operação',
            nl: 'Bedrijfsmodus',
            fr: 'Mode de fonctionnement',
            it: 'Modalità operativa',
            es: 'Modo de operación',
            pl: 'Tryb pracy',
            uk: 'Режим роботи',
            'zh-cn': '运行模式',
        },
        type: 'number',
        role: 'value',
        states: OPERATING_MODES,
    },
    {
        reg: 'network_status',
        ch: 'inverter',
        id: 'network_status',
        name: {
            en: 'Network status',
            de: 'Netzwerkstatus',
            ru: 'Состояние сети',
            pt: 'Estado da rede',
            nl: 'Netwerkstatus',
            fr: 'État du réseau',
            it: 'Stato della rete',
            es: 'Estado de la red',
            pl: 'Stan sieci',
            uk: 'Статус мережі',
            'zh-cn': '网络状态',
        },
        type: 'number',
        role: 'value',
        states: NETWORK_STATUS,
    },

    // EPS / Notstrom
    {
        reg: 'eps_voltage',
        ch: 'eps',
        id: 'voltage',
        name: {
            en: 'EPS voltage',
            de: 'EPS Spannung',
            ru: 'Напряжение EPS',
            pt: 'Tensão EPS',
            nl: 'EPS spanning',
            fr: 'Tension EPS',
            it: 'Tensione EPS',
            es: 'Tensión EPS',
            pl: 'Napięcie EPS',
            uk: 'Напруга EPS',
            'zh-cn': 'EPS电压',
        },
        type: 'number',
        role: 'value.voltage',
        unit: 'V',
    },
    {
        reg: 'eps_current',
        ch: 'eps',
        id: 'current',
        name: {
            en: 'EPS current',
            de: 'EPS Strom',
            ru: 'Ток EPS',
            pt: 'Corrente EPS',
            nl: 'EPS stroom',
            fr: 'Courant EPS',
            it: 'Corrente EPS',
            es: 'Corriente EPS',
            pl: 'Prąd EPS',
            uk: 'Струм EPS',
            'zh-cn': 'EPS电流',
        },
        type: 'number',
        role: 'value.current',
        unit: 'A',
    },
    {
        reg: 'eps_power',
        ch: 'eps',
        id: 'power',
        name: {
            en: 'EPS power',
            de: 'EPS Leistung',
            ru: 'Мощность EPS',
            pt: 'Potência EPS',
            nl: 'EPS vermogen',
            fr: 'Puissance EPS',
            it: 'Potenza EPS',
            es: 'Potencia EPS',
            pl: 'Moc EPS',
            uk: 'Потужність EPS',
            'zh-cn': 'EPS功率',
        },
        type: 'number',
        role: 'value.power',
        unit: 'W',
    },

    // Status
    {
        reg: 'remote_control',
        ch: 'status',
        id: 'remote_control',
        name: {
            en: 'Remote control mode',
            de: 'Fernsteuerung Modus',
            ru: 'Режим дистанционного управления',
            pt: 'Modo de controlo remoto',
            nl: 'Afstandsbedieningsmodus',
            fr: 'Mode de contrôle à distance',
            it: 'Modalità controllo remoto',
            es: 'Modo de control remoto',
            pl: 'Tryb zdalnego sterowania',
            uk: 'Режим дистанційного керування',
            'zh-cn': '远程控制模式',
        },
        type: 'number',
        role: 'value',
        states: REMOTE_CONTROL_MODES,
    },
    {
        reg: 'remote_timeout_countdown',
        ch: 'status',
        id: 'remote_countdown',
        name: {
            en: 'Remote control countdown',
            de: 'Fernsteuerung Countdown',
            ru: 'Обратный отсчёт дистанционного управления',
            pt: 'Contagem decrescente do controlo remoto',
            nl: 'Aftelklok afstandsbediening',
            fr: 'Décompte du contrôle à distance',
            it: 'Conto alla rovescia controllo remoto',
            es: 'Cuenta atrás del control remoto',
            pl: 'Odliczanie zdalnego sterowania',
            uk: 'Зворотний відлік дистанційного керування',
            'zh-cn': '远程控制倒计时',
        },
        type: 'number',
        role: 'value',
        unit: 's',
    },
];

/** Schreibbare Steuer-States */
const CONTROL_STATES = [
    {
        reg: 'remote_control',
        id: 'remote_control_mode',
        name: {
            en: 'Remote control mode',
            de: 'Fernsteuerung Modus',
            ru: 'Режим дистанционного управления',
            pt: 'Modo de controlo remoto',
            nl: 'Afstandsbedieningsmodus',
            fr: 'Mode de contrôle à distance',
            it: 'Modalità controllo remoto',
            es: 'Modo de control remoto',
            pl: 'Tryb zdalnego sterowania',
            uk: 'Режим дистанційного керування',
            'zh-cn': '远程控制模式',
        },
        type: 'number',
        role: 'level',
        min: 0,
        max: 15,
        states: REMOTE_CONTROL_MODES,
        writeReg: 'remote_control',
    },
    {
        reg: 'remote_timeout_set',
        id: 'remote_timeout',
        name: {
            en: 'Remote control timeout',
            de: 'Fernsteuerung Timeout',
            ru: 'Таймаут дистанционного управления',
            pt: 'Tempo limite do controlo remoto',
            nl: 'Time-out afstandsbediening',
            fr: "Délai d'expiration du contrôle à distance",
            it: 'Timeout controllo remoto',
            es: 'Tiempo de espera del control remoto',
            pl: 'Limit czasu zdalnego sterowania',
            uk: 'Тайм-аут дистанційного керування',
            'zh-cn': '远程控制超时',
        },
        type: 'number',
        role: 'level',
        min: 0,
        max: 3600,
        unit: 's',
        writeReg: 'remote_timeout_set',
    },
    {
        reg: 'remote_active_power',
        id: 'remote_active_power',
        name: {
            en: 'Remote active power',
            de: 'Fernsteuerung Wirkleistung',
            ru: 'Активная мощность дистанционного управления',
            pt: 'Potência ativa de controlo remoto',
            nl: 'Actief vermogen afstandsbediening',
            fr: 'Puissance active de contrôle à distance',
            it: 'Potenza attiva controllo remoto',
            es: 'Potencia activa de control remoto',
            pl: 'Moc czynna zdalnego sterowania',
            uk: 'Активна потужність дистанційного керування',
            'zh-cn': '远程有功功率',
        },
        type: 'number',
        role: 'level',
        min: -100000,
        max: 100000,
        unit: 'W',
        writeReg: 'remote_active_power',
    },
    {
        reg: 'remote_reactive_power',
        id: 'remote_reactive_power',
        name: {
            en: 'Remote reactive power',
            de: 'Fernsteuerung Blindleistung',
            ru: 'Реактивная мощность дистанционного управления',
            pt: 'Potência reativa de controlo remoto',
            nl: 'Reactief vermogen afstandsbediening',
            fr: 'Puissance réactive de contrôle à distance',
            it: 'Potenza reattiva controllo remoto',
            es: 'Potencia reactiva de control remoto',
            pl: 'Moc bierna zdalnego sterowania',
            uk: 'Реактивна потужність дистанційного керування',
            'zh-cn': '远程无功功率',
        },
        type: 'number',
        role: 'level',
        min: -100000,
        max: 100000,
        unit: 'var',
        writeReg: 'remote_reactive_power',
    },
    {
        reg: 'eps_output',
        id: 'eps_output',
        name: {
            en: 'EPS/UPS output mode',
            de: 'EPS/UPS Ausgang',
            ru: 'Режим выхода EPS/UPS',
            pt: 'Modo de saída EPS/UPS',
            nl: 'EPS/UPS uitvoermodus',
            fr: 'Mode de sortie EPS/UPS',
            it: 'Modalità uscita EPS/UPS',
            es: 'Modo de salida EPS/UPS',
            pl: 'Tryb wyjścia EPS/UPS',
            uk: 'Режим виходу EPS/UPS',
            'zh-cn': 'EPS/UPS输出模式',
        },
        type: 'number',
        role: 'level',
        min: 0,
        max: 3,
        states: EPS_OUTPUT_MODES,
        writeReg: 'eps_output',
    },
    {
        reg: 'minimum_soc',
        id: 'minimum_soc',
        name: {
            en: 'Minimum SoC',
            de: 'Minimaler Ladestand',
            ru: 'Минимальный SoC',
            pt: 'SoC mínimo',
            nl: 'Minimale SoC',
            fr: 'SoC minimum',
            it: 'SoC minimo',
            es: 'SoC mínimo',
            pl: 'Minimalny SoC',
            uk: 'Мінімальний SoC',
            'zh-cn': '最低荷电状态',
        },
        type: 'number',
        role: 'level',
        min: 10,
        max: 100,
        unit: '%',
        writeReg: 'minimum_soc',
    },
    {
        reg: 'maximum_soc',
        id: 'maximum_soc',
        name: {
            en: 'Maximum SoC',
            de: 'Maximaler Ladestand',
            ru: 'Максимальный SoC',
            pt: 'SoC máximo',
            nl: 'Maximale SoC',
            fr: 'SoC maximum',
            it: 'SoC massimo',
            es: 'SoC máximo',
            pl: 'Maksymalny SoC',
            uk: 'Максимальний SoC',
            'zh-cn': '最高荷电状态',
        },
        type: 'number',
        role: 'level',
        min: 0,
        max: 100,
        unit: '%',
        writeReg: 'maximum_soc',
    },
    {
        reg: 'minimum_soc_ongrid',
        id: 'minimum_soc_ongrid',
        name: {
            en: 'Minimum SoC on-grid',
            de: 'Minimaler Ladestand Netzbetrieb',
            ru: 'Минимальный SoC при работе в сети',
            pt: 'SoC mínimo em rede',
            nl: 'Minimale SoC op net',
            fr: 'SoC minimum sur réseau',
            it: 'SoC minimo in rete',
            es: 'SoC mínimo en red',
            pl: 'Minimalny SoC przy pracy sieciowej',
            uk: 'Мінімальний SoC при роботі в мережі',
            'zh-cn': '并网最低荷电状态',
        },
        type: 'number',
        role: 'level',
        min: 10,
        max: 100,
        unit: '%',
        writeReg: 'minimum_soc_ongrid',
    },
    {
        reg: 'battery_max_charge_current',
        id: 'max_charge_current',
        name: {
            en: 'Max charge current',
            de: 'Max. Ladestrom',
            ru: 'Макс. ток зарядки',
            pt: 'Corrente de carga máx.',
            nl: 'Max. laadstroom',
            fr: 'Courant de charge max.',
            it: 'Corrente di carica max.',
            es: 'Corriente de carga máx.',
            pl: 'Maks. prąd ładowania',
            uk: 'Макс. струм зарядки',
            'zh-cn': '最大充电电流',
        },
        type: 'number',
        role: 'level',
        min: 0,
        max: 40,
        unit: 'A',
        writeReg: 'battery_max_charge_current',
    },
    {
        reg: 'battery_max_discharge_current',
        id: 'max_discharge_current',
        name: {
            en: 'Max discharge current',
            de: 'Max. Entladestrom',
            ru: 'Макс. ток разрядки',
            pt: 'Corrente de descarga máx.',
            nl: 'Max. ontlaadstroom',
            fr: 'Courant de décharge max.',
            it: 'Corrente di scarica max.',
            es: 'Corriente de descarga máx.',
            pl: 'Maks. prąd rozładowania',
            uk: 'Макс. струм розрядки',
            'zh-cn': '最大放电电流',
        },
        type: 'number',
        role: 'level',
        min: 0,
        max: 40,
        unit: 'A',
        writeReg: 'battery_max_discharge_current',
    },
    {
        reg: 'operating_mode',
        id: 'operating_mode',
        name: {
            en: 'Operating mode',
            de: 'Betriebsmodus',
            ru: 'Режим работы',
            pt: 'Modo de operação',
            nl: 'Bedrijfsmodus',
            fr: 'Mode de fonctionnement',
            it: 'Modalità operativa',
            es: 'Modo de operación',
            pl: 'Tryb pracy',
            uk: 'Режим роботи',
            'zh-cn': '运行模式',
        },
        type: 'number',
        role: 'level',
        min: 0,
        max: 7,
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

        this.hub = null;
        this.pollTimer = null;

        this.on('ready', this.onReady.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    // ─── Lifecycle ─────────────────────────────────────────────────────────

    async onReady() {
        // Verbindungsstatus initial auf false setzen
        await this.setStateAsync('info.connection', { val: false, ack: true });

        const { host, port, slaveId, scanInterval } = this.config;

        if (!host) {
            this.log.error('No IP address configured. Please set it in the admin panel.');
            return;
        }

        this.log.info(`Connecting to Solakon ONE: ${host}:${port || 502} (Unit ID: ${slaveId || 1})`);

        // Alle ioBroker-Objekte (Datenpunkte) anlegen
        await this.createAllObjects();

        // Modbus Hub initialisieren
        this.hub = new SolakonModbusHub(host, port || 502, slaveId || 1, this.log, this);

        // Auf schreibbare States abonnieren
        this.subscribeStates('control.*');

        // Polling-Intervall berechnen
        this.pollInterval = Math.max(1, Math.min(300, scanInterval || 30)) * 1000;
        this.log.info(`Polling started – interval: ${this.pollInterval / 1000}s`);

        // Ersten Poll sofort starten, danach jeweils erst nach Abschluss erneut planen
        await this.doPoll();
    }

    onUnload(callback) {
        try {
            this.unloaded = true;
            if (this.pollTimer) {
                this.clearTimeout(this.pollTimer);
                this.pollTimer = null;
            }
            if (this.hub) {
                this.hub.disconnect();
                this.hub = null;
            }
            this.setState('info.connection', { val: false, ack: true });
        } catch {
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
                this.log.warn('No data received from device');
                await this.setStateAsync('info.connection', { val: false, ack: true });
                return;
            }

            await this.updateAllStates(data);
            await this.setStateAsync('info.connection', { val: true, ack: true });
        } catch (err) {
            this.log.error(`Poll error: ${err.message}`);
            await this.setStateAsync('info.connection', { val: false, ack: true });
            // Verbindung trennen, damit beim nächsten Poll neu verbunden wird
            if (this.hub) {
                this.hub.disconnect();
            }
        } finally {
            // Nächsten Poll erst nach Abschluss des aktuellen planen (kein Overlap)
            if (!this.unloaded) {
                this.pollTimer = this.setTimeout(() => this.doPoll(), this.pollInterval);
            }
        }
    }

    // ─── State-Änderungen (Schreibbefehle) ─────────────────────────────────

    async onStateChange(id, state) {
        // Ignoriere Bestätigungen (ack=true) und gelöschte States
        if (!state || state.ack) {
            return;
        }

        // ID-Format: solakon-one.0.control.<key>
        const parts = id.split('.');
        const key = parts.slice(3).join('.'); // z.B. 'remote_control_mode'

        const ctrlDef = CONTROL_STATES.find(c => c.id === key);
        if (!ctrlDef) {
            this.log.warn(`Unknown control state: ${id}`);
            return;
        }

        if (!this.hub || !this.hub.isConnected()) {
            this.log.warn(`Cannot write – not connected (${key})`);
            return;
        }

        try {
            await this.hub.writeNamedRegister(ctrlDef.writeReg, state.val);
            this.log.info(`Register '${ctrlDef.writeReg}' written: ${state.val}`);
            // State mit ack bestätigen
            await this.setStateAsync(id, { val: state.val, ack: true });
        } catch (err) {
            this.log.error(`Writing '${ctrlDef.writeReg}' failed: ${err.message}`);
        }
    }

    // ─── Objekte anlegen ───────────────────────────────────────────────────

    async createAllObjects() {
        // Channels anlegen
        const channels = ['device', 'pv', 'battery', 'grid', 'inverter', 'eps', 'status', 'control'];
        const channelNames = {
            device: {
                en: 'Device Information',
                de: 'Geräteinformationen',
                ru: 'Информация об устройстве',
                pt: 'Informações do dispositivo',
                nl: 'Apparaatinformatie',
                fr: "Informations sur l'appareil",
                it: 'Informazioni dispositivo',
                es: 'Información del dispositivo',
                pl: 'Informacje o urządzeniu',
                uk: 'Інформація про пристрій',
                'zh-cn': '设备信息',
            },
            pv: {
                en: 'Photovoltaics',
                de: 'Photovoltaik',
                ru: 'Фотовольтаика',
                pt: 'Fotovoltaico',
                nl: 'Fotovoltaïsch',
                fr: 'Photovoltaïque',
                it: 'Fotovoltaico',
                es: 'Fotovoltaico',
                pl: 'Fotowoltaika',
                uk: 'Фотовольтаїка',
                'zh-cn': '光伏',
            },
            battery: {
                en: 'Battery',
                de: 'Batterie',
                ru: 'Аккумулятор',
                pt: 'Bateria',
                nl: 'Batterij',
                fr: 'Batterie',
                it: 'Batteria',
                es: 'Batería',
                pl: 'Bateria',
                uk: 'Акумулятор',
                'zh-cn': '电池',
            },
            grid: {
                en: 'Grid',
                de: 'Netz',
                ru: 'Сеть',
                pt: 'Rede',
                nl: 'Net',
                fr: 'Réseau',
                it: 'Rete',
                es: 'Red',
                pl: 'Sieć',
                uk: 'Мережа',
                'zh-cn': '电网',
            },
            inverter: {
                en: 'Inverter',
                de: 'Wechselrichter',
                ru: 'Инвертор',
                pt: 'Inversor',
                nl: 'Omvormer',
                fr: 'Onduleur',
                it: 'Inverter',
                es: 'Inversor',
                pl: 'Falownik',
                uk: 'Інвертор',
                'zh-cn': '逆变器',
            },
            eps: {
                en: 'Emergency Power (EPS/UPS)',
                de: 'Notstromversorgung (EPS/UPS)',
                ru: 'Аварийное питание (EPS/UPS)',
                pt: 'Energia de emergência (EPS/UPS)',
                nl: 'Noodstroom (EPS/UPS)',
                fr: 'Alimentation de secours (EPS/UPS)',
                it: 'Alimentazione di emergenza (EPS/UPS)',
                es: 'Energía de emergencia (EPS/UPS)',
                pl: 'Zasilanie awaryjne (EPS/UPS)',
                uk: 'Аварійне живлення (EPS/UPS)',
                'zh-cn': '应急电源 (EPS/UPS)',
            },
            status: {
                en: 'Status',
                de: 'Status',
                ru: 'Статус',
                pt: 'Estado',
                nl: 'Status',
                fr: 'Statut',
                it: 'Stato',
                es: 'Estado',
                pl: 'Status',
                uk: 'Статус',
                'zh-cn': '状态',
            },
            control: {
                en: 'Control',
                de: 'Steuerung',
                ru: 'Управление',
                pt: 'Controlo',
                nl: 'Bediening',
                fr: 'Commande',
                it: 'Controllo',
                es: 'Control',
                pl: 'Sterowanie',
                uk: 'Керування',
                'zh-cn': '控制',
            },
        };

        for (const ch of channels) {
            await this.setObjectNotExistsAsync(ch, {
                type: 'channel',
                common: { name: channelNames[ch] || ch },
                native: {},
            });
        }

        // Sensor-States anlegen (nur lesen)
        for (const def of SENSOR_STATES) {
            const fullId = `${def.ch}.${def.id}`;
            const common = {
                name: def.name,
                type: def.type,
                role: def.role || 'value',
                read: true,
                write: false,
            };
            if (def.unit) {
                common.unit = def.unit;
            }
            if (def.states) {
                common.states = def.states;
            }

            await this.setObjectNotExistsAsync(fullId, {
                type: 'state',
                common,
                native: {},
            });
        }

        // Steuer-States anlegen (lesen und schreiben)
        for (const def of CONTROL_STATES) {
            const fullId = `control.${def.id}`;
            const common = {
                name: def.name,
                type: def.type,
                role: def.role || 'level',
                read: true,
                write: true,
            };
            if (def.unit) {
                common.unit = def.unit;
            }
            if (def.min !== undefined) {
                common.min = def.min;
            }
            if (def.max !== undefined) {
                common.max = def.max;
            }
            if (def.states) {
                common.states = def.states;
            }

            await this.setObjectNotExistsAsync(fullId, {
                type: 'state',
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
            if (rawVal === undefined || rawVal === null) {
                continue;
            }

            const fullId = `${def.ch}.${def.id}`;
            await this.setStateAsync(fullId, { val: rawVal, ack: true });
        }

        // Steuer-States synchronisieren (Current-Wert vom Gerät)
        for (const def of CONTROL_STATES) {
            const rawVal = data[def.reg];
            if (rawVal === undefined || rawVal === null) {
                continue;
            }

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
    module.exports = options => new SolakonOneAdapter(options);
} else {
    // Direkt ausgeführt
    new SolakonOneAdapter();
}
