/**
 * ====================================================================
 * ZEDECCO GATE - Frontend Application Logic
 * Clean, lightweight, zero-ad SPA controller
 * ====================================================================
 */

let gateData = null;
let activeProtocolFilter = 'all';
let searchQuery = '';

// --- Toast Feedback ---
function showToast(message, duration = 2500) {
  let toast = document.getElementById('zgToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'zgToast';
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
    <span>${escapeHtml(message)}</span>
  `;
  toast.classList.add('show');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

// --- Clipboard Copy ---
function copyTextToClipboard(text, customMsg = 'Copied to clipboard!') {
  if (!text) return;
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(customMsg);
    }).catch(() => {
      fallbackCopy(text, customMsg);
    });
  } else {
    fallbackCopy(text, customMsg);
  }
}

function fallbackCopy(text, msg) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showToast(msg);
  } catch {
    showToast('Failed to copy');
  }
  document.body.removeChild(textArea);
}

// --- QR Code Modal ---
function openQrModal(text, title = 'Scan QR Code') {
  if (!text) return;
  const modal = document.getElementById('qrModal');
  const wrapper = document.getElementById('qrcodeWrapper');
  const titleEl = document.getElementById('qrModalTitle');
  if (!modal || !wrapper) return;

  if (titleEl) titleEl.innerText = title;
  wrapper.innerHTML = '';

  const qrImg = document.createElement('img');
  qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(text)}`;
  qrImg.alt = 'QR Code';
  qrImg.width = 240;
  qrImg.height = 240;
  wrapper.appendChild(qrImg);

  modal.classList.add('active');
}

function closeQrModal() {
  document.getElementById('qrModal')?.classList.remove('active');
}

document.getElementById('qrCloseBtn')?.addEventListener('click', closeQrModal);
document.getElementById('qrModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'qrModal') closeQrModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeQrModal();
});

// --- Theme Switcher ---
function initTheme() {
  const saved = localStorage.getItem('zg_theme') || 'dark';
  applyTheme(saved);
}

function applyTheme(theme) {
  const isLight = (theme === 'light');
  document.documentElement.setAttribute('data-theme', isLight ? 'light' : 'dark');
  document.body.setAttribute('data-theme', isLight ? 'light' : 'dark');
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  localStorage.setItem('zg_theme', next);
  showToast(`Theme: ${next === 'dark' ? 'Dark' : 'Light'}`);
}

document.getElementById('themeToggleBtn')?.addEventListener('click', toggleTheme);
initTheme();

// --- HTML Helper ---
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// --- Format Bytes ---
function formatBytes(bytes) {
  const b = Number(bytes) || 0;
  const neg = b < 0;
  let val = Math.abs(b);
  const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];
  let idx = 0;
  while (val >= 1024 && idx < units.length - 1) {
    val /= 1024;
    idx++;
  }
  return (neg ? '-' : '') + (idx === 0 ? val.toFixed(0) : val.toFixed(val >= 100 ? 0 : val >= 10 ? 1 : 2)) + ' ' + units[idx];
}

// --- Routing ---
function handleRouting() {
  let hash = window.location.hash || '#/home';
  if (hash === '#' || hash === '') hash = '#/home';
  const page = hash.replace(/^#\/?/, '').split('?')[0].toLowerCase() || 'home';

  let valid = 'home';
  if (['subs', 'sub', 'subscription'].includes(page)) valid = 'subs';
  else if (['nodes', 'node', 'configs'].includes(page)) valid = 'nodes';
  else if (['usage', 'traffic', 'stats'].includes(page)) valid = 'usage';

  document.querySelectorAll('.view-container').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-tab-btn, .mob-tab-btn').forEach(el => {
    el.classList.toggle('active', el.getAttribute('data-page') === valid);
  });

  const target = document.getElementById(`view-${valid}`);
  if (target) target.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.addEventListener('hashchange', handleRouting);

// --- Render Node Cards ---
function renderNodes() {
  const container = document.getElementById('nodesGrid');
  if (!container || !gateData) return;

  const rawNodes = gateData.nodes || [];
  const locationStr = gateData.location || 'Global';

  // Apply filters
  const filtered = rawNodes.filter(node => {
    if (!node || !node.uri) return false;
    const lowerType = (node.type || '').toLowerCase();

    // Protocol filter
    if (activeProtocolFilter !== 'all') {
      if (activeProtocolFilter === 'vless' && !lowerType.includes('vless')) return false;
      if (activeProtocolFilter === 'vmess' && !lowerType.includes('vmess')) return false;
      if (activeProtocolFilter === 'trojan' && !lowerType.includes('trojan')) return false;
      if (activeProtocolFilter === 'ss' && !(lowerType.includes('ss') || lowerType.includes('shadowsocks'))) return false;
      if (activeProtocolFilter === 'reality' && !lowerType.includes('reality')) return false;
      if (activeProtocolFilter === 'grpc' && !lowerType.includes('grpc')) return false;
      if (activeProtocolFilter === 'wg' && !(lowerType.includes('wg') || lowerType.includes('wireguard'))) return false;
    }

    // Search query filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = (node.name || '').toLowerCase().includes(q);
      const matchType = lowerType.includes(q);
      const matchUri = (node.uri || '').toLowerCase().includes(q);
      if (!matchName && !matchType && !matchUri) return false;
    }

    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-md); border: 1px dashed var(--border-subtle);">
        <p style="font-size: 1rem; font-weight: 600;">No matching proxy configurations found</p>
        <p style="font-size: 0.82rem; margin-top: 6px;">Try clearing filters or search keywords.</p>
      </div>
    `;
    return;
  }

  let html = '';
  filtered.forEach(node => {
    const rawUri = node.uri;
    const name = node.name || 'Proxy Node';
    const lowerType = (node.type || '').toLowerCase();

    let protoLabel = 'VLESS';
    let protoClass = 'vless';
    if (lowerType.includes('vmess')) { protoLabel = 'VMess'; protoClass = 'vmess'; }
    else if (lowerType.includes('trojan')) { protoLabel = 'Trojan'; protoClass = 'trojan'; }
    else if (lowerType.includes('shadowsocks') || lowerType.startsWith('ss')) { protoLabel = 'Shadowsocks'; protoClass = 'ss'; }
    else if (lowerType.includes('wireguard') || lowerType.includes('wg')) { protoLabel = 'WireGuard'; protoClass = 'wg'; }

    let badges = '';
    if (lowerType.includes('ws')) badges += '<span class="badge-feature">WS</span>';
    if (lowerType.includes('httpupgrade')) badges += '<span class="badge-feature">HTTPUpgrade</span>';
    if (lowerType.includes('grpc')) badges += '<span class="badge-feature">gRPC</span>';
    if (lowerType.includes('xhttp')) badges += '<span class="badge-feature">XHTTP</span>';
    if (lowerType.includes('reality')) badges += '<span class="badge-feature reality">Reality</span>';
    else if (lowerType.includes('tls')) badges += '<span class="badge-feature tls">TLS</span>';

    const encodedUri = encodeURIComponent(rawUri);
    const encodedTitle = encodeURIComponent(name);

    html += `
      <div class="node-item">
        <div class="node-item-top">
          <span class="node-proto-tag ${protoClass}">${protoLabel}</span>
          <div class="node-badges-list">${badges}</div>
        </div>

        <h4 class="node-title" title="${escapeHtml(name)}">${escapeHtml(name)}</h4>

        <div class="node-uri-strip" title="Click to copy URI" onclick="copyTextToClipboard(decodeURIComponent('${encodedUri}'), 'Node URI copied!')">
          ${escapeHtml(rawUri)}
        </div>

        <div class="node-actions-bar">
          <button type="button" class="btn-node-copy" onclick="copyTextToClipboard(decodeURIComponent('${encodedUri}'), 'Node URI copied!')">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
            </svg>
            <span>Copy</span>
          </button>
          <button type="button" class="btn-node-qr" title="Show QR Code" onclick="openQrModal(decodeURIComponent('${encodedUri}'), '${escapeHtml(name)}')">
            QR
          </button>
          ${node.wgConf ? `
            <a href="${node.wgConf}" download="wg0.conf" class="btn-node-qr" title="Download WireGuard Profile">.conf</a>
          ` : ''}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// --- Load Main Server Data ---
async function loadGateData() {
  try {
    const res = await fetch('/health');
    const data = await res.json();
    gateData = data;

    const pathPrefix = (window.location.pathname.split('/').filter(Boolean)[0] || 'gate').replace(/^\//, '');
    const pubPort = data.publicPort || window.location.port || '8080';
    const serverHost = data.domain || data.host || window.location.hostname;
    const locationStr = data.location || 'Global Server';

    // Format Uptime
    let uptimeStr = '--';
    if (data.uptime !== undefined) {
      const days = Math.floor(data.uptime / 86400);
      const hours = Math.floor((data.uptime % 86400) / 3600);
      const mins = Math.floor((data.uptime % 3600) / 60);
      if (days > 0) uptimeStr = `${days}d ${hours}h`;
      else if (hours > 0) uptimeStr = `${hours}h ${mins}m`;
      else uptimeStr = `${mins}m ${Math.floor(data.uptime % 60)}s`;
    }

    // Update Overview Stats
    const elLoc = document.getElementById('statLocation');
    if (elLoc) elLoc.innerText = locationStr;
    const elPort = document.getElementById('statPort');
    if (elPort) elPort.innerText = pubPort;
    const elHost = document.getElementById('statHost');
    if (elHost) elHost.innerText = serverHost;
    const elUptime = document.getElementById('statUptime');
    if (elUptime) elUptime.innerText = uptimeStr;

    // Update Engine Tags
    const engines = [];
    if (data.engines?.singbox) engines.push('sing-box');
    if (data.engines?.xray) engines.push('Xray-core');
    if (data.engines?.argo) engines.push('Argo Tunnel');
    const elEngines = document.getElementById('engineTags');
    if (elEngines) {
      elEngines.innerHTML = engines.map(e => `<span class="engine-pill active">${e}</span>`).join('') || '<span class="engine-pill active">Core Active</span>';
    }

    // Protocol switcher state
    let activeProto = (data.forceHttps || window.location.protocol === 'https:') ? 'https:' : 'http:';

    const updateSubUrls = (proto) => {
      let origin;
      if (data.publicBaseUrl && typeof data.publicBaseUrl === 'string' && data.publicBaseUrl.trim()) {
        origin = data.publicBaseUrl.trim().replace(/\/+$/, '');
      } else if (data.subBase && typeof data.subBase === 'string' && data.subBase.trim()) {
        origin = data.subBase.trim().replace(/\/+$/, '');
      } else {
        const hostPort = window.location.port ? `${window.location.hostname}:${window.location.port}` : window.location.hostname;
        if (proto === 'https:') {
          origin = data.domain ? (data.domain.startsWith('http') ? data.domain : `https://${data.domain}`) : `https://${hostPort}`;
        } else {
          origin = `http://${hostPort}`;
        }
      }

      const tok = data.subToken ? encodeURIComponent(data.subToken) : '';
      const withTok = (url) => tok ? `${url}${url.includes('?') ? '&' : '?'}token=${tok}` : url;

      const subCompat = withTok(`${origin}/${pathPrefix}/base64`);
      const subFull = withTok(`${origin}/${pathPrefix}/base64?compat=full`);
      const subClash = withTok(`${origin}/${pathPrefix}/clash`);
      const subSb = withTok(`${origin}/${pathPrefix}/sb/raw`);
      const subWg = withTok(`${origin}/${pathPrefix}/wg.conf`);

      const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
      setVal('urlSubCompat', subCompat);
      setVal('urlSubFull', subFull);
      setVal('urlSubClash', subClash);
      setVal('urlSubSb', subSb);
      setVal('urlSubWg', subWg);

      const btnDlWg = document.getElementById('btnDownloadWg');
      if (btnDlWg) btnDlWg.href = `${origin}/${pathPrefix}/wg.conf`;
    };

    updateSubUrls(activeProto);

    // Setup interactive protocol toggle buttons
    const btnHttp = document.getElementById('protoBtnHttp');
    const btnHttps = document.getElementById('protoBtnHttps');
    if (btnHttp && btnHttps) {
      btnHttp.classList.toggle('active', activeProto === 'http:');
      btnHttps.classList.toggle('active', activeProto === 'https:');

      btnHttp.onclick = () => {
        activeProto = 'http:';
        btnHttp.classList.add('active');
        btnHttps.classList.remove('active');
        updateSubUrls('http:');
        showToast('Switched to HTTP (v2rayN Windows compatible)');
      };

      btnHttps.onclick = () => {
        activeProto = 'https:';
        btnHttps.classList.add('active');
        btnHttp.classList.remove('active');
        updateSubUrls('https:');
        showToast('Switched to HTTPS (Requires SSL Proxy/Domain)');
      };
    }

    renderNodes();
  } catch (err) {
    console.error('Failed to load server data:', err);
    showToast('Failed to connect to gateway');
  }
}

// --- Traffic Usage Controller ---
(function initTrafficMeter() {
  const $ = (id) => document.getElementById(id);
  const pathPrefix = (window.location.pathname.split('/').filter(Boolean)[0] || 'gate').replace(/^\//, '');
  const API = `/${pathPrefix}/api/traffic`;

  const PROTO_COLORS = {
    'VLESS-WS': '#3b82f6',
    'VMess-WS': '#a855f7',
    'Trojan-WS': '#f43f5e',
    'VLESS-XHTTP': '#06b6d4',
    'VLESS-HTTPUpgrade': '#f59e0b',
    'VMess-HTTPUpgrade': '#c084fc',
    'Trojan-HTTPUpgrade': '#fb7185',
    'VLESS-gRPC': '#10b981',
    'Shadowsocks-WS': '#fb923c',
    'Other': '#64748b'
  };

  const sumTotal = (e) => e ? (e.up || 0) + (e.down || 0) : 0;
  let timer = null;

  function renderTraffic(data) {
    if (!data || !data.ok) return;

    // Live speeds
    const elLiveUp = $('liveSpeedUp');
    const elLiveDown = $('liveSpeedDown');
    if (elLiveUp) elLiveUp.innerText = formatBytes(data.live?.upBps || 0) + '/s';
    if (elLiveDown) elLiveDown.innerText = formatBytes(data.live?.downBps || 0) + '/s';

    // Day, Month, All-Time
    const setVal = (id, val) => { const el = $(id); if (el) el.innerText = val; };
    setVal('usageDayTotal', formatBytes(data.day?.total));
    setVal('usageDayUp', formatBytes(data.day?.up));
    setVal('usageDayDown', formatBytes(data.day?.down));

    setVal('usageMonthTotal', formatBytes(data.month?.used));
    setVal('usageMonthUp', formatBytes(data.month?.up));
    setVal('usageMonthDown', formatBytes(data.month?.down));
    setVal('usageMonthKey', data.month?.key ? `(${data.month.key})` : '');

    setVal('usageAllTotal', formatBytes(data.allTime?.total));
    setVal('usageAllUp', formatBytes(data.allTime?.up));
    setVal('usageAllDown', formatBytes(data.allTime?.down));

    // Limit progress bar
    const limitCard = $('limitCard');
    if (data.limit && limitCard) {
      limitCard.style.display = 'block';
      const pct = Math.max(0, data.limit.pct || 0);
      limitCard.className = `limit-alert-card ${data.limit.level === 'over' ? 'over' : data.limit.level === 'warn' ? 'warn' : ''}`;
      setVal('limitText', `${formatBytes(data.limit.used)} of ${formatBytes(data.limit.bytes)} used`);
      setVal('limitPct', `${pct.toFixed(1)}%`);
      const fill = $('limitProgressFill');
      if (fill) fill.style.width = `${Math.min(100, pct).toFixed(2)}%`;
      setVal('limitMsg', data.limit.level === 'over' ? 'Monthly traffic quota reached.' : data.limit.level === 'warn' ? `Over 80% used — ${formatBytes(data.limit.remaining)} remaining.` : `${formatBytes(data.limit.remaining)} remaining this month.`);
    } else if (limitCard) {
      limitCard.style.display = 'none';
    }

    // Traffic Table Rows
    const rowsContainer = $('trafficRows');
    if (rowsContainer) {
      const keys = data.keys || [];
      const visibleKeys = keys.filter(k => ['VLESS-WS', 'VMess-WS', 'Trojan-WS', 'VLESS-XHTTP'].includes(k) || sumTotal(data.allTime?.per?.[k]) > 0 || (data.active?.[k] || 0) > 0);
      let rowsHtml = '';
      visibleKeys.forEach(k => {
        const m = data.month?.per?.[k] || {};
        const act = data.active?.[k] || 0;
        const color = PROTO_COLORS[k] || '#94a3b8';

        rowsHtml += `
          <tr>
            <td>
              <div class="proto-cell">
                <span class="proto-color-dot" style="background: ${color};"></span>
                <span>${k}</span>
              </div>
            </td>
            <td><span class="active-conn-badge ${act ? 'on' : ''}">${act}</span></td>
            <td>${formatBytes(sumTotal(data.day?.per?.[k]))}</td>
            <td>${formatBytes(m.up)}</td>
            <td>${formatBytes(m.down)}</td>
            <td><strong>${formatBytes(sumTotal(m))}</strong></td>
            <td>${formatBytes(sumTotal(data.allTime?.per?.[k]))}</td>
          </tr>
        `;
      });
      rowsContainer.innerHTML = rowsHtml;
    }
  }

  async function fetchTraffic() {
    try {
      const res = await fetch(API, { cache: 'no-store' });
      if (res.ok) renderTraffic(await res.json());
    } catch {}
  }

  async function postTraffic(subpath, body) {
    const res = await fetch(`${API}${subpath}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-BK-Req': '1' },
      body: JSON.stringify(body || {})
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    renderTraffic(await res.json());
  }

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      await fetchTraffic();
      schedule();
    }, 3000);
  }

  // Sync button
  $('btnSyncTraffic')?.addEventListener('click', async () => {
    const inp = $('inputSyncGb');
    const gb = parseFloat(inp?.value);
    if (!isFinite(gb) || gb < 0) {
      showToast('Please enter a valid GiB number');
      return;
    }
    try {
      await postTraffic('/baseline', { gb });
      if (inp) inp.value = '';
      showToast('Baseline synchronized successfully');
    } catch {
      showToast('Failed to sync baseline');
    }
  });

  // Reset button
  $('btnResetTraffic')?.addEventListener('click', async () => {
    if (!window.confirm('Reset all traffic counters (Day, Month, All-Time)?')) return;
    try {
      await postTraffic('/reset');
      showToast('Traffic counters reset');
    } catch {
      showToast('Failed to reset traffic');
    }
  });

  fetchTraffic();
  schedule();
})();

// --- Search & Filters Init ---
document.addEventListener('DOMContentLoaded', () => {
  handleRouting();
  loadGateData();

  // Search input
  const searchInput = document.getElementById('nodeSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      renderNodes();
    });
  }

  // Protocol filter pills
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeProtocolFilter = btn.getAttribute('data-filter') || 'all';
      renderNodes();
    });
  });

  // Event Delegation for Copy & QR buttons
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.getAttribute('data-action');
    const targetId = btn.getAttribute('data-target');
    const input = targetId ? document.getElementById(targetId) : null;

    if (action === 'copy-input' && input) {
      copyTextToClipboard(input.value);
    } else if (action === 'qr-input' && input) {
      openQrModal(input.value, btn.getAttribute('data-title') || 'Subscription QR');
    }
  });
});
