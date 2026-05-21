# MGRS CSV Aggregator

Offline browser-based utility for validating, aggregating and converting MGRS coordinates into Decimal Degrees (DD) format for further visualization in kepler.gl and other GIS tools.

---

## Features

- CSV / XLSX support
- Strict MGRS validation
- Duplicate coordinate aggregation
- Integer-only value validation
- MGRS → Decimal Degrees conversion
- Heatmap / Points preview
- Multiple basemap preview modes
- Dark / Light theme
- Fully browser-based
- No installation required
- Portable offline workflow

---

## Input Format

Input file must contain:

| Column | Description |
|---|---|
| A | MGRS coordinate |
| B | Integer value |

Example:

```text
37U CP 12345 67890,10
37U CP 12345 67890,5
37U CP 54321 98765,20
```

---

## MGRS Requirements

The application accepts only:

- Valid MGRS coordinates
- Exactly 10 digits precision (1 meter accuracy)

Valid example:

```text
37UCP1234567890
```

Invalid examples:

```text
37UCP123456789
37UCP123456789012
37UCP123456
```

---

## Value Requirements

Value column must contain:

- Integer numbers only
- No floating point values
- No empty values

Valid:

```text
10
-5
250
```

Invalid:

```text
10.5
3,14
(empty)
```

---

## Output Format

Generated CSV:

```text
latitude,longitude,value
```

Example:

```text
46.635421,32.616352,15
46.621521,32.612551,20
```

---

## Aggregation Logic

If duplicate MGRS coordinates exist:

```text
37UCP1234567890,10
37UCP1234567890,5
```

Output becomes:

```text
37UCP1234567890,15
```

---

## Preview Modes

### Points
Displays converted coordinates as points.

### Heatmap
Displays aggregated intensity heatmap preview.

---

## Basemaps

Available preview basemaps:

- Satellite
- Dark
- OpenStreetMap

---

## Usage

1. Open `index.html`
2. Select CSV/XLSX file
3. Press `Обробити`
4. Download converted CSV

---

## Technologies

- Leaflet
- Leaflet Heat
- PapaParse
- SheetJS (XLSX)
- mgrs.js

---

## Project Goals

This utility is designed as a preprocessing tool for:

- kepler.gl
- GIS workflows
- Heatmap generation
- Coordinate normalization
- Tactical visualization pipelines

---

## GitHub

Repository:

https://github.com/trusilov/CoordinatesAggregator