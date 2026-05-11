const fileInput = document.getElementById('fileInput');
const processBtn = document.getElementById('processBtn');
const status = document.getElementById('status');
const downloadLink = document.getElementById('downloadLink');

let currentFile = null;

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];

  if (!file) {
    return;
  }

  currentFile = file;
  status.textContent = `Файл завантажено: ${file.name}`;
});

processBtn.addEventListener('click', () => {
  if (!currentFile) {
    status.textContent = 'Спочатку вибери CSV файл';
    return;
  }

  status.textContent = 'Читання CSV...';

  Papa.parse(currentFile, {
    header: false,
    skipEmptyLines: true,
    delimiter: "",

    complete: (results) => {
      try {
        const rows = results.data.map(row => ({
          mgrs: row[0],
          weight: row[1]
        }));

        status.textContent += `\nЗчитано рядків: ${rows.length}`;

        const validRows = [];

        for (const row of rows) {
          if (!row.mgrs) {
            continue;
          }

          const weight = Number(row.weight);

          if (isNaN(weight)) {
            continue;
          }

          const normalizedValue = String(row.mgrs)
            .replace(/"/g, '')
            .replace(/'/g, '')
            .replace(/;/g, '')
            .toUpperCase()
            .replace(/\s+/g, '')
            .trim();

          validRows.push({
            mgrs: normalizedValue,
            weight: weight
          });
        }

        status.textContent += `\nВалідних рядків: ${validRows.length}`;

        const map = new Map();

        for (const row of validRows) {
          if (map.has(row.mgrs)) {
            map.set(row.mgrs, map.get(row.mgrs) + row.weight);
          } else {
            map.set(row.mgrs, row.weight);
          }
        }

        const aggregated = Array.from(map.entries()).map(([mgrs, weight]) => ({
          mgrs,
          weight
        }));

        status.textContent += `\nУнікальних координат: ${aggregated.length}`;

        const converted = [];

        for (const row of aggregated) {
          try {
            const point = mgrs.toPoint(row.mgrs);

            if (!point || point.length !== 2) {
              continue;
            }

            const lon = point[0];
            const lat = point[1];

            if (isNaN(lat) || isNaN(lon)) {
              continue;
            }

            converted.push({
              lat: Number(lat.toFixed(6)),
              lon: Number(lon.toFixed(6)),
              weight: row.weight
            });

          } catch (err) {
            console.error('Помилка конвертації:', row.mgrs, err);
          }
        }

        status.textContent += `\nКонвертовано: ${converted.length}`;

        const csvRows = [];

        csvRows.push('latitude,longitude,value');

        for (const row of converted) {
          csvRows.push(`${row.lat},${row.lon},${row.weight}`);
        }

        const csvContent = csvRows.join('\r\n');

        const blob = new Blob(
          [csvContent],
          {
            type: 'text/plain;charset=utf-8;'
          }
        );

        const url = URL.createObjectURL(blob);

        downloadLink.href = url;
        downloadLink.download = 'aggregated_coordinates.csv';
        downloadLink.style.display = 'block';

        status.textContent += '\nГотово';

      } catch (err) {
        console.error(err);
        status.textContent = `Помилка: ${err.message}`;
      }
    },

    error: (err) => {
      console.error(err);
      status.textContent = `Помилка CSV: ${err.message}`;
    }
  });
});