function aggregateDuplicates(rows) {
  const map = new Map();

  for (const row of rows) {
    if (map.has(row.mgrs)) {
      const existing =
        map.get(row.mgrs);

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

  return Array.from(
    map.values()
  );
}

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
          mgrs: row.mgrs,
          reason: t('invalidCoordinateStructure')
        });

        continue;
      }

      const lon =
        point[0];

      const lat =
        point[1];

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
        latitude: Number(
          lat.toFixed(6)
        ),
        longitude: Number(
          lon.toFixed(6)
        ),
        value: row.weight
      });

    } catch (err) {
      failed.push({
        mgrs: row.mgrs,
        reason: getConversionErrorMessage(err)
      });
    }
  }

  return {
    converted,
    failed
  };
}

function getConversionErrorMessage(err) {
  if (
    err.message.includes('even number')
  ) {
    return t('mgrsWrongDigits');
  }

  if (
    err.message.includes('Invalid zone letter')
  ) {
    return t('mgrsInvalidZone');
  }

  if (
    err.message.includes('bad conversion')
  ) {
    return t('conversionError');
  }

  return t('unknownError');
}