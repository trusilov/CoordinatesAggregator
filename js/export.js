async function generateValidationWorkbook(
  rows,
  invalidValues,
  invalidMgrs
) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Validation');

  worksheet.columns = [
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

  const errorMap =
    buildErrorMap(
      invalidValues,
      invalidMgrs
    );

  rows.forEach((row, index) => {
    if (index === 0 && isHeaderRow(row)) {
      return;
    }

    const sourceRowIndex = index + 1;
    const error = errorMap.get(sourceRowIndex);

    const addedRow = worksheet.addRow({
      mgrs: row[0] ?? '',
      value: row[1] ?? '',
      error: error ? error.reason : ''
    });

    if (error) {
      highlightValidationRow(addedRow, error);
    }
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

function buildErrorMap(invalidValues, invalidMgrs) {
  const errorMap = new Map();

  invalidValues.forEach((item) => {
    errorMap.set(item.rowIndex, {
      type: 'value',
      reason: item.reason
    });
  });

  invalidMgrs.forEach((item) => {
    errorMap.set(item.rowIndex, {
      type: 'mgrs',
      reason: item.reason
    });
  });

  return errorMap;
}

function highlightValidationRow(row, error) {
  const fills = {
    red: {
      type: 'pattern',
      pattern: 'solid',
      fgColor: {
        argb: 'FFFF6666'
      }
    },

    yellow: {
      type: 'pattern',
      pattern: 'solid',
      fgColor: {
        argb: 'FFFFE066'
      }
    }
  };

  const mgrsCell = row.getCell(1);
  const valueCell = row.getCell(2);
  const errorCell = row.getCell(3);

  if (error.type === 'mgrs') {
    mgrsCell.fill = fills.red;
  }

  if (error.type === 'value') {
    valueCell.fill = fills.yellow;
  }

  errorCell.fill = fills.red;
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