# ioBroker.solakon-one

[![NPM version](https://img.shields.io/npm/v/iobroker.solakon-one.svg)](https://www.npmjs.com/package/iobroker.solakon-one)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**ioBroker adapter for the Solakon ONE hybrid solar inverter**

Monitors and controls the Solakon ONE hybrid solar inverter with battery storage over the local network via **Modbus TCP** (Port 502).

---

## Requirements

- ioBroker with js-controller ≥ 4.0.0
- Node.js ≥ 18.0.0
- Solakon ONE inverter reachable in the local network
- Modbus TCP enabled on the device (Port 502)

---

## Installation

### Via GitHub URL (recommended)

1. Open ioBroker Admin interface
2. **Adapters** → **+ Add adapter**
3. Select the tab **"Install from URL"** (GitHub icon)
4. Enter URL:
   ```
   https://github.com/berto-1974/ioBroker.solakon-one
   ```
5. Click **Install**

---

## Configuration

After installation, fill in the following fields:

| Field | Description | Default |
|-------|-------------|---------|
| **IP Address** | IP of the Solakon ONE on the LAN | `192.168.1.100` |
| **Port** | Modbus TCP port | `502` |
| **Modbus Device ID** | Slave address (1–247) | `1` |
| **Interval (s)** | Poll interval (1–300 s) | `30` |

---

## Data Points

All data points are created under `solakon-one.0.*`.

### Connection Status

| ID | Description | Type |
|----|-------------|------|
| `info.connection` | Connection active | Boolean |

### Device Information (`device.*`)

| ID | Description |
|----|-------------|
| `device.model` | Model name |
| `device.serial` | Serial number |
| `device.fw_master` | Firmware version (Master) |
| `device.fw_slave` | Firmware version (Slave) |

### Photovoltaics (`pv.*`)

| ID | Description | Unit |
|----|-------------|------|
| `pv.total_power` | Total PV power | W |
| `pv.total_energy` | Total PV energy | kWh |
| `pv.pv1_voltage` … `pv4_voltage` | String voltage | V |
| `pv.pv1_current` … `pv4_current` | String current | A |
| `pv.pv1_power` … `pv4_power` | String power | W |

### Battery (`battery.*`)

| ID | Description | Unit |
|----|-------------|------|
| `battery.soc` | State of Charge (SoC) | % |
| `battery.voltage` | Voltage | V |
| `battery.current` | Current | A |
| `battery.power` | Power (+ charge, − discharge) | W |
| `battery.combined_power` | Combined power | W |
| `battery.total_charge` | Total charge energy | kWh |
| `battery.total_discharge` | Total discharge energy | kWh |
| `battery.bms1_soh` | State of Health (SoH) | % |
| `battery.design_energy` | Nominal capacity | Wh |
| `battery.ambient_temp` | Ambient temperature | °C |
| `battery.max_temp` | Maximum temperature | °C |
| `battery.min_temp` | Minimum temperature | °C |

### Grid (`grid.*`)

| ID | Description | Unit |
|----|-------------|------|
| `grid.off_grid` | Island mode active | Boolean |
| `grid.r_voltage` | Grid voltage phase R | V |
| `grid.s_voltage` | Grid voltage phase S | V |
| `grid.t_voltage` | Grid voltage phase T | V |
| `grid.frequency` | Grid frequency | Hz |
| `grid.active_power` | Active power (+ export, − import) | W |
| `grid.reactive_power` | Reactive power | kvar |
| `grid.power_factor` | Power factor | – |
| `grid.total_export` | Total feed-in energy | kWh |
| `grid.total_import` | Total purchased energy | kWh |
| `grid.standard` | Grid standard (6=VDE0126, 7=VDE4105_DE) | – |

### Inverter (`inverter.*`)

| ID | Description | Unit |
|----|-------------|------|
| `inverter.temperature` | Internal temperature | °C |
| `inverter.frequency` | Output frequency | Hz |
| `inverter.daily_energy` | Daily yield | kWh |
| `inverter.total_energy` | Total yield | kWh |
| `inverter.operating_mode` | Operating mode | – |
| `inverter.network_status` | Network status | – |

### Emergency Power / EPS (`eps.*`)

| ID | Description | Unit |
|----|-------------|------|
| `eps.voltage` | EPS output voltage | V |
| `eps.current` | EPS output current | A |
| `eps.power` | EPS output power | W |

### Status (`status.*`)

| ID | Description |
|----|-------------|
| `status.remote_control` | Active remote control mode |
| `status.remote_countdown` | Remaining time remote control (s) |

### Control (`control.*`) — **writable**

| ID | Description | Range |
|----|-------------|-------|
| `control.remote_control_mode` | Remote control mode | 0/1/3/5/7/9/11/13/15 |
| `control.remote_timeout` | Remote control timeout | 0–3600 s |
| `control.remote_active_power` | Active power setpoint | ±100,000 W |
| `control.remote_reactive_power` | Reactive power setpoint | ±100,000 var |
| `control.eps_output` | EPS/UPS output | 0=Off, 2=EPS, 3=UPS |
| `control.minimum_soc` | Min. state of charge | 0–100 % |
| `control.maximum_soc` | Max. state of charge | 0–100 % |
| `control.minimum_soc_ongrid` | Min. SoC (grid-connected) | 0–100 % |
| `control.max_charge_current` | Max. charge current | 0–40 A |
| `control.max_discharge_current` | Max. discharge current | 0–40 A |
| `control.operating_mode` | Operating mode | 0–7 |

#### Operating modes (`operating_mode`)

| Value | Description |
|-------|-------------|
| 0 | Unspecified |
| 1 | Self-consumption |
| 2 | Feed-in priority |
| 3 | Backup |
| 4 | Peak shaving |
| 6 | Force charge |
| 7 | Force discharge |

#### Remote control modes (`remote_control_mode`)

| Value | Description |
|-------|-------------|
| 0 | Off |
| 1 | Inverter export (PV priority) |
| 3 | Inverter import (PV priority) |
| 5 | Battery discharge |
| 7 | Battery charge |
| 9 | Grid export |
| 11 | Grid import |
| 13 | Inverter export (grid priority) |
| 15 | Inverter import (grid priority) |

---

## Changelog

### 1.0.0
- Initial release
- Modbus TCP communication
- All sensor data points (PV, battery, grid, inverter, EPS)
- All control data points (operating mode, SoC limits, remote control, EPS)
- Admin UI with jsonConfig

---

## License

MIT License – Based on the [Home Assistant integration for Solakon ONE](https://github.com/solakon/solakon-one-homeassistant).

Copyright (c) 2024 Marco Bertulies

---
---

# ioBroker.solakon-one — Deutsch

**ioBroker Adapter für den Solakon ONE Hybrid-Wechselrichter**

Überwacht und steuert den Solakon ONE Hybrid-Solar-Wechselrichter mit Batteriespeicher über das lokale Netzwerk via **Modbus TCP** (Port 502).

---

## Voraussetzungen

- ioBroker mit js-controller ≥ 4.0.0
- Node.js ≥ 18.0.0
- Solakon ONE Wechselrichter im lokalen Netzwerk erreichbar
- Modbus TCP auf dem Gerät aktiviert (Port 502)

---

## Installation

### Via GitHub URL (empfohlen)

1. ioBroker Admin-Oberfläche öffnen
2. **Adapter** → **+ Adapter hinzufügen**
3. Tab **"Von URL installieren"** (GitHub-Icon) wählen
4. URL eingeben:
   ```
   https://github.com/berto-1974/ioBroker.solakon-one
   ```
5. **Installieren** klicken

---

## Konfiguration

Nach der Installation folgende Felder ausfüllen:

| Feld | Beschreibung | Standard |
|------|-------------|---------|
| **IP-Adresse** | IP des Solakon ONE im LAN | `192.168.1.100` |
| **Port** | Modbus TCP Port | `502` |
| **Modbus Geräte-ID** | Slave-Adresse (1–247) | `1` |
| **Intervall (s)** | Abfrageintervall (1–300 s) | `30` |

---

## Datenpunkte

Alle Datenpunkte werden unter `solakon-one.0.*` erstellt.

### Verbindungsstatus

| ID | Beschreibung | Typ |
|----|-------------|-----|
| `info.connection` | Verbindung aktiv | Boolean |

### Geräteinformationen (`device.*`)

| ID | Beschreibung |
|----|-------------|
| `device.model` | Modellbezeichnung |
| `device.serial` | Seriennummer |
| `device.fw_master` | Firmware-Version (Master) |
| `device.fw_slave` | Firmware-Version (Slave) |

### Photovoltaik (`pv.*`)

| ID | Beschreibung | Einheit |
|----|-------------|---------|
| `pv.total_power` | PV-Gesamtleistung | W |
| `pv.total_energy` | PV-Energie gesamt | kWh |
| `pv.pv1_voltage` … `pv4_voltage` | String-Spannung | V |
| `pv.pv1_current` … `pv4_current` | String-Strom | A |
| `pv.pv1_power` … `pv4_power` | String-Leistung | W |

### Batterie (`battery.*`)

| ID | Beschreibung | Einheit |
|----|-------------|---------|
| `battery.soc` | Ladestand (SoC) | % |
| `battery.voltage` | Spannung | V |
| `battery.current` | Strom | A |
| `battery.power` | Leistung (+ Laden, − Entladen) | W |
| `battery.combined_power` | Kombinierte Leistung | W |
| `battery.total_charge` | Ladeenergie gesamt | kWh |
| `battery.total_discharge` | Entladeenergie gesamt | kWh |
| `battery.bms1_soh` | Gesundheitszustand (SoH) | % |
| `battery.design_energy` | Nennkapazität | Wh |
| `battery.ambient_temp` | Umgebungstemperatur | °C |
| `battery.max_temp` | Maximaltemperatur | °C |
| `battery.min_temp` | Minimaltemperatur | °C |

### Netz (`grid.*`)

| ID | Beschreibung | Einheit |
|----|-------------|---------|
| `grid.off_grid` | Inselbetrieb aktiv | Boolean |
| `grid.r_voltage` | Netzspannung Phase R | V |
| `grid.s_voltage` | Netzspannung Phase S | V |
| `grid.t_voltage` | Netzspannung Phase T | V |
| `grid.frequency` | Netzfrequenz | Hz |
| `grid.active_power` | Wirkleistung (+ Export, − Import) | W |
| `grid.reactive_power` | Blindleistung | kvar |
| `grid.power_factor` | Leistungsfaktor | – |
| `grid.total_export` | Einspeisung gesamt | kWh |
| `grid.total_import` | Bezug gesamt | kWh |
| `grid.standard` | Netzstandard (6=VDE0126, 7=VDE4105_DE) | – |

### Wechselrichter (`inverter.*`)

| ID | Beschreibung | Einheit |
|----|-------------|---------|
| `inverter.temperature` | Innentemperatur | °C |
| `inverter.frequency` | Ausgangsfrequenz | Hz |
| `inverter.daily_energy` | Tagesernte | kWh |
| `inverter.total_energy` | Gesamtertrag | kWh |
| `inverter.operating_mode` | Betriebsmodus | – |
| `inverter.network_status` | Netzwerkstatus | – |

### Notstrom / EPS (`eps.*`)

| ID | Beschreibung | Einheit |
|----|-------------|---------|
| `eps.voltage` | EPS-Ausgangsspannung | V |
| `eps.current` | EPS-Ausgangsstrom | A |
| `eps.power` | EPS-Ausgangsleistung | W |

### Status (`status.*`)

| ID | Beschreibung |
|----|-------------|
| `status.remote_control` | Aktiver Fernsteuerungsmodus |
| `status.remote_countdown` | Restzeit Fernsteuerung (s) |

### Steuerung (`control.*`) — **schreibbar**

| ID | Beschreibung | Wertebereich |
|----|-------------|-------------|
| `control.remote_control_mode` | Fernsteuerungsmodus | 0/1/3/5/7/9/11/13/15 |
| `control.remote_timeout` | Fernsteuerung Timeout | 0–3600 s |
| `control.remote_active_power` | Wirkleistung Sollwert | ±100.000 W |
| `control.remote_reactive_power` | Blindleistung Sollwert | ±100.000 var |
| `control.eps_output` | EPS/UPS Ausgang | 0=Aus, 2=EPS, 3=UPS |
| `control.minimum_soc` | Min. Ladestand | 0–100 % |
| `control.maximum_soc` | Max. Ladestand | 0–100 % |
| `control.minimum_soc_ongrid` | Min. Ladestand (Netzbetrieb) | 0–100 % |
| `control.max_charge_current` | Max. Ladestrom | 0–40 A |
| `control.max_discharge_current` | Max. Entladestrom | 0–40 A |
| `control.operating_mode` | Betriebsmodus | 0–7 |

#### Betriebsmodi (`operating_mode`)

| Wert | Beschreibung |
|------|-------------|
| 0 | Nicht festgelegt |
| 1 | Eigenverbrauch |
| 2 | Einspeisepriorität |
| 3 | Backup |
| 4 | Spitzenlastkappung |
| 6 | Laden erzwingen |
| 7 | Entladen erzwingen |

#### Fernsteuerungs-Modi (`remote_control_mode`)

| Wert | Beschreibung |
|------|-------------|
| 0 | Aus |
| 1 | Wechselrichter Export (PV Priorität) |
| 3 | Wechselrichter Import (PV Priorität) |
| 5 | Batterie Entladen |
| 7 | Batterie Laden |
| 9 | Netz Export |
| 11 | Netz Import |
| 13 | Wechselrichter Export (Netz Priorität) |
| 15 | Wechselrichter Import (Netz Priorität) |

---

## Changelog

### 1.0.0
- Erstveröffentlichung
- Modbus TCP Kommunikation
- Alle Sensor-Datenpunkte (PV, Batterie, Netz, Wechselrichter, EPS)
- Alle Steuerungs-Datenpunkte (Betriebsmodus, SoC-Grenzen, Fernsteuerung, EPS)
- Admin-UI mit jsonConfig

---

## Lizenz

MIT License – Basierend auf der [Home Assistant Integration für Solakon ONE](https://github.com/solakon/solakon-one-homeassistant).

Copyright (c) 2024 Marco Bertulies
