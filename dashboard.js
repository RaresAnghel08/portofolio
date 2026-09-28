(function () {
  'use strict';

  var STORAGE_KEY = 'dash_pw';
  var gate = document.getElementById('gate');
  var gateForm = document.getElementById('gate-form');
  var gateInput = document.getElementById('gate-input');
  var gateError = document.getElementById('gate-error');
  var dash = document.getElementById('dash');
  var tooltip = document.getElementById('tooltip');
  var currentDays = 30;

  var DEVICE_COLORS = {
    'Desktop': '#2a78d6',
    'Mobile': '#eb6834',
    'Tablet': '#1baf7a'
  };
  var DEVICE_FALLBACK = '#898781';

  function fmtCompact(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return String(n);
  }

  function fmtDuration(seconds) {
    if (seconds < 60) return seconds + 's';
    var m = Math.floor(seconds / 60);
    var s = seconds % 60;
    return m + 'm ' + s + 's';
  }

  function showTooltip(x, y, html) {
    tooltip.innerHTML = '';
    tooltip.appendChild(html);
    tooltip.style.display = 'block';
    tooltip.style.left = (x + 14) + 'px';
    tooltip.style.top = (y + 14) + 'px';
  }

  function hideTooltip() {
    tooltip.style.display = 'none';
  }

  function tooltipContent(valueText, labelText) {
    var frag = document.createDocumentFragment();
    var strong = document.createElement('strong');
    strong.textContent = valueText;
    frag.appendChild(strong);
    if (labelText) {
      var span = document.createElement('span');
      span.textContent = ' — ' + labelText;
      frag.appendChild(span);
    }
    return frag;
  }

  // ---- Auth / gate ----

  function tryLoad(pw) {
    return fetch('/api/dashboard-stats?days=' + currentDays, {
      headers: { Authorization: 'Bearer ' + pw }
    }).then(function (r) {
      if (r.status === 401) throw new Error('unauthorized');
      if (!r.ok) throw new Error('server error');
      return r.json();
    });
  }

  function unlockWith(pw, fromStorage) {
    return tryLoad(pw).then(function (data) {
      sessionStorage.setItem(STORAGE_KEY, pw);
      gate.hidden = true;
      dash.hidden = false;
      render(data);
      return true;
    }).catch(function (err) {
      if (!fromStorage) {
        gateError.hidden = false;
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
      return false;
    });
  }

  gateForm.addEventListener('submit', function (e) {
    e.preventDefault();
    gateError.hidden = true;
    unlockWith(gateInput.value, false);
  });

  var stored = sessionStorage.getItem(STORAGE_KEY);
  if (stored) unlockWith(stored, true);

  // ---- Filters ----

  var filterButtons = document.querySelectorAll('.dash-filters button');
  filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterButtons.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentDays = parseInt(btn.getAttribute('data-days'), 10);
      var pw = sessionStorage.getItem(STORAGE_KEY);
      if (!pw) return;
      dash.setAttribute('data-loading', 'true');
      tryLoad(pw).then(function (data) {
        dash.removeAttribute('data-loading');
        render(data);
      }).catch(function () {
        dash.removeAttribute('data-loading');
      });
    });
  });

  // ---- Rendering ----

  function render(data) {
    renderTiles(data.totals);
    renderSitesTable(document.getElementById('table-sites'), data.sites_table);
    renderLineChart(document.getElementById('chart-pageviews'), data.pageviews_by_day);
    renderBarChart(document.getElementById('chart-sites'), data.top_sites, { color: 'var(--accent)' });
    renderBarChart(document.getElementById('chart-pages'), data.top_pages, { color: 'var(--accent)' });
    renderBarChart(document.getElementById('chart-clicks'), data.top_clicks, { color: 'var(--accent)' });
    renderBarChart(document.getElementById('chart-referrers'), data.top_referrers, { color: 'var(--accent)' });
    renderBarChart(document.getElementById('chart-devices'), data.device_breakdown, {
      colorFor: function (label) { return DEVICE_COLORS[label] || DEVICE_FALLBACK; },
      showSwatch: true
    });
  }

  function renderTiles(totals) {
    var tiles = [
      { label: 'Unique visitors', value: fmtCompact(totals.unique_visitors) },
      { label: 'Pageviews', value: fmtCompact(totals.pageviews) },
      { label: 'Sessions', value: fmtCompact(totals.sessions) },
      { label: 'Avg. time on page', value: fmtDuration(totals.avg_time_on_page_seconds) },
      { label: 'Clicks tracked', value: fmtCompact(totals.clicks_tracked) },
      { label: 'Sites tracked', value: fmtCompact(totals.sites_tracked) }
    ];
    var container = document.getElementById('tiles');
    container.innerHTML = '';
    tiles.forEach(function (t) {
      var el = document.createElement('div');
      el.className = 'dash-tile';
      var label = document.createElement('div');
      label.className = 'dash-tile-label';
      label.textContent = t.label;
      var value = document.createElement('div');
      value.className = 'dash-tile-value';
      value.textContent = t.value;
      el.appendChild(label);
      el.appendChild(value);
      container.appendChild(el);
    });
  }

  function buildTable(columns, rows) {
    var table = document.createElement('table');
    table.className = 'dash-table';

    var thead = document.createElement('thead');
    var headRow = document.createElement('tr');
    columns.forEach(function (c) {
      var th = document.createElement('th');
      th.textContent = c;
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    var tbody = document.createElement('tbody');
    rows.forEach(function (r) {
      var tr = document.createElement('tr');
      r.forEach(function (cell) {
        var td = document.createElement('td');
        td.textContent = cell;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    return table;
  }

  function addTableToggle(container, columns, rows) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'dash-table-toggle';
    btn.textContent = 'View as table';
    var table = buildTable(columns, rows);
    table.hidden = true;

    btn.addEventListener('click', function () {
      table.hidden = !table.hidden;
      btn.textContent = table.hidden ? 'View as table' : 'Hide table';
    });

    container.appendChild(btn);
    container.appendChild(table);
  }

  function renderSitesTable(container, sitesTable) {
    container.innerHTML = '';
    if (!sitesTable || !sitesTable.length) {
      var empty = document.createElement('div');
      empty.className = 'dash-empty';
      empty.textContent = 'No data yet for this range.';
      container.appendChild(empty);
      return;
    }
    var rows = sitesTable.map(function (s) {
      return [s.site, fmtCompact(s.pageviews), fmtCompact(s.unique_visitors), fmtDuration(s.avg_time_on_page_seconds)];
    });
    container.appendChild(buildTable(['Site', 'Pageviews', 'Unique visitors', 'Avg. time on page'], rows));
  }

  function renderBarChart(container, items, opts) {
    container.innerHTML = '';
    opts = opts || {};
    if (!items || !items.length) {
      var empty = document.createElement('div');
      empty.className = 'dash-empty';
      empty.textContent = 'No data yet for this range.';
      container.appendChild(empty);
      return;
    }
    var max = Math.max.apply(null, items.map(function (i) { return i.count; })) || 1;
    var list = document.createElement('div');
    list.className = 'bar-list';

    items.forEach(function (item) {
      var row = document.createElement('div');
      row.className = 'bar-row';
      row.tabIndex = 0;

      var label = document.createElement('div');
      label.className = 'bar-label';
      if (opts.showSwatch) {
        var swatch = document.createElement('span');
        swatch.className = 'bar-swatch';
        swatch.style.background = opts.colorFor ? opts.colorFor(item.label) : opts.color;
        label.appendChild(swatch);
      }
      var labelText = document.createElement('span');
      labelText.textContent = item.label;
      label.appendChild(labelText);
      label.title = item.label;

      var track = document.createElement('div');
      track.className = 'bar-track';
      var fill = document.createElement('div');
      fill.className = 'bar-fill';
      fill.style.width = Math.max(3, (item.count / max) * 100) + '%';
      fill.style.background = opts.colorFor ? opts.colorFor(item.label) : opts.color;
      track.appendChild(fill);

      var value = document.createElement('div');
      value.className = 'bar-value';
      value.textContent = fmtCompact(item.count);

      row.appendChild(label);
      row.appendChild(track);
      row.appendChild(value);

      var showTip = function (e) {
        showTooltip(e.clientX, e.clientY, tooltipContent(String(item.count), item.label));
      };
      row.addEventListener('pointermove', showTip);
      row.addEventListener('pointerenter', showTip);
      row.addEventListener('pointerleave', hideTooltip);
      row.addEventListener('focus', function () {
        var r = row.getBoundingClientRect();
        showTooltip(r.right, r.top, tooltipContent(String(item.count), item.label));
      });
      row.addEventListener('blur', hideTooltip);

      list.appendChild(row);
    });

    container.appendChild(list);
    addTableToggle(container, ['Label', 'Count'], items.map(function (i) { return [i.label, i.count]; }));
  }

  function renderLineChart(container, series) {
    container.innerHTML = '';
    if (!series || !series.length) {
      var empty = document.createElement('div');
      empty.className = 'dash-empty';
      empty.textContent = 'No data yet for this range.';
      container.appendChild(empty);
      return;
    }

    var wrap = document.createElement('div');
    wrap.className = 'line-chart-wrap';

    var W = 1000, H = 200, padL = 8, padR = 8, padT = 12, padB = 24;
    var max = Math.max.apply(null, series.map(function (d) { return d.count; })) || 1;
    var n = series.length;

    function x(i) { return padL + (i / Math.max(1, n - 1)) * (W - padL - padR); }
    function y(v) { return padT + (1 - v / max) * (H - padT - padB); }

    var points = series.map(function (d, i) { return [x(i), y(d.count)]; });
    var pathD = points.map(function (p, i) { return (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ');
    var areaD = pathD + ' L' + x(n - 1).toFixed(1) + ',' + (H - padB) + ' L' + x(0).toFixed(1) + ',' + (H - padB) + ' Z';

    var svgNS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('preserveAspectRatio', 'none');

    var gridTop = document.createElementNS(svgNS, 'line');
    gridTop.setAttribute('class', 'line-gridline');
    gridTop.setAttribute('x1', padL); gridTop.setAttribute('x2', W - padR);
    gridTop.setAttribute('y1', padT); gridTop.setAttribute('y2', padT);
    svg.appendChild(gridTop);

    var gridBase = document.createElementNS(svgNS, 'line');
    gridBase.setAttribute('class', 'line-gridline');
    gridBase.setAttribute('x1', padL); gridBase.setAttribute('x2', W - padR);
    gridBase.setAttribute('y1', H - padB); gridBase.setAttribute('y2', H - padB);
    svg.appendChild(gridBase);

    var maxLabel = document.createElementNS(svgNS, 'text');
    maxLabel.setAttribute('class', 'line-axis-label');
    maxLabel.setAttribute('x', padL); maxLabel.setAttribute('y', padT - 3);
    maxLabel.textContent = String(max);
    svg.appendChild(maxLabel);

    var area = document.createElementNS(svgNS, 'path');
    area.setAttribute('class', 'line-area');
    area.setAttribute('d', areaD);
    svg.appendChild(area);

    var path = document.createElementNS(svgNS, 'path');
    path.setAttribute('class', 'line-path');
    path.setAttribute('d', pathD);
    svg.appendChild(path);

    [0, Math.floor((n - 1) / 2), n - 1].forEach(function (i) {
      var t = document.createElementNS(svgNS, 'text');
      t.setAttribute('class', 'line-axis-label');
      t.setAttribute('x', x(i));
      t.setAttribute('y', H - 6);
      t.setAttribute('text-anchor', i === 0 ? 'start' : (i === n - 1 ? 'end' : 'middle'));
      t.textContent = series[i].date.slice(5);
      svg.appendChild(t);
    });

    var crosshair = document.createElementNS(svgNS, 'line');
    crosshair.setAttribute('class', 'line-crosshair');
    crosshair.setAttribute('y1', padT); crosshair.setAttribute('y2', H - padB);
    svg.appendChild(crosshair);

    var dot = document.createElementNS(svgNS, 'circle');
    dot.setAttribute('class', 'line-dot');
    dot.setAttribute('r', 4);
    svg.appendChild(dot);

    var hitLayer = document.createElementNS(svgNS, 'rect');
    hitLayer.setAttribute('x', 0); hitLayer.setAttribute('y', 0);
    hitLayer.setAttribute('width', W); hitLayer.setAttribute('height', H);
    hitLayer.setAttribute('fill', 'transparent');
    svg.appendChild(hitLayer);

    function handleMove(clientX, clientY, svgX) {
      var i = Math.round((svgX - padL) / (W - padL - padR) * (n - 1));
      i = Math.max(0, Math.min(n - 1, i));
      var px = x(i), py = y(series[i].count);
      crosshair.setAttribute('x1', px); crosshair.setAttribute('x2', px);
      crosshair.style.opacity = 1;
      dot.setAttribute('cx', px); dot.setAttribute('cy', py);
      dot.style.opacity = 1;
      showTooltip(clientX, clientY, tooltipContent(String(series[i].count), series[i].date));
    }

    svg.addEventListener('pointermove', function (e) {
      var rect = svg.getBoundingClientRect();
      var svgX = (e.clientX - rect.left) / rect.width * W;
      handleMove(e.clientX, e.clientY, svgX);
    });
    svg.addEventListener('pointerleave', function () {
      crosshair.style.opacity = 0;
      dot.style.opacity = 0;
      hideTooltip();
    });

    wrap.appendChild(svg);
    container.appendChild(wrap);
    addTableToggle(container, ['Date', 'Pageviews'], series.map(function (d) { return [d.date, d.count]; }));
  }
})();
