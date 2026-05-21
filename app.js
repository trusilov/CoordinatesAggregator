const fileInput = document.getElementById('fileInput');
const processBtn = document.getElementById('processBtn');
const clearBtn = document.getElementById('clearBtn');

const status = document.getElementById('status');
const downloadLink = document.getElementById('downloadLink');

const basemapSelect = document.getElementById('basemapSelect');
const previewModeSelect = document.getElementById('previewModeSelect');

const themeToggleBtn = document.getElementById('themeToggleBtn');
const statusIndicator = document.getElementById('statusIndicator');

let currentFile = null;
let latestConvertedRows = [];

let map = null;
let heatLayer = null;
let tileLayer = null;
let pointsLayer = null;

let currentTheme = 'dark';

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

setReadyStatus();

/*
====================================
EVENTS
====================================
*/

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
      <h3>Файл завантажено</h3>
      <div>${escapeHtml(file.name)}</div>
    </div>
  `;

  setReadyStatus();
});

processBtn.addEventListener('click', async () => {
  if (!currentFile) {
    status.innerHTML = `
      <div class="status-card">
        <h3 class="error">Помилка</h3>
        <div>Спочатку вибери CSV або Excel файл</div>
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
        <h3>Обробка файлу...</h3>
        <div>Читання даних...</div>
      </div>
    `;

    const tableRows = await readInputFile(currentFile);

    const validationResult = validateAndNormalizeRows(tableRows);

    const validRows = validationResult.validRows;
    const invalidValues = validationResult.invalidValues;
    const invalidMgrs = validationResult.invalidMgrs;

    const aggregated = aggregateDuplicates(validRows);

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
      invalidValues,
      invalidMgrs,
      failed
    });

    renderPreview(converted);

    const blob = buildOutputFile(converted);
    const url = URL.createObjectURL(blob);

    downloadLink.href = url;

    const originalName = currentFile.name.replace(/\.[^/.]+$/, '');

    downloadLink.download = `${originalName}_converted.csv`;
    downloadLink.style.display = 'block';

    setReadyStatus();

  } catch (err) {
    console.error(err);

    status.innerHTML = `
      <div class="status-card">
        <h3 class="error">Помилка</h3>
        <div>${escapeHtml(err.message)}</div>
      </div>
    `;

    setErrorStatus();
  }
});

/*
====================================
THEME
====================================
*/

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

/*
====================================
STATUS INDICATOR
====================================
*/

function setReadyStatus() {
  statusIndicator.innerHTML = '● READY';
  statusIndicator.style.color = 'var(--success)';
}

function setProcessingStatus() {
  statusIndicator.innerHTML = '● PROCESSING';
  statusIndicator.style.color = 'var(--warning)';
}

function setErrorStatus() {
  statusIndicator.innerHTML = '● ERROR';
  statusIndicator.style.color = 'var(--error)';
}

/*
====================================
READ FILE
====================================
*/

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
    new Error('Непідтримуваний формат файлу')
  );
}

function readCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      delimiter: "",

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
          reject(new Error('Excel файл не містить листів'));
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
      reject(new Error('Не вдалося прочитати Excel файл'));
    };

    reader.readAsArrayBuffer(file);
  });
}

/*
====================================
VALIDATE
====================================
*/

function validateAndNormalizeRows(rows) {
  const validRows = [];
  const invalidValues = [];
  const invalidMgrs = [];

  for (const row of rows) {
    const mgrsValue = row[0];
    const weightValue = row[1];

    if (!mgrsValue) {
      continue;
    }

    const rawWeight = String(weightValue ?? '').trim();

    if (rawWeight === '') {
      invalidValues.push({
        mgrs: mgrsValue,
        value: '(пусто)',
        reason: 'Value не заповнено'
      });

      continue;
    }

    if (!/^-?\d+$/.test(rawWeight)) {
      invalidValues.push({
        mgrs: mgrsValue,
        value: rawWeight,
        reason: 'Value має бути тільки цілим числом'
      });

      continue;
    }

    const weight = Number(rawWeight);

    const normalizedMgrs = String(mgrsValue)
      .replace(/"/g, '')
      .replace(/'/g, '')
      .replace(/;/g, '')
      .replace(/,/g, '')
      .toUpperCase()
      .replace(/\s+/g, '')
      .trim();

    if (
      !/^\d{1,2}[C-HJ-NP-X][A-HJ-NP-Z]{2}\d{10}$/.test(normalizedMgrs)
    ) {
      invalidMgrs.push({
        mgrs: mgrsValue,
        normalized: normalizedMgrs,
        reason: 'MGRS має містити рівно 10 цифр після зони та квадрата'
      });

      continue;
    }

    validRows.push({
      mgrs: normalizedMgrs,
      weight
    });
  }

  return {
    validRows,
    invalidValues,
    invalidMgrs
  };
}

/*
====================================
AGGREGATE
====================================
*/

function aggregateDuplicates(rows) {
  const map = new Map();

  for (const row of rows) {
    if (map.has(row.mgrs)) {
      map.set(
        row.mgrs,
        map.get(row.mgrs) + row.weight
      );
    } else {
      map.set(
        row.mgrs,
        row.weight
      );
    }
  }

  return Array
    .from(map.entries())
    .map(([mgrs, weight]) => ({
      mgrs,
      weight
    }));
}

/*
====================================
CONVERT
====================================
*/

function convertMgrsToDD(rows) {
  const converted = [];
  const failed = [];

  for (const row of rows) {
    try {
      const point = mgrs.toPoint(row.mgrs);

      if (!point || point.length !== 2) {
        failed.push({
          mgrs: row.mgrs,
          reason: 'Невалідна структура координати'
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
          reason: 'Координати містять некоректні значення'
        });

        continue;
      }

      converted.push({
        latitude: Number(lat.toFixed(6)),
        longitude: Number(lon.toFixed(6)),
        value: row.weight
      });

    } catch (err) {
      let errorMessage = 'Невідома помилка';

      if (err.message.includes('even number')) {
        errorMessage =
          'Неправильна кількість цифр у MGRS координаті';
      } else if (err.message.includes('Invalid zone letter')) {
        errorMessage =
          'Некоректна зона MGRS';
      } else if (err.message.includes('bad conversion')) {
        errorMessage =
          'Помилка конвертації координати';
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

/*
====================================
OUTPUT
====================================
*/

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

/*
====================================
STATUS RENDER
====================================
*/

function renderStatus(data) {
  status.innerHTML = `
    <div class="status-card">
      <h3 class="success">Готово</h3>

      <div class="status-grid">

        <div class="status-item">
          <div class="status-label">Зчитано рядків</div>
          <div class="status-value">${data.totalRows}</div>
        </div>

        <div class="status-item">
          <div class="status-label">Валідних рядків</div>
          <div class="status-value">${data.validRows}</div>
        </div>

        <div class="status-item">
          <div class="status-label">Унікальних координат</div>
          <div class="status-value">${data.uniqueRows}</div>
        </div>

        <div class="status-item">
          <div class="status-label">Конвертовано</div>
          <div class="status-value success">${data.convertedRows}</div>
        </div>

        <div class="status-item">
          <div class="status-label">Не сконвертовано</div>
          <div class="status-value ${data.failedRows > 0 ? 'warning' : 'success'}">
            ${data.failedRows}
          </div>
        </div>

        <div class="status-item">
          <div class="status-label">Невалідні value</div>
          <div class="status-value ${data.invalidValues.length > 0 ? 'warning' : 'success'}">
            ${data.invalidValues.length}
          </div>
        </div>

        <div class="status-item">
          <div class="status-label">Невалідні MGRS</div>
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
      <h3 class="warning">Невалідні value</h3>

      <div class="error-list">
        ${items.map(item => `
          <div class="error-row">
            <div class="error-coord">
              ${escapeHtml(String(item.mgrs))}
            </div>

            <div>
              Value:
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
      <h3 class="warning">Невалідні MGRS</h3>

      <div class="error-list">
        ${items.map(item => `
          <div class="error-row">
            <div class="error-coord">
              ${escapeHtml(String(item.mgrs))}
            </div>

            <div>
              Нормалізовано:
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
      <h3 class="warning">Не сконвертовані координати</h3>

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

/*
====================================
PREVIEW
====================================
*/

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
      minOpacity: 0.4,
      gradient: {
        0.2: 'blue',
        0.4: 'lime',
        0.6: 'yellow',
        0.8: 'orange',
        1.0: 'red'
      }
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
      <b>Value:</b> ${row.value}<br>
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

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}