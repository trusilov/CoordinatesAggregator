function isHeaderRow(row) {
  const firstCell =
    String(row[0] ?? '')
      .trim()
      .toLowerCase();

  const secondCell =
    String(row[1] ?? '')
      .trim()
      .toLowerCase();

  const thirdCell =
    String(row[2] ?? '')
      .trim()
      .toLowerCase();

  return (
    firstCell === 'mgrs' ||
    firstCell === 'coordinate' ||
    firstCell === 'coordinates' ||
    firstCell === 'координата' ||
    firstCell === 'координати' ||
    secondCell === 'value' ||
    secondCell === 'вага' ||
    thirdCell === 'error' ||
    thirdCell === 'помилка'
  );
}

function normalizeLookalikeLetters(value) {
  return String(value)

    .replace(/[АA]/g, 'A')
    .replace(/[ВB]/g, 'B')
    .replace(/[СC]/g, 'C')
    .replace(/[ЕE]/g, 'E')
    .replace(/[НH]/g, 'H')
    .replace(/[КK]/g, 'K')
    .replace(/[МM]/g, 'M')
    .replace(/[ОO]/g, 'O')
    .replace(/[РP]/g, 'P')
    .replace(/[ТT]/g, 'T')
    .replace(/[ХX]/g, 'X')

    .replace(/[аa]/g, 'A')
    .replace(/[вb]/g, 'B')
    .replace(/[сc]/g, 'C')
    .replace(/[еe]/g, 'E')
    .replace(/[нh]/g, 'H')
    .replace(/[кk]/g, 'K')
    .replace(/[мm]/g, 'M')
    .replace(/[оo]/g, 'O')
    .replace(/[рp]/g, 'P')
    .replace(/[тt]/g, 'T')
    .replace(/[хx]/g, 'X');
}

function normalizeMgrs(value) {
  return normalizeLookalikeLetters(value)
    .replace(/"/g, '')
    .replace(/'/g, '')
    .replace(/;/g, '')
    .replace(/,/g, '')
    .replace(/\s+/g, '')
    .toUpperCase()
    .trim();
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

    const rawWeight =
      String(weightValue ?? '')
        .trim();

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
      normalizeMgrs(mgrsValue);

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