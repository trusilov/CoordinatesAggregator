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
  statusIndicator: document.getElementById('statusIndicator')
};

const state = {
  currentFile: null,
  latestConvertedRows: [],

  map: null,
  heatLayer: null,
  tileLayer: null,
  pointsLayer: null,

  currentTheme: 'light',
  currentLang: 'uk',
  currentStatus: 'ready',

  downloadType: null
};