function loadSetting(key, fallback) {
  const value =
    localStorage.getItem(key);

  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return fallback;
  }

  return value;
}

function saveSetting(key, value) {
  localStorage.setItem(
    key,
    value
  );
}

function loadTheme() {
  return loadSetting(
    storageKeys.theme,
    'light'
  );
}

function saveTheme(value) {
  saveSetting(
    storageKeys.theme,
    value
  );
}

function loadLanguage() {
  return loadSetting(
    storageKeys.lang,
    'uk'
  );
}

function saveLanguage(value) {
  saveSetting(
    storageKeys.lang,
    value
  );
}

function loadBasemap() {
  return loadSetting(
    storageKeys.basemap,
    'satellite'
  );
}

function saveBasemap(value) {
  saveSetting(
    storageKeys.basemap,
    value
  );
}

function loadPreviewMode() {
  return loadSetting(
    storageKeys.previewMode,
    'points'
  );
}

function savePreviewMode(value) {
  saveSetting(
    storageKeys.previewMode,
    value
  );
}