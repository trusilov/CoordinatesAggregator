const fileInput = document.getElementById('fileInput');

const processBtn = document.getElementById('processBtn');

const status = document.getElementById('status');

const downloadLink = document.getElementById('downloadLink');


let currentFile = null;


/*
====================================
FILE SELECT
====================================
*/

fileInput.addEventListener('change', (e) => {

  const file = e.target.files[0];

  if (!file) {
    return;
  }

  currentFile = file;

  downloadLink.style.display = 'none';

  status.innerHTML = `
    <div class="status-card">
      <h3>Файл завантажено</h3>
      <div>${escapeHtml(file.name)}</div>
    </div>
  `;
});


/*
====================================
PROCESS
====================================
*/

processBtn.addEventListener('click', async () => {

  if (!currentFile) {

    status.innerHTML = `
      <div class="status-card">
        <h3 class="error">Помилка</h3>
        <div>Спочатку вибери CSV або Excel файл</div>
      </div>
    `;

    return;
  }

  try {

    downloadLink.style.display = 'none';

    status.innerHTML = `
      <div class="status-card">
        <h3>Обробка файлу...</h3>
        <div>Читання даних...</div>
      </div>
    `;


    const tableRows =
      await readInputFile(currentFile);


    const validationResult =
      validateAndNormalizeRows(tableRows);


    const validRows =
      validationResult.validRows;

    const invalidValues =
      validationResult.invalidValues;

    const invalidMgrs =
      validationResult.invalidMgrs;


    const aggregated =
      aggregateDuplicates(validRows);


    const conversionResult =
      convertMgrsToDD(aggregated);


    const converted =
      conversionResult.converted;

    const failed =
      conversionResult.failed;


    renderStatus({

      totalRows:
        tableRows.length,

      validRows:
        validRows.length,

      uniqueRows:
        aggregated.length,

      convertedRows:
        converted.length,

      failedRows:
        failed.length,

      invalidValues,

      invalidMgrs,

      failed
    });


    const blob =
      buildOutputFile(converted);


    const url =
      URL.createObjectURL(blob);


    downloadLink.href =
      url;


    /*
    ====================================
    OUTPUT FILE NAME
    ====================================
    */

    const originalName =
      currentFile.name.replace(/\.[^/.]+$/, '');

    const convertedFileName =
      `${originalName}_converted.csv`;


    downloadLink.download =
      convertedFileName;


    downloadLink.style.display =
      'block';

  } catch (err) {

    console.error(err);

    status.innerHTML = `
      <div class="status-card">
        <h3 class="error">Помилка</h3>
        <div>${escapeHtml(err.message)}</div>
      </div>
    `;
  }
});


/*
====================================
READ FILE
====================================
*/

function readInputFile(file) {

  const fileName =
    file.name.toLowerCase();


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


/*
====================================
READ CSV
====================================
*/

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


/*
====================================
READ EXCEL
====================================
*/

function readExcel(file) {

  return new Promise((resolve, reject) => {

    const reader =
      new FileReader();


    reader.onload = (e) => {

      try {

        const data =
          new Uint8Array(e.target.result);


        const workbook =
          XLSX.read(data, {
            type: 'array'
          });


        const firstSheetName =
          workbook.SheetNames[0];


        if (!firstSheetName) {

          reject(
            new Error(
              'Excel файл не містить листів'
            )
          );

          return;
        }


        const worksheet =
          workbook.Sheets[firstSheetName];


        const rows =
          XLSX.utils.sheet_to_json(
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

      reject(
        new Error(
          'Не вдалося прочитати Excel файл'
        )
      );
    };


    reader.readAsArrayBuffer(file);
  });
}


/*
====================================
VALIDATE + NORMALIZE
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


    /*
    ====================================
    VALUE VALIDATION
    ====================================
    */

    const rawWeight =
      String(weightValue ?? '')
        .trim();


    if (rawWeight === '') {

      invalidValues.push({

        mgrs:
          mgrsValue,

        value:
          '(пусто)',

        reason:
          'Value не заповнено'
      });

      continue;
    }


    if (!/^-?\d+$/.test(rawWeight)) {

      invalidValues.push({

        mgrs:
          mgrsValue,

        value:
          rawWeight,

        reason:
          'Value має бути тільки цілим числом'
      });

      continue;
    }


    const weight =
      Number(rawWeight);


    /*
    ====================================
    MGRS NORMALIZATION
    ====================================
    */

    const normalizedMgrs =

      String(mgrsValue)

        .replace(/"/g, '')

        .replace(/'/g, '')

        .replace(/;/g, '')

        .replace(/,/g, '')

        .toUpperCase()

        .replace(/\s+/g, '')

        .trim();


    /*
    ====================================
    STRICT MGRS VALIDATION
    10 digits only
    ====================================
    */

    if (
      !/^\d{1,2}[C-HJ-NP-X][A-HJ-NP-Z]{2}\d{10}$/.test(normalizedMgrs)
    ) {

      invalidMgrs.push({

        mgrs:
          mgrsValue,

        normalized:
          normalizedMgrs,

        reason:
          'MGRS має містити рівно 10 цифр після зони та квадрата'
      });

      continue;
    }


    validRows.push({

      mgrs:
        normalizedMgrs,

      weight:
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
AGGREGATE DUPLICATES
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
CONVERT MGRS -> DD
====================================
*/

function convertMgrsToDD(rows) {

  const converted = [];

  const failed = [];


  for (const row of rows) {

    try {

      const point =
        mgrs.toPoint(row.mgrs);


      if (
        !point ||
        point.length !== 2
      ) {

        failed.push({

          mgrs:
            row.mgrs,

          reason:
            'Невалідна структура координати'
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

          mgrs:
            row.mgrs,

          reason:
            'Координати містять некоректні значення'
        });

        continue;
      }


      converted.push({

        latitude:
          Number(lat.toFixed(6)),

        longitude:
          Number(lon.toFixed(6)),

        value:
          row.weight
      });

    } catch (err) {

      let errorMessage =
        'Невідома помилка';


      if (
        err.message.includes('even number')
      ) {

        errorMessage =
          'Неправильна кількість цифр у MGRS координаті';
      }

      else if (
        err.message.includes(
          'Invalid zone letter'
        )
      ) {

        errorMessage =
          'Некоректна зона MGRS';
      }

      else if (
        err.message.includes(
          'bad conversion'
        )
      ) {

        errorMessage =
          'Помилка конвертації координати';
      }


      failed.push({

        mgrs:
          row.mgrs,

        reason:
          errorMessage
      });


      console.error(
        'Помилка конвертації:',
        row.mgrs,
        err
      );
    }
  }


  return {

    converted,

    failed
  };
}


/*
====================================
BUILD OUTPUT FILE
====================================
*/

function buildOutputFile(rows) {

  const csvRows = [];


  csvRows.push(
    'latitude,longitude,value'
  );


  for (const row of rows) {

    csvRows.push(
      `${row.latitude},${row.longitude},${row.value}`
    );
  }


  const csvContent =
    csvRows.join('\r\n');


  return new Blob(
    [csvContent],
    {
      type:
        'text/plain;charset=utf-8;'
    }
  );
}


/*
====================================
RENDER STATUS
====================================
*/

function renderStatus(data) {

  status.innerHTML = `

    <div class="status-card">

      <h3 class="success">
        Готово
      </h3>

      <div class="status-grid">

        <div class="status-item">
          <div class="status-label">
            Зчитано рядків
          </div>
          <div class="status-value">
            ${data.totalRows}
          </div>
        </div>

        <div class="status-item">
          <div class="status-label">
            Валідних рядків
          </div>
          <div class="status-value">
            ${data.validRows}
          </div>
        </div>

        <div class="status-item">
          <div class="status-label">
            Унікальних координат
          </div>
          <div class="status-value">
            ${data.uniqueRows}
          </div>
        </div>

        <div class="status-item">
          <div class="status-label">
            Конвертовано
          </div>
          <div class="status-value success">
            ${data.convertedRows}
          </div>
        </div>

        <div class="status-item">
          <div class="status-label">
            Не сконвертовано
          </div>
          <div class="status-value ${data.failedRows > 0 ? 'warning' : 'success'}">
            ${data.failedRows}
          </div>
        </div>

        <div class="status-item">
          <div class="status-label">
            Невалідні value
          </div>
          <div class="status-value ${data.invalidValues.length > 0 ? 'warning' : 'success'}">
            ${data.invalidValues.length}
          </div>
        </div>

        <div class="status-item">
          <div class="status-label">
            Невалідні MGRS
          </div>
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


/*
====================================
INVALID VALUES
====================================
*/

function renderInvalidValues(items) {

  if (items.length === 0) {
    return '';
  }


  return `

    <div class="status-card">

      <h3 class="warning">
        Невалідні value
      </h3>

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


/*
====================================
INVALID MGRS
====================================
*/

function renderInvalidMgrs(items) {

  if (items.length === 0) {
    return '';
  }


  return `

    <div class="status-card">

      <h3 class="warning">
        Невалідні MGRS
      </h3>

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


/*
====================================
FAILED CONVERSION
====================================
*/

function renderFailedRows(items) {

  if (items.length === 0) {
    return '';
  }


  return `

    <div class="status-card">

      <h3 class="warning">
        Не сконвертовані координати
      </h3>

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
ESCAPE HTML
====================================
*/

function escapeHtml(value) {

  return String(value)

    .replace(/&/g, '&amp;')

    .replace(/</g, '&lt;')

    .replace(/>/g, '&gt;')

    .replace(/"/g, '&quot;')

    .replace(/'/g, '&#039;');
}