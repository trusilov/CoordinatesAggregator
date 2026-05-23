# MGRS CSV Aggregator

UA | EN below

---

# 🇺🇦 Українська

Локальний браузерний додаток для обробки MGRS координат, підготовки CSV/XLSX файлів та візуалізації координат на мапі.

---

## Можливості

- Завантаження `.csv`, `.xlsx`, `.xls`
- Обробка MGRS координат
- Автоматична нормалізація координат
- Виправлення схожих кириличних/латинських символів
- Валідація MGRS
- Валідація `value`
- Обʼєднання дублікатів координат
- Сумування `value` для однакових координат
- Конвертація MGRS у `latitude,longitude,value`
- Генерація готового CSV
- Генерація Excel-файлу з підсвіченими помилками
- Попередній перегляд на мапі
- Режими preview:
  - Points
  - Heatmap
- Вибір підкладки мапи:
  - Satellite
  - OpenStreetMap
  - Dark
- Українська та англійська локалізація
- Світла / темна тема
- Help modal з інструкцією
- Повністю офлайн робота
- Не потребує Node.js або збірки

---

## Вхідний формат

Файл має містити мінімум 2 колонки:

```text
MGRS | VALUE
```

Приклад:

```text
37U CP 80667 72128 | 5
37U CP 79665 72331 | 3
37U CP 80181 71596 | 7
```

Перший рядок із заголовками:

```text
MGRS
VALUE
координати
вага
```

ігнорується автоматично.

---

## Вихідний формат

Після успішної обробки генерується CSV:

```text
latitude,longitude,value
```

---

## Робота з помилками

Якщо у файлі знайдено хоча б одну помилку:

- конвертація не виконується;
- дублі не обʼєднуються;
- `value` не сумуються;
- генерується Excel-файл:

```text
*_validation_errors.xlsx
```

- помилкові комірки підсвічуються;
- файл можна виправити та повторно завантажити в додаток.

---

## Автоматична нормалізація

Додаток автоматично виправляє схожі кириличні та латинські символи:

```text
Р → P
С → C
А → A
В → B
```

та інші.

Це дозволяє уникнути помилок при копіюванні координат із месенджерів або документів.

---

## Запуск

Відкрити файл:

```text
index.html
```

у браузері.

---

## Структура проєкту

```text
CoordinatesAggregator/
│
├── index.html
├── style.css
├── app.js
├── README.md
│
├── assets/
│   └── icon.png
│
├── libs/
│   ├── papaparse.min.js
│   ├── xlsx.full.min.js
│   ├── mgrs.min.js
│   └── exceljs.min.js
│
└── js/
    ├── state.js
    ├── i18n.js
    ├── ui.js
    ├── file.js
    ├── validation.js
    ├── export.js
    └── map.js
```

---

# 🇬🇧 English

Local browser-based application for processing MGRS coordinates, preparing CSV/XLSX files and visualizing coordinates on a map.

---

## Features

- Upload `.csv`, `.xlsx`, `.xls`
- MGRS coordinate processing
- Automatic coordinate normalization
- Cyrillic/Latin lookalike symbol correction
- MGRS validation
- `value` validation
- Duplicate coordinate aggregation
- Automatic value summation
- MGRS to `latitude,longitude,value` conversion
- CSV export
- Excel validation file generation with highlighted errors
- Map preview
- Preview modes:
  - Points
  - Heatmap
- Basemap selection:
  - Satellite
  - OpenStreetMap
  - Dark
- Ukrainian & English localization
- Light / Dark theme
- Help modal
- Fully offline
- No Node.js or build system required

---

## Input format

Input file must contain at least 2 columns:

```text
MGRS | VALUE
```

Example:

```text
37U CP 80667 72128 | 5
37U CP 79665 72331 | 3
37U CP 80181 71596 | 7
```

Header rows like:

```text
MGRS
VALUE
coordinates
weight
```

are ignored automatically.

---

## Output format

After successful processing generated CSV format is:

```text
latitude,longitude,value
```

---

## Validation workflow

If at least one error is found:

- conversion is aborted;
- duplicates are not merged;
- values are not summed;
- validation Excel file is generated:

```text
*_validation_errors.xlsx
```

- invalid cells are highlighted;
- user can fix the file and upload it again.

---

## Automatic normalization

Application automatically fixes similar Cyrillic/Latin symbols:

```text
Р → P
С → C
А → A
В → B
```

and others.

This helps avoid errors caused by copied coordinates from messengers or documents.

---

## Launch

Open:

```text
index.html
```

in browser.

---

## Project structure

```text
CoordinatesAggregator/
│
├── index.html
├── style.css
├── app.js
├── README.md
│
├── assets/
│   └── icon.png
│
├── libs/
│   ├── papaparse.min.js
│   ├── xlsx.full.min.js
│   ├── mgrs.min.js
│   └── exceljs.min.js
│
└── js/
    ├── state.js
    ├── i18n.js
    ├── ui.js
    ├── file.js
    ├── validation.js
    ├── export.js
    └── map.js
```

---

## GitHub

https://github.com/trusilov/CoordinatesAggregator