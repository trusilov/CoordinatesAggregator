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