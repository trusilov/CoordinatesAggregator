const el = {
  fileInput: document.getElementById('fileInput'),
  processBtn: document.getElementById('processBtn'),
  clearBtn: document.getElementById('clearBtn'),

  status: document.getElementById('status'),
  downloadLink: document.getElementById('downloadLink'),

  basemapSelect: document.getElementById('basemapSelect'),
  previewModeSelect: document.getElementById('previewModeSelect'),

  themeToggleBtn: document.getElementById('themeToggleBtn'),
  langToggleBtn: document.getElementById('langToggleBtn'),
  statusIndicator: document.getElementById('statusIndicator'),

  helpBtn: document.getElementById('helpBtn'),
  helpModal: document.getElementById('helpModal'),
  closeHelpBtn: document.getElementById('closeHelpBtn'),

  heatmapSettings: document.getElementById('heatmapSettings'),
  heatRadiusInput: document.getElementById('heatRadiusInput'),
  heatBlurInput: document.getElementById('heatBlurInput'),
  heatOpacityInput: document.getElementById('heatOpacityInput'),
  heatIntensityInput: document.getElementById('heatIntensityInput'),
  heatGradientSelect: document.getElementById('heatGradientSelect'),
  heatNormalizeInput: document.getElementById('heatNormalizeInput'),
  heatDynamicRadiusInput: document.getElementById('heatDynamicRadiusInput'),

  heatRadiusValue: document.getElementById('heatRadiusValue'),
  heatBlurValue: document.getElementById('heatBlurValue'),
  heatOpacityValue: document.getElementById('heatOpacityValue'),
  heatIntensityValue: document.getElementById('heatIntensityValue'),

  pointsSettings: document.getElementById('pointsSettings'),
  pointRadiusInput: document.getElementById('pointRadiusInput'),
  pointOpacityInput: document.getElementById('pointOpacityInput'),
  pointColorInput: document.getElementById('pointColorInput'),
  pointRadiusValue: document.getElementById('pointRadiusValue'),
  pointOpacityValue: document.getElementById('pointOpacityValue'),
  pointColorValue: document.getElementById('pointColorValue')
};

const storageKeys = {
  theme: 'coordinatesAggregator.theme',
  lang: 'coordinatesAggregator.lang',
  basemap: 'coordinatesAggregator.basemap',
  previewMode: 'coordinatesAggregator.previewMode',

  heatRadius: 'coordinatesAggregator.heatRadius',
  heatBlur: 'coordinatesAggregator.heatBlur',
  heatOpacity: 'coordinatesAggregator.heatOpacity',
  heatIntensity: 'coordinatesAggregator.heatIntensity',
  heatGradient: 'coordinatesAggregator.heatGradient',
  heatNormalize: 'coordinatesAggregator.heatNormalize',
  heatDynamicRadius: 'coordinatesAggregator.heatDynamicRadius',

  pointRadius: 'coordinatesAggregator.pointRadius',
  pointOpacity: 'coordinatesAggregator.pointOpacity',
  pointColor: 'coordinatesAggregator.pointColor'
};

const state = {
  currentFile: null,
  latestConvertedRows: [],

  map: null,
  heatLayer: null,
  tileLayer: null,
  pointsLayer: null,

  currentTheme: loadTheme(),
  currentLang: loadLanguage(),
  currentStatus: 'ready',

  downloadType: null,

  heatmapSettings: {
    radius: Number(loadSetting(storageKeys.heatRadius, 35)),
    blur: Number(loadSetting(storageKeys.heatBlur, 25)),
    opacity: Number(loadSetting(storageKeys.heatOpacity, 0.65)),
    intensity: Number(loadSetting(storageKeys.heatIntensity, 1)),
    gradient: loadSetting(storageKeys.heatGradient, 'classic'),
    normalize: loadSetting(storageKeys.heatNormalize, 'true') === 'true',
    dynamicRadius: loadSetting(storageKeys.heatDynamicRadius, 'false') === 'true'
  },

  pointSettings: {
    radius: Number(loadSetting(storageKeys.pointRadius, 5)),
    opacity: Number(loadSetting(storageKeys.pointOpacity, 0.7)),
    color: loadSetting(storageKeys.pointColor, '#4f8cff')
  }
};