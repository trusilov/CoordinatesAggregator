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

function saveHeatRadius(value) {

  saveSetting(
    storageKeys.heatRadius,
    value
  );
}

function saveHeatBlur(value) {

  saveSetting(
    storageKeys.heatBlur,
    value
  );
}

function saveHeatOpacity(value) {

  saveSetting(
    storageKeys.heatOpacity,
    value
  );
}

function saveHeatIntensity(value) {

  saveSetting(
    storageKeys.heatIntensity,
    value
  );
}

function saveHeatGradient(value) {

  saveSetting(
    storageKeys.heatGradient,
    value
  );
}

function saveHeatNormalize(value) {

  saveSetting(
    storageKeys.heatNormalize,
    value
  );
}

function saveHeatDynamicRadius(value) {

  saveSetting(
    storageKeys.heatDynamicRadius,
    value
  );
}

function savePointRadius(value) {

  saveSetting(
    storageKeys.pointRadius,
    value
  );
}

function savePointOpacity(value) {

  saveSetting(
    storageKeys.pointOpacity,
    value
  );
}

function savePointColor(value) {

  saveSetting(
    storageKeys.pointColor,
    value
  );
}