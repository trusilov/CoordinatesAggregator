const basemaps = {
  dark: {
    url:
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',

    options: {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap &copy; CARTO'
    }
  },

  osm: {
    url:
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',

    options: {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }
  },

  satellite: {
    url:
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',

    options: {
      maxZoom: 19,
      attribution: 'Tiles &copy; Esri'
    }
  }
};

function renderPreview(rows) {
  if (rows.length === 0) {
    clearPreviewLayers();
    return;
  }

  const center = [
    rows[0].latitude,
    rows[0].longitude
  ];

  if (!state.map) {
    state.map =
      L.map('map')
        .setView(center, 11);

    setBasemap(
      el.basemapSelect.value
    );
  }

  clearPreviewLayers();

  const bounds =
    L.latLngBounds(
      rows.map(row => [
        row.latitude,
        row.longitude
      ])
    );

  state.map.fitBounds(
    bounds,
    {
      padding: [30, 30]
    }
  );

  const currentZoom =
    state.map.getZoom();

  const adaptiveRadius =
    Math.max(
      12,
      Math.min(
        55,
        currentZoom * 3.5
      )
    );

  if (
    el.previewModeSelect.value === 'heatmap'
  ) {
    renderHeatmap(
      rows,
      adaptiveRadius
    );
  } else {
    renderPoints(rows);
  }

  setTimeout(() => {
    state.map.invalidateSize();
  }, 100);
}

function clearPreviewLayers() {
  if (
    state.heatLayer &&
    state.map
  ) {
    state.map.removeLayer(
      state.heatLayer
    );

    state.heatLayer = null;
  }

  if (
    state.pointsLayer &&
    state.map
  ) {
    state.map.removeLayer(
      state.pointsLayer
    );

    state.pointsLayer = null;
  }
}

function renderHeatmap(
  rows,
  radius
) {
  const maxValue =
    Math.max(
      ...rows.map(row => row.value)
    );

  const heatPoints =
    rows.map(row => [
      row.latitude,
      row.longitude,
      row.value / maxValue
    ]);

  state.heatLayer =
    L.heatLayer(
      heatPoints,
      {
        radius,
        blur: radius * 0.7,
        maxZoom: 18,
        minOpacity: 0.4
      }
    ).addTo(state.map);
}

function renderPoints(rows) {
  state.pointsLayer =
    L.layerGroup();

  for (const row of rows) {
    const marker =
      L.circleMarker(
        [
          row.latitude,
          row.longitude
        ],
        {
          radius: 5,
          color: '#ffffff',
          weight: 1,
          fillColor: '#ff4d4d',
          fillOpacity: 0.9
        }
      );

    marker.bindPopup(`
      <b>MGRS:</b> ${escapeHtml(row.originalMgrs || row.mgrs || '')}<br>
      <b>${t('value')}:</b> ${row.value}<br>
      <b>Lat:</b> ${row.latitude}<br>
      <b>Lon:</b> ${row.longitude}
    `);

    state.pointsLayer.addLayer(marker);
  }

  state.pointsLayer.addTo(state.map);
}

function setBasemap(type) {
  if (!state.map) {
    return;
  }

  if (state.tileLayer) {
    state.map.removeLayer(
      state.tileLayer
    );
  }

  const selected =
    basemaps[type] ||
    basemaps.satellite;

  state.tileLayer =
    L.tileLayer(
      selected.url,
      selected.options
    ).addTo(state.map);
}