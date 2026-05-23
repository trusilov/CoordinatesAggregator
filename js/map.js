const heatmapGradients = {
  classic: {
    0.2: 'blue',
    0.4: 'cyan',
    0.6: 'lime',
    0.8: 'yellow',
    1.0: 'red'
  },

  inferno: {
    0.2: '#2c115f',
    0.4: '#721f81',
    0.6: '#b63679',
    0.8: '#f1605d',
    1.0: '#fcfdbf'
  },

  blueRed: {
    0.2: '#1f4fff',
    0.4: '#00b7ff',
    0.6: '#ffff66',
    0.8: '#ff7a00',
    1.0: '#ff0000'
  },

  greenRed: {
    0.2: '#00ff66',
    0.5: '#ffff00',
    0.75: '#ff9900',
    1.0: '#ff0000'
  }
};

function initMap() {
  state.map = L.map('map', {
    zoomControl: true
  }).setView(
    [48.5, 32],
    6
  );

  setBasemap(
    el.basemapSelect.value
  );

  state.map.on(
    'zoomend',
    () => {
      if (
        state.latestConvertedRows.length > 0 &&
        el.previewModeSelect.value === 'heatmap' &&
        state.heatmapSettings.dynamicRadius
      ) {
        renderHeatmap(
          state.latestConvertedRows
        );
      }
    }
  );
}

function setBasemap(type) {
  if (state.tileLayer) {
    state.map.removeLayer(
      state.tileLayer
    );
  }

  if (type === 'satellite') {
    state.tileLayer =
      L.tileLayer(
        'https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
        {
          maxZoom: 20,
          subdomains: [
            'mt0',
            'mt1',
            'mt2',
            'mt3'
          ]
        }
      );

  } else if (type === 'dark') {
    state.tileLayer =
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
          attribution:
            '&copy; OpenStreetMap contributors'
        }
      );

  } else {
    state.tileLayer =
      L.tileLayer(
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution:
            '&copy; OpenStreetMap contributors'
        }
      );
  }

  state.tileLayer.addTo(
    state.map
  );
}

function clearPreviewLayers() {
  if (state.heatLayer) {
    state.map.removeLayer(
      state.heatLayer
    );

    state.heatLayer = null;
  }

  if (state.pointsLayer) {
    state.map.removeLayer(
      state.pointsLayer
    );

    state.pointsLayer = null;
  }
}

function renderPreview(rows) {
  clearPreviewLayers();

  if (!rows || rows.length === 0) {
    return;
  }

  const mode =
    el.previewModeSelect.value;

  if (mode === 'heatmap') {
    renderHeatmap(rows);

    el.heatmapSettings.classList.add(
      'active'
    );

    el.pointsSettings.classList.remove(
      'active'
    );

  } else {
    renderPoints(rows);

    el.heatmapSettings.classList.remove(
      'active'
    );

    el.pointsSettings.classList.add(
      'active'
    );
  }

  fitMapToRows(rows);
}

function renderPoints(rows) {
  if (state.pointsLayer) {
    state.map.removeLayer(
      state.pointsLayer
    );

    state.pointsLayer = null;
  }

  const markers =
    rows.map((row) => {
      return L.circleMarker(
        [
          row.latitude,
          row.longitude
        ],
        {
          radius:
            state.pointSettings.radius,

          weight: 1,

          color:
            state.pointSettings.color,

          fillColor:
            state.pointSettings.color,

          fillOpacity:
            state.pointSettings.opacity
        }
      ).bindPopup(`
        <b>MGRS:</b>
        ${escapeHtml(row.originalMgrs)}
        <br>
        <b>Value:</b>
        ${row.value}
      `);
    });

  state.pointsLayer =
    L.layerGroup(markers);

  state.pointsLayer.addTo(
    state.map
  );
}

function renderHeatmap(rows) {
  if (state.heatLayer) {
    state.map.removeLayer(
      state.heatLayer
    );

    state.heatLayer = null;
  }

  const heatData =
    buildHeatmapData(rows);

  state.heatLayer =
    L.heatLayer(
      heatData,
      {
        radius:
          getEffectiveHeatRadius(),

        blur:
          state.heatmapSettings.blur,

        maxZoom: 17,

        max: 1,

        minOpacity:
          0.15,

        gradient:
          heatmapGradients[
            state.heatmapSettings.gradient
          ] || heatmapGradients.classic
      }
    );

  state.heatLayer.addTo(
    state.map
  );

  applyHeatmapOpacity();
}

function buildHeatmapData(rows) {
  const values =
    rows.map((row) => row.value);

  const maxValue =
    Math.max(...values, 1);

  return rows.map((row) => {
    let intensity =
      row.value *
      state.heatmapSettings.intensity;

    if (
      state.heatmapSettings.normalize &&
      maxValue > 0
    ) {
      intensity =
        (row.value / maxValue) *
        state.heatmapSettings.intensity;
    }

    return [
      row.latitude,
      row.longitude,
      intensity
    ];
  });
}

function getEffectiveHeatRadius() {
  if (!state.heatmapSettings.dynamicRadius) {
    return state.heatmapSettings.radius;
  }

  const zoom =
    state.map.getZoom();

  const dynamicRadius =
    state.heatmapSettings.radius *
    Math.max(
      0.55,
      Math.min(
        1.4,
        10 / zoom
      )
    );

  return Math.round(dynamicRadius);
}

function applyHeatmapOpacity() {
  if (
    state.heatLayer &&
    state.heatLayer._canvas
  ) {
    state.heatLayer._canvas.style.opacity =
      state.heatmapSettings.opacity;
  }
}

function updateHeatmapSettings() {
  state.heatmapSettings.radius =
    Number(
      el.heatRadiusInput.value
    );

  state.heatmapSettings.blur =
    Number(
      el.heatBlurInput.value
    );

  state.heatmapSettings.opacity =
    Number(
      el.heatOpacityInput.value
    );

  state.heatmapSettings.intensity =
    Number(
      el.heatIntensityInput.value
    );

  state.heatmapSettings.gradient =
    el.heatGradientSelect.value;

  state.heatmapSettings.normalize =
    el.heatNormalizeInput.checked;

  state.heatmapSettings.dynamicRadius =
    el.heatDynamicRadiusInput.checked;

  syncHeatmapControls();

  saveHeatRadius(
    state.heatmapSettings.radius
  );

  saveHeatBlur(
    state.heatmapSettings.blur
  );

  saveHeatOpacity(
    state.heatmapSettings.opacity
  );

  saveHeatIntensity(
    state.heatmapSettings.intensity
  );

  saveHeatGradient(
    state.heatmapSettings.gradient
  );

  saveHeatNormalize(
    String(
      state.heatmapSettings.normalize
    )
  );

  saveHeatDynamicRadius(
    String(
      state.heatmapSettings.dynamicRadius
    )
  );

  if (
    state.latestConvertedRows.length > 0 &&
    el.previewModeSelect.value === 'heatmap'
  ) {
    renderHeatmap(
      state.latestConvertedRows
    );
  }
}

function updatePointSettings() {
  state.pointSettings.radius =
    Number(
      el.pointRadiusInput.value
    );

  state.pointSettings.opacity =
    Number(
      el.pointOpacityInput.value
    );

  state.pointSettings.color =
    el.pointColorInput.value;

  syncPointControls();

  savePointRadius(
    state.pointSettings.radius
  );

  savePointOpacity(
    state.pointSettings.opacity
  );

  savePointColor(
    state.pointSettings.color
  );

  if (
    state.latestConvertedRows.length > 0 &&
    el.previewModeSelect.value === 'points'
  ) {
    renderPoints(
      state.latestConvertedRows
    );
  }
}

function syncHeatmapControls() {
  el.heatRadiusInput.value =
    state.heatmapSettings.radius;

  el.heatBlurInput.value =
    state.heatmapSettings.blur;

  el.heatOpacityInput.value =
    state.heatmapSettings.opacity;

  el.heatIntensityInput.value =
    state.heatmapSettings.intensity;

  el.heatGradientSelect.value =
    state.heatmapSettings.gradient;

  el.heatNormalizeInput.checked =
    state.heatmapSettings.normalize;

  el.heatDynamicRadiusInput.checked =
    state.heatmapSettings.dynamicRadius;

  el.heatRadiusValue.textContent =
    state.heatmapSettings.radius;

  el.heatBlurValue.textContent =
    state.heatmapSettings.blur;

  el.heatOpacityValue.textContent =
    state.heatmapSettings.opacity;

  el.heatIntensityValue.textContent =
    state.heatmapSettings.intensity;
}

function syncPointControls() {
  el.pointRadiusInput.value =
    state.pointSettings.radius;

  el.pointOpacityInput.value =
    state.pointSettings.opacity;

  el.pointColorInput.value =
    state.pointSettings.color;

  el.pointRadiusValue.textContent =
    state.pointSettings.radius;

  el.pointOpacityValue.textContent =
    state.pointSettings.opacity;

  el.pointColorValue.textContent =
    state.pointSettings.color;
}

function fitMapToRows(rows) {
  const bounds =
    rows.map((row) => [
      row.latitude,
      row.longitude
    ]);

  if (bounds.length === 1) {
    state.map.setView(
      bounds[0],
      12
    );

    return;
  }

  state.map.fitBounds(
    bounds,
    {
      padding: [40, 40]
    }
  );
}

document.addEventListener(
  'DOMContentLoaded',
  () => {
    initMap();

    syncHeatmapControls();

    syncPointControls();
  }
);