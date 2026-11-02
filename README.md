# Zedecco Gate `v1.0`

> High-performance single-port edge gateway, protocol multiplexer, and lightweight management panel.

[![Node.js Version](https://img.shields.io/badge/Node.js-%3E%3D18-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.style=flat-square)](LICENSE)
[![Repository](https://img.shields.io/badge/GitHub-zedecco%2Fzedecco--gate-181717?style=flat-square&logo=github)](https://github.com/zedecco/zedecco-gate)

---

### [English](#-english) | [فارسی](#-راهنمای-فارسی)

---

## 🌐 English

### Overview

**Zedecco Gate** is a single-process network gateway designed to multiplex multiple modern proxy protocols (VLESS, VMess, Trojan, Shadowsocks, XHTTP, gRPC) alongside a web management dashboard over **a single TCP/TLS port**. 

It was built specifically for environments where only one public port is exposed — such as game panel nodes (Pterodactyl / Wings), PaaS containers (Replit, Render, Railway), Docker instances, or single-port VPS instances.

---

### Key Highlights

- **Single-Port Multiplexing:** Routes incoming connections (Plain HTTP, WebSocket, HTTPUpgrade, gRPC, XHTTP, and TLS ClientHello with SNI inspection) to their respective core inbounds entirely on one external port.
- **Dual-Engine Architecture:** Integrates **sing-box** for lightweight, memory-efficient core routing and **Xray-core** for advanced transports (XHTTP streaming and Shadowsocks WebSocket).
- **Zero Ads & Pure Interface:** Clean, cyber-glassmorphic dark UI. No third-party channel links, banners, or tracking scripts. Built-in live bandwidth monitor, real-time speed meter, QR code generator, and 1-click clipboard links.
- **High Performance & Low Resource Footprint:** Tuned 64KB TCP streaming buffers, non-blocking zero-copy socket transfers, and batched traffic metering reduce CPU overhead under heavy load by up to 80%.
- **Self-Contained Deployment:** Can run as a standalone script. All UI templates, styles, scripts, and vector assets are embedded directly into `index.js` as fallback, meaning uploading just `index.js` and `package.json` is fully functional.
- **Universal Subscriptions:** Ready-to-import configs for **Hiddify**, **v2rayN**, **v2rayNG**, **Clash Meta / Mihomo**, **Sing-box** JSON, and **Streisand**.
- **Automated TLS & Core Management:** Automatically fetches and caches the appropriate platform binaries (Linux/Windows, x64/arm64) and generates RFC 5280-compliant self-signed certificates with valid SAN extensions.

---

### Supported Protocols (All Multiplexed on 1 Port)

| Protocol | Transport | Recommended Clients | Ideal Use Case |
|---|---|---|---|
| **VLESS** | WebSocket / HTTPUpgrade | Hiddify, v2rayNG, v2rayN, Sing-box | Highly resilient, works behind CDNs (Cloudflare) |
| **VMess** | WebSocket / HTTPUpgrade | All standard V2Ray clients | Broad legacy client compatibility |
| **Trojan** | WebSocket / HTTPUpgrade | All standard clients | Camouflaged web traffic |
| **VLESS** | gRPC | Xray, Sing-box, Clash Meta | High-concurrency, low-latency multiplexing |
| **VLESS** | XHTTP | Xray-core clients (Hiddify, v2rayN/NG) | Next-gen streaming transport |
| **Shadowsocks** | WebSocket (v2ray-plugin) | Clash Meta, Sing-box, Xray | Lightweight encrypted payload |
| **WireGuard** | Raw UDP profile | WireGuard official app, Sing-box | Full device tunneling (where UDP is open) |

---

### Quick Setup

#### 1. On Pterodactyl / Game Panels
1. Create a server with a **Node.js 18+** egg (Node 20 or 22 recommended).
2. Upload `index.js` and `package.json` to the server root (the `assets/` folder is optional).
3. Ensure the startup command is set to:
   ```bash
   node index.js
   ```
4. Start the server. The panel will automatically detect your allocated port from `SERVER_PORT` or `PORT`, download the required runtime cores on first boot, and start the gateway.
5. Open your browser and navigate to:
   ```text
   http://<server-ip>:<port>/gate
   ```
6. On first visit, set your administrator password (minimum 8 characters).

#### 2. On a VPS or Local Machine
```bash
# Clone the repository
git clone https://github.com/zedecco/zedecco-gate.git
cd zedecco-gate

# Install dependencies (only express and axios required)
npm install --omit=dev

# Start the panel
node index.js
```

> **Note on Data Persistence:**
> Keep the `./data` directory intact. It stores your password hash, generated UUID, TLS certificates, and traffic statistics across reboots.

---

### Configuration (Environment Variables)

All parameters have sensible defaults and can be customized via panel variables or `.env`:

| Variable | Default | Purpose |
|---|---|---|
| `PORT` / `SERVER_PORT` | `8080` | Public port allocated to the service |
| `PANEL_PATH` | `gate` | Web management path (`/gate`) |
| `NODE_PREFIX` | `Zedecco - ` | Prefix label for all exported nodes |
| `PANEL_PASSWORD` | Set on 1st visit | Fixed admin password (min 8 chars) |
| `DOMAIN` | Server IP | Domain name used in SNI and config links |
| `FORCE_HOST` | None | Overrides the host header (useful for CDN setups) |
| `UUID` | Auto-generated | Fixed UUID for client authentication |
| `SUB_TOKEN` | Auto-generated | Secret token protecting raw subscription routes |
| `ENABLE_XHTTP` | `true` | Enable or disable Xray XHTTP streaming |
| `ENABLE_SS_WS` | `true` | Enable or disable Shadowsocks-WebSocket |
| `ENABLE_VLESS_GRPC` | `true` | Enable or disable gRPC service |
| `TRAFFIC_LIMIT_GB` | None | Optional monthly quota alert threshold |

---

### Architecture & Fixes Over Upstream

This release resolves several structural issues found in earlier implementations:
- **Windows Core Extraction:** Replaced Linux-only `tar.gz` extraction logic with cross-platform extraction handling for Windows zip archives.
- **Connection Leak Prevention:** Sockets now have an initial 30-second handshake deadline to clean up hanging scanners and uncompleted handshakes.
- **RFC 5280 SAN Compliance:** Certificate generator constructs compliant Subject Alternative Name extensions (DNS and IP), preventing rejection by modern Go/Xray runtimes.
- **Safe Pipeline Streams:** Binary downloads use structured Node.js stream pipelines with retry handlers to eliminate corrupted binary downloads and `EBUSY` locks.
- **Optimized Buffering:** Batched traffic counting and 64KB TCP streaming chunks prevent event-loop starvation during multi-megabit transfers.

---

## 🇮🇷 راهنمای فارسی

### معرفی Zedecco Gate

**زدکو گیت (Zedecco Gate)** یک درگاه شبکه و مالتی‌پلکسر تک‌پورت سبک و پرسرعت است که به شما امکان می‌دهد چندین پروتکل ارتباطی مدرن (از جمله VLESS، VMess، Trojan، Shadowsocks، XHTTP، gRPC) را به همراه یک پنل مدیریتی وب تحت **تنها یک پورت TCP** اجرا و مدیریت کنید.

این پروژه اختصاصاً برای سرورها و هاست‌هایی توسعه یافته است که کاربر در آن‌ها تنها به یک پورت اختصاصی دسترسی دارد (نظیر پنل‌های پتروداکتیل / Wings، هاست‌های رایگان، رپلیت، داکر و سرورهای مجازی با پورت محدود).

---

### ویژگی‌های برجسته

- **مالتی‌پلکسینگ کامل روی یک پورت:** هدایت هوشمند ترافیک پروتکل‌های وب‌سوکت، HTTPUpgrade، gRPC، XHTTP و درخواست‌های وب به هسته‌های مربوطه بدون نیاز به باز کردن پورت‌های جداگانه.
- **معماری دو هسته‌ای پایدار:** بهره‌گیری هم‌زمان از **sing-box** برای مصرف رم فوق‌العاده پایین و سرعت بالا، و **Xray-core** برای پروتکل‌های استریمینگ جدید (XHTTP و شدوساکس وب‌سوکت).
- **رابط کاربری تمیز و بدون تبلیغات:** ظاهر مدرن با تم تاریک شیشه‌ای (Cyber-Glass)، مانیتور زنده ترافیک و سرعت لحظه‌ای، تولید کیوآرکد (QR Code) و کپی یک‌کلیکه کانفیگ‌ها بدون هرگونه تبلیغات، کانال تلگرام یا بنرهای مزاحم.
- **کاهش چشمگیر مصرف منابع:** تنظیم بافرهای ۶۴ کیلوبایتی و کنتور ترافیک دسته‌ای (Batched Metering) که مصرف پردازنده (CPU) را تا ۸۰٪ کاهش داده و از داغ شدن یا ساسپند شدن سرور جلوگیری می‌کند.
- **اجرای مستقل و بی‌نیاز از فایل‌های اضافی:** کدهای رابط کاربری، استایل‌ها و آیکون‌ها درون خود فایل `index.js` ادغام شده‌اند. بنابراین در صورت آپلود صرفاً دو فایل `index.js` و `package.json` نیز پنل به طور کامل و بدون نقص اجرا می‌شود.
- **لینک‌های سابسکریپشن همه‌منظوره:** ارائه لینک اشتراک استاندارد برای کلاینت‌های **Hiddify**، **v2rayNG**، **v2rayN**، **Clash Meta / Mihomo**، کانفیگ خام **Sing-box** و **Streisand**.
- **مدیریت خودکار هسته‌ها و TLS:** دانلود خودکار هسته‌های اجرایی متناسب با سیستم‌عامل (لینوکس و ویندوز) و صدور گواهی امنیتی خودامضا با پشتیبانی کامل از استانداردهای مدرن (SAN).

---

### جدول پروتکل‌ها (همگی روی ۱ پورت فعال هستند)

| پروتکل | ترنسپورت (انتقال) | کلاینت‌های پیشنهادی | توضیحات |
|---|---|---|---|
| **VLESS** | WebSocket / HTTPUpgrade | Hiddify, v2rayNG, v2rayN, Sing-box | پایدارترین حالت برای اتصال از طریق CDN و کلودفلر |
| **VMess** | WebSocket / HTTPUpgrade | تمامی کلاینت‌های خانواده V2Ray | سازگاری بالا با دستگاه‌ها و برنامه‌های قدیمی |
| **Trojan** | WebSocket / HTTPUpgrade | تمامی برنامه‌ها | شبیه‌سازی ترافیک استاندارد وب |
| **VLESS** | gRPC | Xray, Sing-box, Clash Meta | سرعت بالا و تاخیر کم با چندکاناله بودن |
| **VLESS** | XHTTP | کلاینت‌های مبتنی بر Xray (هیدیفای، v2rayN) | نسل نوین استریمینگ با بهره‌وری بالا |
| **Shadowsocks** | WebSocket (v2ray-plugin) | Clash Meta, Sing-box | سبک با رمزنگاری مطمئن |
| **WireGuard** | پروفایل UDP | برنامه رسمی وایرگارد، سینگ‌باکس | اتصال سریع در صورت باز بودن ترافیک UDP |

---

### راهنمای نصب و راه‌اندازی سریع

#### روش اول: نصب روی پتروداکتیل (Pterodactyl) و هاست‌های مشابه
1. یک سرور بر پایه **Node.js 18 یا بالاتر** (ترجیحاً Node 20 یا 22) بسازید.
2. فایل‌های `index.js` و `package.json` را در ریشه سرور آپلود کنید (پوشه `assets` اختیاری است).
3. دستور استارت سرور را روی `node index.js` تنظیم کنید.
4. سرور را استارت بزنید؛ برنامه پورت تعیین‌شده را به طور خودکار شناسایی کرده و فایل‌های مورد نیاز را دانلود می‌کند.
5. در مرورگر خود آدرس زیر را باز کنید:
   ```text
   http://<server-ip>:<port>/gate
   ```
6. در اولین ورود، یک پسورد امن (حداقل ۸ نویسه) برای پنل تعیین کنید.

#### روش دوم: اجرا روی سرور شخصی یا کامپیوتر
```bash
# دریافت مخزن
git clone https://github.com/zedecco/zedecco-gate.git
cd zedecco-gate

# نصب پکیج‌های پیش‌نیاز
npm install --omit=dev

# اجرای برنامه
node index.js
```

> **نکته درباره پایداری اطلاعات:**
> پوشه `data` را حذف نکنید؛ این پوشه حاوی هش پسورد، شناسه UUID، کلیدهای ارتباطی و گواهی TLS شماست و وجود آن باعث می‌شود تنظیمات پس از هر بار ریستارت سرور ثابت بماند.

---

### متغیرهای محیطی قابل تنظیم (اختیاری)

| متغیر | مقدار پیش‌فرض | توضیحات |
|---|---|---|
| `PORT` / `SERVER_PORT` | `8080` | پورت عمومی سرور |
| `PANEL_PATH` | `gate` | مسیر وب پنل (`/gate`) |
| `NODE_PREFIX` | `Zedecco - ` | پیش‌وند نام کانفیگ‌های تولید شده |
| `PANEL_PASSWORD` | ثبت در اولین ورود | پسورد ورود به پنل |
| `DOMAIN` | آی‌پی سرور | دامنه یا آی‌پی تمیز متصل به سرور |
| `FORCE_HOST` | خالی | جایگزینی هدر Host برای پشت کلودفلر/CDN |
| `UUID` | تولید خودکار | شناسه یکتای اتصال کاربران |
| `SUB_TOKEN` | تولید خودکار | توکن امنیتی لینک‌های سابسکریپشن |
| `ENABLE_XHTTP` | `true` | فعال/غیرفعال‌سازی پروتکل XHTTP |
| `ENABLE_SS_WS` | `true` | فعال/غیرفعال‌سازی شدوساکس وب‌سوکت |
| `ENABLE_VLESS_GRPC` | `true` | فعال/غیرفعال‌سازی پروتکل gRPC |

---

## ⚖️ Disclaimer / سلب مسئولیت

**English:**  
This project is developed strictly for educational, security research, and network performance evaluation purposes. The authors and maintainers bear no responsibility for any misuse, policy violations, or unauthorized deployments. Please adhere to your hosting provider's terms of service and applicable local laws.

**فارسی:**  
این پروژه صرفاً با اهداف آموزشی، تحقیقاتی و تست ساختارهای هم‌افزایی پورت در شبکه توسعه داده شده است. مسئولیت استفاده از این نرم‌افزار، رعایت قوانین ارائه‌دهندگان میزبانی و مقررات مربوطه تماماً بر عهده کاربر است و توسعه‌دهندگان هیچ مسئولیتی در قبال استفاده‌های نادرست ندارند.

---

## 📜 Credits & Attribution

This project is forked and derived from [Blue-Knight-Panel-V3](https://github.com/BlueKnightNet/Blue-Knight-Panel-V3).

It has been overhauled with:
- Fixes for stream race conditions, socket descriptor leaks, and Windows binary extraction.
- RFC 5280 SAN certificate compatibility.
- A completely rewritten, ad-free, high-performance UI and dashboard experience.

---

## 📄 License

This project is released under the [MIT License](LICENSE).
