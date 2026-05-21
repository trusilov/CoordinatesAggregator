const fileInput = document.getElementById('fileInput');
const processBtn = document.getElementById('processBtn');
const clearBtn = document.getElementById('clearBtn');

const status = document.getElementById('status');
const downloadLink = document.getElementById('downloadLink');

const basemapSelect = document.getElementById('basemapSelect');
const previewModeSelect = document.getElementById('previewModeSelect');

const themeToggleBtn = document.getElementById('themeToggleBtn');
const langToggleBtn = document.getElementById('langToggleBtn');
const statusIndicator = document.getElementById('statusIndicator');

let currentFile = null;
let latestConvertedRows = [];

let map = null;
let heatLayer = null;
let tileLayer = null;
let pointsLayer = null;

let currentTheme = 'light';
let currentLang = 'uk';
let currentStatus = 'ready';

const translations = {
  uk: {
    process: 'Обробити',
    clear: 'Очистити',
    mapPreview: 'Попередній перегляд мапи',
    points: 'Крапки',
    heatmap: 'Теплова мапа',
    satellite: 'Сателіт',
    darkMap: 'Темна',
    downloadResult: 'Завантажити результат',
    downloadConverted: 'Завантажити converted CSV',
    downloadErrors: 'Завантажити файл з помилками',
    errorsFound: 'Знайдено помилок',
    duplicatesMerged: 'Дублікатів обʼєднано',
    rowColumn: 'ROW',

    ready: '● READY',
    processing: '● PROCESSING',
    errorStatus: '● ERROR',

    fileLoaded: 'Файл завантажено',
    chooseFileFirst: 'Спочатку вибери CSV або Excel файл',
    processingFile: 'Обробка файлу...',
    readingData: 'Читання даних...',
    validationFailed: 'Виявлено помилки у файлі',
    validationFileReady: 'Згенеровано файл з підсвіченими помилками',
    done: 'Готово',
    error: 'Помилка',

    totalRows: 'Зчитано рядків',
    validRows: 'Валідних рядків',
    uniqueRows: 'Унікальних координат',
    convertedRows: 'Конвертовано',
    failedRows: 'Не сконвертовано',
    invalidValues: 'Невалідні value',
    invalidMgrs: 'Невалідні MGRS',

    value: 'Value',
    normalized: 'Нормалізовано',
    failedCoordinates: 'Не сконвертовані координати',

    unsupportedFile: 'Непідтримуваний формат файлу',
    excelNoSheets: 'Excel файл не містить листів',
    excelReadError: 'Не вдалося прочитати Excel файл',

    valueEmpty: 'Value не заповнено',
    valueIntegerOnly: 'Value має бути тільки цілим числом',
    mgrsDigitsError: 'MGRS має містити рівно 10 цифр після зони та квадрата',
    invalidCoordinateStructure: 'Невалідна структура координати',
    invalidCoordinateValues: 'Координати містять некоректні значення',
    unknownError: 'Невідома помилка',
    mgrsWrongDigits: 'Неправильна кількість цифр у MGRS координаті',
    mgrsInvalidZone: 'Некоректна зона MGRS',
    conversionError: 'Помилка конвертації координати',

    errorColumn: 'ERROR'
  },

  en: {
    process: 'Process',
    clear: 'Clear',
    mapPreview: 'Map preview',
    points: 'Points',
    heatmap: 'Heatmap',
    satellite: 'Satellite',
    darkMap: 'Dark',
    downloadResult: 'Download result',
    downloadConverted: 'Download converted CSV',
    downloadErrors: 'Download file with errors',
    errorsFound: 'Errors found',
    duplicatesMerged: 'Duplicates merged',
    rowColumn: 'ROW',

    ready: '● READY',
    processing: '● PROCESSING',
    errorStatus: '● ERROR',

    fileLoaded: 'File loaded',
    chooseFileFirst: 'Choose CSV or Excel file first',
    processingFile: 'Processing file...',
    readingData: 'Reading data...',
    validationFailed: 'Validation errors detected',
    validationFileReady: 'Generated file with highlighted errors',
    done: 'Done',
    error: 'Error',

    totalRows: 'Rows read',
    validRows: 'Valid rows',
    uniqueRows: 'Unique coordinates',
    convertedRows: 'Converted',
    failedRows: 'Not converted',
    invalidValues: 'Invalid values',
    invalidMgrs: 'Invalid MGRS',

    value: 'Value',
    normalized: 'Normalized',
    failedCoordinates: 'Failed coordinates',

    unsupportedFile: 'Unsupported file format',
    excelNoSheets: 'Excel file does not contain sheets',
    excelReadError: 'Failed to read Excel file',

    valueEmpty: 'Value is empty',
    valueIntegerOnly: 'Value must be an integer only',
    mgrsDigitsError: 'MGRS must contain exactly 10 digits after zone and grid square',
    invalidCoordinateStructure: 'Invalid coordinate structure',
    invalidCoordinateValues: 'Coordinates contain invalid values',
    unknownError: 'Unknown error',
    mgrsWrongDigits: 'Wrong number of digits in MGRS coordinate',
    mgrsInvalidZone: 'Invalid MGRS zone',
    conversionError: 'Coordinate conversion error',

    errorColumn: 'ERROR'
  }
};

function t(key) {
  return translations[currentLang][key] || key;
}

const basemaps = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    options: {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap &copy; CARTO'
    }
  },

  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }
  },

  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    options: {
      maxZoom: 19,
      attribution: 'Tiles &copy; Esri'
    }
  }
};

applyTranslations();

document.body.classList.add('light-theme');
themeToggleBtn.innerHTML = '☀ Light';
setReadyStatus();

langToggleBtn.addEventListener('click', () => {
  currentLang = currentLang === 'uk' ? 'en' : 'uk';

  langToggleBtn.textContent =
    currentLang === 'uk'
      ? '🇺🇦 UA'
      : '🌍 EN';

  applyTranslations();
});

themeToggleBtn.addEventListener('click', toggleTheme);

clearBtn.addEventListener('click', () => {
  fileInput.value = '';
  currentFile = null;
  latestConvertedRows = [];

  clearPreviewLayers();

  status.innerHTML = '';
  downloadLink.style.display = 'none';

  setReadyStatus();
});

basemapSelect.addEventListener('change', () => {
  setBasemap(basemapSelect.value);
});

previewModeSelect.addEventListener('change', () => {
  if (latestConvertedRows.length > 0) {
    renderPreview(latestConvertedRows);
  }
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];

  if (!file) {
    return;
  }

  currentFile = file;
  latestConvertedRows = [];

  clearPreviewLayers();

  downloadLink.style.display = 'none';

  status.innerHTML = `
    <div class="status-card">
      <h3>${t('fileLoaded')}</h3>
      <div>${escapeHtml(file.name)}</div>
    </div>
  `;

  setReadyStatus();
});

processBtn.addEventListener('click', async () => {
  if (!currentFile) {
    status.innerHTML = `
      <div class="status-card">
        <h3 class="error">${t('error')}</h3>
        <div>${t('chooseFileFirst')}</div>
      </div>
    `;

    setErrorStatus();
    return;
  }

  try {
    setProcessingStatus();

    downloadLink.style.display = 'none';

    status.innerHTML = `
      <div class="status-card">
        <h3>${t('processingFile')}</h3>
        <div>${t('readingData')}</div>
      </div>
    `;

    const tableRows = await readInputFile(currentFile);
    const validationResult = validateAndNormalizeRows(tableRows);

    const validRows = validationResult.validRows;
    const invalidValues = validationResult.invalidValues;
    const invalidMgrs = validationResult.invalidMgrs;

    const hasErrors =
      invalidValues.length > 0 ||
      invalidMgrs.length > 0;

    if (hasErrors) {
      const workbookBuffer =
        await generateValidationWorkbook(
          tableRows,
          invalidValues,
          invalidMgrs
        );

      const blob = new Blob(
        [workbookBuffer],
        {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      );

      const url = URL.createObjectURL(blob);

      const originalName =
        currentFile.name.replace(/\.[^/.]+$/, '');

      downloadLink.href = url;
      downloadLink.download = `${originalName}_validation_errors.xlsx`;
      downloadLink.textContent = t('downloadErrors');
      downloadLink.style.display = 'block';

      status.innerHTML = `
        <div class="status-card">
          <h3 class="warning">${t('validationFailed')}</h3>
          <div>${t('validationFileReady')}</div>
          <div>${t('errorsFound')}: ${invalidValues.length + invalidMgrs.length}</div>
        </div>

        ${renderInvalidValues(invalidValues)}

        ${renderInvalidMgrs(invalidMgrs)}
      `;

      setErrorStatus();
      return;
    }

    const aggregated = aggregateDuplicates(validRows);

    const duplicatesMerged =
      validRows.length - aggregated.length;
    const conversionResult = convertMgrsToDD(aggregated);

    const converted = conversionResult.converted;
    const failed = conversionResult.failed;

    latestConvertedRows = converted;

    renderStatus({
      totalRows: tableRows.length,
      validRows: validRows.length,
      uniqueRows: aggregated.length,
      convertedRows: converted.length,
      failedRows: failed.length,
      duplicatesMerged,
      invalidValues,
      invalidMgrs,
      failed
    });

    renderPreview(converted);

    const blob = buildOutputFile(converted);
    const url = URL.createObjectURL(blob);

    downloadLink.href = url;

    const originalName =
      currentFile.name.replace(/\.[^/.]+$/, '');

    downloadLink.download = `${originalName}_converted.csv`;
    downloadLink.textContent = t('downloadConverted');
    downloadLink.style.display = 'block';

    setReadyStatus();

  } catch (err) {
    console.error(err);

    status.innerHTML = `
      <div class="status-card">
        <h3 class="error">${t('error')}</h3>
        <div>${escapeHtml(err.message)}</div>
      </div>
    `;

    setErrorStatus();
  }
});

function applyTranslations() {
  document
    .querySelectorAll('[data-i18n]')
    .forEach((el) => {
      const key = el.getAttribute('data-i18n');
      el.textContent = t(key);
    });

  refreshStatusIndicator();
}

function setReadyStatus() {
  currentStatus = 'ready';

  statusIndicator.innerHTML = t('ready');
  statusIndicator.style.color = 'var(--success)';
}

function setProcessingStatus() {
  currentStatus = 'processing';

  statusIndicator.innerHTML = t('processing');
  statusIndicator.style.color = 'var(--warning)';
}

function setErrorStatus() {
  currentStatus = 'error';

  statusIndicator.innerHTML = t('errorStatus');
  statusIndicator.style.color = 'var(--error)';
}

function refreshStatusIndicator() {
  if (currentStatus === 'processing') {
    setProcessingStatus();
    return;
  }

  if (currentStatus === 'error') {
    setErrorStatus();
    return;
  }

  setReadyStatus();
}

function toggleTheme() {
  if (currentTheme === 'dark') {
    document.body.classList.add('light-theme');
    currentTheme = 'light';
    themeToggleBtn.innerHTML = '☀ Light';
  } else {
    document.body.classList.remove('light-theme');
    currentTheme = 'dark';
    themeToggleBtn.innerHTML = '🌙 Dark';
  }
}

function isHeaderRow(row) {
  const firstCell =
    String(row[0] ?? '')
      .trim()
      .toLowerCase();

  const secondCell =
    String(row[1] ?? '')
      .trim()
      .toLowerCase();

  return (
    firstCell === 'mgrs' ||
    firstCell === 'coordinate' ||
    firstCell === 'coordinates' ||
    firstCell === 'координата' ||
    firstCell === 'координати' ||
    secondCell === 'value' ||
    secondCell === 'вага'
  );
}

function validateAndNormalizeRows(rows) {
  const validRows = [];
  const invalidValues = [];
  const invalidMgrs = [];

  rows.forEach((row, index) => {
    const rowIndex = index + 1;

    if (index === 0 && isHeaderRow(row)) {
      return;
    }

    const mgrsValue = row[0];
    const weightValue = row[1];

    if (!mgrsValue) {
      return;
    }

    const rawWeight = String(weightValue ?? '').trim();

    if (rawWeight === '') {
      invalidValues.push({
        rowIndex,
        mgrs: mgrsValue,
        value: '(empty)',
        reason: t('valueEmpty')
      });

      return;
    }

    if (!/^-?\d+$/.test(rawWeight)) {
      invalidValues.push({
        rowIndex,
        mgrs: mgrsValue,
        value: rawWeight,
        reason: t('valueIntegerOnly')
      });

      return;
    }

    const normalizedMgrs =
      String(mgrsValue)
        .replace(/"/g, '')
        .replace(/'/g, '')
        .replace(/;/g, '')
        .replace(/,/g, '')
        .replace(/\s+/g, '')
        .toUpperCase()
        .trim();

    if (
      !/^\d{1,2}[C-HJ-NP-X][A-HJ-NP-Z]{2}\d{10}$/.test(normalizedMgrs)
    ) {
      invalidMgrs.push({
        rowIndex,
        mgrs: mgrsValue,
        normalized: normalizedMgrs,
        reason: t('mgrsDigitsError')
      });

      return;
    }

    validRows.push({
      mgrs: normalizedMgrs,
      originalMgrs: String(mgrsValue),
      weight: Number(rawWeight)
    });
  });

  return {
    validRows,
    invalidValues,
    invalidMgrs
  };
}

async function generateValidationWorkbook(
  rows,
  invalidValues,
  invalidMgrs
) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Validation');

  worksheet.columns = [
    {
      header: t('rowColumn'),
      key: 'rowNumber',
      width: 10
    },
    {
      header: 'MGRS',
      key: 'mgrs',
      width: 32
    },
    {
      header: 'VALUE',
      key: 'value',
      width: 18
    },
    {
      header: t('errorColumn'),
      key: 'error',
      width: 60
    }
  ];

  const errorMap = new Map();

  invalidValues.forEach((item) => {
    errorMap.set(
      item.rowIndex,
      {
        type: 'value',
        reason: item.reason
      }
    );
  });

  invalidMgrs.forEach((item) => {
    errorMap.set(
      item.rowIndex,
      {
        type: 'mgrs',
        reason: item.reason
      }
    );
  });

  rows.forEach((row, index) => {
    if (index === 0 && isHeaderRow(row)) {
      return;
    }

    const sourceRowIndex = index + 1;
    const error = errorMap.get(sourceRowIndex);

    const addedRow =
      worksheet.addRow({
        rowNumber: sourceRowIndex,
        mgrs: row[0] ?? '',
        value: row[1] ?? '',
        error: error ? error.reason : ''
      });

    if (!error) {
      return;
    }

    const rowCell = addedRow.getCell(1);
    const mgrsCell = addedRow.getCell(2);
    const valueCell = addedRow.getCell(3);
    const errorCell = addedRow.getCell(4);

    const redFill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: {
        argb: 'FFFF6666'
      }
    };

    const yellowFill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: {
        argb: 'FFFFE066'
      }
    };

    rowCell.fill = redFill;

    if (error.type === 'mgrs') {
      mgrsCell.fill = redFill;
    }

    if (error.type === 'value') {
      valueCell.fill = yellowFill;
    }

    errorCell.fill = redFill;
  });

  worksheet.getRow(1).font = {
    bold: true
  };

  worksheet.views = [
    {
      state: 'frozen',
      ySplit: 1
    }
  ];

  return await workbook.xlsx.writeBuffer();
}

function aggregateDuplicates(rows) {
  const map = new Map();

  for (const row of rows) {
    if (map.has(row.mgrs)) {
      const existing = map.get(row.mgrs);

      map.set(
        row.mgrs,
        {
          mgrs: row.mgrs,
          originalMgrs: existing.originalMgrs,
          weight: existing.weight + row.weight
        }
      );
    } else {
      map.set(
        row.mgrs,
        {
          mgrs: row.mgrs,
          originalMgrs: row.originalMgrs,
          weight: row.weight
        }
      );
    }
  }

  return Array.from(map.values());
}

function convertMgrsToDD(rows) {
  const converted = [];
  const failed = [];

  for (const row of rows) {
    try {
      const point = mgrs.toPoint(row.mgrs);

      if (!point || point.length !== 2) {
        failed.push({
          mgrs: row.mgrs,
          reason: t('invalidCoordinateStructure')
        });

        continue;
      }

      const lon = point[0];
      const lat = point[1];

      if (
        isNaN(lat) ||
        isNaN(lon)
      ) {
        failed.push({
          mgrs: row.mgrs,
          reason: t('invalidCoordinateValues')
        });

        continue;
      }

      converted.push({
        mgrs: row.mgrs,
        originalMgrs: row.originalMgrs,
        latitude: Number(lat.toFixed(6)),
        longitude: Number(lon.toFixed(6)),
        value: row.weight
      });

    } catch (err) {
      let errorMessage = t('unknownError');

      if (err.message.includes('even number')) {
        errorMessage = t('mgrsWrongDigits');
      } else if (err.message.includes('Invalid zone letter')) {
        errorMessage = t('mgrsInvalidZone');
      } else if (err.message.includes('bad conversion')) {
        errorMessage = t('conversionError');
      }

      failed.push({
        mgrs: row.mgrs,
        reason: errorMessage
      });
    }
  }

  return {
    converted,
    failed
  };
}

function buildOutputFile(rows) {
  const csvRows = [];

  csvRows.push('latitude,longitude,value');

  for (const row of rows) {
    csvRows.push(
      `${row.latitude},${row.longitude},${row.value}`
    );
  }

  const csvContent = csvRows.join('\r\n');

  return new Blob(
    [csvContent],
    {
      type: 'text/plain;charset=utf-8;'
    }
  );
}

function renderStatus(data) {
  status.innerHTML = `
    <div class="status-card">
      <h3 class="success">${t('done')}</h3>

      <div class="status-grid">

        <div class="status-item">
          <div class="status-label">${t('totalRows')}</div>
          <div class="status-value">${data.totalRows}</div>
        </div>

        <div class="status-item">
          <div class="status-label">${t('validRows')}</div>
          <div class="status-value">${data.validRows}</div>
        </div>

        <div class="status-item">
          <div class="status-label">${t('uniqueRows')}</div>
          <div class="status-value">${data.uniqueRows}</div>
        </div>

        <div class="status-item">
          <div class="status-label">${t('convertedRows')}</div>
          <div class="status-value success">${data.convertedRows}</div>
        </div>

        <div class="status-item">
          <div class="status-label">${t('failedRows')}</div>
          <div class="status-value ${data.failedRows > 0 ? 'warning' : 'success'}">
            ${data.failedRows}
          </div>
        </div>

        <div class="status-item">
          <div class="status-label">${t('duplicatesMerged')}</div>
          <div class="status-value ${data.duplicatesMerged > 0 ? 'warning' : 'success'}">
            ${data.duplicatesMerged}
          </div>
        </div>

        <div class="status-item">
          <div class="status-label">${t('invalidValues')}</div>
          <div class="status-value ${data.invalidValues.length > 0 ? 'warning' : 'success'}">
            ${data.invalidValues.length}
          </div>
        </div>

        <div class="status-item">
          <div class="status-label">${t('invalidMgrs')}</div>
          <div class="status-value ${data.invalidMgrs.length > 0 ? 'warning' : 'success'}">
            ${data.invalidMgrs.length}
          </div>
        </div>

      </div>
    </div>

    ${renderInvalidValues(data.invalidValues)}

    ${renderInvalidMgrs(data.invalidMgrs)}

    ${renderFailedRows(data.failed)}
  `;
}

function renderInvalidValues(items) {
  if (items.length === 0) {
    return '';
  }

  return `
    <div class="status-card">
      <h3 class="warning">${t('invalidValues')}</h3>

      <div class="error-list">
        ${items.map(item => `
          <div class="error-row">
            <div class="error-coord">
              ${escapeHtml(String(item.mgrs))}
            </div>

            <div>
              ${t('value')}:
              ${escapeHtml(String(item.value))}
            </div>

            <div class="error-reason">
              ${escapeHtml(item.reason)}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderInvalidMgrs(items) {
  if (items.length === 0) {
    return '';
  }

  return `
    <div class="status-card">
      <h3 class="warning">${t('invalidMgrs')}</h3>

      <div class="error-list">
        ${items.map(item => `
          <div class="error-row">
            <div class="error-coord">
              ${escapeHtml(String(item.mgrs))}
            </div>

            <div>
              ${t('normalized')}:
              ${escapeHtml(String(item.normalized))}
            </div>

            <div class="error-reason">
              ${escapeHtml(item.reason)}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderFailedRows(items) {
  if (items.length === 0) {
    return '';
  }

  return `
    <div class="status-card">
      <h3 class="warning">${t('failedCoordinates')}</h3>

      <div class="error-list">
        ${items.map(item => `
          <div class="error-row">
            <div class="error-coord">
              ${escapeHtml(String(item.mgrs))}
            </div>

            <div class="error-reason">
              ${escapeHtml(item.reason)}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderPreview(rows) {
  if (rows.length === 0) {
    clearPreviewLayers();
    return;
  }

  const center = [
    rows[0].latitude,
    rows[0].longitude
  ];

  if (!map) {
    map = L.map('map')
      .setView(center, 11);

    setBasemap(basemapSelect.value);
  }

  clearPreviewLayers();

  const bounds = L.latLngBounds(
    rows.map(row => [
      row.latitude,
      row.longitude
    ])
  );

  map.fitBounds(bounds, {
    padding: [30, 30]
  });

  const currentZoom = map.getZoom();

  const adaptiveRadius = Math.max(
    12,
    Math.min(
      55,
      currentZoom * 3.5
    )
  );

  if (previewModeSelect.value === 'heatmap') {
    renderHeatmap(rows, adaptiveRadius);
  } else {
    renderPoints(rows);
  }

  setTimeout(() => {
    map.invalidateSize();
  }, 100);
}

function clearPreviewLayers() {
  if (heatLayer && map) {
    map.removeLayer(heatLayer);
    heatLayer = null;
  }

  if (pointsLayer && map) {
    map.removeLayer(pointsLayer);
    pointsLayer = null;
  }
}

function renderHeatmap(rows, radius) {
  const maxValue = Math.max(
    ...rows.map(row => row.value)
  );

  const heatPoints = rows.map(row => [
    row.latitude,
    row.longitude,
    row.value / maxValue
  ]);

  heatLayer = L.heatLayer(
    heatPoints,
    {
      radius,
      blur: radius * 0.7,
      maxZoom: 18,
      minOpacity: 0.4
    }
  ).addTo(map);
}

function renderPoints(rows) {
  pointsLayer = L.layerGroup();

  for (const row of rows) {
    const marker = L.circleMarker(
      [
        row.latitude,
        row.longitude
      ],
      {
        radius: 5,
        color: '#ffffff',
        weight: 1,
        fillColor: '#ff4d4d',
        fillOpacity: 0.9
      }
    );

    marker.bindPopup(`
      <b>MGRS:</b> ${escapeHtml(row.originalMgrs || row.mgrs || '')}<br>
      <b>${t('value')}:</b> ${row.value}<br>
      <b>Lat:</b> ${row.latitude}<br>
      <b>Lon:</b> ${row.longitude}
    `);

    pointsLayer.addLayer(marker);
  }

  pointsLayer.addTo(map);
}

function setBasemap(type) {
  if (!map) {
    return;
  }

  if (tileLayer) {
    map.removeLayer(tileLayer);
  }

  const selected =
    basemaps[type] || basemaps.satellite;

  tileLayer = L.tileLayer(
    selected.url,
    selected.options
  ).addTo(map);
}

function readInputFile(file) {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.csv')) {
    return readCSV(file);
  }

  if (
    fileName.endsWith('.xlsx') ||
    fileName.endsWith('.xls')
  ) {
    return readExcel(file);
  }

  return Promise.reject(
    new Error(t('unsupportedFile'))
  );
}

function readCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      delimiter: '',

      complete: (results) => {
        resolve(results.data);
      },

      error: (err) => {
        reject(err);
      }
    });
  });
}

function readExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);

        const workbook = XLSX.read(data, {
          type: 'array'
        });

        const firstSheetName = workbook.SheetNames[0];

        if (!firstSheetName) {
          reject(new Error(t('excelNoSheets')));
          return;
        }

        const worksheet = workbook.Sheets[firstSheetName];

        const rows = XLSX.utils.sheet_to_json(
          worksheet,
          {
            header: 1,
            blankrows: false
          }
        );

        resolve(rows);

      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => {
      reject(new Error(t('excelReadError')));
    };

    reader.readAsArrayBuffer(file);
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}