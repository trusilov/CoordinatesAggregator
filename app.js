initApp();

function initApp() {
  applyTheme();
  applyTranslations();
  setReadyStatus();
  bindEvents();
}

function bindEvents() {
  el.langToggleBtn.addEventListener(
    'click',
    toggleLanguage
  );

  el.themeToggleBtn.addEventListener(
    'click',
    toggleTheme
  );

  el.clearBtn.addEventListener(
    'click',
    resetApp
  );

  el.fileInput.addEventListener(
    'change',
    handleFileSelect
  );

  el.processBtn.addEventListener(
    'click',
    handleProcessClick
  );

  el.basemapSelect.addEventListener(
    'change',
    () => {
      setBasemap(el.basemapSelect.value);
    }
  );

  el.previewModeSelect.addEventListener(
    'change',
    () => {
      if (state.latestConvertedRows.length > 0) {
        renderPreview(state.latestConvertedRows);
      }
    }
  );
}

function toggleLanguage() {
  state.currentLang =
    state.currentLang === 'uk'
      ? 'en'
      : 'uk';

  el.langToggleBtn.textContent =
    state.currentLang === 'uk'
      ? '🇺🇦 UA'
      : '🌍 EN';

  applyTranslations();
}

function resetApp() {
  el.fileInput.value = '';

  state.currentFile = null;
  state.latestConvertedRows = [];
  state.downloadType = null;

  clearPreviewLayers();

  el.status.innerHTML = '';
  el.downloadLink.style.display = 'none';

  setReadyStatus();
}

function handleFileSelect(event) {
  const file = event.target.files[0];

  if (!file) {
    return;
  }

  state.currentFile = file;
  state.latestConvertedRows = [];
  state.downloadType = null;

  clearPreviewLayers();

  el.downloadLink.style.display = 'none';

  el.status.innerHTML = `
    <div class="status-card">
      <h3>${t('fileLoaded')}</h3>
      <div>${escapeHtml(file.name)}</div>
    </div>
  `;

  setReadyStatus();
}

async function handleProcessClick() {
  if (!state.currentFile) {
    el.status.innerHTML = `
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

    state.downloadType = null;
    el.downloadLink.style.display = 'none';

    el.status.innerHTML = `
      <div class="status-card">
        <h3>${t('processingFile')}</h3>
        <div>${t('readingData')}</div>
      </div>
    `;

    const tableRows =
      await readInputFile(state.currentFile);

    const validation =
      validateAndNormalizeRows(tableRows);

    if (
      validation.invalidValues.length > 0 ||
      validation.invalidMgrs.length > 0
    ) {
      await handleValidationErrors(
        tableRows,
        validation
      );

      return;
    }

    handleSuccessfulValidation(
      tableRows,
      validation.validRows
    );

  } catch (err) {
    console.error(err);

    el.status.innerHTML = `
      <div class="status-card">
        <h3 class="error">${t('error')}</h3>
        <div>${escapeHtml(err.message)}</div>
      </div>
    `;

    setErrorStatus();
  }
}

async function handleValidationErrors(
  tableRows,
  validation
) {
  const workbookBuffer =
    await generateValidationWorkbook(
      tableRows,
      validation.invalidValues,
      validation.invalidMgrs
    );

  const blob =
    new Blob(
      [workbookBuffer],
      {
        type:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    );

  const originalName =
    getOriginalFileName(state.currentFile);

  setDownloadLink(
    blob,
    `${originalName}_validation_errors.xlsx`,
    'errors'
  );

  const errorsCount =
    validation.invalidValues.length +
    validation.invalidMgrs.length;

  el.status.innerHTML = `
    <div class="status-card">
      <h3 class="warning">${t('validationFailed')}</h3>
      <div>${t('validationFileReady')}</div>
      <div>${t('errorsFound')}: ${errorsCount}</div>
    </div>

    ${renderInvalidValues(validation.invalidValues)}
    ${renderInvalidMgrs(validation.invalidMgrs)}
  `;

  setErrorStatus();
}

function handleSuccessfulValidation(
  tableRows,
  validRows
) {
  const aggregated =
    aggregateDuplicates(validRows);

  const duplicatesMerged =
    validRows.length - aggregated.length;

  const conversion =
    convertMgrsToDD(aggregated);

  const converted =
    conversion.converted;

  const failed =
    conversion.failed;

  state.latestConvertedRows = converted;

  renderStatus({
    totalRows: tableRows.length,
    validRows: validRows.length,
    uniqueRows: aggregated.length,
    convertedRows: converted.length,
    failedRows: failed.length,
    duplicatesMerged,
    invalidValues: [],
    invalidMgrs: [],
    failed
  });

  renderPreview(converted);

  const blob =
    buildOutputFile(converted);

  const originalName =
    getOriginalFileName(state.currentFile);

  setDownloadLink(
    blob,
    `${originalName}_converted.csv`,
    'converted'
  );

  setReadyStatus();
}

function getOriginalFileName(file) {
  return file.name.replace(
    /\.[^/.]+$/,
    ''
  );
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
  if (err.message.includes('even number')) {
    return t('mgrsWrongDigits');
  }

  if (err.message.includes('Invalid zone letter')) {
    return t('mgrsInvalidZone');
  }

  if (err.message.includes('bad conversion')) {
    return t('conversionError');
  }

  return t('unknownError');
}