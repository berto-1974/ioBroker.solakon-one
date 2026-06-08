"use strict";
const fs = require("node:fs");
const {
  REMOTE_CONTROL_MODES, EPS_OUTPUT_MODES, OPERATING_MODES, NETWORK_STATUS, GRID_STANDARD
} = require("../lib/registers");

const objects = [];

// Channels
[
  { _id: "info",     name: { en: "Connection Info",           de: "Verbindungsinformation" } },
  { _id: "device",   name: { en: "Device Information",        de: "Geräteinformationen" } },
  { _id: "pv",       name: { en: "Photovoltaics",             de: "Photovoltaik" } },
  { _id: "battery",  name: { en: "Battery",                   de: "Batterie" } },
  { _id: "grid",     name: { en: "Grid",                      de: "Netz" } },
  { _id: "inverter", name: { en: "Inverter",                  de: "Wechselrichter" } },
  { _id: "eps",      name: { en: "Emergency Power (EPS/UPS)", de: "Notstromversorgung (EPS/UPS)" } },
  { _id: "status",   name: { en: "Status",                    de: "Status" } },
  { _id: "control",  name: { en: "Control",                   de: "Steuerung" } },
].forEach(ch => objects.push({ _id: ch._id, type: "channel", common: { name: ch.name }, native: {} }));

// info.connection
objects.push({
  _id: "info.connection", type: "state",
  common: { name: { en: "Connected", de: "Verbunden" }, type: "boolean", role: "indicator.connected", read: true, write: false, def: false },
  native: {}
});

// Sensor states (read-only)
const SENSOR_STATES = [
  { ch: "device",   id: "model",            name: { en: "Model name",               de: "Modellbezeichnung" },             type: "string",  role: "info.name" },
  { ch: "device",   id: "serial",           name: { en: "Serial number",            de: "Seriennummer" },                  type: "string",  role: "info.serial" },
  { ch: "device",   id: "fw_master",        name: { en: "Firmware Master",          de: "Firmware Master" },               type: "number",  role: "info.firmware" },
  { ch: "device",   id: "fw_slave",         name: { en: "Firmware Slave",           de: "Firmware Slave" },                type: "number",  role: "info.firmware" },
  { ch: "pv",       id: "total_power",      name: { en: "PV total power",           de: "PV Gesamtleistung" },             type: "number",  role: "value.power",       unit: "W" },
  { ch: "pv",       id: "total_energy",     name: { en: "PV total energy",          de: "PV Energie gesamt" },             type: "number",  role: "value.energy",      unit: "kWh" },
  { ch: "pv",       id: "pv1_voltage",      name: { en: "PV1 voltage",              de: "PV1 Spannung" },                  type: "number",  role: "value.voltage",     unit: "V" },
  { ch: "pv",       id: "pv1_current",      name: { en: "PV1 current",              de: "PV1 Strom" },                     type: "number",  role: "value.current",     unit: "A" },
  { ch: "pv",       id: "pv1_power",        name: { en: "PV1 power",                de: "PV1 Leistung" },                  type: "number",  role: "value.power",       unit: "W" },
  { ch: "pv",       id: "pv2_voltage",      name: { en: "PV2 voltage",              de: "PV2 Spannung" },                  type: "number",  role: "value.voltage",     unit: "V" },
  { ch: "pv",       id: "pv2_current",      name: { en: "PV2 current",              de: "PV2 Strom" },                     type: "number",  role: "value.current",     unit: "A" },
  { ch: "pv",       id: "pv2_power",        name: { en: "PV2 power",                de: "PV2 Leistung" },                  type: "number",  role: "value.power",       unit: "W" },
  { ch: "pv",       id: "pv3_voltage",      name: { en: "PV3 voltage",              de: "PV3 Spannung" },                  type: "number",  role: "value.voltage",     unit: "V" },
  { ch: "pv",       id: "pv3_current",      name: { en: "PV3 current",              de: "PV3 Strom" },                     type: "number",  role: "value.current",     unit: "A" },
  { ch: "pv",       id: "pv3_power",        name: { en: "PV3 power",                de: "PV3 Leistung" },                  type: "number",  role: "value.power",       unit: "W" },
  { ch: "pv",       id: "pv4_voltage",      name: { en: "PV4 voltage",              de: "PV4 Spannung" },                  type: "number",  role: "value.voltage",     unit: "V" },
  { ch: "pv",       id: "pv4_current",      name: { en: "PV4 current",              de: "PV4 Strom" },                     type: "number",  role: "value.current",     unit: "A" },
  { ch: "pv",       id: "pv4_power",        name: { en: "PV4 power",                de: "PV4 Leistung" },                  type: "number",  role: "value.power",       unit: "W" },
  { ch: "battery",  id: "soc",              name: { en: "State of Charge (SoC)",    de: "Ladestand (SoC)" },               type: "number",  role: "value.battery",     unit: "%" },
  { ch: "battery",  id: "voltage",          name: { en: "Voltage",                  de: "Spannung" },                      type: "number",  role: "value.voltage",     unit: "V" },
  { ch: "battery",  id: "current",          name: { en: "Current",                  de: "Strom" },                         type: "number",  role: "value.current",     unit: "A" },
  { ch: "battery",  id: "power",            name: { en: "Power",                    de: "Leistung" },                      type: "number",  role: "value.power",       unit: "W" },
  { ch: "battery",  id: "combined_power",   name: { en: "Combined power",           de: "Kombinierte Leistung" },          type: "number",  role: "value.power",       unit: "W" },
  { ch: "battery",  id: "total_charge",     name: { en: "Total charge energy",      de: "Ladeenergie gesamt" },            type: "number",  role: "value.energy",      unit: "kWh" },
  { ch: "battery",  id: "total_discharge",  name: { en: "Total discharge energy",   de: "Entladeenergie gesamt" },         type: "number",  role: "value.energy",      unit: "kWh" },
  { ch: "battery",  id: "bms1_soh",         name: { en: "State of Health (SoH)",    de: "Gesundheitszustand (SoH)" },      type: "number",  role: "value",             unit: "%" },
  { ch: "battery",  id: "design_energy",    name: { en: "Design capacity",          de: "Nennkapazität" },                 type: "number",  role: "value",             unit: "Wh" },
  { ch: "battery",  id: "ambient_temp",     name: { en: "Ambient temperature",      de: "Umgebungstemperatur" },           type: "number",  role: "value.temperature", unit: "°C" },
  { ch: "battery",  id: "max_temp",         name: { en: "Max temperature",          de: "Max. Temperatur" },               type: "number",  role: "value.temperature", unit: "°C" },
  { ch: "battery",  id: "min_temp",         name: { en: "Min temperature",          de: "Min. Temperatur" },               type: "number",  role: "value.temperature", unit: "°C" },
  { ch: "grid",     id: "off_grid",         name: { en: "Off-grid mode",            de: "Inselbetrieb" },                  type: "boolean", role: "indicator" },
  { ch: "grid",     id: "r_voltage",        name: { en: "Grid voltage (R)",         de: "Netzspannung (R)" },              type: "number",  role: "value.voltage",     unit: "V" },
  { ch: "grid",     id: "s_voltage",        name: { en: "Grid voltage (S)",         de: "Netzspannung (S)" },              type: "number",  role: "value.voltage",     unit: "V" },
  { ch: "grid",     id: "t_voltage",        name: { en: "Grid voltage (T)",         de: "Netzspannung (T)" },              type: "number",  role: "value.voltage",     unit: "V" },
  { ch: "grid",     id: "frequency",        name: { en: "Grid frequency",           de: "Netzfrequenz" },                  type: "number",  role: "value.frequency",   unit: "Hz" },
  { ch: "grid",     id: "active_power",     name: { en: "Active power",             de: "Wirkleistung" },                  type: "number",  role: "value.power",       unit: "W" },
  { ch: "grid",     id: "reactive_power",   name: { en: "Reactive power",           de: "Blindleistung" },                 type: "number",  role: "value.power",       unit: "kvar" },
  { ch: "grid",     id: "power_factor",     name: { en: "Power factor",             de: "Leistungsfaktor" },               type: "number",  role: "value" },
  { ch: "grid",     id: "total_export",     name: { en: "Total export energy",      de: "Einspeisung gesamt" },            type: "number",  role: "value.energy",      unit: "kWh" },
  { ch: "grid",     id: "total_import",     name: { en: "Total import energy",      de: "Bezug gesamt" },                  type: "number",  role: "value.energy",      unit: "kWh" },
  { ch: "grid",     id: "standard",         name: { en: "Grid standard",            de: "Netzstandard" },                  type: "number",  role: "value",             states: GRID_STANDARD },
  { ch: "inverter", id: "temperature",      name: { en: "Temperature",              de: "Temperatur" },                    type: "number",  role: "value.temperature", unit: "°C" },
  { ch: "inverter", id: "frequency",        name: { en: "Inverter frequency",       de: "Wechselrichterfrequenz" },        type: "number",  role: "value.frequency",   unit: "Hz" },
  { ch: "inverter", id: "daily_energy",     name: { en: "Daily generation",         de: "Tagesernte" },                    type: "number",  role: "value.energy",      unit: "kWh" },
  { ch: "inverter", id: "total_energy",     name: { en: "Total generation",         de: "Gesamtertrag" },                  type: "number",  role: "value.energy",      unit: "kWh" },
  { ch: "inverter", id: "operating_mode",   name: { en: "Operating mode",           de: "Betriebsmodus" },                 type: "number",  role: "value",             states: OPERATING_MODES },
  { ch: "inverter", id: "network_status",   name: { en: "Network status",           de: "Netzwerkstatus" },                type: "number",  role: "value",             states: NETWORK_STATUS },
  { ch: "eps",      id: "voltage",          name: { en: "EPS voltage",              de: "EPS Spannung" },                  type: "number",  role: "value.voltage",     unit: "V" },
  { ch: "eps",      id: "current",          name: { en: "EPS current",              de: "EPS Strom" },                     type: "number",  role: "value.current",     unit: "A" },
  { ch: "eps",      id: "power",            name: { en: "EPS power",                de: "EPS Leistung" },                  type: "number",  role: "value.power",       unit: "W" },
  { ch: "status",   id: "remote_control",   name: { en: "Remote control mode",      de: "Fernsteuerung Modus" },           type: "number",  role: "value",             states: REMOTE_CONTROL_MODES },
  { ch: "status",   id: "remote_countdown", name: { en: "Remote control countdown", de: "Fernsteuerung Countdown" },       type: "number",  role: "value",             unit: "s" },
];

SENSOR_STATES.forEach(def => {
  const common = { name: def.name, type: def.type, role: def.role || "value", read: true, write: false };
  if (def.unit) common.unit = def.unit;
  if (def.states) common.states = def.states;
  objects.push({ _id: `${def.ch}.${def.id}`, type: "state", common, native: {} });
});

// Control states (read/write)
const CONTROL_STATES = [
  { id: "remote_control_mode",   name: { en: "Remote control mode",           de: "Fernsteuerung Modus" },            type: "number", role: "level",       min: 0,       max: 15,     states: REMOTE_CONTROL_MODES },
  { id: "remote_timeout",        name: { en: "Remote control timeout",        de: "Fernsteuerung Timeout" },           type: "number", role: "level",       min: 0,       max: 3600,   unit: "s" },
  { id: "remote_active_power",   name: { en: "Remote active power",           de: "Fernsteuerung Wirkleistung" },      type: "number", role: "level.power", min: -100000, max: 100000, unit: "W" },
  { id: "remote_reactive_power", name: { en: "Remote reactive power",         de: "Fernsteuerung Blindleistung" },     type: "number", role: "level.power", min: -100000, max: 100000, unit: "var" },
  { id: "eps_output",            name: { en: "EPS/UPS output mode",           de: "EPS/UPS Ausgang" },                 type: "number", role: "level",       min: 0,       max: 3,      states: EPS_OUTPUT_MODES },
  { id: "minimum_soc",           name: { en: "Minimum SoC",                   de: "Minimaler Ladestand" },             type: "number", role: "level",       min: 10,      max: 100,    unit: "%" },
  { id: "maximum_soc",           name: { en: "Maximum SoC",                   de: "Maximaler Ladestand" },             type: "number", role: "level",       min: 0,       max: 100,    unit: "%" },
  { id: "minimum_soc_ongrid",    name: { en: "Minimum SoC on-grid",           de: "Minimaler Ladestand Netzbetrieb" }, type: "number", role: "level",       min: 10,      max: 100,    unit: "%" },
  { id: "max_charge_current",    name: { en: "Max charge current",            de: "Max. Ladestrom" },                  type: "number", role: "level",       min: 0,       max: 40,     unit: "A" },
  { id: "max_discharge_current", name: { en: "Max discharge current",         de: "Max. Entladestrom" },               type: "number", role: "level",       min: 0,       max: 40,     unit: "A" },
  { id: "operating_mode",        name: { en: "Operating mode",                de: "Betriebsmodus" },                   type: "number", role: "level",       min: 0,       max: 7,      states: OPERATING_MODES },
];

CONTROL_STATES.forEach(def => {
  const common = { name: def.name, type: def.type, role: def.role || "level", read: true, write: true };
  if (def.unit) common.unit = def.unit;
  if (def.min !== undefined) common.min = def.min;
  if (def.max !== undefined) common.max = def.max;
  if (def.states) common.states = def.states;
  objects.push({ _id: `control.${def.id}`, type: "state", common, native: {} });
});

fs.mkdirSync("doc", { recursive: true });
fs.writeFileSync("doc/objects.json", JSON.stringify(objects, null, 2), "utf8");
console.log(`Generated ${objects.length} objects -> doc/objects.json`);
