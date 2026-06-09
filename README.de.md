# ioBroker.solakon-one

**ioBroker Adapter für den Solakon ONE Hybrid-Wechselrichter**

Überwacht und steuert den Solakon ONE Hybrid-Solar-Wechselrichter mit Batteriespeicher über das lokale Netzwerk via **Modbus TCP** (Port 502).

**[English documentation](README.md)**

---

## Voraussetzungen

- ioBroker mit js-controller >= 6.0.0
- Node.js >= 22
- Solakon ONE Wechselrichter im lokalen Netzwerk erreichbar
- Modbus TCP auf dem Gerät aktiviert (Port 502)

---

## Installation

1. ioBroker Admin-Oberfläche öffnen
2. **Adapter** → **+ Adapter hinzufügen**
3. Tab **"Von URL installieren"** (GitHub-Icon) wählen
4. URL eingeben: `https://github.com/berto-1974/ioBroker.solakon-one`
5. **Installieren** klicken

---

## Konfiguration

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

### Steuerung (`control.*`) — schreibbar

| ID | Beschreibung | Wertebereich |
|----|-------------|-------------|
| `control.remote_control_mode` | Fernsteuerungsmodus | 0/1/3/5/7/9/11/13/15 |
| `control.remote_timeout` | Fernsteuerung Timeout (s) | 0–3600 |
| `control.remote_active_power` | Wirkleistung Sollwert (W) | -100000–100000 |
| `control.remote_reactive_power` | Blindleistung Sollwert (var) | -100000–100000 |
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

### 1.0.7 (2026-06-09)
- @types/node Versionsangabe korrigiert: >=22 auf ^22.0.0 geändert (W0066)

### 1.0.6 (2026-06-09)
- Node.js-Anforderung in README korrigiert (>=22); @types/node devDependency ergänzt

### 1.0.5 (2026-06-09)
- Repo-Checker-Fehler behoben: Node.js >=22 vorausgesetzt, release-script aktualisiert, redundantes eslint entfernt, macOS in CI-Testmatrix ergänzt, this.setInterval/clearTimeout korrekt verwendet

### 1.0.4 (2026-06-09)
- Mehrsprachige Bezeichnungen (11 Sprachen) für alle Datenpunkte ergänzt

### 1.0.3 (2026-05-30)
- Node.js 24 in CI-Testmatrix aufgenommen; Node 24 für Lint und Deploy verwendet

### 1.0.2 (2026-04-13)
- Fix: Changelog in README ergänzt, veraltete .eslintrc.json entfernt, release-script Pakete, VS Code Schema, Automerge-Workflow

### 1.0.1 (2026-04-13)
- Fix: Compact Mode aktiviert, ESLint auf @iobroker/eslint-config migriert, node: Präfix für eingebaute Module, automatischer Deploy-Workflow ergänzt

### 1.0.0 (2026-04-12)
- Erstveröffentlichung
- Modbus TCP Kommunikation
- Alle Sensor-Datenpunkte (PV, Batterie, Netz, Wechselrichter, EPS)
- Alle Steuerungs-Datenpunkte (Betriebsmodus, SoC-Grenzen, Fernsteuerung, EPS)
- Admin-UI mit jsonConfig

---

## Lizenz

MIT License

Copyright (c) 2026 Marco Bertulies <berto74online@gmail.com>

Basierend auf der [Home Assistant Integration für Solakon ONE](https://github.com/solakon-de/solakon-one-homeassistant).
