function applyTranslations() {
  document
    .querySelectorAll('[data-i18n]')
    .forEach((item) => {
      const key = item.getAttribute('data-i18n');
      item.textContent = t(key);
    });

  updateDownloadButtonText();
  refreshStatusIndicator();
}

function setReadyStatus() {
  state.currentStatus = 'ready';

  el.statusIndicator.innerHTML = t('ready');
  el.statusIndicator.style.color = 'var(--success)';
}

function setProcessingStatus() {
  state.currentStatus = 'processing';

  el.statusIndicator.innerHTML = t('processing');
  el.statusIndicator.style.color = 'var(--warning)';
}

function setErrorStatus() {
  state.currentStatus = 'error';

  el.statusIndicator.innerHTML = t('errorStatus');
  el.statusIndicator.style.color = 'var(--error)';
}

function refreshStatusIndicator() {
  if (state.currentStatus === 'processing') {
    setProcessingStatus();
    return;
  }

  if (state.currentStatus === 'error') {
    setErrorStatus();
    return;
  }

  setReadyStatus();
}

function applyTheme() {
  if (state.currentTheme === 'light') {
    document.body.classList.add('light-theme');
    el.themeToggleBtn.innerHTML = '☀ Light';
    return;
  }

  document.body.classList.remove('light-theme');
  el.themeToggleBtn.innerHTML = '🌙 Dark';
}

function toggleTheme() {
  state.currentTheme =
    state.currentTheme === 'dark'
      ? 'light'
      : 'dark';

  applyTheme();
}

function openHelpModal() {
  el.helpModal.classList.add('active');
}

function closeHelpModal() {
  el.helpModal.classList.remove('active');
}

function setDownloadLink(blob, filename, type) {
  const url = URL.createObjectURL(blob);

  state.downloadType = type;

  el.downloadLink.href = url;
  el.downloadLink.download = filename;
  el.downloadLink.style.display = 'block';

  el.downloadLink.classList.remove(
    'download-success',
    'download-error'
  );

  if (type === 'errors') {
    el.downloadLink.classList.add('download-error');
    el.downloadLink.textContent = t('downloadErrors');
    return;
  }

  if (type === 'converted') {
    el.downloadLink.classList.add('download-success');
    el.downloadLink.textContent = t('downloadConverted');
    return;
  }

  el.downloadLink.textContent = t('downloadResult');
}

function updateDownloadButtonText() {
  if (!state.downloadType) {
    el.downloadLink.textContent = t('downloadResult');
    return;
  }

  if (state.downloadType === 'errors') {
    el.downloadLink.textContent = t('downloadErrors');
    return;
  }

  if (state.downloadType === 'converted') {
    el.downloadLink.textContent = t('downloadConverted');
  }
}

function renderStatus(data) {
  el.status.innerHTML = `
    <div class="status-card">
      <h3 class="success">${t('done')}</h3>

      <div class="status-grid">

        ${renderStatusItem(t('totalRows'), data.totalRows)}
        ${renderStatusItem(t('validRows'), data.validRows)}
        ${renderStatusItem(t('uniqueRows'), data.uniqueRows)}
        ${renderStatusItem(t('convertedRows'), data.convertedRows, 'success')}
        ${renderStatusItem(t('failedRows'), data.failedRows, data.failedRows > 0 ? 'warning' : 'success')}
        ${renderStatusItem(t('duplicatesMerged'), data.duplicatesMerged, data.duplicatesMerged > 0 ? 'warning' : 'success')}
        ${renderStatusItem(t('invalidValues'), data.invalidValues.length, data.invalidValues.length > 0 ? 'warning' : 'success')}
        ${renderStatusItem(t('invalidMgrs'), data.invalidMgrs.length, data.invalidMgrs.length > 0 ? 'warning' : 'success')}

      </div>
    </div>

    ${renderInvalidValues(data.invalidValues)}
    ${renderInvalidMgrs(data.invalidMgrs)}
    ${renderFailedRows(data.failed)}
  `;
}

function renderStatusItem(label, value, className = '') {
  return `
    <div class="status-item">
      <div class="status-label">${label}</div>
      <div class="status-value ${className}">${value}</div>
    </div>
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

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}