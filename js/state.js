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
  closeHelpBtn: document.getElementById('closeHelpBtn')
};

const storageKeys = {
  theme: 'coordinatesAggregator.theme',
  lang: 'coordinatesAggregator.lang',
  basemap: 'coordinatesAggregator.basemap',
  previewMode: 'coordinatesAggregator.previewMode'
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

  downloadType: null
};