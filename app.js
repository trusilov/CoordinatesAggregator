initApp();

function initApp() {
  applySavedSelectValues();
  applyTheme();
  updateLanguageButton();
  applyTranslations();
  setReadyStatus();
  bindEvents();
}

function applySavedSelectValues() {

  el.basemapSelect.value =
    loadBasemap();

  el.previewModeSelect.value =
    loadPreviewMode();
}

function updateLanguageButton() {

  el.langToggleBtn.textContent =
    state.currentLang === 'uk'
      ? '🇺🇦 UA'
      : '🌍 EN';
}

function bindEvents() {

  el.helpBtn.addEventListener(
    'click',
    openHelpModal
  );

  el.closeHelpBtn.addEventListener(
    'click',
    closeHelpModal
  );

  el.helpModal.addEventListener(
    'click',
    (event) => {

      if (
        event.target === el.helpModal
      ) {
        closeHelpModal();
      }
    }
  );

  document.addEventListener(
    'keydown',
    (event) => {

      if (
        event.key === 'Escape'
      ) {
        closeHelpModal();
      }
    }
  );

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

      saveBasemap(
        el.basemapSelect.value
      );

      setBasemap(
        el.basemapSelect.value
      );
    }
  );

  el.previewModeSelect.addEventListener(
    'change',
    () => {

      savePreviewMode(
        el.previewModeSelect.value
      );

      if (
        state.latestConvertedRows.length > 0
      ) {

        renderPreview(
          state.latestConvertedRows
        );
      }
    }
  );
}

function toggleLanguage() {

  state.currentLang =
    state.currentLang === 'uk'
      ? 'en'
      : 'uk';

  saveLanguage(
    state.currentLang
  );

  updateLanguageButton();

  applyTranslations();
}

function resetApp() {

  el.fileInput.value = '';

  state.currentFile = null;

  state.latestConvertedRows = [];

  state.downloadType = null;

  clearPreviewLayers();

  el.status.innerHTML = '';

  el.downloadLink.style.display =
    'none';

  setReadyStatus();
}

function handleFileSelect(event) {

  const file =
    event.target.files[0];

  if (!file) {
    return;
  }

  state.currentFile = file;

  state.latestConvertedRows = [];

  state.downloadType = null;

  clearPreviewLayers();

  el.downloadLink.style.display =
    'none';

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

    el.downloadLink.style.display =
      'none';

    el.status.innerHTML = `
      <div class="status-card">
        <h3>${t('processingFile')}</h3>
        <div>${t('readingData')}</div>
      </div>
    `;

    const tableRows =
      await readInputFile(
        state.currentFile
      );

    const validation =
      validateAndNormalizeRows(
        tableRows
      );

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
    getOriginalFileName(
      state.currentFile
    );

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
    aggregateDuplicates(
      validRows
    );

  const duplicatesMerged =
    validRows.length -
    aggregated.length;

  const conversion =
    convertMgrsToDD(
      aggregated
    );

  const converted =
    conversion.converted;

  const failed =
    conversion.failed;

  state.latestConvertedRows =
    converted;

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

    duplicatesMerged,

    invalidValues: [],

    invalidMgrs: [],

    failed
  });

  renderPreview(
    converted
  );

  const blob =
    buildOutputFile(
      converted
    );

  const originalName =
    getOriginalFileName(
      state.currentFile
    );

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