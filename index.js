/**
 * ====================================================================
 *             CLOUD STREAM GATEWAY & APPLICATION ROUTER
 * ====================================================================
 * High-performance edge application router and real-time stream service.
 * Multiplexed protocol gateway for cloud environments and containers.
 * ====================================================================
 */

// ========== CONFIGURATION DEFAULTS ==========
const BK_CONFIG = {
  brand: "Zedecco Gate",
  product: "Zedecco Gate",
  nodePrefix: process.env.NODE_PREFIX || "Zedecco - ",
  publicPort: parseInt(process.env.PORT || process.env.SERVER_PORT || '8080', 10) || 8080,
  panelPath: process.env.PANEL_PATH || "gate",
  dataDirHint: "/data",
  uuid: "",
  panelToken: process.env.PANEL_TOKEN || "",
  domain: process.env.DOMAIN || process.env.RAILWAY_PUBLIC_DOMAIN || "",
  forceHost: process.env.FORCE_HOST || "",
  publicBaseUrl: process.env.PUBLIC_BASE_URL || process.env.SUB_BASE_URL || (process.env.RAILWAY_PUBLIC_DOMAIN ? "https://" + process.env.RAILWAY_PUBLIC_DOMAIN : ""),
  subBase: process.env.SUB_BASE || "",
  forceHttps: process.env.FORCE_HTTPS === 'true' || !!process.env.RAILWAY_PUBLIC_DOMAIN || !!process.env.REPLIT_DEPLOYMENT,
  allowLocalHostLinks: false,
  sniHy2: "www.google.com",
  massProxyUrl: "https://www.gstatic.com",
  enable: {
    hysteria2: false,
    vlessWs: true,
    vlessWsTls: true,
    vlessHttpUpgrade: true,
    vmessHttpUpgrade: true,
    trojanHttpUpgrade: true,
    vlessGrpc: true,
    vlessGrpcTls: true,
    trojanWs: true,
    trojanWsTls: true,
    trojanGrpcTls: false,
    vmessWsTls: true,
    vmessWs: true,
    vlessXhttp: true,
    ssWs: true,
    reality: false,
    shadowTlsVless: false,
    shadowsocks: false,
    wireguard: false,
    tuic: false,
    socks: false,
    httpProxy: false,
    argo: false
  },
  reality: {
    target: "www.microsoft.com",
    targetPort: 443,
    shortId: ""
  },
  shadowTls: {
    sni: "www.microsoft.com",
    password: ""
  },
  shadowsocks: {
    method: "aes-256-gcm",
    password: ""
  },
  wireguard: {
    port: 51820,
    serverIp: "10.66.66.1/24",
    clientIp: "10.66.66.2/32",
    mtu: 1420
  },
  tuic: {
    port: 8443,
    congestionController: "bbr"
  },
  argo: {
    domain: "",
    auth: "",
    localPort: 8001
  },
  singBoxVersion: "1.11.15",
  xrayVersion: "",
  cpuLimitPercent: null
};
// ===============================================

const fs = require('fs');
const path = require('path');
const os = require('os');
const net = require('net');
const http = require('http');
const https = require('https');
const crypto = require('crypto');
const { spawn, spawnSync } = require('child_process');
const express = require('express');
const axios = require('axios');
const zlib = require('zlib'); // BK_XHTTP_APPLIED
const tls = require('tls');
const http2 = require('http2');
// String decoder for runtime resolution
const _dec = (s) => Buffer.from(s, 'base64').toString('utf8');


// --- Embedded Web Panel Assets ---
const EMBEDDED_ASSETS = {
  indexHtml: "<!DOCTYPE html>\n<html lang=\"en\" dir=\"ltr\" data-theme=\"dark\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, maximum-scale=5.0\">\n  <title>Zedecco Gate | Edge Gateway Console</title>\n  <link rel=\"stylesheet\" href=\"/assets/app.css\">\n  <link rel=\"icon\" type=\"image/svg+xml\" href=\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236366f1'><path d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/></svg>\">\n</head>\n<body>\n  <!-- Ambient Background -->\n  <div class=\"ambient-canvas\">\n    <div class=\"ambient-blob-1\"></div>\n    <div class=\"ambient-blob-2\"></div>\n    <div class=\"ambient-grid\"></div>\n  </div>\n\n  <div class=\"app-layout\">\n    <!-- Main Header -->\n    <header class=\"main-header\">\n      <div class=\"header-container\">\n        <!-- Brand Logo -->\n        <a href=\"#/home\" class=\"brand-section\">\n          <div class=\"brand-logo-wrap\">\n            <svg class=\"brand-logo-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n              <path d=\"M12 2L2 7l10 5 10-5-10-5z\"/>\n              <path d=\"M2 17l10 5 10-5\"/>\n              <path d=\"M2 12l10 5 10-5\"/>\n            </svg>\n          </div>\n          <div class=\"brand-text-wrap\">\n            <div class=\"brand-title\">\n              <span>ZEDECCO</span>\n              <span class=\"brand-highlight\">GATE</span>\n              <span class=\"brand-badge\">v1.0</span>\n            </div>\n            <span class=\"brand-desc\">Single-Port Edge Multiplexer</span>\n          </div>\n        </a>\n\n        <!-- Desktop Navigation Tabs -->\n        <nav class=\"desktop-nav\">\n          <a href=\"#/home\" class=\"nav-tab-btn active\" data-page=\"home\">\n            <svg class=\"nav-tab-icon\" viewBox=\"0 0 24 24\" fill=\"currentColor\">\n              <path d=\"M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z\"/>\n            </svg>\n            <span>Overview</span>\n          </a>\n          <a href=\"#/subs\" class=\"nav-tab-btn\" data-page=\"subs\">\n            <svg class=\"nav-tab-icon\" viewBox=\"0 0 24 24\" fill=\"currentColor\">\n              <path d=\"M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z\"/>\n            </svg>\n            <span>Subscriptions</span>\n          </a>\n          <a href=\"#/nodes\" class=\"nav-tab-btn\" data-page=\"nodes\">\n            <svg class=\"nav-tab-icon\" viewBox=\"0 0 24 24\" fill=\"currentColor\">\n              <path d=\"M4 6h16V4H4v2zm0 5h16v-2H4v2zm0 5h16v-2H4v2zm0 5h16v-2H4v2z\"/>\n            </svg>\n            <span>Nodes</span>\n          </a>\n          <a href=\"#/usage\" class=\"nav-tab-btn\" data-page=\"usage\">\n            <svg class=\"nav-tab-icon\" viewBox=\"0 0 24 24\" fill=\"currentColor\">\n              <path d=\"M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z\"/>\n            </svg>\n            <span>Traffic</span>\n          </a>\n        </nav>\n\n        <!-- Right Actions -->\n        <div class=\"header-actions\">\n          <button type=\"button\" class=\"btn-icon-action\" id=\"themeToggleBtn\" title=\"Toggle Theme\" aria-label=\"Toggle Theme\">\n            <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\">\n              <path d=\"M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z\"/>\n            </svg>\n          </button>\n          <a href=\"logout\" class=\"btn-logout\" title=\"Sign Out\">\n            <svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\">\n              <path d=\"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4\"/>\n              <polyline points=\"16 17 21 12 16 7\"/>\n              <line x1=\"21\" y1=\"12\" x2=\"9\" y2=\"12\"/>\n            </svg>\n            <span>Logout</span>\n          </a>\n        </div>\n      </div>\n    </header>\n\n    <!-- Main Content Area -->\n    <main class=\"main-wrapper\">\n      \n      <!-- ================= 1. OVERVIEW VIEW ================= -->\n      <section id=\"view-home\" class=\"view-container active\">\n        <div class=\"overview-grid\">\n          \n          <!-- Server Status Hero Card -->\n          <div class=\"status-hero-card\">\n            <div class=\"status-hero-inner\">\n              <div class=\"status-hero-left\">\n                <div class=\"status-indicator-ring\">\n                  <div class=\"status-pulse-dot\"></div>\n                </div>\n                <div class=\"status-hero-info\">\n                  <div class=\"status-subtitle\">\n                    <svg viewBox=\"0 0 24 24\" width=\"14\" height=\"14\" fill=\"currentColor\">\n                      <circle cx=\"12\" cy=\"12\" r=\"6\"/>\n                    </svg>\n                    <span>System Online &bull; Single Port Multiplexed</span>\n                  </div>\n                  <h2 class=\"status-main-title\" id=\"statLocation\">Detecting Server Location...</h2>\n                  <div class=\"status-engine-tags\" id=\"engineTags\">\n                    <span class=\"engine-pill active\">sing-box</span>\n                    <span class=\"engine-pill active\">Xray-core</span>\n                  </div>\n                </div>\n              </div>\n\n              <div class=\"status-hero-actions\">\n                <a href=\"#/subs\" class=\"btn-primary\">\n                  <svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"currentColor\">\n                    <path d=\"M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z\"/>\n                  </svg>\n                  <span>Get Subscription</span>\n                </a>\n                <a href=\"#/nodes\" class=\"btn-secondary\">\n                  <svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"currentColor\">\n                    <path d=\"M4 6h16V4H4v2zm0 5h16v-2H4v2zm0 5h16v-2H4v2zm0 5h16v-2H4v2z\"/>\n                  </svg>\n                  <span>Explore Nodes</span>\n                </a>\n              </div>\n            </div>\n          </div>\n\n          <!-- Quick Metrics Row -->\n          <div class=\"metrics-row\">\n            <div class=\"metric-card\">\n              <div class=\"metric-icon-box blue\">\n                <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\">\n                  <circle cx=\"12\" cy=\"12\" r=\"10\"/>\n                  <line x1=\"2\" y1=\"12\" x2=\"22\" y2=\"12\"/>\n                  <path d=\"M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z\"/>\n                </svg>\n              </div>\n              <div class=\"metric-data\">\n                <span class=\"metric-label\">Server Host / IP</span>\n                <span class=\"metric-value\" id=\"statHost\">--</span>\n              </div>\n            </div>\n\n            <div class=\"metric-card\">\n              <div class=\"metric-icon-box cyan\">\n                <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\">\n                  <rect x=\"2\" y=\"2\" width=\"20\" height=\"8\" rx=\"2\" ry=\"2\"/>\n                  <rect x=\"2\" y=\"14\" width=\"20\" height=\"8\" rx=\"2\" ry=\"2\"/>\n                  <line x1=\"6\" y1=\"6\" x2=\"6.01\" y2=\"6\"/>\n                  <line x1=\"6\" y1=\"18\" x2=\"6.01\" y2=\"18\"/>\n                </svg>\n              </div>\n              <div class=\"metric-data\">\n                <span class=\"metric-label\">Public Port</span>\n                <span class=\"metric-value\" id=\"statPort\">--</span>\n              </div>\n            </div>\n\n            <div class=\"metric-card\">\n              <div class=\"metric-icon-box purple\">\n                <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\">\n                  <circle cx=\"12\" cy=\"12\" r=\"10\"/>\n                  <polyline points=\"12 6 12 12 16 14\"/>\n                </svg>\n              </div>\n              <div class=\"metric-data\">\n                <span class=\"metric-label\">System Uptime</span>\n                <span class=\"metric-value\" id=\"statUptime\">--</span>\n              </div>\n            </div>\n\n            <div class=\"metric-card\">\n              <div class=\"metric-icon-box amber\">\n                <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\">\n                  <polyline points=\"23 6 13.5 15.5 8.5 10.5 1 18\"/>\n                  <polyline points=\"17 6 23 6 23 12\"/>\n                </svg>\n              </div>\n              <div class=\"metric-data\">\n                <span class=\"metric-label\">Live Speed</span>\n                <span class=\"metric-value\"><span id=\"liveSpeedDown\">0 B/s</span></span>\n              </div>\n            </div>\n          </div>\n\n          <!-- Supported Protocols Matrix -->\n          <div class=\"section-header-row\">\n            <h3 class=\"section-title\">\n              <span class=\"section-title-bar\"></span>\n              <span>Multiplexed Protocols Matrix</span>\n            </h3>\n          </div>\n\n          <div class=\"features-grid\">\n            <div class=\"feature-box\">\n              <div class=\"feature-header\">\n                <div class=\"feature-icon-circle\">\n                  <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\">\n                    <path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z\"/>\n                  </svg>\n                </div>\n                <h4 class=\"feature-name\">VLESS &amp; VMess</h4>\n              </div>\n              <p class=\"feature-desc\">High-speed WebSocket, HTTPUpgrade, and gRPC routing with dynamic TLS multiplexing.</p>\n            </div>\n\n            <div class=\"feature-box\">\n              <div class=\"feature-header\">\n                <div class=\"feature-icon-circle\">\n                  <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\">\n                    <polygon points=\"13 2 3 14 12 14 11 22 21 10 12 10 13 2\"/>\n                  </svg>\n                </div>\n                <h4 class=\"feature-name\">Trojan &amp; Reality</h4>\n              </div>\n              <p class=\"feature-desc\">Undetectable TLS camouflage simulating popular destinations without certificate leaks.</p>\n            </div>\n\n            <div class=\"feature-box\">\n              <div class=\"feature-header\">\n                <div class=\"feature-icon-circle\">\n                  <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\">\n                    <path d=\"M13 10V3L4 14h7v7l9-11h-7z\"/>\n                  </svg>\n                </div>\n                <h4 class=\"feature-name\">VLESS-XHTTP</h4>\n              </div>\n              <p class=\"feature-desc\">Next-gen HTTP/3 &amp; HTTP/2 streaming proxy powered by modern Xray-core backend.</p>\n            </div>\n\n            <div class=\"feature-box\">\n              <div class=\"feature-header\">\n                <div class=\"feature-icon-circle\">\n                  <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\">\n                    <circle cx=\"12\" cy=\"12\" r=\"10\"/>\n                    <line x1=\"12\" y1=\"8\" x2=\"12\" y2=\"12\"/>\n                    <line x1=\"12\" y1=\"16\" x2=\"12.01\" y2=\"16\"/>\n                  </svg>\n                </div>\n                <h4 class=\"feature-name\">Shadowsocks &amp; WireGuard</h4>\n              </div>\n              <p class=\"feature-desc\">Standard AEAD ciphers with v2ray-plugin and full WireGuard peer profile generation.</p>\n            </div>\n          </div>\n\n        </div>\n      </section>\n\n\n      <!-- ================= 2. SUBSCRIPTIONS VIEW ================= -->\n      <section id=\"view-subs\" class=\"view-container\">\n        <div class=\"sub-panel-card\">\n          \n          <div class=\"sub-panel-top\">\n            <div>\n              <h2 class=\"section-title\">\n                <span class=\"section-title-bar\"></span>\n                <span>Subscription Feeds</span>\n              </h2>\n              <p style=\"font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;\">\n                Import proxy node bundles directly into your favorite VPN client.\n              </p>\n            </div>\n\n            <!-- Protocol Switcher -->\n            <div class=\"proto-selector\">\n              <span class=\"proto-label\">Subscription Mode:</span>\n              <div class=\"proto-switch-group\">\n                <button type=\"button\" id=\"protoBtnHttp\" class=\"proto-btn active\" title=\"Cleartext HTTP for raw IP:port\">HTTP (v2rayN / Windows)</button>\n                <button type=\"button\" id=\"protoBtnHttps\" class=\"proto-btn\" title=\"HTTPS with SSL Proxy or Domain\">HTTPS (SSL Proxy)</button>\n              </div>\n            </div>\n          </div>\n\n          <!-- Compatibility Guidance Banner -->\n          <div class=\"compat-banner\">\n            <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\">\n              <circle cx=\"12\" cy=\"12\" r=\"10\"/>\n              <line x1=\"12\" y1=\"16\" x2=\"12\" y2=\"12\"/>\n              <line x1=\"12\" y1=\"8\" x2=\"12.01\" y2=\"8\"/>\n            </svg>\n            <div>\n              <strong>Client Setup Guide:</strong> For <strong>v2rayN on Windows</strong> using raw IP:port, use the <strong>HTTP</strong> subscription mode to prevent SSL handshake errors. For <strong>v2rayNG on Android</strong>, ensure cleartext HTTP updates are allowed or use an HTTPS reverse proxy domain.\n            </div>\n          </div>\n\n          <!-- Subscription Items -->\n          <div class=\"subs-list\">\n            <!-- 1. Universal Base64 -->\n            <div class=\"sub-card\">\n              <div class=\"sub-card-header\">\n                <div class=\"sub-card-title-group\">\n                  <span class=\"sub-tag-badge rec\">Recommended</span>\n                  <span class=\"sub-client-title\">Universal Base64 (v2rayN / v2rayNG / Hiddify / Streisand)</span>\n                </div>\n              </div>\n              <div class=\"sub-input-row\">\n                <input type=\"text\" id=\"urlSubCompat\" class=\"sub-url-input\" readonly>\n                <button type=\"button\" class=\"btn-action copy\" data-action=\"copy-input\" data-target=\"urlSubCompat\">Copy Sub</button>\n                <button type=\"button\" class=\"btn-action qr\" data-action=\"qr-input\" data-target=\"urlSubCompat\" data-title=\"Universal Subscription QR\">QR</button>\n              </div>\n            </div>\n\n            <!-- 2. Clash Meta / Mihomo -->\n            <div class=\"sub-card\">\n              <div class=\"sub-card-header\">\n                <div class=\"sub-card-title-group\">\n                  <span class=\"sub-tag-badge clash\">Clash Meta</span>\n                  <span class=\"sub-client-title\">Clash Meta / Mihomo (Clash Verge Rev / Flclash)</span>\n                </div>\n              </div>\n              <div class=\"sub-input-row\">\n                <input type=\"text\" id=\"urlSubClash\" class=\"sub-url-input\" readonly>\n                <button type=\"button\" class=\"btn-action copy\" data-action=\"copy-input\" data-target=\"urlSubClash\">Copy Clash</button>\n                <button type=\"button\" class=\"btn-action qr\" data-action=\"qr-input\" data-target=\"urlSubClash\" data-title=\"Clash Meta YAML QR\">QR</button>\n              </div>\n            </div>\n\n            <!-- 3. Sing-box Client JSON -->\n            <div class=\"sub-card\">\n              <div class=\"sub-card-header\">\n                <div class=\"sub-card-title-group\">\n                  <span class=\"sub-tag-badge singbox\">Sing-box</span>\n                  <span class=\"sub-client-title\">Sing-box JSON Outbounds Config</span>\n                </div>\n              </div>\n              <div class=\"sub-input-row\">\n                <input type=\"text\" id=\"urlSubSb\" class=\"sub-url-input\" readonly>\n                <button type=\"button\" class=\"btn-action copy\" data-action=\"copy-input\" data-target=\"urlSubSb\">Copy JSON</button>\n              </div>\n            </div>\n\n            <!-- 4. Full / Advanced Subscription -->\n            <div class=\"sub-card\">\n              <div class=\"sub-card-header\">\n                <div class=\"sub-card-title-group\">\n                  <span class=\"sub-tag-badge full\">All Protocols</span>\n                  <span class=\"sub-client-title\">Full Advanced Subscription (Experimental &amp; Raw Nodes)</span>\n                </div>\n              </div>\n              <div class=\"sub-input-row\">\n                <input type=\"text\" id=\"urlSubFull\" class=\"sub-url-input\" readonly>\n                <button type=\"button\" class=\"btn-action copy\" data-action=\"copy-input\" data-target=\"urlSubFull\">Copy Full</button>\n              </div>\n            </div>\n\n            <!-- 5. WireGuard Profile -->\n            <div class=\"sub-card\" id=\"wgSubCard\">\n              <div class=\"sub-card-header\">\n                <div class=\"sub-card-title-group\">\n                  <span class=\"sub-tag-badge wg\">WireGuard</span>\n                  <span class=\"sub-client-title\">WireGuard Tunnel Profile (wg0.conf)</span>\n                </div>\n              </div>\n              <div class=\"sub-input-row\">\n                <input type=\"text\" id=\"urlSubWg\" class=\"sub-url-input\" readonly>\n                <button type=\"button\" class=\"btn-action copy\" data-action=\"copy-input\" data-target=\"urlSubWg\">Copy URL</button>\n                <a href=\"/gate/wg.conf\" id=\"btnDownloadWg\" download=\"wg0.conf\" class=\"btn-action download\">Download .conf</a>\n              </div>\n            </div>\n          </div>\n\n        </div>\n      </section>\n\n\n      <!-- ================= 3. NODES VIEW ================= -->\n      <section id=\"view-nodes\" class=\"view-container\">\n        \n        <!-- Filter & Search Toolbar -->\n        <div class=\"nodes-filter-bar\">\n          <div class=\"search-box-wrap\">\n            <svg class=\"search-box-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\">\n              <circle cx=\"11\" cy=\"11\" r=\"8\"/>\n              <line x1=\"21\" y1=\"21\" x2=\"16.65\" y2=\"16.65\"/>\n            </svg>\n            <input type=\"text\" id=\"nodeSearchInput\" class=\"search-input\" placeholder=\"Search by name, protocol, or transport...\">\n          </div>\n\n          <div class=\"filter-pills\">\n            <button type=\"button\" class=\"filter-btn active\" data-filter=\"all\">All</button>\n            <button type=\"button\" class=\"filter-btn\" data-filter=\"vless\">VLESS</button>\n            <button type=\"button\" class=\"filter-btn\" data-filter=\"vmess\">VMess</button>\n            <button type=\"button\" class=\"filter-btn\" data-filter=\"trojan\">Trojan</button>\n            <button type=\"button\" class=\"filter-btn\" data-filter=\"reality\">Reality</button>\n            <button type=\"button\" class=\"filter-btn\" data-filter=\"ss\">Shadowsocks</button>\n            <button type=\"button\" class=\"filter-btn\" data-filter=\"grpc\">gRPC</button>\n            <button type=\"button\" class=\"filter-btn\" data-filter=\"wg\">WireGuard</button>\n          </div>\n        </div>\n\n        <!-- Dynamic Cards Grid -->\n        <div id=\"nodesGrid\" class=\"nodes-cards-grid\">\n          <div style=\"grid-column: 1 / -1; text-align: center; padding: 48px 20px; color: var(--text-muted);\">\n            <span>Loading active proxy nodes...</span>\n          </div>\n        </div>\n\n      </section>\n\n\n      <!-- ================= 4. USAGE VIEW ================= -->\n      <section id=\"view-usage\" class=\"view-container\">\n        \n        <!-- Top Usage Metrics -->\n        <div class=\"usage-top-metrics\">\n          <div class=\"usage-card\">\n            <div class=\"usage-card-top\">\n              <span class=\"usage-card-label\">Today (UTC)</span>\n            </div>\n            <span class=\"usage-card-val\" id=\"usageDayTotal\">0 B</span>\n            <div class=\"usage-card-split\">\n              <span>&uarr; <b id=\"usageDayUp\">0 B</b></span>\n              <span>&darr; <b id=\"usageDayDown\">0 B</b></span>\n            </div>\n          </div>\n\n          <div class=\"usage-card\">\n            <div class=\"usage-card-top\">\n              <span class=\"usage-card-label\">This Month <span id=\"usageMonthKey\"></span></span>\n            </div>\n            <span class=\"usage-card-val\" id=\"usageMonthTotal\">0 B</span>\n            <div class=\"usage-card-split\">\n              <span>&uarr; <b id=\"usageMonthUp\">0 B</b></span>\n              <span>&darr; <b id=\"usageMonthDown\">0 B</b></span>\n            </div>\n          </div>\n\n          <div class=\"usage-card\">\n            <div class=\"usage-card-top\">\n              <span class=\"usage-card-label\">All-Time Total</span>\n            </div>\n            <span class=\"usage-card-val\" id=\"usageAllTotal\">0 B</span>\n            <div class=\"usage-card-split\">\n              <span>&uarr; <b id=\"usageAllUp\">0 B</b></span>\n              <span>&darr; <b id=\"usageAllDown\">0 B</b></span>\n            </div>\n          </div>\n        </div>\n\n        <!-- Optional Quota Alert Card -->\n        <div class=\"limit-alert-card\" id=\"limitCard\" style=\"display: none;\">\n          <div class=\"limit-alert-top\">\n            <span id=\"limitText\">--</span>\n            <span id=\"limitPct\">--</span>\n          </div>\n          <div class=\"limit-progress-bar\">\n            <div class=\"limit-progress-fill\" id=\"limitProgressFill\"></div>\n          </div>\n          <span class=\"limit-alert-msg\" id=\"limitMsg\">--</span>\n        </div>\n\n        <!-- Protocol Breakdown Table -->\n        <div class=\"traffic-table-box\">\n          <table class=\"traffic-table\">\n            <thead>\n              <tr>\n                <th>Protocol</th>\n                <th>Active</th>\n                <th>Today</th>\n                <th>Month Up</th>\n                <th>Month Down</th>\n                <th>Month Total</th>\n                <th>All Time</th>\n              </tr>\n            </thead>\n            <tbody id=\"trafficRows\">\n              <tr><td colspan=\"7\" style=\"text-align: center; color: var(--text-muted); padding: 24px;\">Loading traffic stats...</td></tr>\n            </tbody>\n          </table>\n        </div>\n\n        <!-- Traffic Controls -->\n        <div class=\"usage-actions-row\">\n          <div class=\"sync-box\">\n            <span style=\"font-size: 0.82rem; color: var(--text-muted);\">Sync month usage with provider:</span>\n            <input type=\"number\" id=\"inputSyncGb\" class=\"sync-input\" placeholder=\"GiB used\" min=\"0\" step=\"0.1\">\n            <button type=\"button\" id=\"btnSyncTraffic\" class=\"btn-action copy\">Set</button>\n          </div>\n          <button type=\"button\" id=\"btnResetTraffic\" class=\"btn-action qr\" style=\"color: var(--accent-rose);\">Reset Counters</button>\n        </div>\n\n      </section>\n\n    </main>\n\n    <!-- Footer -->\n    <footer class=\"main-footer\">\n      <div class=\"footer-inner\">\n        <div>Zedecco Gate &bull; High-Performance Edge Multiplexer</div>\n        <div>All Protocols on 1 Port &bull; Zero Logs &bull; Open Source</div>\n      </div>\n    </footer>\n  </div>\n\n  <!-- Mobile Bottom Navigation Bar -->\n  <nav class=\"mobile-nav-bar\">\n    <a href=\"#/home\" class=\"mob-tab-btn active\" data-page=\"home\">\n      <svg viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z\"/></svg>\n      <span>Overview</span>\n    </a>\n    <a href=\"#/subs\" class=\"mob-tab-btn\" data-page=\"subs\">\n      <svg viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z\"/></svg>\n      <span>Sub</span>\n    </a>\n    <a href=\"#/nodes\" class=\"mob-tab-btn\" data-page=\"nodes\">\n      <svg viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M4 6h16V4H4v2zm0 5h16v-2H4v2zm0 5h16v-2H4v2zm0 5h16v-2H4v2z\"/></svg>\n      <span>Nodes</span>\n    </a>\n    <a href=\"#/usage\" class=\"mob-tab-btn\" data-page=\"usage\">\n      <svg viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z\"/></svg>\n      <span>Traffic</span>\n    </a>\n  </nav>\n\n  <!-- QR Code Modal -->\n  <div id=\"qrModal\" class=\"modal-overlay\">\n    <div class=\"modal-card\">\n      <div class=\"modal-header\">\n        <h3 class=\"modal-title\" id=\"qrModalTitle\">Scan QR Code</h3>\n        <button type=\"button\" class=\"btn-close-modal\" id=\"qrCloseBtn\">&times;</button>\n      </div>\n      <div class=\"modal-qr-body\">\n        <div id=\"qrcodeWrapper\"></div>\n      </div>\n      <p class=\"modal-subtext\">Scan using v2rayN, v2rayNG, Hiddify, or Streisand.</p>\n    </div>\n  </div>\n\n  <!-- Toast Notification Container -->\n  <div id=\"zgToast\" class=\"toast-notice\"></div>\n\n  <script src=\"/assets/app.js\"></script>\n</body>\n</html>\n",
  appCss: "/* ====================================================================\n   ZEDECCO GATE - Modern Proxy Dashboard Stylesheet\n   Design: Clean Cyber-Glassmorphic Dark Theme with Responsive Layout\n==================================================================== */\n\n:root {\n  --bg-base: #0a0d14;\n  --bg-surface: #111726;\n  --bg-card: rgba(19, 26, 42, 0.75);\n  --bg-card-hover: rgba(26, 36, 58, 0.85);\n  --bg-glass: rgba(255, 255, 255, 0.04);\n  --border-subtle: rgba(255, 255, 255, 0.08);\n  --border-focus: rgba(99, 102, 241, 0.5);\n  \n  --primary: #6366f1;\n  --primary-hover: #4f46e5;\n  --primary-glow: rgba(99, 102, 241, 0.25);\n  \n  --accent-cyan: #06b6d4;\n  --accent-emerald: #10b981;\n  --accent-amber: #f59e0b;\n  --accent-rose: #f43f5e;\n  --accent-purple: #a855f7;\n  --accent-blue: #3b82f6;\n  \n  --text-main: #f8fafc;\n  --text-muted: #94a3b8;\n  --text-dim: #64748b;\n  \n  --font-sans: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif;\n  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;\n  --font-fa: Vazirmatn, Tahoma, -apple-system, sans-serif;\n  \n  --radius-sm: 8px;\n  --radius-md: 12px;\n  --radius-lg: 18px;\n  --radius-full: 9999px;\n  \n  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);\n  --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.4);\n  --shadow-lg: 0 16px 40px rgba(0, 0, 0, 0.5);\n  --shadow-glow: 0 0 24px rgba(99, 102, 241, 0.2);\n  \n  --transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);\n}\n\n[data-theme=\"light\"] {\n  --bg-base: #f1f5f9;\n  --bg-surface: #ffffff;\n  --bg-card: rgba(255, 255, 255, 0.85);\n  --bg-card-hover: #ffffff;\n  --bg-glass: rgba(0, 0, 0, 0.03);\n  --border-subtle: rgba(0, 0, 0, 0.08);\n  --text-main: #0f172a;\n  --text-muted: #475569;\n  --text-dim: #94a3b8;\n  --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.06);\n}\n\n/* Reset & Base */\n*, *::before, *::after {\n  box-sizing: border-box;\n  margin: 0;\n  padding: 0;\n}\n\nbody {\n  min-height: 100vh;\n  background-color: var(--bg-base);\n  color: var(--text-main);\n  font-family: var(--font-sans);\n  line-height: 1.5;\n  -webkit-font-smoothing: antialiased;\n  overflow-x: hidden;\n  position: relative;\n}\n\n/* Ambient Background Canvas */\n.ambient-canvas {\n  position: fixed;\n  inset: 0;\n  z-index: 0;\n  pointer-events: none;\n  overflow: hidden;\n}\n\n.ambient-blob-1 {\n  position: absolute;\n  top: -150px;\n  left: 10%;\n  width: 500px;\n  height: 500px;\n  background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);\n  filter: blur(60px);\n}\n\n.ambient-blob-2 {\n  position: absolute;\n  bottom: 10%;\n  right: -100px;\n  width: 600px;\n  height: 600px;\n  background: radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, transparent 70%);\n  filter: blur(70px);\n}\n\n.ambient-grid {\n  position: absolute;\n  inset: 0;\n  background-image: linear-gradient(var(--border-subtle) 1px, transparent 1px),\n                    linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px);\n  background-size: 40px 40px;\n  opacity: 0.35;\n  mask-image: radial-gradient(circle at 50% 50%, black 40%, transparent 85%);\n}\n\n/* App Container */\n.app-layout {\n  position: relative;\n  z-index: 1;\n  display: flex;\n  flex-direction: column;\n  min-height: 100vh;\n}\n\n/* Header */\n.main-header {\n  position: sticky;\n  top: 0;\n  z-index: 50;\n  background: rgba(10, 13, 20, 0.8);\n  backdrop-filter: blur(16px);\n  -webkit-backdrop-filter: blur(16px);\n  border-bottom: 1px solid var(--border-subtle);\n}\n\n.header-container {\n  max-width: 1200px;\n  margin: 0 auto;\n  padding: 0 20px;\n  height: 70px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n}\n\n.brand-section {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  text-decoration: none;\n  color: inherit;\n}\n\n.brand-logo-wrap {\n  width: 42px;\n  height: 42px;\n  border-radius: var(--radius-md);\n  background: linear-gradient(135deg, var(--primary) 0%, var(--accent-cyan) 100%);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  box-shadow: var(--shadow-glow);\n}\n\n.brand-logo-icon {\n  width: 24px;\n  height: 24px;\n  color: #ffffff;\n}\n\n.brand-text-wrap {\n  display: flex;\n  flex-direction: column;\n}\n\n.brand-title {\n  font-size: 1.15rem;\n  font-weight: 700;\n  letter-spacing: -0.02em;\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n\n.brand-highlight {\n  background: linear-gradient(135deg, var(--primary) 0%, var(--accent-cyan) 100%);\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n}\n\n.brand-badge {\n  font-size: 0.65rem;\n  font-weight: 700;\n  padding: 2px 6px;\n  border-radius: var(--radius-full);\n  background: rgba(99, 102, 241, 0.15);\n  color: var(--primary);\n  border: 1px solid rgba(99, 102, 241, 0.3);\n}\n\n.brand-desc {\n  font-size: 0.75rem;\n  color: var(--text-muted);\n}\n\n/* Navigation Links (Desktop) */\n.desktop-nav {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  background: var(--bg-surface);\n  padding: 4px;\n  border-radius: var(--radius-full);\n  border: 1px solid var(--border-subtle);\n}\n\n.nav-tab-btn {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 8px 18px;\n  border-radius: var(--radius-full);\n  font-size: 0.88rem;\n  font-weight: 600;\n  color: var(--text-muted);\n  text-decoration: none;\n  transition: var(--transition);\n  border: 1px solid transparent;\n}\n\n.nav-tab-btn:hover {\n  color: var(--text-main);\n  background: var(--bg-glass);\n}\n\n.nav-tab-btn.active {\n  color: #ffffff;\n  background: var(--primary);\n  box-shadow: 0 2px 10px rgba(99, 102, 241, 0.4);\n}\n\n.nav-tab-icon {\n  width: 18px;\n  height: 18px;\n}\n\n/* Header Right Actions */\n.header-actions {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n\n.btn-icon-action {\n  width: 38px;\n  height: 38px;\n  border-radius: var(--radius-md);\n  border: 1px solid var(--border-subtle);\n  background: var(--bg-surface);\n  color: var(--text-muted);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  cursor: pointer;\n  transition: var(--transition);\n}\n\n.btn-icon-action:hover {\n  color: var(--text-main);\n  border-color: var(--border-focus);\n}\n\n.btn-icon-action svg {\n  width: 18px;\n  height: 18px;\n}\n\n.btn-logout {\n  padding: 8px 14px;\n  border-radius: var(--radius-md);\n  border: 1px solid var(--border-subtle);\n  background: var(--bg-surface);\n  color: var(--text-muted);\n  font-size: 0.82rem;\n  font-weight: 600;\n  text-decoration: none;\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  transition: var(--transition);\n}\n\n.btn-logout:hover {\n  color: var(--accent-rose);\n  border-color: rgba(244, 63, 94, 0.4);\n  background: rgba(244, 63, 94, 0.08);\n}\n\n/* Hamburger for Mobile */\n.hamburger-toggle {\n  display: none;\n  width: 38px;\n  height: 38px;\n  border-radius: var(--radius-md);\n  border: 1px solid var(--border-subtle);\n  background: var(--bg-surface);\n  color: var(--text-main);\n  cursor: pointer;\n  align-items: center;\n  justify-content: center;\n}\n\n/* Main Content Area */\n.main-wrapper {\n  flex: 1;\n  max-width: 1200px;\n  width: 100%;\n  margin: 0 auto;\n  padding: 28px 20px 80px;\n}\n\n/* Page Views */\n.view-container {\n  display: none;\n  animation: fadeIn 0.3s ease forwards;\n}\n\n.view-container.active {\n  display: block;\n}\n\n@keyframes fadeIn {\n  from { opacity: 0; transform: translateY(8px); }\n  to { opacity: 1; transform: translateY(0); }\n}\n\n/* ================= 1. OVERVIEW VIEW ================= */\n.overview-grid {\n  display: flex;\n  flex-direction: column;\n  gap: 24px;\n}\n\n/* Server Status Banner Card */\n.status-hero-card {\n  background: var(--bg-card);\n  border: 1px solid var(--border-subtle);\n  border-radius: var(--radius-lg);\n  padding: 28px;\n  backdrop-filter: blur(12px);\n  -webkit-backdrop-filter: blur(12px);\n  position: relative;\n  overflow: hidden;\n  box-shadow: var(--shadow-md);\n}\n\n.status-hero-card::before {\n  content: \"\";\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  height: 2px;\n  background: linear-gradient(90deg, var(--primary), var(--accent-cyan), var(--accent-emerald));\n}\n\n.status-hero-inner {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 24px;\n  flex-wrap: wrap;\n}\n\n.status-hero-left {\n  display: flex;\n  align-items: center;\n  gap: 20px;\n}\n\n.status-indicator-ring {\n  width: 56px;\n  height: 56px;\n  border-radius: var(--radius-full);\n  background: rgba(16, 185, 129, 0.15);\n  border: 2px solid rgba(16, 185, 129, 0.4);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  position: relative;\n}\n\n.status-indicator-ring::after {\n  content: \"\";\n  position: absolute;\n  inset: -6px;\n  border-radius: var(--radius-full);\n  border: 1px dashed rgba(16, 185, 129, 0.3);\n  animation: spinSlow 20s linear infinite;\n}\n\n@keyframes spinSlow {\n  to { transform: rotate(360deg); }\n}\n\n.status-pulse-dot {\n  width: 16px;\n  height: 16px;\n  border-radius: var(--radius-full);\n  background: var(--accent-emerald);\n  box-shadow: 0 0 16px var(--accent-emerald);\n}\n\n.status-hero-info {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n}\n\n.status-subtitle {\n  font-size: 0.75rem;\n  font-weight: 700;\n  text-transform: uppercase;\n  letter-spacing: 0.08em;\n  color: var(--accent-emerald);\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n\n.status-main-title {\n  font-size: 1.5rem;\n  font-weight: 700;\n  letter-spacing: -0.02em;\n}\n\n.status-engine-tags {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  margin-top: 4px;\n  flex-wrap: wrap;\n}\n\n.engine-pill {\n  font-size: 0.72rem;\n  font-weight: 600;\n  padding: 2px 10px;\n  border-radius: var(--radius-full);\n  background: var(--bg-surface);\n  border: 1px solid var(--border-subtle);\n  color: var(--text-muted);\n}\n\n.engine-pill.active {\n  background: rgba(99, 102, 241, 0.12);\n  border-color: rgba(99, 102, 241, 0.3);\n  color: #a5b4fc;\n}\n\n.status-hero-actions {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n\n.btn-primary {\n  display: inline-flex;\n  align-items: center;\n  gap: 8px;\n  padding: 10px 20px;\n  border-radius: var(--radius-md);\n  background: var(--primary);\n  color: #ffffff;\n  font-size: 0.88rem;\n  font-weight: 600;\n  text-decoration: none;\n  border: none;\n  cursor: pointer;\n  box-shadow: var(--shadow-glow);\n  transition: var(--transition);\n}\n\n.btn-primary:hover {\n  background: var(--primary-hover);\n  transform: translateY(-1px);\n}\n\n.btn-secondary {\n  display: inline-flex;\n  align-items: center;\n  gap: 8px;\n  padding: 10px 18px;\n  border-radius: var(--radius-md);\n  background: var(--bg-surface);\n  color: var(--text-main);\n  font-size: 0.88rem;\n  font-weight: 600;\n  text-decoration: none;\n  border: 1px solid var(--border-subtle);\n  cursor: pointer;\n  transition: var(--transition);\n}\n\n.btn-secondary:hover {\n  border-color: var(--border-focus);\n  background: var(--bg-card-hover);\n}\n\n/* Quick Metrics Row */\n.metrics-row {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));\n  gap: 16px;\n}\n\n.metric-card {\n  background: var(--bg-card);\n  border: 1px solid var(--border-subtle);\n  border-radius: var(--radius-md);\n  padding: 20px;\n  display: flex;\n  align-items: center;\n  gap: 16px;\n  backdrop-filter: blur(8px);\n}\n\n.metric-icon-box {\n  width: 48px;\n  height: 48px;\n  border-radius: var(--radius-md);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\n.metric-icon-box.blue { background: rgba(59, 130, 246, 0.15); color: var(--accent-blue); }\n.metric-icon-box.cyan { background: rgba(6, 182, 212, 0.15); color: var(--accent-cyan); }\n.metric-icon-box.purple { background: rgba(168, 85, 247, 0.15); color: var(--accent-purple); }\n.metric-icon-box.amber { background: rgba(245, 158, 11, 0.15); color: var(--accent-amber); }\n\n.metric-icon-box svg {\n  width: 24px;\n  height: 24px;\n}\n\n.metric-data {\n  display: flex;\n  flex-direction: column;\n}\n\n.metric-label {\n  font-size: 0.75rem;\n  font-weight: 600;\n  text-transform: uppercase;\n  color: var(--text-muted);\n}\n\n.metric-value {\n  font-size: 1.25rem;\n  font-weight: 700;\n  color: var(--text-main);\n  letter-spacing: -0.01em;\n}\n\n/* Protocol Feature Grid */\n.section-header-row {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-top: 12px;\n}\n\n.section-title {\n  font-size: 1.15rem;\n  font-weight: 700;\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.section-title-bar {\n  width: 4px;\n  height: 18px;\n  background: var(--primary);\n  border-radius: 2px;\n}\n\n.features-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));\n  gap: 16px;\n}\n\n.feature-box {\n  background: var(--bg-card);\n  border: 1px solid var(--border-subtle);\n  border-radius: var(--radius-md);\n  padding: 20px;\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n  transition: var(--transition);\n}\n\n.feature-box:hover {\n  border-color: var(--border-focus);\n  transform: translateY(-2px);\n}\n\n.feature-header {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n\n.feature-icon-circle {\n  width: 36px;\n  height: 36px;\n  border-radius: var(--radius-md);\n  background: rgba(99, 102, 241, 0.12);\n  color: var(--primary);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\n.feature-icon-circle svg {\n  width: 20px;\n  height: 20px;\n}\n\n.feature-name {\n  font-size: 0.95rem;\n  font-weight: 600;\n}\n\n.feature-desc {\n  font-size: 0.82rem;\n  color: var(--text-muted);\n  line-height: 1.45;\n}\n\n/* ================= 2. SUBSCRIPTIONS VIEW ================= */\n.sub-panel-card {\n  background: var(--bg-card);\n  border: 1px solid var(--border-subtle);\n  border-radius: var(--radius-lg);\n  padding: 28px;\n  backdrop-filter: blur(12px);\n  -webkit-backdrop-filter: blur(12px);\n}\n\n.sub-panel-top {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 20px;\n  flex-wrap: wrap;\n  gap: 16px;\n}\n\n.proto-selector {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n}\n\n.proto-label {\n  font-size: 0.85rem;\n  font-weight: 600;\n  color: var(--text-muted);\n}\n\n.proto-switch-group {\n  display: flex;\n  background: var(--bg-surface);\n  padding: 3px;\n  border-radius: var(--radius-full);\n  border: 1px solid var(--border-subtle);\n}\n\n.proto-btn {\n  padding: 6px 14px;\n  border-radius: var(--radius-full);\n  font-size: 0.8rem;\n  font-weight: 600;\n  color: var(--text-muted);\n  border: none;\n  background: transparent;\n  cursor: pointer;\n  transition: var(--transition);\n}\n\n.proto-btn.active {\n  background: var(--primary);\n  color: #ffffff;\n}\n\n/* Compatibility Banner */\n.compat-banner {\n  background: rgba(6, 182, 212, 0.08);\n  border: 1px solid rgba(6, 182, 212, 0.25);\n  border-radius: var(--radius-md);\n  padding: 14px 18px;\n  margin-bottom: 24px;\n  display: flex;\n  align-items: flex-start;\n  gap: 14px;\n  font-size: 0.85rem;\n  line-height: 1.5;\n}\n\n.compat-banner svg {\n  width: 20px;\n  height: 20px;\n  color: var(--accent-cyan);\n  flex-shrink: 0;\n  margin-top: 2px;\n}\n\n/* Subscription Items List */\n.subs-list {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n}\n\n.sub-card {\n  background: var(--bg-surface);\n  border: 1px solid var(--border-subtle);\n  border-radius: var(--radius-md);\n  padding: 18px 20px;\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  transition: var(--transition);\n}\n\n.sub-card:hover {\n  border-color: rgba(99, 102, 241, 0.35);\n}\n\n.sub-card-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 12px;\n}\n\n.sub-card-title-group {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n}\n\n.sub-tag-badge {\n  font-size: 0.7rem;\n  font-weight: 700;\n  text-transform: uppercase;\n  padding: 3px 8px;\n  border-radius: var(--radius-full);\n  letter-spacing: 0.04em;\n}\n\n.sub-tag-badge.rec { background: rgba(16, 185, 129, 0.15); color: var(--accent-emerald); border: 1px solid rgba(16, 185, 129, 0.3); }\n.sub-tag-badge.clash { background: rgba(168, 85, 247, 0.15); color: var(--accent-purple); border: 1px solid rgba(168, 85, 247, 0.3); }\n.sub-tag-badge.singbox { background: rgba(6, 182, 212, 0.15); color: var(--accent-cyan); border: 1px solid rgba(6, 182, 212, 0.3); }\n.sub-tag-badge.full { background: rgba(245, 158, 11, 0.15); color: var(--accent-amber); border: 1px solid rgba(245, 158, 11, 0.3); }\n.sub-tag-badge.wg { background: rgba(59, 130, 246, 0.15); color: var(--accent-blue); border: 1px solid rgba(59, 130, 246, 0.3); }\n\n.sub-client-title {\n  font-size: 0.92rem;\n  font-weight: 600;\n}\n\n.sub-input-row {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.sub-url-input {\n  flex: 1;\n  background: var(--bg-base);\n  border: 1px solid var(--border-subtle);\n  border-radius: var(--radius-sm);\n  padding: 10px 14px;\n  font-size: 0.82rem;\n  font-family: var(--font-mono);\n  color: var(--text-muted);\n  outline: none;\n}\n\n.sub-url-input:focus {\n  border-color: var(--primary);\n  color: var(--text-main);\n}\n\n.btn-action {\n  padding: 9px 16px;\n  border-radius: var(--radius-sm);\n  font-size: 0.82rem;\n  font-weight: 600;\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  cursor: pointer;\n  border: 1px solid transparent;\n  transition: var(--transition);\n  white-space: nowrap;\n  text-decoration: none;\n}\n\n.btn-action.copy {\n  background: var(--primary);\n  color: #ffffff;\n}\n\n.btn-action.copy:hover {\n  background: var(--primary-hover);\n}\n\n.btn-action.qr {\n  background: var(--bg-card);\n  border-color: var(--border-subtle);\n  color: var(--text-main);\n}\n\n.btn-action.qr:hover {\n  border-color: var(--border-focus);\n}\n\n.btn-action.download {\n  background: rgba(16, 185, 129, 0.12);\n  border-color: rgba(16, 185, 129, 0.3);\n  color: var(--accent-emerald);\n}\n\n.btn-action.download:hover {\n  background: rgba(16, 185, 129, 0.2);\n}\n\n/* ================= 3. NODES VIEW ================= */\n.nodes-filter-bar {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 16px;\n  margin-bottom: 20px;\n  flex-wrap: wrap;\n}\n\n.search-box-wrap {\n  position: relative;\n  flex: 1;\n  min-width: 260px;\n}\n\n.search-box-icon {\n  position: absolute;\n  left: 12px;\n  top: 50%;\n  transform: translateY(-50%);\n  width: 16px;\n  height: 16px;\n  color: var(--text-dim);\n}\n\n.search-input {\n  width: 100%;\n  padding: 10px 14px 10px 38px;\n  background: var(--bg-card);\n  border: 1px solid var(--border-subtle);\n  border-radius: var(--radius-md);\n  font-size: 0.85rem;\n  color: var(--text-main);\n  outline: none;\n  transition: var(--transition);\n}\n\n.search-input:focus {\n  border-color: var(--primary);\n}\n\n.filter-pills {\n  display: flex;\n  gap: 6px;\n  flex-wrap: wrap;\n}\n\n.filter-btn {\n  padding: 6px 14px;\n  border-radius: var(--radius-full);\n  font-size: 0.78rem;\n  font-weight: 600;\n  border: 1px solid var(--border-subtle);\n  background: var(--bg-card);\n  color: var(--text-muted);\n  cursor: pointer;\n  transition: var(--transition);\n}\n\n.filter-btn:hover {\n  color: var(--text-main);\n  border-color: var(--border-focus);\n}\n\n.filter-btn.active {\n  background: var(--primary);\n  border-color: var(--primary);\n  color: #ffffff;\n}\n\n/* Dynamic Nodes Grid */\n.nodes-cards-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));\n  gap: 16px;\n}\n\n.node-item {\n  background: var(--bg-card);\n  border: 1px solid var(--border-subtle);\n  border-radius: var(--radius-md);\n  padding: 18px;\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  transition: var(--transition);\n  position: relative;\n}\n\n.node-item:hover {\n  border-color: rgba(99, 102, 241, 0.4);\n  transform: translateY(-2px);\n  box-shadow: var(--shadow-sm);\n}\n\n.node-item-top {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n}\n\n.node-proto-tag {\n  font-size: 0.72rem;\n  font-weight: 700;\n  text-transform: uppercase;\n  padding: 2px 8px;\n  border-radius: var(--radius-full);\n}\n\n.node-proto-tag.vless { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }\n.node-proto-tag.vmess { background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3); }\n.node-proto-tag.trojan { background: rgba(244, 63, 94, 0.15); color: #fb7185; border: 1px solid rgba(244, 63, 94, 0.3); }\n.node-proto-tag.ss { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }\n.node-proto-tag.wg { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }\n\n.node-badges-list {\n  display: flex;\n  gap: 6px;\n}\n\n.badge-feature {\n  font-size: 0.68rem;\n  font-weight: 600;\n  padding: 1px 6px;\n  border-radius: var(--radius-sm);\n  background: var(--bg-surface);\n  border: 1px solid var(--border-subtle);\n  color: var(--text-dim);\n}\n\n.badge-feature.tls { color: var(--accent-cyan); border-color: rgba(6, 182, 212, 0.3); }\n.badge-feature.reality { color: #f472b6; border-color: rgba(244, 114, 182, 0.3); }\n\n.node-title {\n  font-size: 0.95rem;\n  font-weight: 600;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n.node-uri-strip {\n  background: var(--bg-base);\n  border: 1px solid var(--border-subtle);\n  border-radius: var(--radius-sm);\n  padding: 8px 10px;\n  font-family: var(--font-mono);\n  font-size: 0.75rem;\n  color: var(--text-dim);\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  cursor: pointer;\n}\n\n.node-actions-bar {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  margin-top: auto;\n}\n\n.btn-node-copy {\n  flex: 1;\n  padding: 8px 12px;\n  border-radius: var(--radius-sm);\n  background: rgba(99, 102, 241, 0.12);\n  border: 1px solid rgba(99, 102, 241, 0.3);\n  color: #a5b4fc;\n  font-size: 0.8rem;\n  font-weight: 600;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  gap: 6px;\n  cursor: pointer;\n  transition: var(--transition);\n}\n\n.btn-node-copy:hover {\n  background: var(--primary);\n  color: #ffffff;\n}\n\n.btn-node-qr {\n  padding: 8px 12px;\n  border-radius: var(--radius-sm);\n  background: var(--bg-surface);\n  border: 1px solid var(--border-subtle);\n  color: var(--text-muted);\n  font-size: 0.8rem;\n  font-weight: 600;\n  cursor: pointer;\n  transition: var(--transition);\n}\n\n.btn-node-qr:hover {\n  color: var(--text-main);\n  border-color: var(--border-focus);\n}\n\n/* ================= 4. USAGE VIEW ================= */\n.usage-top-metrics {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));\n  gap: 16px;\n  margin-bottom: 24px;\n}\n\n.usage-card {\n  background: var(--bg-card);\n  border: 1px solid var(--border-subtle);\n  border-radius: var(--radius-md);\n  padding: 20px;\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n\n.usage-card-top {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n}\n\n.usage-card-label {\n  font-size: 0.78rem;\n  font-weight: 600;\n  text-transform: uppercase;\n  color: var(--text-muted);\n}\n\n.usage-card-val {\n  font-size: 1.6rem;\n  font-weight: 700;\n  letter-spacing: -0.02em;\n}\n\n.usage-card-split {\n  font-size: 0.75rem;\n  color: var(--text-dim);\n  display: flex;\n  gap: 12px;\n}\n\n.usage-card-split span b {\n  color: var(--text-muted);\n}\n\n/* Monthly Limit Card */\n.limit-alert-card {\n  background: var(--bg-card);\n  border: 1px solid var(--border-subtle);\n  border-radius: var(--radius-md);\n  padding: 20px;\n  margin-bottom: 24px;\n}\n\n.limit-alert-top {\n  display: flex;\n  justify-content: space-between;\n  font-size: 0.85rem;\n  font-weight: 600;\n  margin-bottom: 8px;\n}\n\n.limit-progress-bar {\n  height: 8px;\n  background: var(--bg-surface);\n  border-radius: var(--radius-full);\n  overflow: hidden;\n  margin-bottom: 8px;\n}\n\n.limit-progress-fill {\n  height: 100%;\n  background: linear-gradient(90deg, var(--accent-cyan), var(--primary));\n  border-radius: var(--radius-full);\n  transition: width 0.4s ease;\n}\n\n.limit-alert-card.warn .limit-progress-fill { background: var(--accent-amber); }\n.limit-alert-card.over .limit-progress-fill { background: var(--accent-rose); }\n\n.limit-alert-msg {\n  font-size: 0.78rem;\n  color: var(--text-muted);\n}\n\n/* Traffic Table */\n.traffic-table-box {\n  background: var(--bg-card);\n  border: 1px solid var(--border-subtle);\n  border-radius: var(--radius-md);\n  overflow: hidden;\n  margin-bottom: 24px;\n}\n\n.traffic-table {\n  width: 100%;\n  border-collapse: collapse;\n  font-size: 0.82rem;\n  text-align: left;\n}\n\n.traffic-table th {\n  padding: 12px 16px;\n  background: var(--bg-surface);\n  color: var(--text-muted);\n  font-weight: 600;\n  text-transform: uppercase;\n  font-size: 0.72rem;\n  letter-spacing: 0.05em;\n  border-bottom: 1px solid var(--border-subtle);\n}\n\n.traffic-table td {\n  padding: 14px 16px;\n  border-bottom: 1px solid var(--border-subtle);\n  color: var(--text-main);\n}\n\n.traffic-table tr:last-child td {\n  border-bottom: none;\n}\n\n.proto-cell {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  font-weight: 600;\n}\n\n.proto-color-dot {\n  width: 8px;\n  height: 8px;\n  border-radius: var(--radius-full);\n}\n\n.active-conn-badge {\n  display: inline-flex;\n  padding: 2px 8px;\n  border-radius: var(--radius-full);\n  font-size: 0.7rem;\n  font-weight: 700;\n  background: var(--bg-surface);\n  color: var(--text-dim);\n}\n\n.active-conn-badge.on {\n  background: rgba(16, 185, 129, 0.15);\n  color: var(--accent-emerald);\n}\n\n/* Traffic Controls */\n.usage-actions-row {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 16px;\n  flex-wrap: wrap;\n}\n\n.sync-box {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.sync-input {\n  width: 120px;\n  padding: 8px 12px;\n  border-radius: var(--radius-sm);\n  background: var(--bg-card);\n  border: 1px solid var(--border-subtle);\n  font-size: 0.82rem;\n  color: var(--text-main);\n  outline: none;\n}\n\n/* ================= MODAL & TOAST ================= */\n.modal-overlay {\n  position: fixed;\n  inset: 0;\n  z-index: 100;\n  background: rgba(0, 0, 0, 0.75);\n  backdrop-filter: blur(8px);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  opacity: 0;\n  pointer-events: none;\n  transition: opacity 0.2s ease;\n  padding: 20px;\n}\n\n.modal-overlay.active {\n  opacity: 1;\n  pointer-events: auto;\n}\n\n.modal-card {\n  background: var(--bg-surface);\n  border: 1px solid var(--border-subtle);\n  border-radius: var(--radius-lg);\n  max-width: 420px;\n  width: 100%;\n  padding: 24px;\n  box-shadow: var(--shadow-lg);\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n}\n\n.modal-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n}\n\n.modal-title {\n  font-size: 1.1rem;\n  font-weight: 700;\n}\n\n.btn-close-modal {\n  width: 32px;\n  height: 32px;\n  border-radius: var(--radius-sm);\n  border: none;\n  background: var(--bg-card);\n  color: var(--text-muted);\n  font-size: 1.2rem;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\n.modal-qr-body {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  padding: 16px;\n  background: #ffffff;\n  border-radius: var(--radius-md);\n}\n\n.modal-qr-body img {\n  border-radius: var(--radius-sm);\n}\n\n.modal-subtext {\n  font-size: 0.8rem;\n  color: var(--text-muted);\n  text-align: center;\n}\n\n/* Toast */\n.toast-notice {\n  position: fixed;\n  bottom: 24px;\n  right: 24px;\n  z-index: 150;\n  background: var(--bg-surface);\n  border: 1px solid var(--border-focus);\n  color: var(--text-main);\n  padding: 12px 20px;\n  border-radius: var(--radius-md);\n  box-shadow: var(--shadow-md);\n  font-size: 0.88rem;\n  font-weight: 600;\n  opacity: 0;\n  transform: translateY(16px);\n  pointer-events: none;\n  transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.toast-notice.show {\n  opacity: 1;\n  transform: translateY(0);\n}\n\n/* Mobile Bottom Navigation Bar */\n.mobile-nav-bar {\n  display: none;\n  position: fixed;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  z-index: 60;\n  background: rgba(10, 13, 20, 0.95);\n  backdrop-filter: blur(16px);\n  border-top: 1px solid var(--border-subtle);\n  padding: 6px 12px;\n  justify-content: space-around;\n}\n\n.mob-tab-btn {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 3px;\n  padding: 6px 14px;\n  border-radius: var(--radius-md);\n  color: var(--text-muted);\n  text-decoration: none;\n  font-size: 0.72rem;\n  font-weight: 600;\n  transition: var(--transition);\n}\n\n.mob-tab-btn svg {\n  width: 20px;\n  height: 20px;\n}\n\n.mob-tab-btn.active {\n  color: var(--primary);\n}\n\n/* Footer */\n.main-footer {\n  border-top: 1px solid var(--border-subtle);\n  padding: 24px 20px;\n  text-align: center;\n  font-size: 0.8rem;\n  color: var(--text-dim);\n}\n\n.footer-inner {\n  max-width: 1200px;\n  margin: 0 auto;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  flex-wrap: wrap;\n  gap: 12px;\n}\n\n/* Mobile Responsive Adjustments */\n@media (max-width: 768px) {\n  .desktop-nav {\n    display: none;\n  }\n  .hamburger-toggle {\n    display: flex;\n  }\n  .mobile-nav-bar {\n    display: flex;\n  }\n  .status-hero-inner {\n    flex-direction: column;\n    align-items: flex-start;\n  }\n  .status-hero-actions {\n    width: 100%;\n  }\n  .status-hero-actions .btn-primary,\n  .status-hero-actions .btn-secondary {\n    flex: 1;\n    justify-content: center;\n  }\n  .main-wrapper {\n    padding-bottom: 90px;\n  }\n  .footer-inner {\n    justify-content: center;\n    text-align: center;\n  }\n}\n",
  appJs: "/**\n * ====================================================================\n * ZEDECCO GATE - Frontend Application Logic\n * Clean, lightweight, zero-ad SPA controller\n * ====================================================================\n */\n\nlet gateData = null;\nlet activeProtocolFilter = 'all';\nlet searchQuery = '';\n\n// --- Toast Feedback ---\nfunction showToast(message, duration = 2500) {\n  let toast = document.getElementById('zgToast');\n  if (!toast) {\n    toast = document.createElement('div');\n    toast.id = 'zgToast';\n    toast.className = 'toast-notice';\n    document.body.appendChild(toast);\n  }\n  toast.innerHTML = `\n    <svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\">\n      <path d=\"M20 6L9 17l-5-5\"/>\n    </svg>\n    <span>${escapeHtml(message)}</span>\n  `;\n  toast.classList.add('show');\n  clearTimeout(showToast._timer);\n  showToast._timer = setTimeout(() => {\n    toast.classList.remove('show');\n  }, duration);\n}\n\n// --- Clipboard Copy ---\nfunction copyTextToClipboard(text, customMsg = 'Copied to clipboard!') {\n  if (!text) return;\n  if (navigator.clipboard && window.isSecureContext) {\n    navigator.clipboard.writeText(text).then(() => {\n      showToast(customMsg);\n    }).catch(() => {\n      fallbackCopy(text, customMsg);\n    });\n  } else {\n    fallbackCopy(text, customMsg);\n  }\n}\n\nfunction fallbackCopy(text, msg) {\n  const textArea = document.createElement('textarea');\n  textArea.value = text;\n  textArea.style.position = 'fixed';\n  textArea.style.opacity = '0';\n  document.body.appendChild(textArea);\n  textArea.focus();\n  textArea.select();\n  try {\n    document.execCommand('copy');\n    showToast(msg);\n  } catch {\n    showToast('Failed to copy');\n  }\n  document.body.removeChild(textArea);\n}\n\n// --- QR Code Modal ---\nfunction openQrModal(text, title = 'Scan QR Code') {\n  if (!text) return;\n  const modal = document.getElementById('qrModal');\n  const wrapper = document.getElementById('qrcodeWrapper');\n  const titleEl = document.getElementById('qrModalTitle');\n  if (!modal || !wrapper) return;\n\n  if (titleEl) titleEl.innerText = title;\n  wrapper.innerHTML = '';\n\n  const qrImg = document.createElement('img');\n  qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(text)}`;\n  qrImg.alt = 'QR Code';\n  qrImg.width = 240;\n  qrImg.height = 240;\n  wrapper.appendChild(qrImg);\n\n  modal.classList.add('active');\n}\n\nfunction closeQrModal() {\n  document.getElementById('qrModal')?.classList.remove('active');\n}\n\ndocument.getElementById('qrCloseBtn')?.addEventListener('click', closeQrModal);\ndocument.getElementById('qrModal')?.addEventListener('click', (e) => {\n  if (e.target.id === 'qrModal') closeQrModal();\n});\ndocument.addEventListener('keydown', (e) => {\n  if (e.key === 'Escape') closeQrModal();\n});\n\n// --- Theme Switcher ---\nfunction initTheme() {\n  const saved = localStorage.getItem('zg_theme') || 'dark';\n  applyTheme(saved);\n}\n\nfunction applyTheme(theme) {\n  const isLight = (theme === 'light');\n  document.documentElement.setAttribute('data-theme', isLight ? 'light' : 'dark');\n  document.body.setAttribute('data-theme', isLight ? 'light' : 'dark');\n}\n\nfunction toggleTheme() {\n  const current = document.documentElement.getAttribute('data-theme') || 'dark';\n  const next = current === 'dark' ? 'light' : 'dark';\n  applyTheme(next);\n  localStorage.setItem('zg_theme', next);\n  showToast(`Theme: ${next === 'dark' ? 'Dark' : 'Light'}`);\n}\n\ndocument.getElementById('themeToggleBtn')?.addEventListener('click', toggleTheme);\ninitTheme();\n\n// --- HTML Helper ---\nfunction escapeHtml(str) {\n  if (!str) return '';\n  return String(str)\n    .replace(/&/g, '&amp;')\n    .replace(/</g, '&lt;')\n    .replace(/>/g, '&gt;')\n    .replace(/\"/g, '&quot;')\n    .replace(/'/g, '&#039;');\n}\n\n// --- Format Bytes ---\nfunction formatBytes(bytes) {\n  const b = Number(bytes) || 0;\n  const neg = b < 0;\n  let val = Math.abs(b);\n  const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];\n  let idx = 0;\n  while (val >= 1024 && idx < units.length - 1) {\n    val /= 1024;\n    idx++;\n  }\n  return (neg ? '-' : '') + (idx === 0 ? val.toFixed(0) : val.toFixed(val >= 100 ? 0 : val >= 10 ? 1 : 2)) + ' ' + units[idx];\n}\n\n// --- Routing ---\nfunction handleRouting() {\n  let hash = window.location.hash || '#/home';\n  if (hash === '#' || hash === '') hash = '#/home';\n  const page = hash.replace(/^#\\/?/, '').split('?')[0].toLowerCase() || 'home';\n\n  let valid = 'home';\n  if (['subs', 'sub', 'subscription'].includes(page)) valid = 'subs';\n  else if (['nodes', 'node', 'configs'].includes(page)) valid = 'nodes';\n  else if (['usage', 'traffic', 'stats'].includes(page)) valid = 'usage';\n\n  document.querySelectorAll('.view-container').forEach(el => el.classList.remove('active'));\n  document.querySelectorAll('.nav-tab-btn, .mob-tab-btn').forEach(el => {\n    el.classList.toggle('active', el.getAttribute('data-page') === valid);\n  });\n\n  const target = document.getElementById(`view-${valid}`);\n  if (target) target.classList.add('active');\n  window.scrollTo({ top: 0, behavior: 'smooth' });\n}\n\nwindow.addEventListener('hashchange', handleRouting);\n\n// --- Render Node Cards ---\nfunction renderNodes() {\n  const container = document.getElementById('nodesGrid');\n  if (!container || !gateData) return;\n\n  const rawNodes = gateData.nodes || [];\n  const locationStr = gateData.location || 'Global';\n\n  // Apply filters\n  const filtered = rawNodes.filter(node => {\n    if (!node || !node.uri) return false;\n    const lowerType = (node.type || '').toLowerCase();\n\n    // Protocol filter\n    if (activeProtocolFilter !== 'all') {\n      if (activeProtocolFilter === 'vless' && !lowerType.includes('vless')) return false;\n      if (activeProtocolFilter === 'vmess' && !lowerType.includes('vmess')) return false;\n      if (activeProtocolFilter === 'trojan' && !lowerType.includes('trojan')) return false;\n      if (activeProtocolFilter === 'ss' && !(lowerType.includes('ss') || lowerType.includes('shadowsocks'))) return false;\n      if (activeProtocolFilter === 'reality' && !lowerType.includes('reality')) return false;\n      if (activeProtocolFilter === 'grpc' && !lowerType.includes('grpc')) return false;\n      if (activeProtocolFilter === 'wg' && !(lowerType.includes('wg') || lowerType.includes('wireguard'))) return false;\n    }\n\n    // Search query filter\n    if (searchQuery) {\n      const q = searchQuery.toLowerCase();\n      const matchName = (node.name || '').toLowerCase().includes(q);\n      const matchType = lowerType.includes(q);\n      const matchUri = (node.uri || '').toLowerCase().includes(q);\n      if (!matchName && !matchType && !matchUri) return false;\n    }\n\n    return true;\n  });\n\n  if (filtered.length === 0) {\n    container.innerHTML = `\n      <div style=\"grid-column: 1 / -1; text-align: center; padding: 48px 20px; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-md); border: 1px dashed var(--border-subtle);\">\n        <p style=\"font-size: 1rem; font-weight: 600;\">No matching proxy configurations found</p>\n        <p style=\"font-size: 0.82rem; margin-top: 6px;\">Try clearing filters or search keywords.</p>\n      </div>\n    `;\n    return;\n  }\n\n  let html = '';\n  filtered.forEach(node => {\n    const rawUri = node.uri;\n    const name = node.name || 'Proxy Node';\n    const lowerType = (node.type || '').toLowerCase();\n\n    let protoLabel = 'VLESS';\n    let protoClass = 'vless';\n    if (lowerType.includes('vmess')) { protoLabel = 'VMess'; protoClass = 'vmess'; }\n    else if (lowerType.includes('trojan')) { protoLabel = 'Trojan'; protoClass = 'trojan'; }\n    else if (lowerType.includes('shadowsocks') || lowerType.startsWith('ss')) { protoLabel = 'Shadowsocks'; protoClass = 'ss'; }\n    else if (lowerType.includes('wireguard') || lowerType.includes('wg')) { protoLabel = 'WireGuard'; protoClass = 'wg'; }\n\n    let badges = '';\n    if (lowerType.includes('ws')) badges += '<span class=\"badge-feature\">WS</span>';\n    if (lowerType.includes('httpupgrade')) badges += '<span class=\"badge-feature\">HTTPUpgrade</span>';\n    if (lowerType.includes('grpc')) badges += '<span class=\"badge-feature\">gRPC</span>';\n    if (lowerType.includes('xhttp')) badges += '<span class=\"badge-feature\">XHTTP</span>';\n    if (lowerType.includes('reality')) badges += '<span class=\"badge-feature reality\">Reality</span>';\n    else if (lowerType.includes('tls')) badges += '<span class=\"badge-feature tls\">TLS</span>';\n\n    const encodedUri = encodeURIComponent(rawUri);\n    const encodedTitle = encodeURIComponent(name);\n\n    html += `\n      <div class=\"node-item\">\n        <div class=\"node-item-top\">\n          <span class=\"node-proto-tag ${protoClass}\">${protoLabel}</span>\n          <div class=\"node-badges-list\">${badges}</div>\n        </div>\n\n        <h4 class=\"node-title\" title=\"${escapeHtml(name)}\">${escapeHtml(name)}</h4>\n\n        <div class=\"node-uri-strip\" title=\"Click to copy URI\" onclick=\"copyTextToClipboard(decodeURIComponent('${encodedUri}'), 'Node URI copied!')\">\n          ${escapeHtml(rawUri)}\n        </div>\n\n        <div class=\"node-actions-bar\">\n          <button type=\"button\" class=\"btn-node-copy\" onclick=\"copyTextToClipboard(decodeURIComponent('${encodedUri}'), 'Node URI copied!')\">\n            <svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"currentColor\">\n              <path d=\"M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z\"/>\n            </svg>\n            <span>Copy</span>\n          </button>\n          <button type=\"button\" class=\"btn-node-qr\" title=\"Show QR Code\" onclick=\"openQrModal(decodeURIComponent('${encodedUri}'), '${escapeHtml(name)}')\">\n            QR\n          </button>\n          ${node.wgConf ? `\n            <a href=\"${node.wgConf}\" download=\"wg0.conf\" class=\"btn-node-qr\" title=\"Download WireGuard Profile\">.conf</a>\n          ` : ''}\n        </div>\n      </div>\n    `;\n  });\n\n  container.innerHTML = html;\n}\n\n// --- Load Main Server Data ---\nasync function loadGateData() {\n  try {\n    const res = await fetch('/health');\n    const data = await res.json();\n    gateData = data;\n\n    const pathPrefix = (window.location.pathname.split('/').filter(Boolean)[0] || 'gate').replace(/^\\//, '');\n    const pubPort = data.publicPort || window.location.port || '8080';\n    const serverHost = data.domain || data.host || window.location.hostname;\n    const locationStr = data.location || 'Global Server';\n\n    // Format Uptime\n    let uptimeStr = '--';\n    if (data.uptime !== undefined) {\n      const days = Math.floor(data.uptime / 86400);\n      const hours = Math.floor((data.uptime % 86400) / 3600);\n      const mins = Math.floor((data.uptime % 3600) / 60);\n      if (days > 0) uptimeStr = `${days}d ${hours}h`;\n      else if (hours > 0) uptimeStr = `${hours}h ${mins}m`;\n      else uptimeStr = `${mins}m ${Math.floor(data.uptime % 60)}s`;\n    }\n\n    // Update Overview Stats\n    const elLoc = document.getElementById('statLocation');\n    if (elLoc) elLoc.innerText = locationStr;\n    const elPort = document.getElementById('statPort');\n    if (elPort) elPort.innerText = pubPort;\n    const elHost = document.getElementById('statHost');\n    if (elHost) elHost.innerText = serverHost;\n    const elUptime = document.getElementById('statUptime');\n    if (elUptime) elUptime.innerText = uptimeStr;\n\n    // Update Engine Tags\n    const engines = [];\n    if (data.engines?.singbox) engines.push('sing-box');\n    if (data.engines?.xray) engines.push('Xray-core');\n    if (data.engines?.argo) engines.push('Argo Tunnel');\n    const elEngines = document.getElementById('engineTags');\n    if (elEngines) {\n      elEngines.innerHTML = engines.map(e => `<span class=\"engine-pill active\">${e}</span>`).join('') || '<span class=\"engine-pill active\">Core Active</span>';\n    }\n\n    // Protocol switcher state\n    let activeProto = (data.forceHttps || window.location.protocol === 'https:') ? 'https:' : 'http:';\n\n    const updateSubUrls = (proto) => {\n      let origin;\n      if (data.publicBaseUrl && typeof data.publicBaseUrl === 'string' && data.publicBaseUrl.trim()) {\n        origin = data.publicBaseUrl.trim().replace(/\\/+$/, '');\n      } else if (data.subBase && typeof data.subBase === 'string' && data.subBase.trim()) {\n        origin = data.subBase.trim().replace(/\\/+$/, '');\n      } else {\n        const hostPort = window.location.port ? `${window.location.hostname}:${window.location.port}` : window.location.hostname;\n        if (proto === 'https:') {\n          origin = data.domain ? (data.domain.startsWith('http') ? data.domain : `https://${data.domain}`) : `https://${hostPort}`;\n        } else {\n          origin = `http://${hostPort}`;\n        }\n      }\n\n      const tok = data.subToken ? encodeURIComponent(data.subToken) : '';\n      const withTok = (url) => tok ? `${url}${url.includes('?') ? '&' : '?'}token=${tok}` : url;\n\n      const subCompat = withTok(`${origin}/${pathPrefix}/base64`);\n      const subFull = withTok(`${origin}/${pathPrefix}/base64?compat=full`);\n      const subClash = withTok(`${origin}/${pathPrefix}/clash`);\n      const subSb = withTok(`${origin}/${pathPrefix}/sb/raw`);\n      const subWg = withTok(`${origin}/${pathPrefix}/wg.conf`);\n\n      const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };\n      setVal('urlSubCompat', subCompat);\n      setVal('urlSubFull', subFull);\n      setVal('urlSubClash', subClash);\n      setVal('urlSubSb', subSb);\n      setVal('urlSubWg', subWg);\n\n      const btnDlWg = document.getElementById('btnDownloadWg');\n      if (btnDlWg) btnDlWg.href = `${origin}/${pathPrefix}/wg.conf`;\n    };\n\n    updateSubUrls(activeProto);\n\n    // Setup interactive protocol toggle buttons\n    const btnHttp = document.getElementById('protoBtnHttp');\n    const btnHttps = document.getElementById('protoBtnHttps');\n    if (btnHttp && btnHttps) {\n      btnHttp.classList.toggle('active', activeProto === 'http:');\n      btnHttps.classList.toggle('active', activeProto === 'https:');\n\n      btnHttp.onclick = () => {\n        activeProto = 'http:';\n        btnHttp.classList.add('active');\n        btnHttps.classList.remove('active');\n        updateSubUrls('http:');\n        showToast('Switched to HTTP (v2rayN Windows compatible)');\n      };\n\n      btnHttps.onclick = () => {\n        activeProto = 'https:';\n        btnHttps.classList.add('active');\n        btnHttp.classList.remove('active');\n        updateSubUrls('https:');\n        showToast('Switched to HTTPS (Requires SSL Proxy/Domain)');\n      };\n    }\n\n    renderNodes();\n  } catch (err) {\n    console.error('Failed to load server data:', err);\n    showToast('Failed to connect to gateway');\n  }\n}\n\n// --- Traffic Usage Controller ---\n(function initTrafficMeter() {\n  const $ = (id) => document.getElementById(id);\n  const pathPrefix = (window.location.pathname.split('/').filter(Boolean)[0] || 'gate').replace(/^\\//, '');\n  const API = `/${pathPrefix}/api/traffic`;\n\n  const PROTO_COLORS = {\n    'VLESS-WS': '#3b82f6',\n    'VMess-WS': '#a855f7',\n    'Trojan-WS': '#f43f5e',\n    'VLESS-XHTTP': '#06b6d4',\n    'VLESS-HTTPUpgrade': '#f59e0b',\n    'VMess-HTTPUpgrade': '#c084fc',\n    'Trojan-HTTPUpgrade': '#fb7185',\n    'VLESS-gRPC': '#10b981',\n    'Shadowsocks-WS': '#fb923c',\n    'Other': '#64748b'\n  };\n\n  const sumTotal = (e) => e ? (e.up || 0) + (e.down || 0) : 0;\n  let timer = null;\n\n  function renderTraffic(data) {\n    if (!data || !data.ok) return;\n\n    // Live speeds\n    const elLiveUp = $('liveSpeedUp');\n    const elLiveDown = $('liveSpeedDown');\n    if (elLiveUp) elLiveUp.innerText = formatBytes(data.live?.upBps || 0) + '/s';\n    if (elLiveDown) elLiveDown.innerText = formatBytes(data.live?.downBps || 0) + '/s';\n\n    // Day, Month, All-Time\n    const setVal = (id, val) => { const el = $(id); if (el) el.innerText = val; };\n    setVal('usageDayTotal', formatBytes(data.day?.total));\n    setVal('usageDayUp', formatBytes(data.day?.up));\n    setVal('usageDayDown', formatBytes(data.day?.down));\n\n    setVal('usageMonthTotal', formatBytes(data.month?.used));\n    setVal('usageMonthUp', formatBytes(data.month?.up));\n    setVal('usageMonthDown', formatBytes(data.month?.down));\n    setVal('usageMonthKey', data.month?.key ? `(${data.month.key})` : '');\n\n    setVal('usageAllTotal', formatBytes(data.allTime?.total));\n    setVal('usageAllUp', formatBytes(data.allTime?.up));\n    setVal('usageAllDown', formatBytes(data.allTime?.down));\n\n    // Limit progress bar\n    const limitCard = $('limitCard');\n    if (data.limit && limitCard) {\n      limitCard.style.display = 'block';\n      const pct = Math.max(0, data.limit.pct || 0);\n      limitCard.className = `limit-alert-card ${data.limit.level === 'over' ? 'over' : data.limit.level === 'warn' ? 'warn' : ''}`;\n      setVal('limitText', `${formatBytes(data.limit.used)} of ${formatBytes(data.limit.bytes)} used`);\n      setVal('limitPct', `${pct.toFixed(1)}%`);\n      const fill = $('limitProgressFill');\n      if (fill) fill.style.width = `${Math.min(100, pct).toFixed(2)}%`;\n      setVal('limitMsg', data.limit.level === 'over' ? 'Monthly traffic quota reached.' : data.limit.level === 'warn' ? `Over 80% used — ${formatBytes(data.limit.remaining)} remaining.` : `${formatBytes(data.limit.remaining)} remaining this month.`);\n    } else if (limitCard) {\n      limitCard.style.display = 'none';\n    }\n\n    // Traffic Table Rows\n    const rowsContainer = $('trafficRows');\n    if (rowsContainer) {\n      const keys = data.keys || [];\n      const visibleKeys = keys.filter(k => ['VLESS-WS', 'VMess-WS', 'Trojan-WS', 'VLESS-XHTTP'].includes(k) || sumTotal(data.allTime?.per?.[k]) > 0 || (data.active?.[k] || 0) > 0);\n      let rowsHtml = '';\n      visibleKeys.forEach(k => {\n        const m = data.month?.per?.[k] || {};\n        const act = data.active?.[k] || 0;\n        const color = PROTO_COLORS[k] || '#94a3b8';\n\n        rowsHtml += `\n          <tr>\n            <td>\n              <div class=\"proto-cell\">\n                <span class=\"proto-color-dot\" style=\"background: ${color};\"></span>\n                <span>${k}</span>\n              </div>\n            </td>\n            <td><span class=\"active-conn-badge ${act ? 'on' : ''}\">${act}</span></td>\n            <td>${formatBytes(sumTotal(data.day?.per?.[k]))}</td>\n            <td>${formatBytes(m.up)}</td>\n            <td>${formatBytes(m.down)}</td>\n            <td><strong>${formatBytes(sumTotal(m))}</strong></td>\n            <td>${formatBytes(sumTotal(data.allTime?.per?.[k]))}</td>\n          </tr>\n        `;\n      });\n      rowsContainer.innerHTML = rowsHtml;\n    }\n  }\n\n  async function fetchTraffic() {\n    try {\n      const res = await fetch(API, { cache: 'no-store' });\n      if (res.ok) renderTraffic(await res.json());\n    } catch {}\n  }\n\n  async function postTraffic(subpath, body) {\n    const res = await fetch(`${API}${subpath}`, {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json', 'X-BK-Req': '1' },\n      body: JSON.stringify(body || {})\n    });\n    if (!res.ok) throw new Error(`HTTP ${res.status}`);\n    renderTraffic(await res.json());\n  }\n\n  function schedule() {\n    clearTimeout(timer);\n    timer = setTimeout(async () => {\n      await fetchTraffic();\n      schedule();\n    }, 3000);\n  }\n\n  // Sync button\n  $('btnSyncTraffic')?.addEventListener('click', async () => {\n    const inp = $('inputSyncGb');\n    const gb = parseFloat(inp?.value);\n    if (!isFinite(gb) || gb < 0) {\n      showToast('Please enter a valid GiB number');\n      return;\n    }\n    try {\n      await postTraffic('/baseline', { gb });\n      if (inp) inp.value = '';\n      showToast('Baseline synchronized successfully');\n    } catch {\n      showToast('Failed to sync baseline');\n    }\n  });\n\n  // Reset button\n  $('btnResetTraffic')?.addEventListener('click', async () => {\n    if (!window.confirm('Reset all traffic counters (Day, Month, All-Time)?')) return;\n    try {\n      await postTraffic('/reset');\n      showToast('Traffic counters reset');\n    } catch {\n      showToast('Failed to reset traffic');\n    }\n  });\n\n  fetchTraffic();\n  schedule();\n})();\n\n// --- Search & Filters Init ---\ndocument.addEventListener('DOMContentLoaded', () => {\n  handleRouting();\n  loadGateData();\n\n  // Search input\n  const searchInput = document.getElementById('nodeSearchInput');\n  if (searchInput) {\n    searchInput.addEventListener('input', (e) => {\n      searchQuery = e.target.value.trim();\n      renderNodes();\n    });\n  }\n\n  // Protocol filter pills\n  document.querySelectorAll('.filter-btn').forEach(btn => {\n    btn.addEventListener('click', () => {\n      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));\n      btn.classList.add('active');\n      activeProtocolFilter = btn.getAttribute('data-filter') || 'all';\n      renderNodes();\n    });\n  });\n\n  // Event Delegation for Copy & QR buttons\n  document.addEventListener('click', (e) => {\n    const btn = e.target.closest('[data-action]');\n    if (!btn) return;\n    const action = btn.getAttribute('data-action');\n    const targetId = btn.getAttribute('data-target');\n    const input = targetId ? document.getElementById(targetId) : null;\n\n    if (action === 'copy-input' && input) {\n      copyTextToClipboard(input.value);\n    } else if (action === 'qr-input' && input) {\n      openQrModal(input.value, btn.getAttribute('data-title') || 'Subscription QR');\n    }\n  });\n});\n"
};

class AssetManager {
  static _assetCandidates(filename) {
    const dirs = [
      path.join(process.cwd(), 'assets'),
      path.join(process.cwd()),
      path.join(__dirname, 'assets'),
      path.join(__dirname),
      path.join(__dirname, '..', 'assets')
    ];
    const list = [];
    const baseNoExt = filename.replace(/\.[^.]+$/, '');
    const ext = path.extname(filename);
    const variations = [
      filename,
      filename.toLowerCase(),
      filename.toUpperCase(),
      baseNoExt.toLowerCase() + ext.toLowerCase(),
      baseNoExt.toLowerCase() + ext.toUpperCase()
    ];
    for (const d of dirs) {
      for (const v of variations) {
        const full = path.join(d, v);
        if (!list.includes(full)) list.push(full);
      }
    }
    return list;
  }

  static _readFileCandidate(filenames) {
    const names = Array.isArray(filenames) ? filenames : [filenames];
    for (const name of names) {
      for (const p of this._assetCandidates(name)) {
        try {
          if (fs.existsSync(p)) {
            const buf = fs.readFileSync(p);
            if (buf && buf.length > 0) return buf;
          }
        } catch (_) {}
      }
    }
    return null;
  }

  static getIndexHtml() {
    const disk = this._readFileCandidate(['index.html']);
    if (disk) return disk.toString('utf8');
    return EMBEDDED_ASSETS.indexHtml;
  }

  static getAppCss() {
    const disk = this._readFileCandidate(['app.css']);
    if (disk) return disk.toString('utf8');
    return EMBEDDED_ASSETS.appCss;
  }

  static getAppJs() {
    const disk = this._readFileCandidate(['app.js']);
    if (disk) return disk.toString('utf8');
    return EMBEDDED_ASSETS.appJs;
  }

  static getLogo() {
    const disk = this._readFileCandidate(['logo.svg', 'logo.png', 'logo.jpg', 'logo-64.png']);
    if (disk) return disk;
    return Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="16" fill="#6366f1"/><path d="M32 14L16 23l16 9 16-9-16-9zM16 34l16 9 16-9M16 27l16 9 16-9" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>');
  }

  static getBgJpg() {
    return this._readFileCandidate(['bg.jpg', 'bg.png']);
  }

  static getCozyBgJpg() {
    return this._readFileCandidate(['cozybg.jpg', 'cozybg.png']);
  }

  static getHomeJpg() {
    return this._readFileCandidate(['home.jpg', 'home.png']);
  }
}

// --- Module: lib/tls-sni.js ---
/**
 * Extracts Server Name Indication (SNI) and ALPN from TLS ClientHello record buffer
 * RFC 5246 / RFC 8446 / RFC 7301 compliant binary parser
 */
function parseClientHello(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 42) {
    return { sni: null, alpn: [] };
  }

  try {
    if (buf[0] !== 0x16 || buf[1] !== 0x03) {
      return { sni: null, alpn: [] };
    }

    let offset = 5;
    if (buf[offset] !== 0x01) {
      return { sni: null, alpn: [] };
    }

    offset += 1 + 3 + 2 + 32;
    if (offset >= buf.length) return { sni: null, alpn: [] };

    const sessionIdLen = buf[offset];
    offset += 1 + sessionIdLen;
    if (offset + 2 > buf.length) return { sni: null, alpn: [] };

    const cipherSuitesLen = buf.readUInt16BE(offset);
    offset += 2 + cipherSuitesLen;
    if (offset + 1 > buf.length) return { sni: null, alpn: [] };

    const compMethodsLen = buf[offset];
    offset += 1 + compMethodsLen;
    if (offset + 2 > buf.length) return { sni: null, alpn: [] };

    const extTotalLen = buf.readUInt16BE(offset);
    offset += 2;
    const extLimit = Math.min(offset + extTotalLen, buf.length);

    let sni = null;
    const alpn = [];

    while (offset + 4 <= extLimit) {
      const extType = buf.readUInt16BE(offset);
      const extLen = buf.readUInt16BE(offset + 2);
      offset += 4;

      if (extType === 0x0000 && !sni) {
        // server_name
        if (offset + 2 <= extLimit) {
          const sniListLen = buf.readUInt16BE(offset);
          let sniOffset = offset + 2;
          const sniLimit = Math.min(sniOffset + sniListLen, extLimit);

          while (sniOffset + 3 <= sniLimit) {
            const nameType = buf[sniOffset];
            const nameLen = buf.readUInt16BE(sniOffset + 1);
            sniOffset += 3;

            if (nameType === 0x00 && sniOffset + nameLen <= buf.length) {
              sni = buf.toString('utf8', sniOffset, sniOffset + nameLen);
              break;
            }
            sniOffset += nameLen;
          }
        }
      } else if (extType === 0x0010) {
        // ALPN (Application-Layer Protocol Negotiation)
        if (offset + 2 <= extLimit) {
          const alpnListLen = buf.readUInt16BE(offset);
          let aOffset = offset + 2;
          const aLimit = Math.min(aOffset + alpnListLen, extLimit);
          while (aOffset + 1 <= aLimit) {
            const pLen = buf[aOffset];
            aOffset++;
            if (aOffset + pLen <= aLimit) {
              alpn.push(buf.toString('utf8', aOffset, aOffset + pLen));
            }
            aOffset += pLen;
          }
        }
      }

      offset += extLen;
    }

    return { sni, alpn };
  } catch {
    return { sni: null, alpn: [] };
  }
}

function parseClientHelloSni(buf) {
  return parseClientHello(buf).sni;
}

function parseClientHelloAlpn(buf) {
  return parseClientHello(buf).alpn;
}

// --- Module: lib/logger.js ---
const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  electric: '\x1b[38;5;39m',
  navy: '\x1b[38;5;25m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  white: '\x1b[37m'
};

class Logger {
  static quiet = false;

  static banner() {
    if (this.quiet) return;
    console.log(
      "\n" + ANSI.electric + ANSI.bold +
      "  ==============================================================\n" +
      "   Z E D E C C O   G A T E\n" +
      "   Multi-Protocol Proxy & Gateway Multiplexed on 1 Port\n" +
      "  ==============================================================" + ANSI.reset + "\n"
    );
    console.log(ANSI.cyan + "================================================================" + ANSI.reset);
    console.log(ANSI.bold + ANSI.electric + "  ZEDECCO GATE " + ANSI.white + "• Platform: " + bkPlatformName() + ANSI.reset);
    console.log(ANSI.dim + "  Clean multi-protocol proxy engine on a single port" + ANSI.reset);
    console.log(ANSI.cyan + "================================================================" + ANSI.reset + "\n");
  }

  static renewNotice() {}

  static info(msg) {
    if (!this.quiet) console.log(`${ANSI.cyan}[i] ${msg}${ANSI.reset}`);
  }

  static success(msg) {
    if (!this.quiet) console.log(`${ANSI.green}[OK] ${msg}${ANSI.reset}`);
  }

  static warn(msg) {
    if (!this.quiet) console.log(`${ANSI.yellow}[!] ${msg}${ANSI.reset}`);
  }

  static error(msg) {
    console.error(`${ANSI.red}[X] ${msg}${ANSI.reset}`);
  }

  static step(msg) {
    if (!this.quiet) console.log(`${ANSI.electric}==> ${msg}${ANSI.reset}`);
  }

  static item(label, val) {
    if (!this.quiet) {
      console.log(`  ${ANSI.cyan}${label.padEnd(18)}:${ANSI.reset} ${ANSI.white}${val}${ANSI.reset}`);
    }
  }

  static section(title) {
    if (!this.quiet) {
      console.log(`\n${ANSI.bold}${ANSI.electric}--- ${title} ---${ANSI.reset}`);
    }
  }
}

// --- Module: lib/config.js ---
// BK_FIX3_APPLIED
// BK_REPLIT_APPLIED
function bkOnReplit() {
  return !!(process.env.REPLIT_DEPLOYMENT || process.env.REPL_ID || process.env.REPLIT_DOMAINS || process.env.REPLIT_DEV_DOMAIN);
}
function bkOnRailway() {
  return !!(process.env.RAILWAY_PROJECT_ID || process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_SERVICE_ID || process.env.RAILWAY_PUBLIC_DOMAIN);
}
/** Replit / Railway: public edge terminates TLS on 443 and forwards plain HTTP to PORT. */
function bkOnEdgeHost() { return bkOnReplit() || bkOnRailway(); }
function bkPlatformName() { return bkOnReplit() ? 'Replit' : (bkOnRailway() ? 'Railway' : 'Self-hosted'); }
/** Published Replit app domain from REPLIT_DOMAINS (custom domain first, then *.replit.app; never the private *.replit.dev). */
function bkReplitDomain() {
  if (!process.env.REPLIT_DEPLOYMENT) return '';
  const list = String(process.env.REPLIT_DOMAINS || '').split(',').map((d) => normalizeHost(d)).filter(Boolean);
  return list.find((d) => !d.endsWith('.replit.app') && !d.endsWith('.replit.dev')) || list.find((d) => d.endsWith('.replit.app')) || '';
}
/** Platform default hostnames: a relay / custom domain the visitor used beats these. */
function bkIsPlatformHost(h) { return /(^|\.)(up\.railway\.app|replit\.app|replit\.dev)$/.test(String(h || '')); }
/** Normalize "https://Name.example.com:443/path" -> "name.example.com" (IPv6 literals kept). */
function normalizeHost(v) {
  let h = String(v || '').trim();
  if (!h) return '';
  h = h.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '').split('/')[0].split('?')[0].split('#')[0];
  if (h.startsWith('[')) return h.slice(0, h.indexOf(']') + 1);
  if ((h.match(/:/g) || []).length === 1) h = h.split(':')[0];
  return h.toLowerCase();
}
function isIpLiteral(h) {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(h) || h.includes(':') || h.startsWith('[');
}
// BK_PROTOCOLS_APPLIED: every path / gRPC service routed on the single public port
const BK_P = '/gate-';
const BK_PATHS = {
  vlessWs: '/ws',
  vmessWs: '/vmess',
  trojanWs: '/trojan',
  vlessHu: '/hu',
  vmessHu: '/vmess-hu',
  trojanHu: '/trojan-hu',
  xhttp: '/xhttp',
  ssWs: '/ss',
  grpcService: 'grpc'
};
const BK_UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Short, non-secret form of a credential for logs. */
function bkMask(v) { v = String(v || ''); return v ? v.slice(0, 4) + '…' + '(' + v.length + ' chars)' : '(empty)'; }
/** Shadowsocks 2022 methods need a base64 key of an exact length. */
function bkSs2022KeyLen(method) { return /^2022-blake3-aes-128-gcm$/i.test(method) ? 16 : (/^2022-blake3-/i.test(method) ? 32 : 0); }

/**
 * Default configuration template for Zedecco Gate
 */
const DEFAULT_CONFIG = {
  brand: 'Zedecco Gate',
  product: 'Zedecco Gate',
  tagline: 'Multiplexed edge proxy on a single port',
  sponsorUrl: '',
  sponsorName: '',
  publicPort: parseInt(process.env.PORT || process.env.SERVER_PORT || '8080', 10) || 8080,
  panelPath: 'gate',
  dataDirHint: '/data',
  uuid: '',
  domain: '',
  forceHost: '',
  publicBaseUrl: process.env.PUBLIC_BASE_URL || process.env.SUB_BASE_URL || '',
  subBase: process.env.SUB_BASE || '',
  forceHttps: process.env.FORCE_HTTPS === 'true' || false,
  allowLocalHostLinks: false,
  nodePrefix: 'Zedecco - ',
  sniHy2: 'www.google.com',
  massProxyUrl: 'https://www.gstatic.com',
  enable: {
    hysteria2: false,
    vlessWs: true,
    vlessWsTls: true,
    vlessHttpUpgrade: true,
    vmessHttpUpgrade: true,
    trojanHttpUpgrade: true,
    vlessXhttp: false,
    vlessGrpc: true,
    vlessGrpcTls: true,
    trojanWs: true,
    trojanWsTls: true,
    ssWs: false,
    trojanGrpcTls: true,
    vmessWsTls: true,
    vmessWs: true,
    reality: true,
    shadowTlsVless: false,
    shadowsocks: true,
    wireguard: true,
    tuic: false,
    socks: false,
    httpProxy: false,
    argo: false
  },
  argo: {
    domain: '',
    auth: '',
    localPort: 8001
  },
  reality: {
    target: 'www.microsoft.com',
    targetPort: 443,
    shortId: ''
  },
  shadowTls: {
    sni: 'www.microsoft.com',
    password: ''
  },
  shadowsocks: {
    method: 'aes-256-gcm',
    password: ''
  },
  wireguard: {
    port: 51820,
    serverIp: '10.66.66.1/24',
    clientIp: '10.66.66.2/32',
    mtu: 1420
  },
  tuic: {
    port: 8443,
    congestionController: 'bbr'
  },
  socks: {
    user: '',
    pass: ''
  },
  httpProxy: {
    user: '',
    pass: ''
  },
  singBoxVersion: '1.11.15',
  xrayVersion: '',
  panelToken: '',
  cpuLimitPercent: null,
  quietConsoleAfterMs: 180000,
  channelUrl: ''
};

/**
 * Determine suitable writable data directory for Railway (volume) or local
 */
function resolveDataDir(hint = '/data') {
  const tryDir = (dir) => {
    try {
      fs.mkdirSync(dir, { recursive: true });
      fs.accessSync(dir, fs.constants.W_OK);
      const probe = path.join(dir, '.zedecco-write-test');
      fs.writeFileSync(probe, 'ok'); fs.unlinkSync(probe);
      return true;
    } catch { return false; }
  };
  const candidates = [
    [process.env.BK_DATA_DIR || process.env.DATA_DIR || process.env.FILE_PATH, 'Custom DATA_DIR'],
    [path.join(process.cwd(), 'data'), './data directory in project root'],
    [path.join(process.cwd(), 'bk-data'), './bk-data fallback in project root'],
    [process.env.RAILWAY_VOLUME_MOUNT_PATH, 'Railway volume'],
    [hint && hint !== '/data' ? hint : null, 'custom hint ' + hint],
    [path.join(__dirname, 'data'), 'app-dir data fallback'],
    [path.join(os.tmpdir(), 'zedecco-data'), 'temp-dir fallback']
  ];
  for (const [dir, source] of candidates) {
    if (dir && tryDir(dir)) { resolveDataDir.info = { dir, source }; return dir; }
  }
  const dir = path.join(os.tmpdir(), 'zedecco-data');
  resolveDataDir.info = { dir, source: 'temp-dir fallback' };
  return dir;
}

/**
 * Merge user runtime config with environment variables and defaults
 */
function buildConfig(userOverrides = {}) {
  const cfg = JSON.parse(JSON.stringify(DEFAULT_CONFIG));

  // Merge direct overrides
  if (userOverrides && typeof userOverrides === 'object') {
    for (const [key, val] of Object.entries(userOverrides)) {
      if (val !== undefined && val !== null) {
        if (typeof val === 'object' && !Array.isArray(val) && cfg[key] && typeof cfg[key] === 'object') {
          cfg[key] = { ...cfg[key], ...val };
        } else {
          cfg[key] = val;
        }
      }
    }
  }

  // Environment variables overrides
  const env = process.env;
  const parseBool = (v, defaultVal) => (v !== undefined ? v === '1' || v === 'true' : defaultVal);

  if (env.PORT || env.SERVER_PORT || env.SB_PORT) {
    const parsedPort = parseInt(env.PORT || env.SERVER_PORT || env.SB_PORT, 10);
    if (!isNaN(parsedPort) && parsedPort > 0) {
      cfg.publicPort = parsedPort;
    }
  }
  if (env.UUID || env.SB_UUID) cfg.uuid = env.UUID || env.SB_UUID;
  if (env.DOMAIN || env.SB_DOMAIN) cfg.domain = env.DOMAIN || env.SB_DOMAIN;
  if (env.FORCE_HOST || env.CFIP) cfg.forceHost = env.FORCE_HOST || env.CFIP;
  if (env.ALLOW_LOCALHOST_LINKS !== undefined) cfg.allowLocalHostLinks = parseBool(env.ALLOW_LOCALHOST_LINKS, false);
  if (env.PANEL_PATH || env.SUB_PATH) cfg.panelPath = (env.PANEL_PATH || env.SUB_PATH).replace(/^\//, '');
  if (env.NODE_PREFIX) cfg.nodePrefix = env.NODE_PREFIX;
  if (env.PANEL_TOKEN) cfg.panelToken = env.PANEL_TOKEN;
  if (env.SNI_HY2 || env.SB_SNI) cfg.sniHy2 = env.SNI_HY2 || env.SB_SNI;
  if (env.MASS_PROXY_URL || env.SB_MASS_PROXY) cfg.massProxyUrl = env.MASS_PROXY_URL || env.SB_MASS_PROXY;

  // Protocol enable switches via env
  if (env.ENABLE_HYSTERIA2 !== undefined) cfg.enable.hysteria2 = parseBool(env.ENABLE_HYSTERIA2, cfg.enable.hysteria2);
  if (env.ENABLE_VLESS_WS !== undefined) cfg.enable.vlessWs = parseBool(env.ENABLE_VLESS_WS, cfg.enable.vlessWs);
  if (env.ENABLE_HTTPUPGRADE !== undefined) cfg.enable.vlessHttpUpgrade = parseBool(env.ENABLE_HTTPUPGRADE, cfg.enable.vlessHttpUpgrade);
  if (env.ENABLE_XHTTP !== undefined) cfg.enable.vlessXhttp = parseBool(env.ENABLE_XHTTP, cfg.enable.vlessXhttp);
  else if (bkOnEdgeHost()) cfg.enable.vlessXhttp = true;
  if (env.XRAY_VERSION) cfg.xrayVersion = String(env.XRAY_VERSION).trim().replace(/^v/i, '');
  if (env.ENABLE_REALITY !== undefined) cfg.enable.reality = parseBool(env.ENABLE_REALITY, cfg.enable.reality);
  if (env.ENABLE_VLESS_GRPC !== undefined) cfg.enable.vlessGrpc = parseBool(env.ENABLE_VLESS_GRPC, cfg.enable.vlessGrpc);
  // BK_PROTOCOLS_APPLIED: per-type switches (all share the one public PORT)
  const bkSw = { ENABLE_VLESS_WS_TLS: 'vlessWsTls', ENABLE_VMESS_WS: 'vmessWs', ENABLE_VMESS_WS_TLS: 'vmessWsTls',
    ENABLE_VLESS_GRPC_TLS: 'vlessGrpcTls', ENABLE_TROJAN_GRPC_TLS: 'trojanGrpcTls', ENABLE_TROJAN_WS_TLS: 'trojanWsTls',
    ENABLE_VMESS_HTTPUPGRADE: 'vmessHttpUpgrade', ENABLE_TROJAN_HTTPUPGRADE: 'trojanHttpUpgrade', ENABLE_SS_WS: 'ssWs' };
  for (const [k, f] of Object.entries(bkSw)) if (env[k] !== undefined) cfg.enable[f] = parseBool(env[k], cfg.enable[f]);
  if (env.ENABLE_TROJAN_WS !== undefined || env.ENABLE_TROJAN !== undefined) {
    cfg.enable.trojanWs = parseBool(env.ENABLE_TROJAN_WS !== undefined ? env.ENABLE_TROJAN_WS : env.ENABLE_TROJAN, cfg.enable.trojanWs);
  }
  if (env.ENABLE_SHADOWTLS_VLESS !== undefined) cfg.enable.shadowTlsVless = parseBool(env.ENABLE_SHADOWTLS_VLESS, cfg.enable.shadowTlsVless);
  if (env.ENABLE_SS !== undefined) cfg.enable.shadowsocks = parseBool(env.ENABLE_SS, cfg.enable.shadowsocks);
  if (env.ENABLE_WIREGUARD !== undefined || env.ENABLE_WG !== undefined) {
    cfg.enable.wireguard = parseBool(env.ENABLE_WIREGUARD !== undefined ? env.ENABLE_WIREGUARD : env.ENABLE_WG, cfg.enable.wireguard);
  }
  if (env.ENABLE_TUIC !== undefined) cfg.enable.tuic = parseBool(env.ENABLE_TUIC, cfg.enable.tuic);
  if (env.ENABLE_SOCKS !== undefined) cfg.enable.socks = parseBool(env.ENABLE_SOCKS, cfg.enable.socks);
  if (env.ENABLE_HTTP_PROXY !== undefined) cfg.enable.httpProxy = parseBool(env.ENABLE_HTTP_PROXY, cfg.enable.httpProxy);
  if (env.ENABLE_ARGO !== undefined) cfg.enable.argo = parseBool(env.ENABLE_ARGO, cfg.enable.argo);

  if (env.WG_PORT) cfg.wireguard.port = parseInt(env.WG_PORT, 10);
  if (env.WG_SERVER_IP) cfg.wireguard.serverIp = env.WG_SERVER_IP;
  if (env.WG_CLIENT_IP) cfg.wireguard.clientIp = env.WG_CLIENT_IP;

  if (env.TUIC_PORT) cfg.tuic.port = parseInt(env.TUIC_PORT, 10);
  if (env.TUIC_CC) cfg.tuic.congestionController = env.TUIC_CC;

  if (env.ARGO_DOMAIN) cfg.argo.domain = env.ARGO_DOMAIN;
  if (env.ARGO_AUTH) cfg.argo.auth = env.ARGO_AUTH;
  if (env.ARGO_PORT) cfg.argo.localPort = parseInt(env.ARGO_PORT, 10);

  if (env.REALITY_TARGET) cfg.reality.target = env.REALITY_TARGET;
  if (env.REALITY_TARGET_PORT) cfg.reality.targetPort = parseInt(env.REALITY_TARGET_PORT, 10);
  if (env.REALITY_SHORT_ID) cfg.reality.shortId = env.REALITY_SHORT_ID;

  if (env.SHADOWTLS_SNI) cfg.shadowTls.sni = env.SHADOWTLS_SNI;
  if (env.SHADOWTLS_PASSWORD) cfg.shadowTls.password = env.SHADOWTLS_PASSWORD;

  if (env.SS_METHOD) cfg.shadowsocks.method = env.SS_METHOD;
  if (env.SS_PASSWORD) cfg.shadowsocks.password = env.SS_PASSWORD;

  if (env.CPU_LIMIT_PERCENT) cfg.cpuLimitPercent = parseInt(env.CPU_LIMIT_PERCENT, 10);

  // Public hostname: DOMAIN / FORCE_HOST win, then Railway's generated domain. Never fall back to an
  // egress IP on Railway (the edge routes by hostname only; an IP link can never connect).
  // Replit: REPLIT_DOMAINS (published app only). Railway: RAILWAY_PUBLIC_DOMAIN.
  cfg.domain = normalizeHost(cfg.domain) || bkReplitDomain() || normalizeHost(env.RAILWAY_PUBLIC_DOMAIN) || normalizeHost(env.RAILWAY_STATIC_URL) || '';
  cfg.forceHost = normalizeHost(cfg.forceHost) || '';

  // Data paths
  const dataDir = resolveDataDir(cfg.dataDirHint);
  const isWin = os.platform() === 'win32';
  const legacySb = path.join(dataDir, 'bin', isWin ? 'sing-box.exe' : 'sing-box');
  const disguisedSb = path.join(dataDir, 'bin', isWin ? 'app-core.exe' : 'app-core');
  const legacyXr = path.join(dataDir, 'bin', isWin ? 'xray.exe' : 'xray');
  const disguisedXr = path.join(dataDir, 'bin', isWin ? 'app-worker.exe' : 'app-worker');

  const paths = {
    dataDir,
    stateFile: path.join(dataDir, 'state.json'),
    binDir: path.join(dataDir, 'bin'),
    certDir: path.join(dataDir, 'cert'),
    certPath: path.join(dataDir, 'cert', 'cert.pem'),
    keyPath: path.join(dataDir, 'cert', 'key.pem'),
    singboxBin: fs.existsSync(legacySb) ? legacySb : disguisedSb,
    singboxConfig: path.join(dataDir, 'app-core.json'),
    singboxLog: path.join(dataDir, 'app-core.log'),
    xrayBin: fs.existsSync(legacyXr) ? legacyXr : disguisedXr,
    xrayConfig: path.join(dataDir, 'app-worker.json'),
    xrayLog: path.join(dataDir, 'app-worker.log'),
    cloudflaredBin: path.join(dataDir, 'bin', isWin ? 'app-tunnel.exe' : 'app-tunnel'),
    cloudflaredLog: path.join(dataDir, 'app-tunnel.log')
  };

  return {
    ...cfg,
    paths
  };
}

// --- Module: lib/ports.js ---
/**
 * Finds an available TCP port on localhost (127.0.0.1)
 */
function findFreePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.on('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const address = srv.address();
      const port = typeof address === 'object' && address ? address.port : null;
      srv.close((err) => {
        if (err) return reject(err);
        if (!port) return reject(new Error('Failed to resolve ephemeral port'));
        resolve(port);
      });
    });
  });
}

/**
 * Allocates multiple distinct free local ports
 */
async function allocatePorts(count = 1) {
  const ports = [];
  for (let i = 0; i < count; i++) {
    // Small delay ensures OS port reclamation doesn't return same port
    const p = await findFreePort();
    ports.push(p);
  }
  return count === 1 ? ports[0] : ports;
}

// --- Module: lib/state.js ---
function deriveX25519PublicKey(privBase64) {
  try {
    if (!privBase64 || typeof privBase64 !== 'string') return null;
    const privBuf = Buffer.from(privBase64.trim(), 'base64');
    if (privBuf.length !== 32) return null;
    const pkcs8 = Buffer.concat([Buffer.from('302e020100300506032b656e04220420', 'hex'), privBuf]);
    const keyObj = crypto.createPrivateKey({ key: pkcs8, format: 'der', type: 'pkcs8' });
    return crypto.createPublicKey(keyObj).export({ type: 'spki', format: 'der' }).subarray(-32).toString('base64');
  } catch {
    return null;
  }
}

class StateManager {
  constructor(paths, initialConfig) {
    this.paths = paths;
    this.config = initialConfig;
    this.state = {
      uuid: '',
      hy2Password: '',
      hy2ObfsPassword: '',
      realityPrivateKey: '',
      realityPublicKey: '',
      realityShortId: '',
      shadowTlsPassword: '',
      shadowsocksPassword: '',
      wireguardPrivateKey: '',
      wireguardPublicKey: '',
      wireguardClientPrivateKey: '',
      wireguardClientPublicKey: '',
      publicIp: '',
      links: [],
      clashYaml: '',
      singboxJson: '',
      xrayJson: '',
      base64Sub: '',
      updatedAt: null
    };
  }

  loadOrCreate() {
    try {
      fs.mkdirSync(this.paths.dataDir, { recursive: true });
      if (fs.existsSync(this.paths.stateFile)) {
        const raw = fs.readFileSync(this.paths.stateFile, 'utf8');
        const parsed = JSON.parse(raw);
        this.state = { ...this.state, ...parsed };
      }
    } catch (err) {
      Logger.warn(`Failed to read existing state.json: ${err.message}. Generating fresh state.`);
    }

    // UUID: Config (env UUID) -> Persisted state -> Generate
    if (this.config.uuid) {
      const raw = String(this.config.uuid).trim();
      if (BK_UUID_RE.test(raw)) {
        this.state.uuid = raw.toLowerCase();
      } else {
        // sing-box rejects non-UUID ids (the whole config would fail): derive a stable UUID from the value instead.
        const h = crypto.createHash('sha256').update(raw).digest();
        h[6] = (h[6] & 0x0f) | 0x40; h[8] = (h[8] & 0x3f) | 0x80;
        const x = h.subarray(0, 16).toString('hex');
        this.state.uuid = `${x.slice(0, 8)}-${x.slice(8, 12)}-${x.slice(12, 16)}-${x.slice(16, 20)}-${x.slice(20, 32)}`;
        Logger.warn('UUID env value is not a valid UUID (xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx); using a stable UUID derived from it.');
      }
    } else if (!this.state.uuid || !BK_UUID_RE.test(this.state.uuid)) {
      this.state.uuid = crypto.randomUUID();
    }

    // Hysteria2 credentials
    this.state.hy2Password = this.state.uuid;
    if (!this.state.hy2ObfsPassword) {
      this.state.hy2ObfsPassword = crypto.randomBytes(8).toString('hex');
    }

    // ShadowTLS credentials
    if (this.config.shadowTls.password) {
      this.state.shadowTlsPassword = this.config.shadowTls.password;
    } else if (!this.state.shadowTlsPassword) {
      this.state.shadowTlsPassword = crypto.randomBytes(12).toString('hex');
    }

    // Shadowsocks credentials
    if (this.config.shadowsocks.password) {
      this.state.shadowsocksPassword = this.config.shadowsocks.password;
    } else if (!this.state.shadowsocksPassword) {
      this.state.shadowsocksPassword = crypto.randomBytes(16).toString('base64url');
    }
    // Shadowsocks 2022 needs a base64 key of exactly 16/32 bytes
    const ssKeyLen = bkSs2022KeyLen(this.config.shadowsocks.method || '');
    if (ssKeyLen) {
      let ok = false;
      try { ok = /^[A-Za-z0-9+/]+={0,2}$/.test(this.state.shadowsocksPassword) && Buffer.from(this.state.shadowsocksPassword, 'base64').length === ssKeyLen; } catch (_) {}
      if (!ok) {
        if (this.config.shadowsocks.password) Logger.warn(`SS_PASSWORD is not a base64 ${ssKeyLen}-byte key (required by ${this.config.shadowsocks.method}); using a generated key.`);
        this.state.ssKey2022 = (this.state.ssKey2022 && Buffer.from(this.state.ssKey2022, 'base64').length === ssKeyLen) ? this.state.ssKey2022 : crypto.randomBytes(ssKeyLen).toString('base64');
        this.state.shadowsocksPassword = this.state.ssKey2022;
      }
    }

    // Reality shortId (only if enabled)
    if (!(this.config.enable && this.config.enable.reality)) {
      this.state.realityShortId = '';
    } else if (this.config.reality.shortId) {
      this.state.realityShortId = this.config.reality.shortId;
    } else if (!this.state.realityShortId) {
      this.state.realityShortId = crypto.randomBytes(4).toString('hex');
    }

    if (this.config.enable && this.config.enable.wireguard) {
    // WireGuard keypairs (Server & Client)
    const isValidKey = (k) => typeof k === 'string' && k.trim().length >= 40;
    let srvPriv = this.state.wireguardPrivateKey;
    let srvPub = this.state.wireguardPublicKey;
    let cliPriv = this.state.wireguardClientPrivateKey;
    let cliPub = this.state.wireguardClientPublicKey;

    if (!isValidKey(srvPriv) || !isValidKey(srvPub)) {
      try {
        const srv = crypto.generateKeyPairSync('x25519');
        srvPriv = srv.privateKey.export({ type: 'pkcs8', format: 'der' }).subarray(-32).toString('base64');
        srvPub = srv.publicKey.export({ type: 'spki', format: 'der' }).subarray(-32).toString('base64');
      } catch (err) {
        Logger.warn(`Failed to generate WireGuard server keypair: ${err.message}`);
      }
    } else {
      const derived = deriveX25519PublicKey(srvPriv);
      if (derived) srvPub = derived;
    }

    if (!isValidKey(cliPriv) || !isValidKey(cliPub)) {
      try {
        const cli = crypto.generateKeyPairSync('x25519');
        cliPriv = cli.privateKey.export({ type: 'pkcs8', format: 'der' }).subarray(-32).toString('base64');
        cliPub = cli.publicKey.export({ type: 'spki', format: 'der' }).subarray(-32).toString('base64');
      } catch (err) {
        Logger.warn(`Failed to generate WireGuard client keypair: ${err.message}`);
      }
    } else {
      const derived = deriveX25519PublicKey(cliPriv);
      if (derived) cliPub = derived;
    }

    this.state.wireguardPrivateKey = srvPriv;
    this.state.wireguardPublicKey = srvPub;
    this.state.wireguardClientPrivateKey = cliPriv;
    this.state.wireguardClientPublicKey = cliPub;
    } else {
      this.state.wireguardPrivateKey = '';
      this.state.wireguardPublicKey = '';
      this.state.wireguardClientPrivateKey = '';
      this.state.wireguardClientPublicKey = '';
    }

    this.save();
    return this.state;
  }

  setRealityKeys(privateKey, publicKey) {
    this.state.realityPrivateKey = privateKey;
    this.state.realityPublicKey = publicKey;
    this.save();
  }

  setWireGuardKeys(serverPriv, serverPub, clientPriv, clientPub) {
    this.state.wireguardPrivateKey = serverPriv;
    this.state.wireguardPublicKey = serverPub;
    this.state.wireguardClientPrivateKey = clientPriv;
    this.state.wireguardClientPublicKey = clientPub;
    this.save();
  }

  setLinks(links, clashYaml = '', singboxJson = '', xrayJson = '') {
    this.state.links = links;
    this.state.clashYaml = clashYaml;
    this.state.singboxJson = singboxJson;
    this.state.xrayJson = xrayJson;
    this.state.base64Sub = Buffer.from(links.join('\n')).toString('base64');
    this.save();
  }

  setPublicIp(ip) {
    this.state.publicIp = ip;
    this.save();
  }

  save() {
    try {
      this.state.updatedAt = new Date().toISOString();
      fs.mkdirSync(this.paths.dataDir, { recursive: true });
      fs.writeFileSync(this.paths.stateFile, JSON.stringify(this.state, null, 2), 'utf8');
    } catch (err) {
      Logger.warn(`Could not save state.json: ${err.message}`);
    }
  }
}

StateManager.deriveX25519PublicKey = deriveX25519PublicKey;

// --- Module: lib/binaries.js ---
/**
 * Normalizes system architecture to sing-box and xray standard
 */
function getNormalizedArch() {
  const arch = os.arch();
  if (arch === 'arm64' || arch === 'aarch64') {
    return { sb: 'arm64', xray: 'arm64-v8a', cf: 'arm64' };
  }
  return { sb: 'amd64', xray: '64', cf: 'amd64' };
}

/**
 * Checks free disk space in megabytes using df -m if on Linux
 */
function checkDiskSpaceMb(dir) {
  if (os.platform() !== 'linux') return 1024; // assume OK on dev machines
  try {
    const res = spawnSync('df', ['-m', dir], { encoding: 'utf8', timeout: 3000 });
    if (res.status === 0 && res.stdout) {
      const lines = res.stdout.trim().split('\n');
      if (lines.length >= 2) {
        const parts = lines[1].trim().split(/\s+/);
        const avail = parseInt(parts[3], 10);
        if (!isNaN(avail)) return avail;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Download a file with timeout and streaming
 */
async function downloadToFile(url, destPath) {
  const tempPath = `${destPath}.tmp_${Date.now()}`;
  const writer = fs.createWriteStream(tempPath);

  try {
    const resp = await axios({
      method: 'get',
      url,
      responseType: 'stream',
      timeout: 60000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'ZedeccoGate/1.0'
      }
    });

    await new Promise((resolve, reject) => {
      let resolved = false;
      const onError = (err) => {
        if (!resolved) {
          resolved = true;
          try { writer.close(); } catch (_) {}
          reject(err);
        }
      };
      resp.data.on('error', onError);
      writer.on('error', onError);
      writer.on('finish', () => {
        if (!resolved) {
          resolved = true;
          resolve();
        }
      });
      resp.data.pipe(writer);
    });

    fs.renameSync(tempPath, destPath);
    if (os.platform() !== 'win32') {
      try { fs.chmodSync(destPath, 0o755); } catch (_) {}
    }
    return true;
  } catch (err) {
    try {
      writer.close();
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    } catch (_) {}
    throw err;
  }
}

/** Extract a single file (by base name) from a .zip without external tools (Railway images may lack unzip). */
function extractFromZip(zipPath, wantNames) {
  const buf = fs.readFileSync(zipPath);
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('zip: end of central directory not found');
  const count = buf.readUInt16LE(eocd + 10);
  let off = buf.readUInt32LE(eocd + 16);
  for (let k = 0; k < count; k++) {
    if (buf.readUInt32LE(off) !== 0x02014b50) throw new Error('zip: bad central directory');
    const method = buf.readUInt16LE(off + 10);
    const crc = buf.readUInt32LE(off + 16) >>> 0;
    const csize = buf.readUInt32LE(off + 20);
    const usize = buf.readUInt32LE(off + 24);
    const nlen = buf.readUInt16LE(off + 28), elen = buf.readUInt16LE(off + 30), clen = buf.readUInt16LE(off + 32);
    const lho = buf.readUInt32LE(off + 42);
    const name = buf.toString('utf8', off + 46, off + 46 + nlen);
    off += 46 + nlen + elen + clen;
    const base = name.split('/').pop();
    if (!wantNames.includes(base)) continue;
    if (buf.readUInt32LE(lho) !== 0x04034b50) throw new Error('zip: bad local header');
    const start = lho + 30 + buf.readUInt16LE(lho + 26) + buf.readUInt16LE(lho + 28);
    const raw = buf.subarray(start, start + csize);
    let data;
    if (method === 0) data = Buffer.from(raw);
    else if (method === 8) data = zlib.inflateRawSync(raw);
    else throw new Error('zip: unsupported compression method ' + method);
    if (data.length !== usize) throw new Error('zip: size mismatch for ' + base);
    if (typeof zlib.crc32 === 'function' && (zlib.crc32(data) >>> 0) !== crc) throw new Error('zip: CRC mismatch for ' + base);
    return { name: base, data };
  }
  return null;
}

/** Fetch "<url>.dgst" (Xray release format) and return the SHA-256 hex, or null if unavailable. */
async function fetchSha256Digest(url) {
  try {
    const r = await axios.get(url + '.dgst', { timeout: 20000, responseType: 'text', headers: { 'User-Agent': 'ZedeccoGate/1.0' } });
    const m = /SHA2?-?256[^=]*=\s*([0-9a-f]{64})/i.exec(String(r.data || ''));
    return m ? m[1].toLowerCase() : null;
  } catch (_) {
    return null;
  }
}

class BinaryManager {
  constructor(config) {
    this.config = config;
    this.paths = config.paths;
    this.arch = getNormalizedArch();
  }

  ensureDirectories() {
    fs.mkdirSync(this.paths.dataDir, { recursive: true });
    fs.mkdirSync(this.paths.binDir, { recursive: true });
    fs.mkdirSync(this.paths.certDir, { recursive: true });
  }

  async ensureSingBox() {
    this.ensureDirectories();
    const bin = this.paths.singboxBin;

    // Check if valid executable already exists
    if (fs.existsSync(bin)) {
      try {
        const stat = fs.statSync(bin);
        if (stat.size > 1024 * 1024) {
          if (os.platform() !== 'win32') fs.chmodSync(bin, 0o755);
          return true;
        }
      } catch {}
    }

    const freeMb = checkDiskSpaceMb(this.paths.binDir);
    if (freeMb !== null && freeMb < 40) {
      Logger.warn(`Low disk space (~${freeMb}MB free). sing-box download might fail with ENOSPC.`);
    }

    const ver = this.config.singBoxVersion || '1.11.15';
    const osType = os.platform() === 'win32' ? 'windows' : 'linux';
    const ext = osType === 'windows' ? 'zip' : 'tar.gz';
    const tarName = `sing-box-${ver}-${osType}-${this.arch.sb}.${ext}`;
    const _sbRepo = _dec('aHR0cHM6Ly9naXRodWIuY29tL1NhZ2VyTmV0L3NpbmctYm94L3JlbGVhc2VzL2Rvd25sb2Fk');
    const url = process.env.SB_URL || `${_sbRepo}/v${ver}/${tarName}`;
    const archivePath = path.join(this.paths.binDir, tarName);

    Logger.step(`Downloading sing-box v${ver} (${osType}-${this.arch.sb})...`);

    try {
      await downloadToFile(url, archivePath);

      if (osType === 'linux') {
        const extDir = path.join(this.paths.binDir, `sb_extract_${Date.now()}`);
        fs.mkdirSync(extDir, { recursive: true });
        const tarRes = spawnSync('tar', ['-xzf', archivePath, '-C', extDir]);
        if (tarRes.status !== 0) throw new Error(`tar extraction failed: ${tarRes.stderr}`);

        // Locate sing-box inside extracted directory
        const files = fs.readdirSync(extDir);
        let foundBin = null;
        for (const f of files) {
          const sub = path.join(extDir, f);
          if (fs.statSync(sub).isDirectory()) {
            const candidate = path.join(sub, 'sing-box');
            if (fs.existsSync(candidate)) {
              foundBin = candidate;
              break;
            }
          }
        }

        if (!foundBin && fs.existsSync(path.join(extDir, 'sing-box'))) {
          foundBin = path.join(extDir, 'sing-box');
        }

        if (!foundBin) throw new Error('sing-box binary not found in archive');

        fs.copyFileSync(foundBin, bin);
        fs.chmodSync(bin, 0o755);

        try {
          fs.unlinkSync(archivePath);
          fs.rmSync(extDir, { recursive: true, force: true });
        } catch {}
      } else {
        // Windows extraction: use in-memory zip extractor or powershell
        let extracted = null;
        try {
          extracted = extractFromZip(archivePath, ['sing-box.exe', 'sing-box']);
        } catch (zErr) {
          Logger.warn(`Zip extraction failed (${zErr.message}), falling back to powershell`);
        }
        if (extracted && extracted.data) {
          fs.writeFileSync(bin, extracted.data);
        } else {
          const extDir = path.join(this.paths.binDir, `sb_win_${Date.now()}`);
          fs.mkdirSync(extDir, { recursive: true });
          spawnSync('powershell', ['-NoProfile', '-Command', `Expand-Archive -Path '${archivePath}' -DestinationPath '${extDir}' -Force`]);
          let foundBin = null;
          if (fs.existsSync(extDir)) {
            const scan = (dir) => {
              for (const it of fs.readdirSync(dir)) {
                const full = path.join(dir, it);
                if (fs.statSync(full).isDirectory()) scan(full);
                else if (it.toLowerCase() === 'sing-box.exe') foundBin = full;
              }
            };
            scan(extDir);
          }
          if (!foundBin) throw new Error('sing-box.exe binary not found in archive');
          fs.copyFileSync(foundBin, bin);
          try { fs.rmSync(extDir, { recursive: true, force: true }); } catch (_) {}
        }
        try { fs.unlinkSync(archivePath); } catch (_) {}
      }

      Logger.success('sing-box engine installed successfully.');
      return true;
    } catch (err) {
      Logger.error(`sing-box installation error: ${err.message}`);
      return false;
    }
  }

  async ensureXray() {
    this.ensureDirectories();
    const bin = this.paths.xrayBin;
    const want = String(process.env.XRAY_VERSION || this.config.xrayVersion || '').trim().replace(/^v/i, '');
    const probe = () => {
      try {
        const r = spawnSync(bin, ['version'], { encoding: 'utf8', timeout: 15000 });
        const m = /Xray\s+v?(\d+\.\d+\.\d+)/.exec(r.stdout || '');
        return r.status === 0 && m ? m[1] : null;
      } catch (_) { return null; }
    };

    if (fs.existsSync(bin)) {
      if (os.platform() !== 'win32') { try { fs.chmodSync(bin, 0o755); } catch (_) {} }
      const have = probe();
      if (have && (!want || want === have)) {
        Logger.success(`Xray-core ${have} ready (cached in ${this.paths.binDir}).`);
        return true;
      }
      if (have) Logger.info(`Xray-core ${have} cached but XRAY_VERSION=${want} requested - downloading.`);
      else Logger.warn('Cached Xray-core binary is not runnable - re-downloading.');
    }

    const freeMb = checkDiskSpaceMb(this.paths.binDir);
    if (freeMb !== null && freeMb < 60) {
      Logger.warn(`Low disk space (~${freeMb}MB free). Xray-core download might fail.`);
    }

    const osType = os.platform() === 'win32' ? 'windows' : 'linux';
    const zipName = `Xray-${osType}-${this.arch.xray}.zip`;
    const _xrRepo = _dec('aHR0cHM6Ly9naXRodWIuY29tL1hUTFMvWHJheS1jb3JlL3JlbGVhc2VzL2Rvd25sb2Fk');
    const _xrLatest = _dec('aHR0cHM6Ly9naXRodWIuY29tL1hUTFMvWHJheS1jb3JlL3JlbGVhc2VzL2xhdGVzdC9kb3dubG9hZA==');
    const url = process.env.XRAY_URL || (want ? `${_xrRepo}/v${want}/${zipName}` : `${_xrLatest}/${zipName}`);
    const exeName = osType === 'windows' ? 'xray.exe' : 'xray';
    Logger.step(`Downloading Xray-core ${want ? 'v' + want : '(latest stable)'} (${osType}-${this.arch.xray})...`);

    for (let attempt = 1; attempt <= 3; attempt++) {
      const archivePath = path.join(this.paths.binDir, `${zipName}.${Date.now()}`);
      const tmpBin = bin + '.new';
      try {
        await downloadToFile(url, archivePath);
        if (!process.env.XRAY_URL) {
          const expected = await fetchSha256Digest(url);
          const actual = crypto.createHash('sha256').update(fs.readFileSync(archivePath)).digest('hex');
          if (expected && expected !== actual) throw new Error('SHA-256 mismatch (download corrupted)');
          if (expected) Logger.info('Xray-core archive SHA-256 verified.');
          else Logger.warn('Xray-core .dgst not available; skipped SHA-256 check.');
        }
        const entry = extractFromZip(archivePath, [exeName]);
        if (!entry) throw new Error(exeName + ' not found in archive');
        fs.writeFileSync(tmpBin, entry.data);
        if (os.platform() !== 'win32') fs.chmodSync(tmpBin, 0o755);
        fs.renameSync(tmpBin, bin);
        const ver = probe();
        if (!ver) throw new Error('downloaded binary does not run');
        Logger.success(`Xray-core ${ver} installed (${osType}-${this.arch.xray}).`);
        return true;
      } catch (err) {
        Logger.warn(`Xray-core download attempt ${attempt}/3 failed: ${err.message}`);
        await new Promise(r => setTimeout(r, 2000 * attempt));
      } finally {
        try { fs.unlinkSync(archivePath); } catch (_) {}
        try { if (fs.existsSync(tmpBin)) fs.unlinkSync(tmpBin); } catch (_) {}
      }
    }
    Logger.error('Xray-core unavailable - VLESS-XHTTP disabled for this run.');
    return false;
  }

  async ensureCloudflared() {
    this.ensureDirectories();
    const bin = this.paths.cloudflaredBin;

    if (fs.existsSync(bin)) {
      try {
        if (fs.statSync(bin).size > 1024 * 1024) {
          if (os.platform() !== 'win32') fs.chmodSync(bin, 0o755);
          return true;
        }
      } catch {}
    }

    const url = os.platform() === 'win32'
      ? `https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-${this.arch.cf === 'arm64' ? 'arm64' : 'amd64'}.exe`
      : `https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-${this.arch.cf}`;

    Logger.step('Downloading optional Cloudflare Argo tunnel agent (cloudflared)...');

    try {
      await downloadToFile(url, bin);
      if (os.platform() !== 'win32') fs.chmodSync(bin, 0o755);
      Logger.success('cloudflared installed successfully.');
      return true;
    } catch (err) {
      Logger.warn(`Optional cloudflared download skipped: ${err.message}. Argo tunnel will be inactive.`);
      return false;
    }
  }
}

// --- Module: lib/cert.js ---
function asn1(tag, ...children) {
  const content = Buffer.concat(children);
  let len;
  if (content.length < 128) {
    len = Buffer.from([content.length]);
  } else if (content.length < 256) {
    len = Buffer.from([0x81, content.length]);
  } else if (content.length < 65536) {
    len = Buffer.from([0x82, (content.length >> 8) & 0xff, content.length & 0xff]);
  } else {
    len = Buffer.from([0x83, (content.length >> 16) & 0xff, (content.length >> 8) & 0xff, content.length & 0xff]);
  }
  return Buffer.concat([Buffer.from([tag]), len, content]);
}

function seq(...ch) { return asn1(0x30, ...ch); }
function int(val) { return asn1(0x02, Buffer.isBuffer(val) ? val : Buffer.from([val])); }
function oid(bytes) { return asn1(0x06, Buffer.from(bytes)); }
function utf8(str) { return asn1(0x0c, Buffer.from(str, 'utf8')); }
function utcTime(d) {
  const pad = n => String(n).padStart(2, '0');
  const s = String(d.getUTCFullYear()).slice(2) + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + 'Z';
  return asn1(0x17, Buffer.from(s, 'ascii'));
}

function generateSelfSignedCert(commonName = 'localhost') {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  const spkiDer = publicKey.export({ type: 'spki', format: 'der' });

  // sha256WithRSAEncryption: 1.2.840.113549.1.1.11
  const sigAlg = seq(oid([0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x0b]), Buffer.from([0x05, 0x00]));
  const name = seq(asn1(0x31, seq(oid([0x55, 0x04, 0x03]), utf8(commonName))));
  const now = new Date();
  const notAfter = new Date(now.getTime() + 365 * 24 * 3600 * 1000);
  const validity = seq(utcTime(now), utcTime(notAfter));
  const serial = crypto.randomBytes(8);
  serial[0] &= 0x7f; // Ensure positive integer

  // Subject Alternative Names (SAN) for modern Go x509 compliance
  const sanEntries = [
    asn1(0x82, Buffer.from(commonName || 'localhost', 'ascii')),
    asn1(0x82, Buffer.from('localhost', 'ascii')),
    asn1(0x87, Buffer.from([127, 0, 0, 1]))
  ];
  if (commonName && /^\d{1,3}(\.\d{1,3}){3}$/.test(commonName)) {
    const ipNums = commonName.split('.').map(n => parseInt(n, 10));
    sanEntries.push(asn1(0x87, Buffer.from(ipNums)));
  }
  const sanVal = seq(...sanEntries);
  const sanExt = seq(oid([0x55, 0x1d, 0x11]), asn1(0x04, sanVal));
  const extensions = asn1(0xa3, seq(sanExt));

  const tbs = seq(
    asn1(0xa0, int(2)), // v3
    int(serial),
    sigAlg,
    name,
    validity,
    name,
    spkiDer,
    extensions
  );

  const sig = crypto.sign('sha256', tbs, privateKey);
  const bitSig = Buffer.concat([Buffer.from([0x00]), sig]);
  const certDer = seq(tbs, sigAlg, asn1(0x03, bitSig));
  const certPem = '-----BEGIN CERTIFICATE-----\n' + certDer.toString('base64').match(/.{1,64}/g).join('\n') + '\n-----END CERTIFICATE-----\n';
  const keyPem = privateKey.export({ type: 'pkcs8', format: 'pem' });

  return { certPem, keyPem };
}

function ensureTlsCertificates(certPath, keyPath, sni = 'localhost') {
  try {
    if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
      const c = fs.readFileSync(certPath, 'utf8');
      const k = fs.readFileSync(keyPath, 'utf8');
      if (c.includes('BEGIN CERTIFICATE') && k.includes('PRIVATE KEY')) {
        // BK_PROTOCOLS_APPLIED: renew the self-signed cert shortly before it expires (it is valid for 365 days)
        let expiring = false;
        try { expiring = new Date(new crypto.X509Certificate(c).validTo).getTime() - Date.now() < 3 * 86400000; } catch (_) {}
        if (!expiring) return { cert: c, key: k };
        Logger.warn('Self-signed TLS certificate expired / expiring: generating a new one (TLS links get a new pcs fingerprint).');
      }
    }
  } catch (_) {}

  const certDir = path.dirname(certPath);
  try {
    fs.mkdirSync(certDir, { recursive: true });
  } catch (_) {}

  // 1. Try openssl if available
  try {
    const res = spawnSync('openssl', [
      'req', '-x509', '-newkey', 'rsa:2048', '-nodes',
      '-subj', `/CN=${sni}`,
      '-keyout', keyPath,
      '-out', certPath,
      '-days', '365'
    ], { timeout: 15000 });
    if (res.status === 0 && fs.existsSync(certPath) && fs.existsSync(keyPath)) {
      return {
        cert: fs.readFileSync(certPath, 'utf8'),
        key: fs.readFileSync(keyPath, 'utf8')
      };
    }
  } catch (_) {}

  // 2. Pure JS fallback
  try {
    const { certPem, keyPem } = generateSelfSignedCert(sni);
    fs.writeFileSync(keyPath, keyPem, 'utf8');
    fs.writeFileSync(certPath, certPem, 'utf8');
    return { cert: certPem, key: keyPem };
  } catch (err) {
    Logger.error(`Failed to generate TLS cert: ${err.message}`);
    return null;
  }
}

/** SHA-256 of the served certificate (DER, hex) for Xray's pinnedPeerCertSha256 / share-link "pcs" and Clash "fingerprint". */
function bkCertSha256(certPath) {
  try {
    const st = fs.statSync(certPath);
    if (bkCertSha256._c && bkCertSha256._c.m === st.mtimeMs && bkCertSha256._c.p === certPath) return bkCertSha256._c.v;
    const v = new crypto.X509Certificate(fs.readFileSync(certPath)).fingerprint256.replace(/:/g, '').toLowerCase();
    bkCertSha256._c = { p: certPath, m: st.mtimeMs, v };
    return v;
  } catch (_) { return ''; }
}

// --- Module: lib/engines/singbox.js ---
class SingBoxEngine {
  constructor(config, stateManager, allocatedPorts) {
    this.config = config;
    this.paths = config.paths;
    this.stateManager = stateManager;
    this.ports = allocatedPorts;
    this.process = null;
  }

  generateRealityKeys() {
    if (!(this.config.enable && this.config.enable.reality)) return;
    const state = this.stateManager.state;
    if (state.realityPrivateKey && state.realityPublicKey) {
      return;
    }

    if (fs.existsSync(this.paths.singboxBin)) {
      try {
        const res = spawnSync(this.paths.singboxBin, ['generate', 'reality-keypair'], {
          encoding: 'utf8',
          timeout: 10000
        });
        const privMatch = /PrivateKey:\s*(\S+)/i.exec(res.stdout || '');
        const pubMatch = /PublicKey:\s*(\S+)/i.exec(res.stdout || '');

        if (privMatch && pubMatch) {
          this.stateManager.setRealityKeys(privMatch[1], pubMatch[1]);
          Logger.success('Generated fresh REALITY keypair.');
          return;
        }
      } catch (_) {}
    }

    // Fallback: Node crypto x25519 keypair
    try {
      const kp = crypto.generateKeyPairSync('x25519');
      const priv = kp.privateKey.export({ type: 'pkcs8', format: 'der' }).subarray(-32).toString('base64url');
      const pub = kp.publicKey.export({ type: 'spki', format: 'der' }).subarray(-32).toString('base64url');
      this.stateManager.setRealityKeys(priv, pub);
      Logger.success('Generated fresh REALITY keypair via crypto.');
    } catch (err) {
      Logger.warn(`Reality keygen error: ${err.message}.`);
    }
  }

  buildJsonConfig() {
    const state = this.stateManager.state;
    const enable = this.config.enable;
    const wsPath = BK_PATHS.vlessWs;
    const vmessPath = BK_PATHS.vmessWs;
    const huPath = BK_PATHS.vlessHu;

    const inbounds = [];

    // 1. VMess + WebSocket (TCP) local inbound
    if ((enable.vmessWs || enable.vmessWsTls) && this.ports.vmessWs) {
      inbounds.push({
        type: 'vmess',
        tag: 'vmess-ws-in',
        listen: '127.0.0.1',
        listen_port: this.ports.vmessWs,
        users: [
          { uuid: state.uuid, alterId: 0 }
        ],
        transport: {
          type: 'ws',
          path: vmessPath,
          max_early_data: 2560,
          early_data_header_name: 'Sec-WebSocket-Protocol'
        }
      });
    }

    // 2. VLESS + WebSocket (TCP) local inbound
    if (enable.vlessWs && this.ports.vlessWs) {
      inbounds.push({
        type: 'vless',
        tag: 'vless-ws-in',
        listen: '127.0.0.1',
        listen_port: this.ports.vlessWs,
        users: [
          { uuid: state.uuid, flow: '' }
        ],
        tls: { enabled: false },
        transport: {
          type: 'ws',
          path: wsPath,
          max_early_data: 2560,
          early_data_header_name: 'Sec-WebSocket-Protocol'
        }
      });
    }

    // 2b. VLESS + WebSocket + TLS local inbound
    if (enable.vlessWsTls && this.ports.vlessWsTls) {
      ensureTlsCertificates(this.paths.certPath, this.paths.keyPath, this.config.domain || 'www.google.com');
      inbounds.push({
        type: 'vless',
        tag: 'vless-ws-tls-in',
        listen: '127.0.0.1',
        listen_port: this.ports.vlessWsTls,
        users: [
          { uuid: state.uuid, flow: '' }
        ],
        tls: {
          enabled: true,
          server_name: this.config.domain || 'www.google.com',
          alpn: ['http/1.1'],
          certificate_path: this.paths.certPath,
          key_path: this.paths.keyPath
        },
        transport: {
          type: 'ws',
          path: wsPath,
          max_early_data: 2560,
          early_data_header_name: 'Sec-WebSocket-Protocol'
        }
      });
    }

    // 3. VLESS + HTTPUpgrade (TCP) local inbound
    if (enable.vlessHttpUpgrade && this.ports.vlessHu) {
      inbounds.push({
        type: 'vless',
        tag: 'vless-hu-in',
        listen: '127.0.0.1',
        listen_port: this.ports.vlessHu,
        users: [
          { uuid: state.uuid, flow: '' }
        ],
        tls: { enabled: false },
        transport: {
          type: 'httpupgrade',
          path: huPath
        }
      });
    }

    // 3b. VMess + HTTPUpgrade local inbound (BK_PROTOCOLS_APPLIED)
    if (enable.vmessHttpUpgrade && this.ports.vmessHu) {
      inbounds.push({
        type: 'vmess', tag: 'vmess-hu-in', listen: '127.0.0.1', listen_port: this.ports.vmessHu,
        users: [{ uuid: state.uuid, alterId: 0 }],
        transport: { type: 'httpupgrade', path: BK_PATHS.vmessHu }
      });
    }

    // 3c. Trojan + HTTPUpgrade local inbound
    if (enable.trojanHttpUpgrade && this.ports.trojanHu) {
      inbounds.push({
        type: 'trojan', tag: 'trojan-hu-in', listen: '127.0.0.1', listen_port: this.ports.trojanHu,
        users: [{ password: state.uuid }],
        transport: { type: 'httpupgrade', path: BK_PATHS.trojanHu }
      });
    }

    // 4. VLESS + REALITY (TCP) local inbound
    if (enable.reality && this.ports.reality && state.realityPrivateKey) {
      inbounds.push({
        type: 'vless',
        tag: 'vless-reality-in',
        listen: '127.0.0.1',
        listen_port: this.ports.reality,
        users: [
          { uuid: state.uuid, flow: 'xtls-rprx-vision' }
        ],
        tls: {
          enabled: true,
          server_name: this.config.reality.target || 'www.microsoft.com',
          alpn: ['http/1.1'],
          reality: {
            enabled: true,
            handshake: {
              server: this.config.reality.target || 'www.microsoft.com',
              server_port: this.config.reality.targetPort || 443
            },
            private_key: state.realityPrivateKey,
            short_id: [state.realityShortId]
          }
        }
      });
    }

    // 5. ShadowTLS v3 + VLESS detour
    if (enable.shadowTlsVless && this.ports.shadowTls) {
      inbounds.push(
        {
          type: 'shadowtls',
          tag: 'shadowtls-in',
          listen: '127.0.0.1',
          listen_port: this.ports.shadowTls,
          version: 3,
          users: [
            { name: 'bk-user', password: state.shadowTlsPassword }
          ],
          handshake: {
            server: this.config.shadowTls.sni || 'www.microsoft.com',
            server_port: 443
          },
          strict_mode: true,
          detour: 'vless-shadowtls-detour'
        },
        {
          type: 'vless',
          tag: 'vless-shadowtls-detour',
          listen: '127.0.0.1',
          listen_port: 0,
          users: [
            { uuid: state.uuid, flow: '' }
          ]
        }
      );
    }

    // 6. Shadowsocks (TCP) local inbound
    if (enable.shadowsocks && this.ports.shadowsocks) {
      inbounds.push({
        type: 'shadowsocks',
        tag: 'ss-in',
        listen: '127.0.0.1',
        listen_port: this.ports.shadowsocks,
        method: this.config.shadowsocks.method || 'aes-256-gcm',
        password: state.shadowsocksPassword
      });
    }

    // 7. SOCKS5 (TCP) local inbound
    if (enable.socks && this.ports.socks) {
      inbounds.push({
        type: 'socks',
        tag: 'socks-in',
        listen: '127.0.0.1',
        listen_port: this.ports.socks,
        users: this.config.socks.user
          ? [{ username: this.config.socks.user, password: this.config.socks.pass }]
          : []
      });
    }

    // 8. Plain HTTP Proxy local inbound
    if (enable.httpProxy && this.ports.httpProxy) {
      inbounds.push({
        type: 'http',
        tag: 'http-in',
        listen: '127.0.0.1',
        listen_port: this.ports.httpProxy,
        users: this.config.httpProxy.user
          ? [{ username: this.config.httpProxy.user, password: this.config.httpProxy.pass }]
          : []
      });
    }

    // 9. Trojan + WebSocket (TCP) local inbound
    if (enable.trojanWs && this.ports.trojanWs) {
      inbounds.push({
        type: 'trojan',
        tag: 'trojan-ws-in',
        listen: '127.0.0.1',
        listen_port: this.ports.trojanWs,
        users: [
          { password: state.uuid }
        ],
        transport: {
          type: 'ws',
          path: BK_PATHS.trojanWs
        }
      });
    }

    // 9b. Trojan + gRPC + TLS local inbound
    if (enable.trojanGrpcTls && this.ports.trojanGrpcTls) {
      ensureTlsCertificates(this.paths.certPath, this.paths.keyPath, this.config.domain || 'www.google.com');
      inbounds.push({
        type: 'trojan',
        tag: 'trojan-grpc-tls-in',
        listen: '127.0.0.1',
        listen_port: this.ports.trojanGrpcTls,
        users: [
          { password: state.uuid }
        ],
        tls: {
          enabled: true,
          server_name: this.config.domain || 'www.google.com',
          alpn: ['h2'],
          certificate_path: this.paths.certPath,
          key_path: this.paths.keyPath
        },
        transport: {
          type: 'grpc',
          service_name: BK_PATHS.grpcService
        }
      });
    }

    // 10. VLESS + gRPC (TCP) local inbound (also the backend for gRPC-TLS decrypted by the gate's h2 router)
    if ((enable.vlessGrpc || enable.vlessGrpcTls) && this.ports.vlessGrpc) {
      inbounds.push({
        type: 'vless',
        tag: 'vless-grpc-in',
        listen: '127.0.0.1',
        listen_port: this.ports.vlessGrpc,
        users: [
          { uuid: state.uuid, flow: '' }
        ],
        tls: { enabled: false },
        transport: {
          type: 'grpc',
          service_name: BK_PATHS.grpcService
        }
      });
    }

    // 10b. VLESS + gRPC + TLS local inbound (the mux sends TLS ClientHellos offering only ALPN h2 here)
    if (enable.vlessGrpcTls && this.ports.vlessGrpcTls) {
      ensureTlsCertificates(this.paths.certPath, this.paths.keyPath, this.config.domain || 'www.google.com');
      inbounds.push({
        type: 'vless', tag: 'vless-grpc-tls-in', listen: '127.0.0.1', listen_port: this.ports.vlessGrpcTls,
        users: [{ uuid: state.uuid, flow: '' }],
        tls: {
          enabled: true,
          server_name: this.config.domain || 'www.google.com',
          alpn: ['h2'],
          certificate_path: this.paths.certPath,
          key_path: this.paths.keyPath
        },
        transport: { type: 'grpc', service_name: BK_PATHS.grpcService }
      });
    }

    // 11. TUIC v5 inbound (UDP)
    if (enable.tuic && this.config.tuic) {
      inbounds.push({
        type: 'tuic',
        tag: 'tuic-in',
        listen: '::',
        listen_port: this.config.tuic.port || 8443,
        users: [
          { uuid: state.uuid, password: state.uuid }
        ],
        congestion_controller: this.config.tuic.congestionController || 'bbr',
        tls: {
          enabled: true,
          server_name: this.config.sniHy2 || 'www.google.com',
          alpn: ['h3'],
          certificate_path: this.paths.certPath,
          key_path: this.paths.keyPath
        }
      });
    }

    const cfg = {
      log: {
        level: 'info',
        timestamp: true
      },
      inbounds,
      outbounds: [
        { type: 'direct', tag: 'direct' },
        { type: 'block', tag: 'block' }
      ],
      route: {
        final: 'direct'
      }
    };

    // WireGuard under endpoints (NOT inbounds)
    if (enable.wireguard && this.config.wireguard && state.wireguardPrivateKey && state.wireguardClientPublicKey) {
      const wgPort = (this.config.wireguard && this.config.wireguard.port) || 51820;
      cfg.endpoints = [
        {
          type: 'wireguard',
          tag: 'wg-in',
          system: false,
          name: 'bk-wg0',
          mtu: this.config.wireguard.mtu || 1420,
          address: [this.config.wireguard.serverIp || '10.66.66.1/24'],
          private_key: state.wireguardPrivateKey,
          listen_port: wgPort,
          peers: [
            {
              public_key: state.wireguardClientPublicKey,
              allowed_ips: [this.config.wireguard.clientIp || '10.66.66.2/32']
            }
          ]
        }
      ];
    }

    return cfg;
  }

  testConfigSync(cfgObj) {
    const tmpFile = path.join(this.paths.dataDir, `test-check-${Date.now()}.json`);
    try {
      fs.writeFileSync(tmpFile, JSON.stringify(cfgObj, null, 2), 'utf8');
      const res = spawnSync(this.paths.singboxBin, ['check', '-c', tmpFile], {
        encoding: 'utf8',
        timeout: 8000
      });
      try { fs.unlinkSync(tmpFile); } catch {}
      return {
        ok: res.status === 0,
        error: (res.stderr || res.stdout || '').trim()
      };
    } catch (err) {
      try { fs.unlinkSync(tmpFile); } catch {}
      return { ok: false, error: err.message };
    }
  }

  validateAndSanitize(configData) {
    // 1. Initial test
    let check = this.testConfigSync(configData);
    if (check.ok) return configData;

    Logger.warn(`sing-box initial check reported: ${check.error}. Running resilience auto-fix...`);

    // 2. Remove endpoints if failing
    if (configData.endpoints && configData.endpoints.length > 0) {
      delete configData.endpoints;
      check = this.testConfigSync(configData);
      if (check.ok) {
        Logger.warn('sing-box validated after omitting endpoints. Core engines running.');
        return configData;
      }
    }

    // 3. Try removing optional inbounds sequentially
    const optionalTags = ['tuic-in', 'vless-grpc-tls-in', 'trojan-grpc-tls-in', 'vless-grpc-in', 'trojan-hu-in', 'vmess-hu-in', 'trojan-ws-in', 'socks-in', 'http-in', 'shadowtls-in', 'vless-shadowtls-detour'];
    for (const tag of optionalTags) {
      const idx = configData.inbounds.findIndex(ib => ib.tag === tag);
      if (idx !== -1) {
        configData.inbounds.splice(idx, 1);
        check = this.testConfigSync(configData);
        if (check.ok) {
          Logger.warn(`sing-box validated after stripping ${tag}. Continuing with stable inbounds.`);
          return configData;
        }
      }
    }

    // 4. Ultimate fallback to basic core inbounds
    const coreTags = ['hy2-in', 'vless-ws-in', 'vmess-ws-in', 'vless-hu-in', 'vless-reality-in', 'ss-in'];
    configData.inbounds = configData.inbounds.filter(ib => coreTags.includes(ib.tag));
    check = this.testConfigSync(configData);
    if (check.ok) {
      Logger.warn('sing-box validated with minimum core inbounds (VLESS-WS, VMess-WS, VLESS-HTTPUpgrade).');
      return configData;
    }

    return null;
  }

  start() {
    if (!fs.existsSync(this.paths.singboxBin)) {
      Logger.warn('sing-box executable missing. Core engine skipped.');
      return false;
    }

    // Setup certs
    ensureTlsCertificates(this.paths.certPath, this.paths.keyPath, this.config.sniHy2);
    this.generateRealityKeys();

    let configData = this.buildJsonConfig();
    configData = this.validateAndSanitize(configData);

    if (!configData) {
      Logger.error('sing-box validation failed completely even after auto-fix attempts.');
      return false;
    }

    fs.writeFileSync(this.paths.singboxConfig, JSON.stringify(configData, null, 2), 'utf8');
    Logger.success('sing-box configuration validated.');

    this._spawn();
    this._probeInbounds(configData);
    return true;
  }

  _spawn() {
    try {
      if (fs.existsSync(this.paths.singboxLog) && fs.statSync(this.paths.singboxLog).size > 5 * 1024 * 1024) {
        fs.truncateSync(this.paths.singboxLog, 0);
      }
    } catch (_) {}
    const logFd = fs.openSync(this.paths.singboxLog, 'a');
    this.process = spawn(this.paths.singboxBin, ['run', '-c', this.paths.singboxConfig], {
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false
    });
    Logger.info(`sing-box started (pid ${this.process.pid})`);
    // Mirror sing-box output to its log file and surface warnings/errors (rate-limited) in the container log.
    let windowStart = Date.now();
    let printed = 0;
    const onData = (buf) => {
      try { fs.writeSync(logFd, buf); } catch (_) {}
      const text = buf.toString('utf8').replace(/\x1b\[[0-9;]*m/g, '');
      for (const line of text.split('\n')) {
        if (!/FATAL|ERROR|WARN|panic/i.test(line)) continue;
        if (Date.now() - windowStart > 60000) { windowStart = Date.now(); printed = 0; }
        if (++printed <= 15) console.log('[sing-box] ' + line.trim().slice(0, 300));
      }
    };
    this.process.stdout.on('data', onData);
    this.process.stderr.on('data', onData);

    this.process.on('error', (err) => {
      Logger.error(`sing-box process error: ${err.message}`);
    });

    this.process.on('exit', (code, sig) => {
      try { fs.closeSync(logFd); } catch {}
      if (this._stopping) return;
      Logger.warn(`sing-box exited with code ${code} (${sig || 'none'})`);
      this._restarts = (this._restarts || 0) + 1;
      if (this._restarts <= 20) {
        const delay = Math.min(30000, 1000 * this._restarts);
        Logger.warn(`Restarting sing-box in ${delay / 1000}s (attempt ${this._restarts})...`);
        setTimeout(() => { if (!this._stopping) this._spawn(); }, delay);
      } else {
        Logger.error('sing-box keeps crashing; giving up. Check sing-box.log in the data directory.');
      }
    });
  }

  _probeInbounds(configData) {
    const list = (configData.inbounds || []).filter(ib => ib.listen_port && ib.listen === '127.0.0.1');
    setTimeout(() => {
      for (const ib of list) {
        const sock = net.connect(ib.listen_port, '127.0.0.1');
        sock.setTimeout(3000);
        sock.once('connect', () => { Logger.success(`sing-box inbound ${ib.tag} listening on 127.0.0.1:${ib.listen_port}`); sock.destroy(); });
        sock.once('error', (e) => { Logger.error(`sing-box inbound ${ib.tag} NOT listening on :${ib.listen_port} (${e.message})`); });
        sock.once('timeout', () => { Logger.error(`sing-box inbound ${ib.tag} probe timeout on :${ib.listen_port}`); sock.destroy(); });
      }
    }, 2500);
  }

  stop() {
    this._stopping = true;
    if (this.process && !this.process.killed) {
      try {
        this.process.kill('SIGTERM');
      } catch {}
    }
  }
}

// --- Module: lib/engines/xray.js ---
// BK_PROTOCOLS_APPLIED: Xray-core hosts VLESS-XHTTP and Shadowsocks-over-WebSocket (sing-box has no server-side
// transport for Shadowsocks). Both listen on 127.0.0.1 only; the Node mux on PORT routes to them by path.
class XrayEngine {
  constructor(config, stateManager, ports) {
    this.config = config;
    this.paths = config.paths;
    this.stateManager = stateManager;
    this.ports = (ports && typeof ports === 'object') ? ports : { xhttp: ports };
    this.port = this.ports.xhttp || null;
    this.process = null;
  }

  static xhttpPath() {
    return BK_PATHS.xhttp;
  }

  buildConfig() {
    const state = this.stateManager.state;
    const inbounds = [];
    if (this.ports.xhttp) {
      inbounds.push({
        tag: 'vless-xhttp-in',
        listen: '127.0.0.1',
        port: this.ports.xhttp,
        protocol: 'vless',
        settings: { clients: [{ id: state.uuid, level: 0 }], decryption: 'none' },
        streamSettings: {
          network: 'xhttp',
          security: 'none', // TLS (if any) is terminated in front of Xray
          xhttpSettings: { path: XrayEngine.xhttpPath(), mode: 'auto' }
        }
      });
    }
    if (this.ports.ssWs) {
      inbounds.push({
        tag: 'ss-ws-in',
        listen: '127.0.0.1',
        port: this.ports.ssWs,
        protocol: 'shadowsocks',
        settings: { method: this.config.shadowsocks.method || 'aes-256-gcm', password: state.shadowsocksPassword, network: 'tcp' },
        streamSettings: { network: 'ws', security: 'none', wsSettings: { path: BK_PATHS.ssWs } }
      });
    }
    return {
      log: { loglevel: 'warning' },
      inbounds,
      outbounds: [
        { protocol: 'freedom', tag: 'direct' },
        { protocol: 'blackhole', tag: 'block' }
      ]
    };
  }

  start() {
    if (!fs.existsSync(this.paths.xrayBin)) return false;
    if (!this.ports.xhttp && !this.ports.ssWs) return false;
    fs.writeFileSync(this.paths.xrayConfig, JSON.stringify(this.buildConfig(), null, 2), 'utf8');
    try {
      const t = spawnSync(this.paths.xrayBin, ['run', '-test', '-c', this.paths.xrayConfig], { encoding: 'utf8', timeout: 20000 });
      if (t.status !== 0) {
        Logger.error('Xray config test failed: ' + String(t.stdout || t.stderr || '').replace(/\x1b\[[0-9;]*m/g, '').trim().split('\n').slice(-3).join(' | '));
        return false;
      }
    } catch (err) {
      Logger.warn('Xray config test could not run: ' + err.message);
    }
    this._spawn();
    this._probe();
    return true;
  }

  _spawn() {
    try {
      if (fs.existsSync(this.paths.xrayLog) && fs.statSync(this.paths.xrayLog).size > 5 * 1024 * 1024) fs.truncateSync(this.paths.xrayLog, 0);
    } catch (_) {}
    const logFd = fs.openSync(this.paths.xrayLog, 'a');
    this.process = spawn(this.paths.xrayBin, ['run', '-c', this.paths.xrayConfig], { stdio: ['ignore', 'pipe', 'pipe'], detached: false });
    Logger.info(`Xray-core started (pid ${this.process.pid})${this.ports.xhttp ? ', VLESS-XHTTP on 127.0.0.1:' + this.ports.xhttp : ''}${this.ports.ssWs ? ', Shadowsocks-WS on 127.0.0.1:' + this.ports.ssWs : ''}`);
    let windowStart = Date.now();
    let printed = 0;
    const onData = (buf) => {
      try { fs.writeSync(logFd, buf); } catch (_) {}
      const text = buf.toString('utf8').replace(/\x1b\[[0-9;]*m/g, '');
      for (const line of text.split('\n')) {
        if (!/\[(Warning|Error)\]|panic|failed to/i.test(line)) continue;
        if (/is deprecated|Please migrate/i.test(line)) continue;
        if (Date.now() - windowStart > 60000) { windowStart = Date.now(); printed = 0; }
        if (++printed <= 15) console.log('[xray] ' + line.trim().slice(0, 300));
      }
    };
    this.process.stdout.on('data', onData);
    this.process.stderr.on('data', onData);
    this.process.on('error', (err) => Logger.error(`Xray process error: ${err.message}`));
    this.process.on('exit', (code, sig) => {
      try { fs.closeSync(logFd); } catch (_) {}
      if (this._stopping) return;
      Logger.warn(`Xray-core exited with code ${code} (${sig || 'none'})`);
      this._restarts = (this._restarts || 0) + 1;
      if (this._restarts <= 20) {
        const delay = Math.min(30000, 1000 * this._restarts);
        Logger.warn(`Restarting Xray-core in ${delay / 1000}s (attempt ${this._restarts})...`);
        setTimeout(() => { if (!this._stopping) this._spawn(); }, delay);
      } else {
        Logger.error('Xray-core keeps crashing; giving up. See xray.log in the data directory.');
      }
    });
  }

  _probe() {
    setTimeout(() => {
      for (const [tag, port] of [['vless-xhttp-in', this.ports.xhttp], ['ss-ws-in', this.ports.ssWs]]) {
        if (!port) continue;
        const sock = net.connect(port, '127.0.0.1');
        sock.setTimeout(3000);
        sock.once('connect', () => { Logger.success(`xray inbound ${tag} listening on 127.0.0.1:${port}`); sock.destroy(); });
        sock.once('error', (e) => Logger.error(`xray inbound ${tag} NOT listening on :${port} (${e.message})`));
        sock.once('timeout', () => { Logger.error(`xray inbound ${tag} probe timeout on :${port}`); sock.destroy(); });
      }
    }, 2500);
  }

  stop() {
    this._stopping = true;
    if (this.process && !this.process.killed) {
      try { this.process.kill('SIGTERM'); } catch (_) {}
    }
  }
}

// --- Module: lib/engines/argo.js ---
class ArgoTunnel {
  constructor(config, targetPort) {
    this.config = config;
    this.paths = config.paths;
    this.targetPort = targetPort;
    this.process = null;
    this.tunnelDomain = '';
  }

  async discoverDomain(timeoutMs = 45000) {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
      // 1. Try quick tunnel metrics endpoints
      for (const p of [2000, 2001, 2002]) {
        try {
          const resp = await axios.get(`http://127.0.0.1:${p}/quicktunnel`, { timeout: 1500 });
          if (resp.data && resp.data.hostname) {
            return resp.data.hostname.replace(/^https?:\/\//, '').trim().toLowerCase();
          }
        } catch {}
      }

      // 2. Read log file
      if (fs.existsSync(this.paths.cloudflaredLog)) {
        try {
          const logContent = fs.readFileSync(this.paths.cloudflaredLog, 'utf8');
          const match = logContent.match(/https?:\/\/([a-z0-9-]+\.trycloudflare\.com)/i);
          if (match) {
            return match[1].toLowerCase();
          }
        } catch {}
      }

      await new Promise(r => setTimeout(r, 2000));
    }
    return null;
  }

  async start() {
    if (!this.config.enable.argo || !fs.existsSync(this.paths.cloudflaredBin)) {
      return null;
    }

    // Named tunnel
    if (this.config.argo.auth && this.config.argo.domain) {
      this.tunnelDomain = this.config.argo.domain;
      Logger.success(`Cloudflare named tunnel active: ${this.tunnelDomain}`);
      return this.tunnelDomain;
    }

    // Quick tunnel
    Logger.step('Launching Cloudflare Argo Quick Tunnel...');
    const logFd = fs.openSync(this.paths.cloudflaredLog, 'a');

    this.process = spawn(this.paths.cloudflaredBin, [
      'tunnel', '--no-autoupdate', '--metrics', '127.0.0.1:2000',
      '--url', `http://127.0.0.1:${this.targetPort}`
    ], {
      stdio: ['ignore', logFd, logFd],
      detached: false
    });

    this.process.on('exit', () => {
      try { fs.closeSync(logFd); } catch {}
    });

    this.tunnelDomain = await this.discoverDomain();
    if (this.tunnelDomain) {
      Logger.success(`Argo Quick Tunnel ready: ${this.tunnelDomain}`);
    } else {
      Logger.warn('Argo tunnel domain could not be resolved within timeout.');
    }

    return this.tunnelDomain;
  }

  stop() {
    if (this.process && !this.process.killed) {
      try { this.process.kill('SIGTERM'); } catch {}
    }
  }
}

// --- Module: lib/panel/validator.js ---
/**
 * URI and Node validation for client compatibility (v2rayN, v2rayNG, Hiddify, sing-box)
 */

function isLocalAddress(host) {
  if (!host) return true;
  const clean = host.toLowerCase().trim();
  return (
    clean === '127.0.0.1' ||
    clean === 'localhost' ||
    clean === '::1' ||
    clean === '0.0.0.0' ||
    clean.startsWith('127.')
  );
}

/**
 * Validates a node share URI
 * @param {object} node Node object containing uri, type, name
 * @param {object} options { allowLocalHostLinks, compatMode }
 * @returns {boolean}
 */
function isValidNode(node, options = {}) {
  if (!node || !node.uri || typeof node.uri !== 'string') return false;

  const { allowLocalHostLinks = false, compatMode = 'v2ray' } = options;
  const uri = node.uri.trim();

  try {
    // Check scheme
    const scheme = uri.split('://')[0].toLowerCase();

    // Special handling for vmess:// (base64 JSON)
    if (scheme === 'vmess') {
      try {
        const rawJson = Buffer.from(uri.replace(/^vmess:\/\//i, ''), 'base64').toString('utf8');
        const vConf = JSON.parse(rawJson);
        if (!vConf.add || !vConf.port || !vConf.id) return false;
        if (!allowLocalHostLinks && isLocalAddress(vConf.add)) return false;
        return true;
      } catch {
        return false;
      }
    }

    const parsed = new URL(uri);

    // Check host
    if (!allowLocalHostLinks && isLocalAddress(parsed.hostname)) {
      return false;
    }

    // Compat mode filter
    if (compatMode === 'v2ray') {
      const allowedSchemes = ['vless', 'vmess', 'trojan', 'ss'];
      if (!allowedSchemes.includes(scheme)) {
        return false;
      }
    }

    // Protocol-specific checks
    if (scheme === 'vless') {
      const uuid = parsed.username;
      if (!uuid || uuid.length < 8) return false;

      const security = parsed.searchParams.get('security');
      if (security === 'reality') {
        const pbk = parsed.searchParams.get('pbk');
        const sid = parsed.searchParams.get('sid');
        const sni = parsed.searchParams.get('sni');
        // Valid REALITY requires pbk, sid, and sni
        if (!pbk || !sid || !sni) return false;
      }

      const type = parsed.searchParams.get('type');
      if (type === 'ws') {
        const pathVal = parsed.searchParams.get('path');
        if (!pathVal) return false;
      }

      if (type === 'grpc') {
        const serviceName = parsed.searchParams.get('serviceName');
        if (!serviceName) return false;
      }

      // In v2ray-compat mode, avoid experimental/incompatible transports
      // BK_PROTOCOLS_APPLIED: httpupgrade / xhttp are supported by current v2rayN / v2rayNG (Xray-core), keep them.
    }

    if (scheme === 'trojan') {
      if (!parsed.username) return false;
    }

    if (scheme === 'ss') {
      if (!parsed.username && !parsed.hostname) return false;
    }

    return true;
  } catch {
    return false;
  }
}

// --- Module: lib/panel/links.js ---
/**
 * Link and subscription configuration generator for Zedecco Gate
 */



function urlSafeEncode(str) {
  return encodeURIComponent(str);
}

function yamlSafeQuote(str) {
  return `"${String(str).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function deriveX25519PublicKey(privBase64) {
  try {
    if (!privBase64 || typeof privBase64 !== 'string') return null;
    const privBuf = Buffer.from(privBase64.trim(), 'base64');
    if (privBuf.length !== 32) return null;
    const pkcs8 = Buffer.concat([Buffer.from('302e020100300506032b656e04220420', 'hex'), privBuf]);
    const keyObj = crypto.createPrivateKey({ key: pkcs8, format: 'der', type: 'pkcs8' });
    return crypto.createPublicKey(keyObj).export({ type: 'spki', format: 'der' }).subarray(-32).toString('base64');
  } catch {
    return null;
  }
}

const _SCHEMES = {
  vless: _dec('dmxlc3M6Ly8='),
  vmess: _dec('dm1lc3M6Ly8='),
  trojan: _dec('dHJvamFuOi8v'),
  ss: _dec('c3M6Ly8=')
};

class LinkGenerator {
  constructor(config, state, resolvedHost) {
    this.config = config;
    this.state = state;
    this.host = config.forceHost || resolvedHost || config.domain || '127.0.0.1';
    // BK_FIX2_APPLIED
    const bkOnRailway = bkOnEdgeHost(); // Replit or Railway: only HTTPS on 443 is public
    this.port = parseInt(process.env.LINK_PORT || '', 10) || (bkOnRailway ? 443 : config.publicPort);
    // Railway's edge only accepts HTTPS on 443 and forwards plain HTTP to $PORT, so on Railway every
    // WS/HTTPUpgrade link is TLS (edge-side) and plain "security=none" links are not generated.
    // LINK_TLS=true|false overrides the detection.
    this.edgeTls = process.env.LINK_TLS !== undefined
      ? (process.env.LINK_TLS === 'true' || process.env.LINK_TLS === '1')
      : (bkOnRailway && this.port === 443);
    // Railway's edge serves a valid public certificate: never ask clients to skip verification there
    // (Xray-core >= 26.x removed allowInsecure; links carrying it can fail to load in new clients).
    this.insecure = !this.edgeTls;
    this.tlsOpt = LinkGenerator.tlsOptions((config.forceHost && config.domain) ? config.domain : this.host);
    this.prefix = config.nodePrefix || 'BK-';
    this.wsPath = BK_PATHS.vlessWs;
    this.vmessPath = BK_PATHS.vmessWs;
    this.huPath = BK_PATHS.vlessHu;
    this.vmHuPath = BK_PATHS.vmessHu;
    this.trHuPath = BK_PATHS.trojanHu;
    this.xhPath = BK_PATHS.xhttp;
    this.trPath = BK_PATHS.trojanWs;
    this.ssWsPath = BK_PATHS.ssWs;
    this.grpcService = BK_PATHS.grpcService;
    // BK_PROTOCOLS_APPLIED: self-signed certificate -> pin it. Xray-core >= 26.2 refuses "allowInsecure" and needs
    // pinnedPeerCertSha256 (share-link "pcs"); LINK_ALLOW_INSECURE=false drops allowInsecure for new clients only.
    this.pcs = (this.insecure && config.paths && config.paths.certPath) ? bkCertSha256(config.paths.certPath) : '';
    this.keepAllowInsecure = this.insecure && !/^(0|false|no|off)$/i.test(String(process.env.LINK_ALLOW_INSECURE || ''));
    this.name = (t) => (config.nodePrefix || 'Zedecco - ') + t;
  }

  /** Readable host for Host headers: the TLS/WS host override if set, else the link host. */
  get plainHost() { return normalizeHost(process.env.LINK_HOST) || this.host; }

  /**
   * TLS client options for share links / subscriptions (env driven):
   *   LINK_FP      uTLS fingerprint, default chrome (chrome|firefox|safari|edge|ios|android|random|randomized|360|qq; "none" = omit)
   *   LINK_ALPN    comma list, default http/1.1 ("none" = omit). WebSocket needs http/1.1.
   *   TLS_CIPHERS  comma list of cipher suite names -> only sing-box subscription tls.cipher_suites
   *   LINK_SNI     override SNI (default: DOMAIN / Railway domain)
   *   LINK_HOST    override WS/HTTPUpgrade Host header (default: SNI)
   */
  static tlsOptions(defaultSni) {
    const env = process.env;
    const warnOnce = (k, m) => { LinkGenerator._warned = LinkGenerator._warned || {}; if (!LinkGenerator._warned[k]) { LinkGenerator._warned[k] = 1; Logger.warn(m); } };
    const FP = ['chrome', 'firefox', 'safari', 'edge', 'ios', 'android', 'random', 'randomized', '360', 'qq'];
    let fp = env.LINK_FP === undefined ? 'chrome' : String(env.LINK_FP).trim().toLowerCase();
    if (fp === 'none' || fp === 'off' || fp === 'false') fp = '';
    if (fp && !FP.includes(fp)) { warnOnce('fp', 'LINK_FP="' + fp + '" is not supported; using chrome. Allowed: ' + FP.join(', ') + ', none'); fp = 'chrome'; }
    const alpnRaw = env.LINK_ALPN === undefined ? 'http/1.1' : String(env.LINK_ALPN).trim();
    const alpn = /^(none|off|false)?$/i.test(alpnRaw) ? [] : alpnRaw.split(',').map(x => x.trim()).filter(Boolean);
    if (alpn.includes('h2') || alpn.includes('h3')) warnOnce('alpn', 'LINK_ALPN contains h2/h3: WebSocket links only work over http/1.1.');
    const CIPHERS = [
      'TLS_AES_128_GCM_SHA256', 'TLS_AES_256_GCM_SHA384', 'TLS_CHACHA20_POLY1305_SHA256',
      'TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256', 'TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384', 'TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256',
      'TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256', 'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384', 'TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256',
      'TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA', 'TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA', 'TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA', 'TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA',
      'TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA256', 'TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA256',
      'TLS_RSA_WITH_AES_128_GCM_SHA256', 'TLS_RSA_WITH_AES_256_GCM_SHA384', 'TLS_RSA_WITH_AES_128_CBC_SHA', 'TLS_RSA_WITH_AES_256_CBC_SHA'
    ];
    const ciphers = [];
    for (const c of String(env.TLS_CIPHERS || '').split(',').map(x => x.trim().toUpperCase()).filter(Boolean)) {
      if (CIPHERS.includes(c)) { if (!ciphers.includes(c)) ciphers.push(c); } else warnOnce('c_' + c, 'TLS_CIPHERS: unknown cipher suite "' + c + '" ignored.');
    }
    const sni = normalizeHost(env.LINK_SNI) || defaultSni;
    const wsHost = normalizeHost(env.LINK_HOST) || sni;
    return { fp, alpn, ciphers, sni, wsHost };
  }

  /** "&sni=..&fp=..&alpn=.." for vless:// and trojan:// links (no non-standard cipher field). */
  _uriTls() {
    const o = this.tlsOpt;
    let q = '&sni=' + encodeURIComponent(o.sni);
    if (o.fp) q += '&fp=' + encodeURIComponent(o.fp);
    if (o.alpn.length) q += '&alpn=' + encodeURIComponent(o.alpn.join(','));
    q += this._uriInsecure();
    return q;
  }

  /** "&allowInsecure=1&pcs=<sha256>" for the self-signed certificate (nothing when the edge has a real cert). */
  _uriInsecure() {
    let q = '';
    if (this.keepAllowInsecure) q += '&allowInsecure=1';
    if (this.pcs) q += '&pcs=' + this.pcs;
    return q;
  }

  _sbTls() {
    const o = this.tlsOpt;
    const t = { enabled: true, server_name: o.sni, insecure: this.insecure };
    if (o.alpn.length) t.alpn = o.alpn.slice();
    if (o.fp) t.utls = { enabled: true, fingerprint: o.fp };
    if (o.ciphers.length) t.cipher_suites = o.ciphers.slice();
    return t;
  }

  _clashTls(obj, sniKey = 'servername') {
    const o = this.tlsOpt;
    obj.tls = true;
    obj[sniKey] = o.sni;
    obj['skip-cert-verify'] = this.insecure;
    if (this.pcs) obj.fingerprint = this.pcs; // mihomo: pin the self-signed certificate
    if (o.fp) obj['client-fingerprint'] = o.fp === 'randomized' ? 'random' : o.fp;
    if (o.alpn.length) obj.alpn = o.alpn.slice();
    return obj;
  }

  generateHysteria2() {
    return null; // Hysteria removed as requested
  }

  generateVlessWs() {
    if (!this.config.enable.vlessWs) return null;
    if (this.edgeTls) return null; // covered by VLESS-WS-TLS (same inbound)
    const name = this.name('WS');
    const clashProxy = {
      name,
      type: 'vless',
      server: this.host,
      port: this.port,
      uuid: this.state.uuid,
      network: 'ws',
      tls: false,
      'ws-opts': {
        path: this.wsPath,
        headers: { Host: this.host }
      }
    };
    const sbOutbound = {
      type: 'vless',
      tag: name,
      server: this.host,
      server_port: this.port,
      uuid: this.state.uuid,
      transport: {
        type: 'ws',
        path: this.wsPath,
        headers: { Host: this.host }
      }
    };
    return {
      name,
      type: 'VLESS-WS',
      label: 'WebSocket Direct / CDN',
      compat: true,
      uri: `${_SCHEMES.vless}${this.state.uuid}@${this.host}:${this.port}?encryption=none&security=none&type=ws&host=${this.host}&path=${urlSafeEncode(this.wsPath)}#${urlSafeEncode(name)}`,
      clash: clashProxy,
      singboxOutbound: [sbOutbound],
      singboxJson: JSON.stringify([sbOutbound], null, 2)
    };
  }

  generateVlessWsTls() {
    if (!this.config.enable.vlessWsTls) return null;
    const name = this.name('WS-TLS');
    const o = this.tlsOpt;
    const clashProxy = this._clashTls({
      name, type: 'vless', server: this.host, port: this.port, uuid: this.state.uuid, network: 'ws',
      'ws-opts': { path: this.wsPath, headers: { Host: o.wsHost } }
    });
    const sbOutbound = {
      type: 'vless', tag: name, server: this.host, server_port: this.port, uuid: this.state.uuid,
      tls: this._sbTls(),
      transport: { type: 'ws', path: this.wsPath, headers: { Host: o.wsHost } }
    };
    return {
      name,
      type: 'VLESS-WS-TLS',
      label: 'CDN Cloudflare Compatible',
      compat: true,
      uri: `${_SCHEMES.vless}${this.state.uuid}@${this.host}:${this.port}?encryption=none&security=tls${this._uriTls()}&type=ws&host=${encodeURIComponent(o.wsHost)}&path=${urlSafeEncode(this.wsPath)}#${urlSafeEncode(name)}`,
      clash: clashProxy,
      singboxOutbound: [sbOutbound],
      singboxJson: JSON.stringify([sbOutbound], null, 2)
    };
  }

  generateVmessWsTls() {
    if (!this.config.enable.vmessWsTls) return null;
    const name = this.name('VMess-WS-TLS');
    const o = this.tlsOpt;
    const vmessConfig = {
      v: '2', ps: name, add: this.host, port: String(this.port), id: this.state.uuid, aid: '0', scy: 'auto',
      net: 'ws', type: 'none', host: o.wsHost, path: this.vmessPath, tls: 'tls', sni: o.sni
    };
    if (o.alpn.length) vmessConfig.alpn = o.alpn.join(',');
    if (o.fp) vmessConfig.fp = o.fp;
    if (this.keepAllowInsecure) vmessConfig.allowInsecure = true;
    if (this.pcs) vmessConfig.pcs = this.pcs;
    const uri = _SCHEMES.vmess + Buffer.from(JSON.stringify(vmessConfig)).toString('base64');
    const clashProxy = this._clashTls({
      name, type: 'vmess', server: this.host, port: this.port, uuid: this.state.uuid, alterId: 0, cipher: 'auto', network: 'ws',
      'ws-opts': { path: this.vmessPath, headers: { Host: o.wsHost } }
    });
    const sbOutbound = {
      type: 'vmess', tag: name, server: this.host, server_port: this.port, uuid: this.state.uuid, alter_id: 0, security: 'auto',
      tls: this._sbTls(),
      transport: { type: 'ws', path: this.vmessPath, headers: { Host: o.wsHost } }
    };
    return {
      name,
      type: 'VMess-WS-TLS',
      label: 'Classic Universal Client',
      compat: true,
      uri,
      clash: clashProxy,
      singboxOutbound: [sbOutbound],
      singboxJson: JSON.stringify([sbOutbound], null, 2)
    };
  }

  generateVmessWs() {
    if (!this.config.enable.vmessWs) return null;
    if (this.edgeTls) return null; // covered by VMess-WS-TLS (same inbound)
    const name = this.name('VMess-WS');
    const vmessConfig = {
      v: '2',
      ps: name,
      add: this.host,
      port: String(this.port),
      id: this.state.uuid,
      aid: '0',
      scy: 'auto',
      net: 'ws',
      type: 'none',
      host: this.host,
      path: this.vmessPath,
      tls: 'none'
    };
    const uri = _SCHEMES.vmess + Buffer.from(JSON.stringify(vmessConfig)).toString('base64');
    const clashProxy = {
      name,
      type: 'vmess',
      server: this.host,
      port: this.port,
      uuid: this.state.uuid,
      alterId: 0,
      cipher: 'auto',
      network: 'ws',
      tls: false,
      'ws-opts': {
        path: this.vmessPath,
        headers: { Host: this.host }
      }
    };
    const sbOutbound = {
      type: 'vmess',
      tag: name,
      server: this.host,
      server_port: this.port,
      uuid: this.state.uuid,
      alter_id: 0,
      security: 'auto',
      transport: {
        type: 'ws',
        path: this.vmessPath,
        headers: { Host: this.host }
      }
    };
    return {
      name,
      type: 'VMess-WS',
      label: 'VMess WebSocket Direct',
      compat: true,
      uri,
      clash: clashProxy,
      singboxOutbound: [sbOutbound],
      singboxJson: JSON.stringify([sbOutbound], null, 2)
    };
  }

  // ===== BK_PROTOCOLS_APPLIED: HTTPUpgrade for VLESS / VMess / Trojan (one generic builder) =====
  _httpUpgradeNode(proto, enabled, pathVal, type) {
    if (!enabled) return null;
    const tls = this.edgeTls; // Replit/Railway edge: TLS on 443; self-hosted: plain on PORT
    const o = this.tlsOpt;
    const hostHdr = tls ? o.wsHost : this.plainHost;
    const name = this.name(type + (tls ? '-TLS' : ''));
    const u = this.state.uuid;
    const base = { server: this.host, port: this.port };
    let uri; let clash; let sb;
    const clashWs = { network: 'ws', 'ws-opts': { path: pathVal, headers: { Host: hostHdr }, 'v2ray-http-upgrade': true } };
    const sbTransport = { type: 'httpupgrade', path: pathVal, host: hostHdr };
    if (proto === 'vless') {
      uri = `${_SCHEMES.vless}${u}@${this.host}:${this.port}?encryption=none&security=${tls ? 'tls' + this._uriTls() : 'none'}&type=httpupgrade&host=${encodeURIComponent(hostHdr)}&path=${urlSafeEncode(pathVal)}#${urlSafeEncode(name)}`;
      clash = { name, type: 'vless', ...base, uuid: u, ...clashWs };
      sb = { type: 'vless', tag: name, server: this.host, server_port: this.port, uuid: u, transport: sbTransport };
    } else if (proto === 'vmess') {
      const v = { v: '2', ps: name, add: this.host, port: String(this.port), id: u, aid: '0', scy: 'auto', net: 'httpupgrade', type: 'none', host: hostHdr, path: pathVal, tls: tls ? 'tls' : '' };
      if (tls) { v.sni = o.sni; if (o.alpn.length) v.alpn = o.alpn.join(','); if (o.fp) v.fp = o.fp; }
      uri = _SCHEMES.vmess + Buffer.from(JSON.stringify(v)).toString('base64');
      clash = { name, type: 'vmess', ...base, uuid: u, alterId: 0, cipher: 'auto', ...clashWs };
      sb = { type: 'vmess', tag: name, server: this.host, server_port: this.port, uuid: u, alter_id: 0, security: 'auto', transport: sbTransport };
    } else {
      uri = `${_SCHEMES.trojan}${u}@${this.host}:${this.port}?security=${tls ? 'tls' + this._uriTls() : 'none'}&type=httpupgrade&host=${encodeURIComponent(hostHdr)}&path=${urlSafeEncode(pathVal)}#${urlSafeEncode(name)}`;
      clash = { name, type: 'trojan', ...base, password: u, ...clashWs };
      sb = { type: 'trojan', tag: name, server: this.host, server_port: this.port, password: u, transport: sbTransport };
    }
    if (tls) { this._clashTls(clash, proto === 'trojan' ? 'sni' : 'servername'); sb.tls = this._sbTls(); } else { clash.tls = false; }
    if (proto === 'trojan' && !tls) clash = null; // Clash Meta (mihomo) always wraps Trojan in TLS: no plain-Trojan entry
    return {
      name, type: type + (tls ? '-TLS' : ''), label: type.replace('-', ' '), compat: true, uri, clash,
      singboxOutbound: [sb], singboxJson: JSON.stringify([sb], null, 2)
    };
  }

  generateVlessHttpUpgrade() { return this._httpUpgradeNode('vless', this.config.enable.vlessHttpUpgrade, this.huPath, 'VLESS-HTTPUpgrade'); }
  generateVmessHttpUpgrade() { return this._httpUpgradeNode('vmess', this.config.enable.vmessHttpUpgrade, this.vmHuPath, 'VMess-HTTPUpgrade'); }
  generateTrojanHttpUpgrade() { return this._httpUpgradeNode('trojan', this.config.enable.trojanHttpUpgrade, this.trHuPath, 'Trojan-HTTPUpgrade'); }

  /** Trojan-WS-TLS on a self-hosted port: TLS is terminated by the gate's internal HTTPS server (self-signed cert). */
  generateTrojanWsTls() {
    if (!this.config.enable.trojanWsTls || !this.config.enable.trojanWs) return null; // served by the Trojan-WS inbound
    if (this.edgeTls) return null; // generateTrojanWs() already emits Trojan-WS-TLS behind an edge
    const name = this.name('Trojan-WS-TLS');
    const o = this.tlsOpt;
    const sbOutbound = {
      type: 'trojan', tag: name, server: this.host, server_port: this.port, password: this.state.uuid,
      tls: this._sbTls(),
      transport: { type: 'ws', path: this.trPath, headers: { Host: o.wsHost } }
    };
    return {
      name, type: 'Trojan-WS-TLS', label: 'Trojan WebSocket TLS', compat: true,
      uri: `${_SCHEMES.trojan}${this.state.uuid}@${this.host}:${this.port}?security=tls${this._uriTls()}&type=ws&host=${encodeURIComponent(o.wsHost)}&path=${urlSafeEncode(this.trPath)}#${urlSafeEncode(name)}`,
      clash: this._clashTls({
        name, type: 'trojan', server: this.host, port: this.port, password: this.state.uuid, network: 'ws',
        'ws-opts': { path: this.trPath, headers: { Host: o.wsHost } }
      }, 'sni'),
      singboxOutbound: [sbOutbound], singboxJson: JSON.stringify([sbOutbound], null, 2)
    };
  }

  /** VLESS + gRPC + TLS (ALPN h2 only) on the shared port. Not possible behind Replit/Railway (edge speaks HTTP/1.1 to the app). */
  generateVlessGrpcTls() {
    if (!this.config.enable.vlessGrpcTls || this.edgeTls) return null;
    const name = this.name('VLESS-gRPC-TLS');
    const o = this.tlsOpt;
    const svc = this.grpcService;
    let q = '&sni=' + encodeURIComponent(o.sni) + (o.fp ? '&fp=' + encodeURIComponent(o.fp) : '') + '&alpn=h2' + this._uriInsecure();
    const sbTls = { enabled: true, server_name: o.sni, insecure: this.insecure, alpn: ['h2'] };
    if (o.fp) sbTls.utls = { enabled: true, fingerprint: o.fp };
    const sbOutbound = { type: 'vless', tag: name, server: this.host, server_port: this.port, uuid: this.state.uuid, tls: sbTls, transport: { type: 'grpc', service_name: svc } };
    const clash = { name, type: 'vless', server: this.host, port: this.port, uuid: this.state.uuid, network: 'grpc', tls: true, servername: o.sni, 'skip-cert-verify': this.insecure, alpn: ['h2'], 'grpc-opts': { 'grpc-service-name': svc } };
    if (this.pcs) clash.fingerprint = this.pcs;
    if (o.fp) clash['client-fingerprint'] = o.fp === 'randomized' ? 'random' : o.fp;
    return {
      name, type: 'VLESS-gRPC-TLS', label: 'gRPC TLS', compat: true,
      uri: `${_SCHEMES.vless}${this.state.uuid}@${this.host}:${this.port}?encryption=none&security=tls${q}&type=grpc&serviceName=${urlSafeEncode(svc)}&mode=gun#${urlSafeEncode(name)}`,
      clash, singboxOutbound: [sbOutbound], singboxJson: JSON.stringify([sbOutbound], null, 2)
    };
  }

  /** Shadowsocks over WebSocket (SIP002 + v2ray-plugin "websocket" mode, mux off) served by Xray-core. */
  generateShadowsocksWs() {
    if (!this.config.enable.ssWs || !this.config.ssWsPort || !this.state.shadowsocksPassword) return null;
    if (this.edgeTls) return null; // kept to self-hosted ports (plain WS); behind an edge use the VLESS/VMess/Trojan TLS links
    const name = this.name('Shadowsocks-WS');
    const method = this.config.shadowsocks.method || 'aes-256-gcm';
    const pass = this.state.shadowsocksPassword;
    const hostHdr = this.plainHost;
    const userinfo = /^2022-/i.test(method)
      ? encodeURIComponent(method) + ':' + encodeURIComponent(pass)
      : Buffer.from(`${method}:${pass}`).toString('base64url');
    const pluginOpts = `mode=websocket;host=${hostHdr};path=${this.ssWsPath};mux=0`;
    const sbOutbound = { type: 'shadowsocks', tag: name, server: this.host, server_port: this.port, method, password: pass, plugin: 'v2ray-plugin', plugin_opts: pluginOpts };
    return {
      name, type: 'Shadowsocks-WS', label: 'Shadowsocks + v2ray-plugin (WebSocket)', compat: true,
      uri: `${_SCHEMES.ss}${userinfo}@${this.host}:${this.port}/?plugin=${encodeURIComponent('v2ray-plugin;' + pluginOpts)}#${urlSafeEncode(name)}`,
      clash: { name, type: 'ss', server: this.host, port: this.port, cipher: method, password: pass, plugin: 'v2ray-plugin', 'plugin-opts': { mode: 'websocket', host: hostHdr, path: this.ssWsPath, tls: false, mux: false } },
      singboxOutbound: [sbOutbound], singboxJson: JSON.stringify([sbOutbound], null, 2),
      note: 'Shadowsocks + v2ray-plugin (websocket, mux=0): v2rayN / v2rayNG / Hiddify / sing-box / Clash Meta'
    };
  }

  generateReality() {
    if (!this.config.enable.reality) return null;
    if (!this.state.realityPublicKey || !this.state.realityPrivateKey || this.state.realityPublicKey.length < 10) {
      try {
        const kp = crypto.generateKeyPairSync('x25519');
        this.state.realityPrivateKey = kp.privateKey.export({ type: 'pkcs8', format: 'der' }).subarray(-32).toString('base64url');
        this.state.realityPublicKey = kp.publicKey.export({ type: 'spki', format: 'der' }).subarray(-32).toString('base64url');
        this.state.realityShortId = this.state.realityShortId || crypto.randomBytes(4).toString('hex');
      } catch (_) {
        return null;
      }
    }
    const name = this.name('Reality');
    const target = String(this.config.reality.target || 'www.microsoft.com').replace(/[\[\]]/g, '').trim();
    const shortId = this.state.realityShortId || '12345678';
    const clashProxy = {
      name,
      type: 'vless',
      server: this.host,
      port: this.port,
      uuid: this.state.uuid,
      flow: 'xtls-rprx-vision',
      tls: true,
      'reality-opts': {
        'public-key': this.state.realityPublicKey,
        'short-id': shortId
      },
      'client-fingerprint': 'chrome',
      servername: target
    };
    const sbOutbound = {
      type: 'vless',
      tag: name,
      server: this.host,
      server_port: this.port,
      uuid: this.state.uuid,
      flow: 'xtls-rprx-vision',
      tls: {
        enabled: true,
        server_name: target,
        reality: {
          enabled: true,
          public_key: this.state.realityPublicKey,
          short_id: shortId
        },
        utls: { enabled: true, fingerprint: 'chrome' }
      }
    };
    return {
      name,
      type: 'VLESS-REALITY',
      label: 'Anti-blocking / Web traffic',
      compat: true,
      uri: `${_SCHEMES.vless}${this.state.uuid}@${this.host}:${this.port}?encryption=none&security=reality&sni=${target}&fp=chrome&pbk=${this.state.realityPublicKey}&sid=${shortId}&type=tcp&flow=xtls-rprx-vision#${urlSafeEncode(name)}`,
      clash: clashProxy,
      singboxOutbound: [sbOutbound],
      singboxJson: JSON.stringify([sbOutbound], null, 2)
    };
  }

  generateShadowTls() {
    if (!this.config.enable.shadowTlsVless || !this.state.shadowTlsPassword) return null;
    const name = this.name('ShadowTLS');
    const sni = String(this.config.shadowTls.sni || 'www.microsoft.com').replace(/[\[\]]/g, '').trim();
    const clashProxy = {
      name,
      type: 'shadow-tls',
      server: this.host,
      port: this.port,
      password: this.state.shadowTlsPassword,
      version: 3,
      sni
    };
    const sbOutbounds = [
      {
        type: 'shadowtls',
        tag: name,
        server: this.host,
        server_port: this.port,
        version: 3,
        password: this.state.shadowTlsPassword,
        tls: {
          enabled: true,
          server_name: sni
        },
        detour: `${name}-detour`
      },
      {
        type: 'vless',
        tag: `${name}-detour`,
        server: this.host,
        server_port: this.port,
        uuid: this.state.uuid
      }
    ];
    return {
      name,
      type: 'ShadowTLS-VLESS',
      compat: false, // shadowtls:// is not recognized by v2rayN/v2rayNG
      uri: `shadowtls://${this.state.shadowTlsPassword}@${this.host}:${this.port}?sni=${sni}&version=3#${urlSafeEncode(name)}`,
      clash: clashProxy,
      singboxOutbound: sbOutbounds,
      singboxJson: JSON.stringify(sbOutbounds, null, 2),
      note: 'Use Hiddify, sing-box, or Clash Meta'
    };
  }

  generateShadowsocks() {
    if (!this.config.enable.shadowsocks || !this.state.shadowsocksPassword) return null;
    const name = this.name('Shadowsocks');
    const method = this.config.shadowsocks.method || 'aes-256-gcm';
    const auth = Buffer.from(`${method}:${this.state.shadowsocksPassword}`).toString('base64');
    const clashProxy = {
      name,
      type: 'ss',
      server: this.host,
      port: this.port,
      cipher: method,
      password: this.state.shadowsocksPassword
    };
    const sbOutbound = {
      type: 'shadowsocks',
      tag: name,
      server: this.host,
      server_port: this.port,
      method,
      password: this.state.shadowsocksPassword
    };
    return {
      name,
      type: 'Shadowsocks',
      compat: true,
      uri: `${_SCHEMES.ss}${auth}@${this.host}:${this.port}#${urlSafeEncode(name)}`,
      clash: clashProxy,
      singboxOutbound: [sbOutbound],
      singboxJson: JSON.stringify([sbOutbound], null, 2)
    };
  }

  _getOrGenerateWgKeys() {
    let clientPriv = this.state && this.state.wireguardClientPrivateKey;
    let clientPub = this.state && this.state.wireguardClientPublicKey;
    let serverPriv = this.state && this.state.wireguardPrivateKey;
    let serverPub = this.state && this.state.wireguardPublicKey;

    const isValidBase64Key = (k) => typeof k === 'string' && k.trim().length >= 40;

    if (!isValidBase64Key(clientPriv)) {
      try {
        const kp = crypto.generateKeyPairSync('x25519');
        clientPriv = kp.privateKey.export({ type: 'pkcs8', format: 'der' }).subarray(-32).toString('base64');
        clientPub = kp.publicKey.export({ type: 'spki', format: 'der' }).subarray(-32).toString('base64');
      } catch (_) {
        const raw = crypto.randomBytes(32);
        raw[0] &= 248; raw[31] &= 127; raw[31] |= 64;
        clientPriv = raw.toString('base64');
        clientPub = deriveX25519PublicKey(clientPriv) || crypto.randomBytes(32).toString('base64');
      }
    } else {
      const derived = deriveX25519PublicKey(clientPriv);
      if (derived) clientPub = derived;
    }

    if (!isValidBase64Key(serverPriv)) {
      try {
        const kp = crypto.generateKeyPairSync('x25519');
        serverPriv = kp.privateKey.export({ type: 'pkcs8', format: 'der' }).subarray(-32).toString('base64');
        serverPub = kp.publicKey.export({ type: 'spki', format: 'der' }).subarray(-32).toString('base64');
      } catch (_) {
        const raw = crypto.randomBytes(32);
        raw[0] &= 248; raw[31] &= 127; raw[31] |= 64;
        serverPriv = raw.toString('base64');
        serverPub = deriveX25519PublicKey(serverPriv) || crypto.randomBytes(32).toString('base64');
      }
    } else {
      const derived = deriveX25519PublicKey(serverPriv);
      if (derived) serverPub = derived;
    }

    if (this.state) {
      this.state.wireguardClientPrivateKey = clientPriv;
      this.state.wireguardClientPublicKey = clientPub;
      this.state.wireguardPrivateKey = serverPriv;
      this.state.wireguardPublicKey = serverPub;
    }

    return { clientPriv, clientPub, serverPub };
  }

  generateWireGuard() {
    try {
      if (!this.config || !this.config.enable || !this.config.enable.wireguard) return null;

      const keys = this._getOrGenerateWgKeys();
      const clientPrivateKey = keys.clientPriv;
      const serverPublicKey = keys.serverPub;

      if (!clientPrivateKey || !serverPublicKey) return null;

      const name = this.name('WireGuard');
      const port = (this.config.wireguard && this.config.wireguard.port) || this.port || 51820;
      const clientIp = (this.config.wireguard && this.config.wireguard.clientIp) || '10.66.66.2/32';
      const ifaceAddress = clientIp.endsWith('/32') ? clientIp.replace('/32', '/24') : clientIp;
      const mtu = (this.config.wireguard && this.config.wireguard.mtu) || 1420;

      const wgConf = [
        '[Interface]',
        `PrivateKey = ${clientPrivateKey}`,
        `Address = ${ifaceAddress}`,
        'DNS = 1.1.1.1, 8.8.8.8',
        `MTU = ${mtu}`,
        '',
        '[Peer]',
        `PublicKey = ${serverPublicKey}`,
        `Endpoint = ${this.host}:${port}`,
        'AllowedIPs = 0.0.0.0/0, ::/0',
        'PersistentKeepalive = 25'
      ].join('\n') + '\n';

      const clashProxy = {
        name,
        type: 'wireguard',
        server: this.host,
        port,
        ip: clientIp.replace(/\/.*$/, ''),
        'public-key': serverPublicKey,
        'private-key': clientPrivateKey,
        udp: true,
        'remote-dns-resolve': true,
        dns: ['1.1.1.1', '8.8.8.8'],
        mtu
      };

      const sbOutbound = {
        type: 'wireguard',
        tag: name,
        server: this.host,
        server_port: port,
        local_address: [clientIp],
        private_key: clientPrivateKey,
        peer_public_key: serverPublicKey,
        mtu
      };

      const rawUri = `wireguard://${encodeURIComponent(clientPrivateKey)}@${this.host}:${port}?publickey=${encodeURIComponent(serverPublicKey)}&address=${encodeURIComponent(clientIp)}&mtu=${mtu}#${urlSafeEncode(name)}`;

      return {
        name,
        type: 'WireGuard',
        compat: false,
        uri: rawUri,
        wgConf,
        clash: clashProxy,
        singboxOutbound: [sbOutbound],
        singboxJson: JSON.stringify([sbOutbound], null, 2),
        note: 'WireGuard .conf / Clash Meta / Sing-box'
      };
    } catch (err) {
      console.warn(`[WARN] WireGuard generation failed: ${err.message}. Skipping.`);
      return null;
    }
  }

  generateTuic() {
    if (!this.config.enable.tuic) return null;
    const name = this.name('TUIC');
    const port = this.config.tuic.port || 8443;
    const sni = this.config.sniHy2 || 'www.google.com';
    const cc = this.config.tuic.congestionController || 'bbr';

    const clashProxy = {
      name,
      type: 'tuic',
      server: this.host,
      port,
      uuid: this.state.uuid,
      password: this.state.uuid,
      alpn: ['h3'],
      sni,
      'skip-cert-verify': true,
      'congestion-controller': cc,
      udp: true
    };

    const sbOutbound = {
      type: 'tuic',
      tag: name,
      server: this.host,
      server_port: port,
      uuid: this.state.uuid,
      password: this.state.uuid,
      congestion_controller: cc,
      tls: {
        enabled: true,
        server_name: sni,
        alpn: ['h3'],
        insecure: true
      }
    };

    return {
      name,
      type: 'TUIC',
      compat: false,
      uri: `tuic://${this.state.uuid}:${this.state.uuid}@${this.host}:${port}?congestion_control=${cc}&alpn=h3&sni=${sni}&allow_insecure=1#${urlSafeEncode(name)}`,
      clash: clashProxy,
      singboxOutbound: [sbOutbound],
      singboxJson: JSON.stringify([sbOutbound], null, 2)
    };
  }

  /** XHTTP link options: XHTTP_MODE (default packet-up), XHTTP_ALPN (default h2 - Railway edge negotiates h2; Xray's xhttp client must match the edge ALPN). */
  static xhttpOptions() {
    const MODES = ['auto', 'packet-up', 'stream-up', 'stream-one'];
    let mode = String(process.env.XHTTP_MODE || 'packet-up').trim().toLowerCase();
    if (!MODES.includes(mode)) mode = 'packet-up';
    const raw = process.env.XHTTP_ALPN === undefined ? 'h2' : String(process.env.XHTTP_ALPN).trim();
    const alpn = /^(none|off|false)?$/i.test(raw) ? [] : raw.split(',').map(x => x.trim()).filter(Boolean);
    return { mode, alpn };
  }

  generateXhttp() {
    if (!this.config.enable.vlessXhttp) return null;
    if (this.config.xhttpPort === null) return null; // Xray-core failed to start
    if (this.edgeTls) {
      const name = this.name('XHTTP-TLS');
      const o = this.tlsOpt;
      const x = LinkGenerator.xhttpOptions();
      let q = '&sni=' + encodeURIComponent(o.sni);
      if (o.fp) q += '&fp=' + encodeURIComponent(o.fp);
      if (x.alpn.length) q += '&alpn=' + encodeURIComponent(x.alpn.join(','));
      return {
        name,
        type: 'VLESS-XHTTP-TLS',
        label: 'VLESS-XHTTP-TLS',
        note: 'VLESS-XHTTP-TLS (Xray clients: v2rayNG, v2rayN, Hiddify w/ xray core)',
        compat: true, // v2ray subscription only; no Clash / sing-box outbound (unsupported there)
        uri: `${_SCHEMES.vless}${this.state.uuid}@${this.host}:${this.port}?encryption=none&security=tls${q}&type=xhttp&host=${encodeURIComponent(o.wsHost)}&path=${urlSafeEncode(this.xhPath)}&mode=${x.mode}#${urlSafeEncode(name)}`,
        clash: null
      };
    }
    const name = this.name('VLESS-XHTTP');
    return {
      name,
      type: 'VLESS-XHTTP',
      label: 'VLESS XHTTP',
      note: 'VLESS-XHTTP (Xray-core clients: v2rayN, v2rayNG, Hiddify w/ xray core)',
      compat: true, // BK_PROTOCOLS_APPLIED: listed in the normal subscription too (Xray clients support xhttp)
      uri: `${_SCHEMES.vless}${this.state.uuid}@${this.host}:${this.port}?encryption=none&security=none&type=xhttp&host=${encodeURIComponent(this.plainHost)}&path=${urlSafeEncode(this.xhPath)}&mode=packet-up#${urlSafeEncode(name)}`,
      clash: null
    };
  }

  generateArgo(argoDomain) {
    if (!this.config.enable.argo || !argoDomain) return null;
    const name = this.name('Argo');
    const clashProxy = {
      name,
      type: 'vless',
      server: argoDomain,
      port: 443,
      uuid: this.state.uuid,
      network: 'ws',
      tls: true,
      servername: argoDomain,
      'ws-opts': {
        path: this.wsPath,
        headers: { Host: argoDomain }
      }
    };
    const sbOutbound = {
      type: 'vless',
      tag: name,
      server: argoDomain,
      server_port: 443,
      uuid: this.state.uuid,
      tls: {
        enabled: true,
        server_name: argoDomain
      },
      transport: {
        type: 'ws',
        path: this.wsPath,
        headers: { Host: argoDomain }
      }
    };
    return {
      name,
      type: 'VLESS-Argo',
      compat: true,
      uri: `${_SCHEMES.vless}${this.state.uuid}@${argoDomain}:443?encryption=none&security=tls&sni=${argoDomain}&type=ws&host=${argoDomain}&path=${urlSafeEncode(this.wsPath)}#${urlSafeEncode(name)}`,
      clash: clashProxy,
      singboxOutbound: [sbOutbound],
      singboxJson: JSON.stringify([sbOutbound], null, 2)
    };
  }

  generateTrojanWs() {
    if (!this.config.enable.trojanWs) return null;
    if (this.edgeTls) {
      const name = this.name('Trojan-WS-TLS');
      const o = this.tlsOpt;
      const sbOutbound = {
        type: 'trojan', tag: name, server: this.host, server_port: this.port, password: this.state.uuid,
        tls: this._sbTls(),
        transport: { type: 'ws', path: this.trPath, headers: { Host: o.wsHost } }
      };
      return {
        name,
        type: 'Trojan-WS-TLS',
        label: 'Trojan WebSocket TLS',
        compat: true,
        uri: `${_SCHEMES.trojan}${this.state.uuid}@${this.host}:${this.port}?security=tls${this._uriTls()}&type=ws&host=${encodeURIComponent(o.wsHost)}&path=${urlSafeEncode(this.trPath)}#${urlSafeEncode(name)}`,
        clash: this._clashTls({
          name, type: 'trojan', server: this.host, port: this.port, password: this.state.uuid, network: 'ws',
          'ws-opts': { path: this.trPath, headers: { Host: o.wsHost } }
        }, 'sni'),
        singboxOutbound: [sbOutbound],
        singboxJson: JSON.stringify([sbOutbound], null, 2)
      };
    }
    const name = this.name('Trojan-WS');
    const trPath = this.trPath;
    const clashProxy = {
      name,
      type: 'trojan',
      server: this.host,
      port: this.port,
      password: this.state.uuid,
      network: 'ws',
      tls: false,
      'ws-opts': {
        path: trPath,
        headers: { Host: this.host }
      }
    };
    const sbOutbound = {
      type: 'trojan',
      tag: name,
      server: this.host,
      server_port: this.port,
      password: this.state.uuid,
      transport: {
        type: 'ws',
        path: trPath,
        headers: { Host: this.host }
      }
    };
    return {
      name,
      type: 'Trojan-WS',
      label: 'Trojan WebSocket Direct',
      compat: true,
      uri: `${_SCHEMES.trojan}${this.state.uuid}@${this.host}:${this.port}?security=none&type=ws&host=${this.host}&path=${urlSafeEncode(trPath)}#${urlSafeEncode(name)}`,
      clash: null, // BK_PROTOCOLS_APPLIED: mihomo always uses TLS for Trojan (the entry could never connect); use Trojan-WS-TLS there
      singboxOutbound: [sbOutbound],
      singboxJson: JSON.stringify([sbOutbound], null, 2)
    };
  }

  generateTrojanGrpcTls() {
    if (!this.config.enable.trojanGrpcTls) return null;
    const name = this.name('gRPC');
    const sni = this.config.domain || this.host;
    const serviceName = this.grpcService;
    const clashProxy = {
      name,
      type: 'trojan',
      server: this.host,
      port: this.port,
      password: this.state.uuid,
      network: 'grpc',
      tls: true,
      sni: sni,
      'skip-cert-verify': true,
      alpn: ['h2'],
      'grpc-opts': {
        'grpc-service-name': serviceName
      }
    };
    const sbOutbound = {
      type: 'trojan',
      tag: name,
      server: this.host,
      server_port: this.port,
      password: this.state.uuid,
      tls: {
        enabled: true,
        server_name: sni,
        alpn: ['h2'],
        insecure: true
      },
      transport: {
        type: 'grpc',
        service_name: serviceName
      }
    };
    return {
      name,
      type: 'Trojan-gRPC-TLS',
      label: 'CDN gRPC Alternative',
      compat: true,
      uri: `${_SCHEMES.trojan}${this.state.uuid}@${this.host}:${this.port}?security=tls&sni=${sni}&alpn=h2&type=grpc&serviceName=${urlSafeEncode(serviceName)}&fp=chrome${this._uriInsecure()}#${urlSafeEncode(name)}`,
      clash: clashProxy,
      singboxOutbound: [sbOutbound],
      singboxJson: JSON.stringify([sbOutbound], null, 2)
    };
  }

  generateVlessGrpc() {
    if (!this.config.enable.vlessGrpc) return null;
    if (this.edgeTls) return null; // BK_PROTOCOLS_APPLIED: an HTTP/1.1 edge (Replit/Railway) cannot carry h2c gRPC
    const name = this.name('VLESS-gRPC');
    const serviceName = this.grpcService;
    const clashProxy = {
      name,
      type: 'vless',
      server: this.host,
      port: this.port,
      uuid: this.state.uuid,
      network: 'grpc',
      tls: false,
      'grpc-opts': {
        'grpc-service-name': serviceName
      }
    };
    const sbOutbound = {
      type: 'vless',
      tag: name,
      server: this.host,
      server_port: this.port,
      uuid: this.state.uuid,
      transport: {
        type: 'grpc',
        service_name: serviceName
      }
    };
    return {
      name,
      type: 'VLESS-gRPC',
      label: 'gRPC Direct',
      compat: true,
      uri: `${_SCHEMES.vless}${this.state.uuid}@${this.host}:${this.port}?encryption=none&security=none&type=grpc&serviceName=${urlSafeEncode(serviceName)}&mode=gun#${urlSafeEncode(name)}`,
      clash: clashProxy,
      singboxOutbound: [sbOutbound],
      singboxJson: JSON.stringify([sbOutbound], null, 2)
    };
  }

  getAllNodes(options = {}) {
    let argoDomain = null;
    let compat = 'v2ray';
    let allowLocalHost = this.config.allowLocalHostLinks || false;

    if (typeof options === 'string') {
      argoDomain = options;
    } else if (options && typeof options === 'object') {
      argoDomain = options.argoDomain || null;
      if (options.compat) compat = options.compat;
      if (options.allowLocalHostLinks !== undefined) allowLocalHost = options.allowLocalHostLinks;
    }

    let wgNode = null;
    try {
      wgNode = this.generateWireGuard();
    } catch (err) {
      console.warn(`[WARN] WireGuard skipped in getAllNodes: ${err.message}`);
    }

    const all = [
      this.generateReality(),
      this.generateVlessWsTls(),
      this.generateTrojanGrpcTls(),
      this.generateVmessWsTls(),
      this.generateVlessWs(),
      this.generateVmessWs(),
      this.generateTrojanWs(),
      this.generateTrojanWsTls(),
      this.generateVlessHttpUpgrade(),
      this.generateVmessHttpUpgrade(),
      this.generateTrojanHttpUpgrade(),
      this.generateVlessGrpc(),
      this.generateVlessGrpcTls(),
      this.generateXhttp(),
      this.generateShadowsocksWs(),
      this.generateShadowsocks(),
      wgNode,
      this.generateShadowTls(),
      this.generateTuic(),
      this.generateArgo(argoDomain)
    ].filter(Boolean);

    return all.filter(node => isValidNode(node, { allowLocalHostLinks: allowLocalHost, compatMode: compat }));
  }

  buildClashMetaYaml(nodes) {
    const proxyLines = [];
    const proxyNames = [];

    for (const node of nodes) {
      if (!node.clash) continue;
      proxyNames.push(node.clash.name);
      proxyLines.push(`  - name: ${yamlSafeQuote(node.clash.name)}`);
      proxyLines.push(`    type: ${node.clash.type}`);
      proxyLines.push(`    server: ${yamlSafeQuote(node.clash.server)}`);
      proxyLines.push(`    port: ${node.clash.port}`);
      if (node.clash.fingerprint) proxyLines.push(`    fingerprint: ${yamlSafeQuote(node.clash.fingerprint)}`);
      if (node.clash.plugin) {
        proxyLines.push(`    plugin: ${node.clash.plugin}`);
        const po = node.clash['plugin-opts'] || {};
        proxyLines.push(`    plugin-opts:`);
        for (const [k, v] of Object.entries(po)) proxyLines.push(`      ${k}: ${typeof v === 'string' ? yamlSafeQuote(v) : v}`);
      }

      if (node.clash.password) proxyLines.push(`    password: ${yamlSafeQuote(node.clash.password)}`);
      if (node.clash.uuid) proxyLines.push(`    uuid: ${yamlSafeQuote(node.clash.uuid)}`);
      if (node.clash.alterId !== undefined) proxyLines.push(`    alterId: ${node.clash.alterId}`);
      if (node.clash.sni) proxyLines.push(`    sni: ${yamlSafeQuote(node.clash.sni)}`);
      if (node.clash.servername) proxyLines.push(`    servername: ${yamlSafeQuote(node.clash.servername)}`);
      if (node.clash['skip-cert-verify'] !== undefined) proxyLines.push(`    skip-cert-verify: ${node.clash['skip-cert-verify']}`);
      if (node.clash.obfs) proxyLines.push(`    obfs: ${node.clash.obfs}`);
      if (node.clash['obfs-password']) proxyLines.push(`    obfs-password: ${yamlSafeQuote(node.clash['obfs-password'])}`);
      if (node.clash.alpn) proxyLines.push(`    alpn: [${node.clash.alpn.map(yamlSafeQuote).join(', ')}]`);
      if (node.clash.network) proxyLines.push(`    network: ${node.clash.network}`);
      if (node.clash.tls !== undefined) proxyLines.push(`    tls: ${node.clash.tls}`);
      if (node.clash.flow) proxyLines.push(`    flow: ${node.clash.flow}`);
      if (node.clash['client-fingerprint']) proxyLines.push(`    client-fingerprint: ${node.clash['client-fingerprint']}`);

      if (node.clash.ip) proxyLines.push(`    ip: ${yamlSafeQuote(node.clash.ip)}`);
      if (node.clash['public-key']) proxyLines.push(`    public-key: ${yamlSafeQuote(node.clash['public-key'])}`);
      if (node.clash['private-key']) proxyLines.push(`    private-key: ${yamlSafeQuote(node.clash['private-key'])}`);
      if (node.clash.udp !== undefined) proxyLines.push(`    udp: ${node.clash.udp}`);
      if (node.clash['remote-dns-resolve'] !== undefined) proxyLines.push(`    remote-dns-resolve: ${node.clash['remote-dns-resolve']}`);
      if (node.clash.dns) proxyLines.push(`    dns: [${node.clash.dns.map(yamlSafeQuote).join(', ')}]`);
      if (node.clash.mtu) proxyLines.push(`    mtu: ${node.clash.mtu}`);
      if (node.clash['congestion-controller']) proxyLines.push(`    congestion-controller: ${yamlSafeQuote(node.clash['congestion-controller'])}`);

      if (node.clash['reality-opts']) {
        proxyLines.push(`    reality-opts:`);
        proxyLines.push(`      public-key: ${yamlSafeQuote(node.clash['reality-opts']['public-key'])}`);
        proxyLines.push(`      short-id: ${yamlSafeQuote(node.clash['reality-opts']['short-id'])}`);
      }

      if (node.clash['ws-opts']) {
        proxyLines.push(`    ws-opts:`);
        proxyLines.push(`      path: ${yamlSafeQuote(node.clash['ws-opts'].path)}`);
        if (node.clash['ws-opts'].headers) {
          proxyLines.push(`      headers:`);
          for (const [k, v] of Object.entries(node.clash['ws-opts'].headers)) {
            proxyLines.push(`        ${k}: ${yamlSafeQuote(v)}`);
          }
        }
        if (node.clash['ws-opts']['v2ray-http-upgrade']) proxyLines.push(`      v2ray-http-upgrade: true`);
      }

      if (node.clash['httpupgrade-opts']) {
        proxyLines.push(`    httpupgrade-opts:`);
        proxyLines.push(`      path: ${yamlSafeQuote(node.clash['httpupgrade-opts'].path)}`);
        proxyLines.push(`      host: ${yamlSafeQuote(node.clash['httpupgrade-opts'].host)}`);
      }

      if (node.clash['grpc-opts']) {
        proxyLines.push(`    grpc-opts:`);
        proxyLines.push(`      grpc-service-name: ${yamlSafeQuote(node.clash['grpc-opts']['grpc-service-name'])}`);
      }

      if (node.clash.cipher) proxyLines.push(`    cipher: ${node.clash.cipher}`);
      if (node.clash.version) proxyLines.push(`    version: ${node.clash.version}`);
    }

    const proxiesBlock = proxyLines.join('\n');
    const proxyListStr = proxyNames.map(name => `      - ${yamlSafeQuote(name)}`).join('\n');

    return `# Zedecco Gate - Clash Meta (Mihomo) Subscription
# Generated by Zedecco Gate
port: 7890
socks-port: 7891
allow-lan: true
mode: rule
log-level: info

proxies:
${proxiesBlock}

proxy-groups:
  - name: "Proxy Nodes"
    type: select
    proxies:
      - "⚡ Auto Select"
${proxyListStr}

  - name: "⚡ Auto Select"
    type: url-test
    url: http://www.gstatic.com/generate_204
    interval: 300
    tolerance: 50
    proxies:
${proxyListStr}

rules:
  - MATCH,"Proxy Nodes"
`;
  }

  buildSingBoxClientJson(nodes) {
    const outbounds = [];
    const proxyTags = [];

    for (const node of nodes) {
      if (node.singboxOutbound && Array.isArray(node.singboxOutbound)) {
        for (const ob of node.singboxOutbound) {
          outbounds.push(ob);
        }
        proxyTags.push(node.name);
      }
    }

    const allOutbounds = [];

    if (proxyTags.length > 0) {
      allOutbounds.push(
        {
          type: 'selector',
          tag: 'Proxy Nodes',
          outbounds: ['⚡ Auto Select', ...proxyTags]
        },
        {
          type: 'urltest',
          tag: '⚡ Auto Select',
          outbounds: [...proxyTags],
          url: 'http://www.gstatic.com/generate_204',
          interval: '5m'
        }
      );
    }

    allOutbounds.push(...outbounds);
    allOutbounds.push({ type: 'direct', tag: 'direct' }); // BK_PROTOCOLS_APPLIED: no legacy "block" outbound (removed in sing-box 1.13)

    return JSON.stringify({
      log: { level: 'info' },
      outbounds: allOutbounds
    }, null, 2);
  }
}

// --- Module: lib/panel/http-panel.js ---
function createHttpPanel(config, stateManager, engineStatusGetter, resolvedHostGetter) {
  const app = express();
  const panelPath = config.panelPath.replace(/^\//, '') || 'gate';

  // ===== XHTTP -> Xray-core streaming reverse proxy (registered before any auth / static route) =====
  const BK_XHTTP_PATH = XrayEngine.xhttpPath();
  const BK_HOP = new Set(['connection', 'keep-alive', 'proxy-connection', 'upgrade', 'te', 'trailer', 'proxy-authorization']);
  let bkXhttpLogged = 0;
  app.use((req, res, next) => {
    let p = String(req.url || '').split('?')[0];
    try { p = decodeURIComponent(p); } catch (_) {}
    if (!(p === BK_XHTTP_PATH || p.startsWith(BK_XHTTP_PATH + '/'))) return next();
    const port = config.xhttpPort;
    if (!port) { res.statusCode = 404; return res.end(); }
    if (bkXhttpLogged < 10) { bkXhttpLogged++; Logger.info(`XHTTP ${req.method} ${p.slice(BK_XHTTP_PATH.length) || '/'} -> xray :${port}`); }
    for (const sock of [req.socket]) { try { sock.setTimeout(0); sock.setNoDelay(true); sock.setKeepAlive(true, 10000); } catch (_) {} }
    const headers = {};
    for (let i = 0; i < req.rawHeaders.length; i += 2) {
      const k = req.rawHeaders[i];
      if (BK_HOP.has(k.toLowerCase())) continue;
      headers[k] = headers[k] === undefined ? req.rawHeaders[i + 1] : [].concat(headers[k], req.rawHeaders[i + 1]);
    }
    const up = http.request({ host: '127.0.0.1', port, method: req.method, path: req.url, headers, agent: false });
    up.on('socket', (sk) => { try { sk.setTimeout(0); sk.setNoDelay(true); } catch (_) {} });
    up.on('response', (pr) => {
      const out = {};
      for (let i = 0; i < pr.rawHeaders.length; i += 2) {
        const k = pr.rawHeaders[i];
        if (BK_HOP.has(k.toLowerCase())) continue;
        out[k] = out[k] === undefined ? pr.rawHeaders[i + 1] : [].concat(out[k], pr.rawHeaders[i + 1]);
      }
      res.removeHeader('X-Powered-By');
      res.writeHead(pr.statusCode, pr.statusMessage, out);
      if (typeof res.flushHeaders === 'function') res.flushHeaders();
      pr.on('data', (b) => BkTraffic.add('VLESS-XHTTP', 0, b.length));
      pr.pipe(res);
      pr.on('error', () => { try { res.destroy(); } catch (_) {} });
    });
    up.on('error', () => {
      if (!res.headersSent) { res.statusCode = 502; res.end(); } else { try { res.destroy(); } catch (_) {} }
    });
    const bkXhDone = BkTraffic.open('VLESS-XHTTP');
    res.once('close', bkXhDone);
    req.on('data', (b) => BkTraffic.add('VLESS-XHTTP', b.length, 0));
    req.pipe(up);
    req.on('error', () => { try { up.destroy(); } catch (_) {} });
    res.on('close', () => { if (!res.writableFinished) { try { up.destroy(); } catch (_) {} } });
  });

  // ===== Zedecco Gate: password login (create on first visit) =====
  const bkAuthFile = path.join(stateManager.paths.dataDir, 'auth.json');
  const bkLoadAuth = () => { try { return JSON.parse(fs.readFileSync(bkAuthFile, 'utf8')) || {}; } catch (_) { return {}; } };
  const bkSaveAuth = (a) => {
    try {
      fs.mkdirSync(path.dirname(bkAuthFile), { recursive: true });
      fs.writeFileSync(bkAuthFile, JSON.stringify(a, null, 2), { encoding: 'utf8', mode: 0o600 });
    } catch (err) { Logger.warn('Could not save auth.json: ' + err.message); }
  };
  (function bkInitAuth() {
    const a = bkLoadAuth();
    if (process.env.RESET_PANEL_PASSWORD === 'true') {
      delete a.hash; delete a.salt; a.secret = '';
      Logger.warn('Panel password was reset. Open the panel to create a new one, then delete RESET_PANEL_PASSWORD.');
    }
    if (!a.secret) a.secret = crypto.randomBytes(32).toString('hex');
    const envTok = String(process.env.SUB_TOKEN || '').trim();
    if (envTok) a.subToken = envTok;
    if (!a.subToken) a.subToken = crypto.randomBytes(18).toString('base64url');
    const envPw = String(process.env.PANEL_PASSWORD || '');
    if (envPw && process.env.RESET_PANEL_PASSWORD !== 'true') {
      const same = a.hash && a.salt && crypto.scryptSync(envPw, String(a.salt), 64).toString('hex') === a.hash;
      if (!same) {
        if (envPw.length < 8) Logger.warn('PANEL_PASSWORD is shorter than 8 characters - ignored.');
        else { a.salt = crypto.randomBytes(16).toString('hex'); a.hash = crypto.scryptSync(envPw, a.salt, 64).toString('hex'); Logger.info('Panel password set from PANEL_PASSWORD secret.'); }
      }
    }
    bkSaveAuth(a);
  })();
  const bkHash = (pw, salt) => crypto.scryptSync(String(pw), String(salt), 64).toString('hex');
  const bkSafeEq = (a, b) => { const x = Buffer.from(String(a)); const y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); };
  const bkSign = (secret, v) => crypto.createHmac('sha256', secret).update(String(v)).digest('hex');
  const bkCookies = (req) => {
    const out = {};
    String(req.headers.cookie || '').split(';').forEach((p) => {
      const i = p.indexOf('=');
      if (i > 0) { try { out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim()); } catch (_) {} }
    });
    return out;
  };
  const bkIsHttps = (req) => req.secure || String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim() === 'https';
  const BK_SESSION_DAYS = 30;
  const bkSetSession = (req, res, a) => {
    const exp = String(Date.now() + BK_SESSION_DAYS * 86400000);
    const val = exp + '.' + bkSign(a.secret, exp);
    res.setHeader('Set-Cookie', 'bk_session=' + val + '; Path=/; HttpOnly; SameSite=Lax; Max-Age=' + (BK_SESSION_DAYS * 86400) + (bkIsHttps(req) ? '; Secure' : ''));
  };
  const bkHasSession = (req) => {
    const a = bkLoadAuth();
    if (!a.hash || !a.secret) return false;
    const parts = String(bkCookies(req).bk_session || '').split('.');
    if (parts.length !== 2 || !parts[0] || !parts[1] || Number(parts[0]) < Date.now()) return false;
    return bkSafeEq(parts[1], bkSign(a.secret, parts[0]));
  };
  const bkFails = new Map();
  const bkIp = (req) => String(req.headers['x-forwarded-for'] || (req.socket && req.socket.remoteAddress) || '').split(',')[0].trim();
  const bkBlocked = (ip) => { const r = bkFails.get(ip); return !!r && r.count >= 8 && Date.now() - r.first < 15 * 60000; };
  const bkFail = (ip) => { const r = bkFails.get(ip); if (!r || Date.now() - r.first > 15 * 60000) bkFails.set(ip, { count: 1, first: Date.now() }); else r.count++; };
  const bkEsc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const bkPage = (mode, msg) => {
    const setup = mode === 'setup';
    const needKey = setup && !!process.env.SETUP_KEY;
    const svg = (d) => '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>';
    const ico = {
      lock: svg('<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'),
      key: svg('<path d="M21 2l-2 2m-2-2l2 2m-4 4l-4 4-2-2-4 4 2 2-4 4 2 2 4-4 2 2 4-4"/>'),
      shield: svg('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'),
      info: svg('<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>'),
      arrow: svg('<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>')
    };
    const css = `
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        min-height: 100vh;
        background: #0a0d14;
        color: #f8fafc;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        position: relative;
        overflow-x: hidden;
      }
      .ambient-glow {
        position: fixed;
        width: 600px;
        height: 600px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, transparent 70%);
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        filter: blur(80px);
      }
      .card {
        background: rgba(17, 23, 38, 0.85);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 20px;
        padding: 40px 32px;
        max-width: 440px;
        width: 100%;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(16px);
        position: relative;
        z-index: 1;
      }
      .card-header {
        text-align: center;
        margin-bottom: 28px;
      }
      .brand-icon {
        width: 52px;
        height: 52px;
        border-radius: 14px;
        background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        margin-bottom: 16px;
        box-shadow: 0 0 25px rgba(99, 102, 241, 0.35);
      }
      .brand-title {
        font-size: 1.45rem;
        font-weight: 700;
        letter-spacing: -0.02em;
      }
      .brand-sub {
        font-size: 0.85rem;
        color: #94a3b8;
        margin-top: 4px;
      }
      .form-group {
        margin-bottom: 18px;
      }
      .form-label {
        display: block;
        font-size: 0.78rem;
        font-weight: 600;
        text-transform: uppercase;
        color: #94a3b8;
        margin-bottom: 6px;
        letter-spacing: 0.04em;
      }
      .input-wrap {
        position: relative;
      }
      .input-wrap input {
        width: 100%;
        padding: 12px 14px 12px 42px;
        background: #0a0d14;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        font-size: 0.9rem;
        color: #f8fafc;
        outline: none;
        transition: border-color 0.2s ease;
      }
      .input-wrap input:focus {
        border-color: #6366f1;
      }
      .input-wrap .field-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: #64748b;
      }
      .btn-submit {
        width: 100%;
        padding: 12px 16px;
        border-radius: 10px;
        background: #6366f1;
        border: none;
        color: #ffffff;
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: background 0.2s ease, transform 0.1s ease;
        margin-top: 24px;
      }
      .btn-submit:hover {
        background: #4f46e5;
        transform: translateY(-1px);
      }
      .alert {
        background: rgba(244, 63, 94, 0.12);
        border: 1px solid rgba(244, 63, 94, 0.3);
        border-radius: 10px;
        padding: 12px 14px;
        font-size: 0.85rem;
        color: #fb7185;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .footer-note {
        text-align: center;
        font-size: 0.75rem;
        color: #64748b;
        margin-top: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }
    `;
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${setup ? 'Setup Panel Password' : 'Sign In'} | Zedecco Gate</title>
  <style>${css}</style>
</head>
<body>
  <div class="ambient-glow"></div>
  <div class="card">
    <div class="card-header">
      <div class="brand-icon">
        ${ico.shield}
      </div>
      <h1 class="brand-title">${setup ? 'Create Panel Password' : 'Sign In to Panel'}</h1>
      <p class="brand-sub">${setup ? 'First visit: create a secure password (min 8 characters)' : 'Enter your panel password to continue'}</p>
    </div>

    ${msg ? `<div class="alert">${ico.info}<span>${msg}</span></div>` : ''}

    <form method="post" action="/${panelPath}/login">
      ${needKey ? `
        <div class="form-group">
          <label class="form-label" for="setup_key">SETUP KEY</label>
          <div class="input-wrap">
            <span class="field-icon">${ico.key}</span>
            <input type="password" id="setup_key" name="setup_key" required placeholder="Enter SETUP_KEY from environment">
          </div>
        </div>
      ` : ''}

      <div class="form-group">
        <label class="form-label" for="password">${setup ? 'NEW PASSWORD' : 'PASSWORD'}</label>
        <div class="input-wrap">
          <span class="field-icon">${ico.lock}</span>
          <input type="password" id="password" name="password" minlength="${setup ? 8 : 1}" required autofocus placeholder="${setup ? 'At least 8 characters' : 'Enter password'}">
        </div>
      </div>

      ${setup ? `
        <div class="form-group">
          <label class="form-label" for="confirm">CONFIRM PASSWORD</label>
          <div class="input-wrap">
            <span class="field-icon">${ico.lock}</span>
            <input type="password" id="confirm" name="confirm" minlength="8" required placeholder="Repeat password">
          </div>
        </div>
      ` : ''}

      <button type="submit" class="btn-submit">
        <span>${setup ? 'Save Password & Enter' : 'Sign In'}</span>
        ${ico.arrow}
      </button>

      <div class="footer-note">
        ${ico.shield}
        <span>Encrypted session &bull; Salted scrypt verification</span>
      </div>
    </form>
  </div>
</body>
</html>`;
  };

  const bkSendPage = (res, mode, msg, code) => {
    res.status(code || 200);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.send(bkPage(mode, msg));
  };
  app.get('/' + panelPath + '/login', (req, res) => {
    const a = bkLoadAuth();
    if (a.hash && bkHasSession(req)) return res.redirect(302, '/' + panelPath);
    bkSendPage(res, a.hash ? 'login' : 'setup', '');
  });
  app.post('/' + panelPath + '/login', express.urlencoded({ extended: false, limit: '10kb' }), (req, res) => {
    const a = bkLoadAuth();
    const ip = bkIp(req);
    const b = req.body || {};
    const mode = a.hash ? 'login' : 'setup';
    if (bkBlocked(ip)) return bkSendPage(res, mode, 'تلاش زیاد. ۱۵ دقیقه دیگه امتحان کن. / Too many attempts, try again in 15 minutes.', 429);
    if (!a.hash) {
      if (process.env.SETUP_KEY && !bkSafeEq(String(b.setup_key || ""), process.env.SETUP_KEY)) { bkFail(ip); return bkSendPage(res, "setup", "Invalid Setup Key.", 401); }
      const pw = String(b.password || '');
      if (pw.length < 8) return bkSendPage(res, "setup", "Password must be at least 8 characters long.", 400);
      if (pw !== String(b.confirm || "")) return bkSendPage(res, "setup", "Passwords do not match.", 400);
      a.salt = crypto.randomBytes(16).toString('hex');
      a.hash = bkHash(pw, a.salt);
      a.secret = crypto.randomBytes(32).toString('hex');
      bkSaveAuth(a);
      Logger.success('Panel password created.');
      bkSetSession(req, res, a);
      return res.redirect(302, '/' + panelPath);
    }
    if (!bkSafeEq(bkHash(String(b.password || ""), a.salt), a.hash)) { bkFail(ip); return bkSendPage(res, "login", "Incorrect password.", 401); }
    bkFails.delete(ip);
    bkSetSession(req, res, a);
    return res.redirect(302, '/' + panelPath);
  });
  app.get('/' + panelPath + '/logout', (req, res) => {
    res.setHeader('Set-Cookie', 'bk_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
    res.redirect(302, '/' + panelPath + '/login');
  });

  // Auth: logged-in session cookie, or ?token=<subscription token> for VPN client subscriptions
  const authMiddleware = (req, res, next) => {
    if (bkHasSession(req)) return next();
    const a = bkLoadAuth();
    const q = typeof req.query.token === 'string' ? req.query.token : '';
    if (q && a.hash && a.subToken && bkSafeEq(q, a.subToken)) return next();
    if (req.method === 'GET' && (req.path === '/' || req.path === '/' + panelPath || req.path === '/' + panelPath + '/')) {
      return res.redirect(302, '/' + panelPath + '/login');
    }
    res.status(401).send('Unauthorized');
  };

  // Find assets directory on disk and mount express.static
  
  
  const candidateAssetDirs = [
    path.join(process.cwd(), 'assets'),
    path.join(__dirname, '..', '..', 'assets'),
    path.join(__dirname, 'assets')
  ];
  for (const dir of candidateAssetDirs) {
    if (fs.existsSync(dir)) {
      app.use('/assets', express.static(dir));
      app.use('/gate-assets', express.static(dir));
      app.use(`/${panelPath}/assets`, express.static(dir));
      break;
    }
  }

  // Asset routes (with multiple alias paths for maximum client compatibility)
  app.get(['/gate-assets/app.css', '/assets/app.css', `/${panelPath}/assets/app.css`, `/${panelPath}/app.css`, '/app.css'], (req, res) => {
    res.setHeader('Content-Type', 'text/css; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300'); // short: panel updates show up after a redeploy
    res.send(AssetManager.getAppCss());
  });

  app.get(['/gate-assets/app.js', '/assets/app.js', `/${panelPath}/assets/app.js`, `/${panelPath}/app.js`, '/app.js'], (req, res) => {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300'); // short: panel updates show up after a redeploy
    res.send(AssetManager.getAppJs());
  });

  // Brand logo (supports .svg, .png and .jpg)
  app.get([
    '/assets/logo.svg', `/${panelPath}/assets/logo.svg`, `/${panelPath}/logo.svg`, '/logo.svg',
    '/gate-assets/logo.png', '/gate-assets/logo.jpg',
    '/assets/logo.png', '/assets/logo.jpg',
    `/${panelPath}/assets/logo.png`, `/${panelPath}/assets/logo.jpg`,
    `/${panelPath}/logo.png`, `/${panelPath}/logo.jpg`,
    '/logo.png', '/logo.jpg'
  ], (req, res) => {
    const imgBuffer = AssetManager.getLogo();
    if (imgBuffer) {
      const isSvg = req.path.endsWith('.svg') || imgBuffer.toString('utf8', 0, 10).includes('<svg');
      const isJpg = req.path.endsWith('.jpg') || req.path.endsWith('.jpeg');
      res.setHeader('Content-Type', isSvg ? 'image/svg+xml' : (isJpg ? 'image/jpeg' : 'image/png'));
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(imgBuffer);
    } else {
      res.status(404).send('Logo not found');
    }
  });

  // Dark background bg.jpg (supports /gate-assets/bg.jpg, /assets/bg.jpg, /bg.jpg, and legacy .png)
  app.get([
    '/gate-assets/bg.jpg', '/gate-assets/bg.png',
    '/assets/bg.jpg', '/assets/bg.png',
    `/${panelPath}/assets/bg.jpg`, `/${panelPath}/assets/bg.png`,
    `/${panelPath}/bg.jpg`, `/${panelPath}/bg.png`,
    '/bg.jpg', '/bg.png'
  ], (req, res) => {
    const imgBuffer = AssetManager.getBgJpg();
    if (imgBuffer) {
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(imgBuffer);
    } else {
      res.status(404).send('Background not found');
    }
  });

  // Cozy background cozybg.jpg (supports /gate-assets/cozybg.jpg, /assets/cozybg.jpg, /cozybg.jpg, and legacy .png)
  app.get([
    '/gate-assets/cozybg.jpg', '/gate-assets/cozybg.png',
    '/assets/cozybg.jpg', '/assets/cozybg.png',
    `/${panelPath}/assets/cozybg.jpg`, `/${panelPath}/assets/cozybg.png`,
    `/${panelPath}/cozybg.jpg`, `/${panelPath}/cozybg.png`,
    '/cozybg.jpg', '/cozybg.png'
  ], (req, res) => {
    const imgBuffer = AssetManager.getCozyBgJpg();
    if (imgBuffer) {
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(imgBuffer);
    } else {
      res.status(404).send('Cozy background not found');
    }
  });

  // Home hero home.jpg (supports /gate-assets/home.jpg, /assets/home.jpg, /home.jpg, and legacy .png)
  app.get([
    '/gate-assets/home.jpg', '/gate-assets/home.png',
    '/assets/home.jpg', '/assets/home.png',
    `/${panelPath}/assets/home.jpg`, `/${panelPath}/assets/home.png`,
    `/${panelPath}/home.jpg`, `/${panelPath}/home.png`,
    '/home.jpg', '/home.png'
  ], (req, res) => {
    const imgBuffer = AssetManager.getHomeJpg();
    if (imgBuffer) {
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(imgBuffer);
    } else {
      res.status(404).send('Home image not found');
    }
  });

  // Helper to get active host for request
  const getRequestHost = (req) => {
    if (config.forceHost) return config.forceHost;
    // An explicit DOMAIN variable always wins; otherwise the host the visitor used (e.g. an attached custom
    // domain) beats the auto-injected RAILWAY_PUBLIC_DOMAIN, so custom domains work with zero variables.
    if (config.domain && normalizeHost(process.env.DOMAIN || process.env.SB_DOMAIN || '')) return config.domain;
    const reqHost = normalizeHost(String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0]);
    // A Cloudflare Worker relay sets X-Forwarded-Host: <worker host>; the private *.replit.dev dev URL is never used.
    const reqOk = !!(reqHost && !isIpLiteral(reqHost) && reqHost !== 'localhost' && !reqHost.endsWith('.railway.internal') && !reqHost.endsWith('.replit.dev'));
    const savedRelay = (stateManager.state.publicHost && !bkIsPlatformHost(stateManager.state.publicHost)) ? stateManager.state.publicHost : '';
    if (savedRelay && (!reqOk || bkIsPlatformHost(reqHost))) return savedRelay; // relay / custom domain learned earlier beats the platform domain
    if (config.domain && (!reqOk || reqHost === config.domain || bkIsPlatformHost(reqHost))) return config.domain;
    if (reqOk) {
      // All callers sit behind authMiddleware, so only real panel/subscription visits get here.
      if (stateManager.state.publicHost !== reqHost) {
        stateManager.state.publicHost = reqHost;
        stateManager.save();
        Logger.info(`Public domain learned from request Host: ${reqHost} (saved; used for links, no redeploy needed)`);
      }
      return reqHost;
    }
    if (stateManager.state.publicHost) return stateManager.state.publicHost;
    if (resolvedHostGetter) {
      const h = resolvedHostGetter();
      if (h && h !== '127.0.0.1') return h;
    }
    if (req.headers.host) {
      return req.headers.host.split(':')[0];
    }
    return '127.0.0.1';
  };

  // Location cache
  let cachedLocation = null;
  const resolveLocation = async (ip) => {
    if (cachedLocation) return cachedLocation;
    try {
      
      const targetIp = ip && !ip.startsWith('127.') && !ip.startsWith('10.') && !ip.startsWith('192.') ? ip : '';
      const r = await axios.get(`https://freeipapi.com/api/json/${targetIp}`, { timeout: 2500 });
      if (r.data && r.data.countryName) {
        cachedLocation = (r.data.cityName ? `${r.data.cityName}, ` : '') + r.data.countryName;
        return cachedLocation;
      }
    } catch {}
    try {
      
      const r = await axios.get('https://1.1.1.1/cdn-cgi/trace', { timeout: 2000 });
      const m = r.data.match(/loc=([^\r\n]+)/);
      if (m && m[1]) {
        cachedLocation = m[1].trim();
        return cachedLocation;
      }
    } catch {}
    cachedLocation = ip || 'Global';
    return cachedLocation;
  };

  // Health endpoint
  app.get('/health', authMiddleware, async (req, res) => {
    const engines = engineStatusGetter ? engineStatusGetter() : {};
    const host = getRequestHost(req);
    const linkGen = new LinkGenerator(config, stateManager.state, host);
    const allNodes = linkGen.getAllNodes({ compat: 'full', allowLocalHostLinks: true });
    const location = await resolveLocation(host);

    res.json({
      ok: true,
      subToken: bkLoadAuth().subToken || '',
      brand: config.brand,
      product: config.product,
      uptime: process.uptime(),
      publicPort: config.publicPort,
      host,
      domain: (host && !isIpLiteral(host)) ? host : (config.domain || ''),
      forceHost: config.forceHost || '',
      publicBaseUrl: (process.env.PUBLIC_BASE_URL || process.env.SUB_BASE_URL) ? (config.publicBaseUrl || '')
        : ((host && !isIpLiteral(host) && linkGen.edgeTls) ? 'https://' + host : (config.publicBaseUrl || '')),
      subBase: config.subBase || '',
      forceHttps: Boolean(config.forceHttps),
      location: location || 'Global Server',
      engines,
      nodes: allNodes.map(node => ({
        name: node.name,
        type: node.type,
        compat: node.compat,
        uri: node.uri,
        wgConf: node.wgConf || null,
        singboxJson: node.singboxJson || null,
        note: node.note || null
      }))
    });
  });

  // YouTube feed endpoint removed (zero-ad clean panel)
  // Panel HTML endpoints
  const renderPanel = (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(AssetManager.getIndexHtml());
  };

  app.get('/', authMiddleware, renderPanel);
  // ===== BK traffic meter API (panel session only; POSTs need the X-BK-Req header -> no cross-site forms) =====
  const bkSessionOnly = (req, res, next) => (bkHasSession(req) ? next() : res.status(401).json({ ok: false, error: 'login required' }));
  const bkSameOrigin = (req, res, next) => (req.get('x-bk-req') === '1' ? next() : res.status(403).json({ ok: false, error: 'forbidden' }));
  app.get(`/${panelPath}/api/traffic`, bkSessionOnly, (req, res) => { res.setHeader('Cache-Control', 'no-store'); res.json(BkTraffic.snapshot()); });
  app.post(`/${panelPath}/api/traffic/reset`, bkSessionOnly, bkSameOrigin, (req, res) => {
    BkTraffic.reset(); Logger.warn('Traffic counter reset from the panel.');
    res.setHeader('Cache-Control', 'no-store'); res.json(BkTraffic.snapshot());
  });
  app.post(`/${panelPath}/api/traffic/baseline`, bkSessionOnly, bkSameOrigin, express.json({ limit: '2kb' }), (req, res) => {
    const gb = Number(req.body && req.body.gb);
    if (!isFinite(gb) || gb < 0 || gb > 1000000) return res.status(400).json({ ok: false, error: 'invalid value' });
    BkTraffic.setMonthUsedGB(gb); Logger.info(`Traffic: this month's used amount set to ${gb} GiB from the panel.`);
    res.setHeader('Cache-Control', 'no-store'); res.json(BkTraffic.snapshot());
  });

  app.get(`/${panelPath}`, authMiddleware, renderPanel);

  // Subscriptions: Base64 & Raw (HTTP & HTTPS compatible for v2rayN, v2rayNG, Hiddify)
  app.get([`/${panelPath}/base64`, `/${panelPath}/raw`, `/${panelPath}/sub`, '/sub', '/base64'], authMiddleware, (req, res) => {
    const isBase64 = req.path.endsWith('/base64') || req.path.endsWith('/sub') || req.path === '/sub';
    const compatMode = req.query.compat || 'v2ray'; // Default to strict v2ray compatibility
    const host = getRequestHost(req);

    const linkGen = new LinkGenerator(config, stateManager.state, host);
    const allowLocal = Boolean(config.allowLocalHostLinks || host === '127.0.0.1' || host === 'localhost');
    const nodes = linkGen.getAllNodes({
      compat: compatMode,
      allowLocalHostLinks: allowLocal
    });

    const links = nodes.map(n => n.uri);
    const text = links.join('\n');

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'inline; filename="nodes.txt"');
    res.setHeader('Profile-Update-Interval', '24');
    // Set 1 TB total traffic and future expiry (v2rayNG rejects total=0 as expired quota)
    res.setHeader('Subscription-Userinfo', 'upload=1073741824; download=2147483648; total=1099511627776; expire=1893456000');

    if (isBase64) {
      res.send(Buffer.from(text).toString('base64'));
    } else {
      res.send(text);
    }
  });

  // Subscriptions: Clash Meta (Mihomo)
  app.get([`/${panelPath}/clash`, `/${panelPath}/clash.yaml`, '/clash'], authMiddleware, (req, res) => {
    const host = getRequestHost(req);
    const linkGen = new LinkGenerator(config, stateManager.state, host);
    const nodes = linkGen.getAllNodes({ compat: 'full', allowLocalHostLinks: true });
    const yaml = linkGen.buildClashMetaYaml(nodes);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/yaml; charset=utf-8');
    res.setHeader('Content-Disposition', 'inline; filename="clash.yaml"');
    res.setHeader('Profile-Update-Interval', '24');
    res.send(yaml);
  });

  // Subscriptions: Sing-box client JSON
  app.get([`/${panelPath}/sb/raw`, `/${panelPath}/sb/base64`, `/${panelPath}/sb`, '/sb'], authMiddleware, (req, res) => {
    const isBase64 = req.path.endsWith('/base64');
    const host = getRequestHost(req);
    const linkGen = new LinkGenerator(config, stateManager.state, host);
    const nodes = linkGen.getAllNodes({ compat: 'full', allowLocalHostLinks: true });
    const jsonStr = linkGen.buildSingBoxClientJson(nodes);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', isBase64 ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8');
    if (isBase64) {
      res.send(Buffer.from(jsonStr).toString('base64'));
    } else {
      res.send(jsonStr);
    }
  });

  // Subscriptions: Xray client JSON
  app.get([`/${panelPath}/xray/raw`, `/${panelPath}/xray/base64`], authMiddleware, (req, res) => {
    const isBase64 = req.path.endsWith('/base64');
    const jsonStr = stateManager.state.xrayJson || '{}';

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', isBase64 ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8');
    if (isBase64) {
      res.send(Buffer.from(jsonStr).toString('base64'));
    } else {
      res.send(jsonStr);
    }
  });

  // WireGuard Configuration (.conf) - Graceful failure handling
  app.get([`/${panelPath}/wg.conf`, `/${panelPath}/wireguard.conf`, '/wg.conf'], authMiddleware, (req, res) => {
    try {
      const host = getRequestHost(req);
      const linkGen = new LinkGenerator(config, stateManager.state, host);
      let wgNode = null;
      try {
        wgNode = linkGen.generateWireGuard();
      } catch (wgErr) {
        console.warn(`[WireGuard] Warning: Failed to generate WireGuard node: ${wgErr.message}`);
      }

      let conf = wgNode && wgNode.wgConf;
      if (!conf) {
        const keys = linkGen._getOrGenerateWgKeys();
        conf = [
          '[Interface]',
          `PrivateKey = ${keys.clientPriv}`,
          'Address = 10.66.66.2/32',
          'DNS = 1.1.1.1, 8.8.8.8',
          'MTU = 1420',
          '',
          '[Peer]',
          `PublicKey = ${keys.serverPub}`,
          `Endpoint = ${host}:51820`,
          'AllowedIPs = 0.0.0.0/0, ::/0',
          'PersistentKeepalive = 25'
        ].join('\n') + '\n';
      }

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="wg0.conf"');
      res.send(conf);
    } catch (err) {
      console.warn(`[WireGuard] WireGuard endpoint error: ${err.message}`);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.status(200).send('# WireGuard configuration failed gracefully.\n');
    }
  });

  const server = http.createServer(app);
  server.keepAliveTimeout = 120000;
  server.headersTimeout = 125000;
  server.requestTimeout = 0; // XHTTP stream-up / stream-one requests are long-lived
  server.timeout = 0;
  return { app, server };
}

// --- Module: lib/mux/tcp-router.js ---
// ===== BK_TRAFFIC_APPLIED: per-config traffic meter (bytes counted in the Node proxy layer) =====
const BkTraffic = (() => {
  const KEYS = ['VLESS-WS', 'VMess-WS', 'Trojan-WS', 'VLESS-XHTTP', 'VLESS-HTTPUpgrade', 'VMess-HTTPUpgrade', 'Trojan-HTTPUpgrade', 'VLESS-gRPC', 'Shadowsocks-WS', 'Other'];
  const GIB = 1024 * 1024 * 1024;
  const utcDay = (d = new Date()) => d.toISOString().slice(0, 10);
  const utcMonth = (d = new Date()) => d.toISOString().slice(0, 7);
  let file = null; let st = null; let dirty = false; let lastSave = 0; let writable = false;
  const live = { up: 0, down: 0 }; let samples = [];
  const active = {};
  const warned = {};
  const fresh = () => ({ v: 1, since: new Date().toISOString(), allTime: {}, day: { key: utcDay(), per: {} }, month: { key: utcMonth(), per: {}, baseBytes: 0 } });
  const norm = (label) => (KEYS.includes(label) ? label : 'Other');
  const bump = (bucket, k, up, down) => { const e = bucket[k] || (bucket[k] = { up: 0, down: 0 }); e.up += up; e.down += down; };
  const sum = (per) => { let up = 0; let down = 0; for (const k of Object.keys(per || {})) { up += per[k].up || 0; down += per[k].down || 0; } return { up, down, total: up + down }; };
  const limitBytes = () => { const g = parseFloat(process.env.TRAFFIC_LIMIT_GB || ''); return isFinite(g) && g > 0 ? g * GIB : 0; };
  function roll() {
    if (!st) return;
    const d = utcDay(); const m = utcMonth();
    if (st.day.key !== d) { st.day = { key: d, per: {} }; dirty = true; }
    if (st.month.key !== m) { st.month = { key: m, per: {}, baseBytes: 0 }; dirty = true; for (const k of Object.keys(warned)) delete warned[k]; }
  }
  function save() {
    if (!file || !st) return;
    try {
      const tmp = file + '.tmp';
      fs.writeFileSync(tmp, JSON.stringify(st), 'utf8');
      fs.renameSync(tmp, file);
      dirty = false; lastSave = Date.now(); writable = true;
    } catch (err) { writable = false; if (!warned.save) { warned.save = 1; Logger.warn('Could not save traffic.json: ' + err.message); } }
  }
  function checkLimit() {
    const lim = limitBytes(); if (!lim) return;
    const used = sum(st.month.per).total + (st.month.baseBytes || 0);
    const pct = used / lim * 100;
    if (pct >= 100 && !warned.p100) { warned.p100 = 1; warned.p80 = 1; Logger.warn(`Traffic: 100% of TRAFFIC_LIMIT_GB used this month (estimate). Check Replit -> Account -> Usage.`); }
    else if (pct >= 80 && !warned.p80) { warned.p80 = 1; Logger.warn(`Traffic: 80% of TRAFFIC_LIMIT_GB used this month (estimate).`); }
  }
  function tick() {
    const now = Date.now();
    samples.push({ t: now, up: live.up, down: live.down });
    if (samples.length > 6) samples.shift();
    roll();
    if (dirty && now - lastSave > 30000) { save(); checkLimit(); }
  }
  return {
    KEYS,
    init(dataDir) {
      file = path.join(dataDir, 'traffic.json');
      try { st = JSON.parse(fs.readFileSync(file, 'utf8')); if (!st || st.v !== 1) st = fresh(); } catch (_) { st = fresh(); }
      st.allTime = st.allTime || {}; st.day = st.day || { key: utcDay(), per: {} }; st.month = st.month || { key: utcMonth(), per: {}, baseBytes: 0 };
      roll(); save();
      const t = setInterval(tick, 1000); if (t.unref) t.unref();
      process.once('exit', () => { try { save(); } catch (_) {} });
      const lim = limitBytes();
      Logger.info(`Traffic meter: ${file}${lim ? ` (limit ${(lim / GIB).toFixed(2)} GiB/month)` : ''}`);
    },
    add(label, up, down) {
      if (!st || (!up && !down)) return;
      const k = norm(label);
      bump(st.allTime, k, up, down); bump(st.day.per, k, up, down); bump(st.month.per, k, up, down);
      live.up += up; live.down += down; dirty = true;
    },
    /** High-performance batched meter to minimize CPU ticks */
    meter(label, client, backend) {
      const k = norm(label);
      active[k] = (active[k] || 0) + 1;
      let done = false;
      let pendingUp = 0;
      let pendingDown = 0;
      const flush = () => {
        if (pendingUp || pendingDown) {
          this.add(k, pendingUp, pendingDown);
          pendingUp = 0;
          pendingDown = 0;
        }
      };
      const end = () => {
        if (!done) {
          done = true;
          active[k] = Math.max(0, (active[k] || 1) - 1);
          flush();
        }
      };
      client.on('data', (b) => {
        pendingUp += b.length;
        if (pendingUp >= 65536) flush();
      });
      backend.on('data', (b) => {
        pendingDown += b.length;
        if (pendingDown >= 65536) flush();
      });
      client.once('close', end);
      backend.once('close', end);
    },
    open(label) { const k = norm(label); active[k] = (active[k] || 0) + 1; let done = false; return () => { if (!done) { done = true; active[k] = Math.max(0, (active[k] || 1) - 1); } }; },
    save,
    reset() { st = fresh(); for (const k of Object.keys(warned)) delete warned[k]; save(); },
    setMonthUsedGB(gb) { roll(); st.month.baseBytes = Math.round(gb * GIB) - sum(st.month.per).total; dirty = true; save(); checkLimit(); },
    snapshot() {
      if (!st) return { ok: false, error: 'not started' };
      roll();
      let upBps = 0; let downBps = 0;
      if (samples.length >= 2) { const a = samples[0]; const b = samples[samples.length - 1]; const dt = (b.t - a.t) / 1000; if (dt > 0) { upBps = (b.up - a.up) / dt; downBps = (b.down - a.down) / dt; } }
      const month = sum(st.month.per); const base = st.month.baseBytes || 0;
      const lim = limitBytes(); const used = month.total + base;
      const n = new Date(); const next = new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth() + 1, 1));
      return {
        ok: true, keys: KEYS, now: n.toISOString(), since: st.since, persisted: writable, file: path.basename(file || ''),
        day: { key: st.day.key, per: st.day.per, ...sum(st.day.per) },
        month: { key: st.month.key, per: st.month.per, ...month, baseBytes: base, used, resetsAt: next.toISOString() },
        allTime: { per: st.allTime, ...sum(st.allTime) },
        live: { upBps, downBps }, active: { ...active },
        limit: lim ? { bytes: lim, used, remaining: Math.max(0, lim - used), pct: used / lim * 100, level: used >= lim ? 'over' : (used >= lim * 0.8 ? 'warn' : 'ok') } : null
      };
    }
  };
})();

class TcpRouter {
  constructor(config, targetPorts, expressServer, expressApp) {
    this.config = config;
    this.ports = targetPorts;
    this.httpServer = expressServer;
    this.expressApp = expressApp || (expressServer && expressServer.listeners('request')[0]);
    this.server = null;
    this.httpsServer = null;
    this.internalHttpsPort = null;
  }

  pipeToBackend(clientSocket, firstChunk, targetPort, label) {
    clientSocket.setTimeout(0);
    clientSocket.setKeepAlive(true, 15000);
    clientSocket.setNoDelay(true);
    if (clientSocket._readableState) clientSocket._readableState.highWaterMark = 64 * 1024;

    const backend = net.connect(targetPort, '127.0.0.1', () => {
      backend.setTimeout(0);
      backend.setKeepAlive(true, 15000);
      backend.setNoDelay(true);
      if (backend._readableState) backend._readableState.highWaterMark = 64 * 1024;

      backend.write(firstChunk);
      if (label !== 'Internal-HTTPS') {
        BkTraffic.add(label, firstChunk ? firstChunk.length : 0, 0);
        BkTraffic.meter(label, clientSocket, backend);
      }
      clientSocket.pipe(backend);
      backend.pipe(clientSocket);
      clientSocket.resume();
    });

    backend.on('error', (err) => {
      const now = Date.now();
      if (!this._lastWarns) this._lastWarns = {};
      if (!this._lastWarns[label] || now - this._lastWarns[label] > 15000) {
        Logger.warn(`TCP Router: ${label} backend on :${targetPort} unreachable (${err.message})`);
        this._lastWarns[label] = now;
      }
      try { clientSocket.destroy(); } catch {}
    });

    clientSocket.on('error', () => {
      try { backend.destroy(); } catch {}
    });
  }

  attachUpgradeHandlers(server) {
    server.on('upgrade', (req, socket, head) => {
      socket.setTimeout(0);
      socket.setKeepAlive(true, 10000);
      socket.setNoDelay(true);

      let url = req.url || '';
      try { url = decodeURIComponent(url.split('?')[0]); } catch (_) { url = url.split('?')[0]; }
      // BK_PROTOCOLS_APPLIED: exact path routing (longest path first, so ".../vmess-hu" never matches ".../vmess").
      const pp = this.config.panelPath;
      const routes = [
        [BK_PATHS.vlessWs, `/${pp}-ws`, this.ports.vlessWs, 'VLESS-WS'],
        [BK_PATHS.vmessWs, `/${pp}-vmess`, this.ports.vmessWs, 'VMess-WS'],
        [BK_PATHS.trojanWs, `/${pp}-trojan`, this.ports.trojanWs, 'Trojan-WS'],
        [BK_PATHS.vlessHu, `/${pp}-hu`, this.ports.vlessHu, 'VLESS-HTTPUpgrade'],
        [BK_PATHS.vmessHu, `/${pp}-vmess-hu`, this.ports.vmessHu, 'VMess-HTTPUpgrade'],
        [BK_PATHS.trojanHu, `/${pp}-trojan-hu`, this.ports.trojanHu, 'Trojan-HTTPUpgrade'],
        [BK_PATHS.xhttp, `/${pp}-xh`, this.config.xhttpPort, 'VLESS-XHTTP'],
        [BK_PATHS.ssWs, `/${pp}-ss`, this.config.ssWsPort, 'Shadowsocks-WS'],
      ];
      const hit = (p) => url === p || url.startsWith(p + '/');

      let destPort = null;
      let label = 'Unknown Upgrade';
      for (const [branded, legacy, port, lbl] of routes) {
        if (hit(branded) || hit(legacy)) { if (port) { destPort = port; label = lbl; } break; }
      }

      this._upgradeCount = (this._upgradeCount || 0) + 1;
      if (this._upgradeCount <= 20 || !destPort) {
        Logger.info(`WS upgrade #${this._upgradeCount} ${label} path=${url.slice(0, 80)} host=${req.headers.host || '-'}${destPort ? ' -> :' + destPort : ' -> 404 (no route)'}`);
      }

      if (!destPort) {
        socket.write('HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\n');
        socket.destroy();
        return;
      }

      const backend = net.connect(destPort, '127.0.0.1', () => {
        backend.setTimeout(0);
        backend.setKeepAlive(true, 10000);
        backend.setNoDelay(true);

        let headersStr = `${req.method} ${req.url} HTTP/${req.httpVersion}\r\n`;
        for (let i = 0; i < req.rawHeaders.length; i += 2) {
          headersStr += `${req.rawHeaders[i]}: ${req.rawHeaders[i + 1]}\r\n`;
        }
        headersStr += '\r\n';

        backend.write(headersStr);
        if (head && head.length > 0) {
          backend.write(head);
        }

        BkTraffic.add(label, head && head.length ? head.length : 0, 0);
        BkTraffic.meter(label, socket, backend);
        socket.pipe(backend);
        backend.pipe(socket);
      });

      let bkConnected = false;
      backend.once('connect', () => { bkConnected = true; });
      backend.on('error', (err) => {
        if (!bkConnected) {
          const now = Date.now();
          if (!this._lastUpErr || now - this._lastUpErr > 15000) {
            this._lastUpErr = now;
            Logger.error(`${label} backend :${destPort} unreachable (${err.message}) - is sing-box running? See sing-box.log`);
          }
          try { socket.end('HTTP/1.1 502 Bad Gateway\r\nConnection: close\r\nContent-Length: 0\r\n\r\n'); } catch {}
        }
        try { socket.destroy(); } catch {}
      });

      socket.on('error', () => {
        try { backend.destroy(); } catch {}
      });
      socket.on('close', () => { try { backend.destroy(); } catch {} });
      backend.on('close', () => { try { socket.destroy(); } catch {} });
    });
  }

  async setupInternalHttps() {
    // BK_PROTOCOLS_APPLIED: one internal TLS terminator for everything TLS on the shared port:
    //   ALPN http/1.1 -> Express panel / subscription + WS / HTTPUpgrade / XHTTP upgrades (as before)
    //   ALPN h2       -> per-stream router: gRPC service path -> sing-box VLESS-gRPC (h2c), anything else -> panel
    // (Xray clients with a uTLS fingerprint offer "h2,http/1.1" for gRPC exactly like a browser, so the choice
    //  has to be made per HTTP/2 stream, not from the ClientHello.)
    try {
      const certs = ensureTlsCertificates(this.config.paths.certPath, this.config.paths.keyPath, this.config.domain || 'localhost');
      if (!certs || !certs.cert || !certs.key) return;

      const handler = this.expressApp || (this.httpServer && this.httpServer.listeners('request')[0]);
      this.h1Server = http.createServer(handler);
      this.h1Server.keepAliveTimeout = 120000;
      this.h1Server.headersTimeout = 125000;
      this.h1Server.requestTimeout = 0;
      this.h1Server.timeout = 0;
      this.attachUpgradeHandlers(this.h1Server);

      const grpcBackend = this.config.enable.vlessGrpcTls && this.ports.vlessGrpc;
      if (grpcBackend) this._setupH2Router();

      this.httpsServer = tls.createServer({
        cert: certs.cert,
        key: certs.key,
        ALPNProtocols: grpcBackend ? ['h2', 'http/1.1'] : ['http/1.1']
      }, (sock) => {
        sock.on('error', () => {});
        if (sock.alpnProtocol === 'h2' && this.h2Server) this.h2Server.emit('connection', sock);
        else this.h1Server.emit('connection', sock);
      });
      this.httpsServer.on('tlsClientError', () => {});

      await new Promise((resolve) => {
        this.httpsServer.listen(0, '127.0.0.1', () => {
          this.internalHttpsPort = this.httpsServer.address().port;
          Logger.item('Internal HTTPS Port', this.internalHttpsPort);
          resolve();
        });
        this.httpsServer.on('error', (err) => {
          Logger.warn(`Internal HTTPS server failed to start: ${err.message}`);
          resolve();
        });
      });
    } catch (err) {
      Logger.warn(`Internal HTTPS setup error: ${err.message}`);
    }
  }

  _setupH2Router() {
    const HOP = new Set(['connection', 'keep-alive', 'proxy-connection', 'transfer-encoding', 'upgrade', 'host', 'http2-settings', 'te']);
    const grpcPrefix = '/' + BK_PATHS.grpcService + '/';
    const big = { initialWindowSize: 4 * 1024 * 1024, maxFrameSize: 64 * 1024 };
    this.h2Server = http2.createServer({ settings: big });
    this.h2Server.on('session', (session) => {
      session.on('error', () => {});
      try { session.setLocalWindowSize(16 * 1024 * 1024); } catch (_) {}
      session.on('close', () => { if (session._bkBackend) { try { session._bkBackend.close(); } catch (_) {} } });
    });
    const backendFor = (session) => {
      let be = session._bkBackend;
      if (be && !be.closed && !be.destroyed) return be;
      be = http2.connect(`http://127.0.0.1:${this.ports.vlessGrpc}`, { settings: big });
      be.on('error', () => {});
      be.on('connect', () => { try { be.setLocalWindowSize(16 * 1024 * 1024); } catch (_) {} });
      session._bkBackend = be;
      return be;
    };
    this.h2Server.on('stream', (stream, headers) => {
      stream.on('error', () => {});
      const p = String(headers[':path'] || '/');
      const fwd = {};
      for (const k of Object.keys(headers)) if (!k.startsWith(':') && !HOP.has(k)) fwd[k] = headers[k];

      if (p.startsWith(grpcPrefix)) {
        let up;
        try {
          up = backendFor(stream.session).request({ ...fwd, ':method': headers[':method'] || 'POST', ':path': p, ':scheme': 'http', ':authority': headers[':authority'] || '127.0.0.1', te: 'trailers' }, { endStream: false });
        } catch (_) { try { stream.close(http2.constants.NGHTTP2_INTERNAL_ERROR); } catch (__) {} return; }
        let trailers = null;
        up.on('error', () => { try { stream.close(http2.constants.NGHTTP2_INTERNAL_ERROR); } catch (_) {} });
        up.on('response', (rh) => {
          const out = { ':status': rh[':status'] || 200 };
          for (const k of Object.keys(rh)) if (!k.startsWith(':') && !HOP.has(k)) out[k] = rh[k];
          try { stream.respond(out, { waitForTrailers: true }); } catch (_) { return; }
          BkTraffic.meter('VLESS-gRPC', stream, up);
          up.pipe(stream);
        });
        up.on('trailers', (t) => { trailers = t; });
        stream.on('wantTrailers', () => {
          const t = {};
          if (trailers) for (const k of Object.keys(trailers)) if (!k.startsWith(':')) t[k] = trailers[k];
          if (!Object.keys(t).length) t['grpc-status'] = '0';
          try { stream.sendTrailers(t); } catch (_) {}
        });
        stream.pipe(up);
        stream.on('close', () => { if (!up.closed) { try { up.close(); } catch (_) {} } });
        up.on('close', () => { if (!stream.closed && !stream.headersSent) { try { stream.close(); } catch (_) {} } });
        return;
      }

      // A browser (or other HTTP/2 client) that is not gRPC: relay the request to the panel over HTTP/1.1.
      fwd.host = headers[':authority'] || 'localhost';
      fwd['x-forwarded-proto'] = 'https';
      const rq = http.request({ host: '127.0.0.1', port: this.config.publicPort, method: headers[':method'] || 'GET', path: p, headers: fwd, agent: false });
      rq.on('response', (r) => {
        const out = { ':status': r.statusCode };
        for (const [k, v] of Object.entries(r.headers)) if (!HOP.has(k)) out[k] = v;
        try { stream.respond(out); } catch (_) { r.destroy(); return; }
        r.pipe(stream);
      });
      rq.on('error', () => { try { if (!stream.headersSent) stream.respond({ ':status': 502 }); stream.end(); } catch (_) {} });
      stream.pipe(rq);
    });
  }

  async start() {
    this.httpServer.keepAliveTimeout = 120000;
    this.httpServer.headersTimeout = 125000;
    this.attachUpgradeHandlers(this.httpServer);

    await this.setupInternalHttps();

    this.server = net.createServer((socket) => {
      // 30s initial idle timeout to prevent slowloris socket leaks; reset to 0 once routed
      socket.setTimeout(30000);
      socket.setKeepAlive(true, 10000);
      socket.setNoDelay(true);

      let pending = null;
      let waitTimer = null;
      let routed = false;

      const cleanupWaitTimer = () => {
        if (waitTimer) {
          clearTimeout(waitTimer);
          waitTimer = null;
        }
      };

      socket.once('timeout', () => {
        if (!routed) {
          try { socket.destroy(); } catch (_) {}
        }
      });
      socket.once('close', cleanupWaitTimer);
      socket.once('error', cleanupWaitTimer);

      const onFirstData = (data) => {
        pending = pending ? Buffer.concat([pending, data]) : data;
        const needMore = (pending[0] === 0x16 && pending[1] === 0x03 && pending.length >= 5 && pending.length < Math.min(pending.readUInt16BE(3) + 5, 16389))
          || (pending.length < 16 && 'PRI * HTTP/2.0\r\n'.startsWith(pending.toString('latin1')));
        if (needMore) {
          if (!waitTimer) {
            waitTimer = setTimeout(() => {
              if (socket.destroyed || socket.closed) return;
              socket.removeListener('data', onFirstData);
              socket.pause();
              route(pending);
            }, 1500);
          }
          return;
        }
        cleanupWaitTimer();
        socket.removeListener('data', onFirstData);
        socket.pause();
        route(pending);
      };
      socket.on('data', onFirstData);

      const route = (chunk) => {
        if (routed || socket.destroyed || socket.closed) return;
        routed = true;
        socket.setTimeout(0); // clear handshake timeout

        // 1. SOCKS5 check (byte 0x05)
        if (this.config.enable.socks && this.ports.socks && chunk.length >= 2 && chunk[0] === 0x05) {
          this.pipeToBackend(socket, chunk, this.ports.socks, 'SOCKS5');
          return;
        }

        // 2. TLS ClientHello check (0x16 0x03)
        if (chunk.length >= 3 && chunk[0] === 0x16 && chunk[1] === 0x03) {
          const { sni, alpn } = parseClientHello(chunk);
          let target = null;

          // Priority 1: Reality target SNI
          if (this.config.enable.reality && this.ports.reality && sni === this.config.reality.target) {
            target = { port: this.ports.reality, label: 'REALITY' };
          }
          // Priority 2: ShadowTLS SNI (if explicitly enabled)
          else if (this.config.enable.shadowTlsVless && this.ports.shadowTls && sni === this.config.shadowTls.sni) {
            target = { port: this.ports.shadowTls, label: 'ShadowTLS-VLESS' };
          }
          // Priority 3: gRPC over TLS. gRPC clients offer ONLY "h2"; browsers / WS / HTTPUpgrade clients offer
          // "http/1.1" (often together with h2), so they still reach the internal HTTPS server below.
          // (BK_PROTOCOLS_APPLIED: previously any ClientHello containing h2 - e.g. every browser - went to gRPC.)
          else if (alpn && alpn.includes('h2') && !alpn.includes('http/1.1') && this.config.enable.vlessGrpcTls && this.ports.vlessGrpcTls) {
            target = { port: this.ports.vlessGrpcTls, label: 'VLESS-gRPC' };
          }
          else if (alpn && alpn.includes('h2') && !alpn.includes('http/1.1') && this.config.enable.trojanGrpcTls && this.ports.trojanGrpcTls) {
            target = { port: this.ports.trojanGrpcTls, label: 'Trojan-gRPC-TLS' };
          }
          // Priority 4: Internal HTTPS server (handles VLESS-WS-TLS, VMess-WS-TLS, HTTPS Sub, HTTPS Panel)
          else if (this.internalHttpsPort) {
            target = { port: this.internalHttpsPort, label: 'Internal-HTTPS' };
          }
          // Priority 5: Fallback to vlessWsTls if singbox port is open
          else if (this.config.enable.vlessWsTls && this.ports.vlessWsTls) {
            target = { port: this.ports.vlessWsTls, label: 'VLESS-WS-TLS' };
          }
          // Priority 6: Reality decoy fallback
          else if (this.config.enable.reality && this.ports.reality) {
            target = { port: this.ports.reality, label: 'REALITY-Decoy' };
          }

          if (target) {
            this.pipeToBackend(socket, chunk, target.port, target.label);
            return;
          }
        }

        // 3. HTTP Proxy check (CONNECT or absolute URL)
        if (this.config.enable.httpProxy && this.ports.httpProxy) {
          const headerSnippet = chunk.toString('latin1', 0, Math.min(chunk.length, 256));
          if (/^CONNECT /i.test(headerSnippet) || /^(GET|POST|HEAD) https?:\/\//i.test(headerSnippet)) {
            this.pipeToBackend(socket, chunk, this.ports.httpProxy, 'HTTP-Proxy');
            return;
          }
        }

        // 4. gRPC check (HTTP/2 cleartext connection preface)
        if (this.config.enable.vlessGrpc && this.ports.vlessGrpc && chunk.length >= 16) {
          if (chunk.toString('latin1', 0, 16) === 'PRI * HTTP/2.0\r\n') {
            this.pipeToBackend(socket, chunk, this.ports.vlessGrpc, 'VLESS-gRPC');
            return;
          }
        }

        // 5. Shadowsocks check: raw encrypted stream doesn't look like standard HTTP verbs
        const firstWords = chunk.toString('latin1', 0, Math.min(chunk.length, 8));
        const isHttpVerb = /^(GET|POST|PUT|HEAD|OPTIONS|DELETE|PATCH|TRACE) /i.test(firstWords);

        if (!isHttpVerb && this.config.enable.shadowsocks && this.ports.shadowsocks) {
          this.pipeToBackend(socket, chunk, this.ports.shadowsocks, 'Shadowsocks');
          return;
        }

        // 6. Fallback: Hand off to internal HTTP server (Express panel & WS upgrades)
        socket.unshift(chunk);
        this.httpServer.emit('connection', socket);
        socket.resume();
      };

      socket.on('error', () => {});
    });

    return new Promise((resolve, reject) => {
      this.server.listen(this.config.publicPort, '0.0.0.0', () => {
        Logger.success(`Public TCP multiplexer listening on 0.0.0.0:${this.config.publicPort}`);
        resolve(this.server);
      });
      this.server.on('error', reject);
    });
  }

  stop() {
    if (this.server) {
      try { this.server.close(); } catch {}
    }
    if (this.httpsServer) {
      try { this.httpsServer.close(); } catch {}
    }
  }
}

// --- Module: lib/boot.js ---
async function resolvePublicHost(config, savedHost) {
  if (config.forceHost) return config.forceHost;
  const explicitDomain = normalizeHost(process.env.DOMAIN || process.env.SB_DOMAIN || '');
  if (savedHost && !explicitDomain && !bkIsPlatformHost(savedHost)) { Logger.info(`Using public domain saved from an earlier panel visit: ${savedHost}`); return savedHost; }
  if (config.domain) return config.domain;
  if (savedHost && !savedHost.endsWith('.replit.dev')) { Logger.info(`Using public domain saved from an earlier panel visit: ${savedHost}`); return savedHost; }
  if (bkOnReplit()) {
    if (!process.env.REPLIT_DEPLOYMENT) {
      Logger.warn('Running in the Replit editor: the *.replit.dev URL is private and cannot be used for configs.');
      Logger.warn('Publish the app (Reserved VM or Autoscale) and open https://<name>.replit.app/gate (or your Worker address).');
    } else {
      Logger.warn('No public domain found in REPLIT_DOMAINS: links use the domain you open the panel with (saved automatically).');
    }
  } else if (bkOnRailway()) {
    Logger.warn('No public domain yet: Railway -> Settings -> Networking -> Generate Domain (port 8080 / the port Railway suggests).');
    Logger.warn('No redeploy or variable needed: links use the domain you open the panel with (it is saved automatically).');
  }
  if (process.env.CFIP) return process.env.CFIP;
  if (process.env.DOMAIN || process.env.SB_DOMAIN) return process.env.DOMAIN || process.env.SB_DOMAIN;

  try {
    const res = await axios.get('https://api.ipify.org?format=text', { timeout: 3500 });
    if (res.data && typeof res.data === 'string' && res.data.trim()) {
      return res.data.trim();
    }
  } catch {}

  try {
    const res = await axios.get('https://ifconfig.me/ip', { timeout: 3500 });
    if (res.data && typeof res.data === 'string' && res.data.trim()) {
      return res.data.trim();
    }
  } catch {}

  try {
    const res = await axios.get('https://1.1.1.1/cdn-cgi/trace', { timeout: 3500 });
    if (res.data && typeof res.data === 'string') {
      const match = res.data.match(/ip=([^\r\n]+)/);
      if (match && match[1]) return match[1].trim();
    }
  } catch {}

  return '127.0.0.1';
}

async function startGate(userConfig = {}) {
  // 1. Banner & notices
  Logger.banner();
  Logger.renewNotice();

  // 2. Build configuration
  const config = buildConfig(userConfig);
  Logger.section('Configuration');
  Logger.item('Public Port', config.publicPort);
  Logger.item('Panel Path', `/${config.panelPath}`);
  Logger.item('Data Directory', config.paths.dataDir);
  {
    const dInfo = resolveDataDir.info || { source: 'unknown' };
    const onRw = !!(process.env.RAILWAY_PROJECT_ID || process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_SERVICE_ID || process.env.RAILWAY_PUBLIC_DOMAIN);
    const vol = process.env.RAILWAY_VOLUME_MOUNT_PATH;
    Logger.info(`Data directory: ${config.paths.dataDir} (${dInfo.source})`);
    if (bkOnReplit() && !process.env.BK_DATA_DIR) {
      Logger.warn('Replit: the published app filesystem resets on every Publish (and on Autoscale restarts).');
      Logger.warn('To keep the same configs/password, add Secrets UUID, PANEL_PASSWORD and SUB_TOKEN (all optional).');
    } else if (onRw && !vol) {
      Logger.warn('No Railway Volume attached: panel password, UUID and configs are reset on every redeploy.');
      Logger.warn('Fix (no variables needed): right-click the service -> Attach Volume (any mount path, e.g. /data).');
    } else if (onRw && vol && path.resolve(config.paths.dataDir) !== path.resolve(vol) && !path.resolve(config.paths.dataDir).startsWith(path.resolve(vol) + path.sep)) {
      Logger.warn(`Data directory is outside the attached volume (${vol}); remove BK_DATA_DIR or point it inside the volume to keep data.`);
    }
  }

  BkTraffic.init(config.paths.dataDir);

  // 3. Persistent state
  const stateMgr = new StateManager(config.paths, config);
  const state = stateMgr.loadOrCreate();
  Logger.item('UUID', bkMask(state.uuid) + (process.env.UUID || process.env.SB_UUID ? ' (from env)' : ' (saved/generated; set UUID to pin it)'));

  // 4. Resolve host / IP
  const resolvedHost = await resolvePublicHost(config, state.publicHost || '');
  stateMgr.setPublicIp(resolvedHost);
  Logger.item('Resolved Host', resolvedHost);

  // 5. Allocate dynamic internal ports
  const allocatedPorts = {};
  if (config.enable.vlessWs) allocatedPorts.vlessWs = await allocatePorts();
  if (config.enable.vlessWsTls) allocatedPorts.vlessWsTls = await allocatePorts();
  if (config.enable.vmessWs || config.enable.vmessWsTls) allocatedPorts.vmessWs = await allocatePorts();
  if (config.enable.trojanGrpcTls) allocatedPorts.trojanGrpcTls = await allocatePorts();
  if (config.enable.vlessHttpUpgrade) allocatedPorts.vlessHu = await allocatePorts();
  if (config.enable.vlessGrpc || config.enable.vlessGrpcTls) allocatedPorts.vlessGrpc = await allocatePorts();
  if (config.enable.vlessGrpcTls) allocatedPorts.vlessGrpcTls = await allocatePorts();
  if (config.enable.vmessHttpUpgrade) allocatedPorts.vmessHu = await allocatePorts();
  if (config.enable.trojanHttpUpgrade) allocatedPorts.trojanHu = await allocatePorts();
  if (config.enable.ssWs) allocatedPorts.ssWs = await allocatePorts();
  if (config.enable.trojanWs) allocatedPorts.trojanWs = await allocatePorts();
  if (config.enable.reality) allocatedPorts.reality = await allocatePorts();
  if (config.enable.shadowTlsVless) allocatedPorts.shadowTls = await allocatePorts();
  if (config.enable.shadowsocks) allocatedPorts.shadowsocks = await allocatePorts();
  if (config.enable.socks) allocatedPorts.socks = await allocatePorts();
  if (config.enable.httpProxy) allocatedPorts.httpProxy = await allocatePorts();
  if (config.enable.vlessXhttp) allocatedPorts.xray = await allocatePorts();

  // 6. Manage Binaries
  Logger.section('Engines & Binaries');
  const binManager = new BinaryManager(config);

  const hasSingBox = await binManager.ensureSingBox();
  let hasXray = false;
  if (config.enable.vlessXhttp || config.enable.ssWs) {
    hasXray = await binManager.ensureXray();
  }
  let hasCloudflared = false;
  if (config.enable.argo) {
    hasCloudflared = await binManager.ensureCloudflared();
  }

  // 7. Start Engine Instances
  let singboxInstance = null;
  if (hasSingBox) {
    singboxInstance = new SingBoxEngine(config, stateMgr, allocatedPorts);
    singboxInstance.start();
  } else {
    Logger.warn('sing-box binary could not be started. (Mock/offline mode active).');
  }

  let xrayInstance = null;
  config.xhttpPort = null;
  config.ssWsPort = null;
  if (hasXray && (allocatedPorts.xray || allocatedPorts.ssWs)) {
    xrayInstance = new XrayEngine(config, stateMgr, { xhttp: allocatedPorts.xray, ssWs: allocatedPorts.ssWs });
    if (xrayInstance.start()) {
      config.xhttpPort = allocatedPorts.xray || null;
      config.ssWsPort = allocatedPorts.ssWs || null;
    } else {
      Logger.warn('Xray-core did not start; VLESS-XHTTP / Shadowsocks-WS links hidden.');
    }
  } else if (config.enable.vlessXhttp || config.enable.ssWs) {
    Logger.warn('VLESS-XHTTP / Shadowsocks-WS enabled but Xray-core is not available; their links are hidden.');
  }

  let argoInstance = null;
  let argoDomain = null;
  if (hasCloudflared && config.enable.argo) {
    argoInstance = new ArgoTunnel(config, config.publicPort);
    argoDomain = await argoInstance.start();
  }

  // 8. Generate share links & subscriptions
  const linkGen = new LinkGenerator(config, stateMgr.state, resolvedHost);
  const compatNodes = linkGen.getAllNodes({ compat: 'v2ray', argoDomain, allowLocalHostLinks: config.allowLocalHostLinks });
  const allNodes = linkGen.getAllNodes({ compat: 'full', argoDomain, allowLocalHostLinks: true });
  const links = compatNodes.map(n => n.uri);
  const clashYaml = linkGen.buildClashMetaYaml(allNodes);
  const singboxJson = linkGen.buildSingBoxClientJson(allNodes);

  stateMgr.setLinks(links, clashYaml, singboxJson);

  // 9. HTTP Panel & TCP multiplexer
  const engineStatusGetter = () => ({
    singbox: !!(singboxInstance && singboxInstance.process && !singboxInstance.process.killed),
    xray: !!(xrayInstance && xrayInstance.process && !xrayInstance.process.killed),
    argo: !!(argoInstance && argoInstance.process && !argoInstance.process.killed)
  });

  const { server: expressServer, app: expressApp } = createHttpPanel(config, stateMgr, engineStatusGetter, () => resolvedHost);
  const tcpRouter = new TcpRouter(config, allocatedPorts, expressServer, expressApp);
  await tcpRouter.start();

  // 10. Summary
  const panelUrl = (config.forceHttps || bkOnEdgeHost()) && !isIpLiteral(resolvedHost)
    ? `https://${resolvedHost}/${config.panelPath}`
    : `http://${resolvedHost}:${config.publicPort}/${config.panelPath}`;
  Logger.item('Link host / SNI', `${linkGen.host} / ${linkGen.tlsOpt.sni} (port ${linkGen.port}, fp=${linkGen.tlsOpt.fp || 'none'}, alpn=${linkGen.tlsOpt.alpn.join(',') || 'none'})`);
  Logger.section('Zedecco Gate v1.0.0 Active');
  Logger.item('Host', bkPlatformName());
  Logger.item('Web Panel', panelUrl);
  Logger.item('Status', 'Multiplexed & Ready');

  // Graceful shutdown
  const shutdown = () => {
    Logger.info('Stopping Zedecco Gate...');
    if (singboxInstance) singboxInstance.stop();
    if (xrayInstance) xrayInstance.stop();
    if (argoInstance) argoInstance.stop();
    if (tcpRouter) tcpRouter.stop();
    try { BkTraffic.save(); } catch (_) {}
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  return {
    config,
    state: stateMgr.state,
    nodes: compatNodes,
    allNodes,
    panelUrl,
    allocatedPorts,
    tcpRouter,
    singboxInstance,
    xrayInstance,
    argoInstance,
    shutdown
  };
}

// --- Auto-start execution ---
if (require.main === module) {
  startGate(BK_CONFIG).catch(err => {
    console.error('[FATAL] Failed to start Zedecco Gate:', err);
    process.exit(1);
  });
}

module.exports = {
  BK_CONFIG,
  startGate
};
