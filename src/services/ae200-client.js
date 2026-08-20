/**
 * ae200-client.js
 * Core WebSocket client for Mitsubishi AE-200E
 * Handles connection, auth, reconnect, and XML messaging
 */

const WebSocket = require('ws');

// ─── ENCRYPTION ──────────────────────────────────────────────────────────────

function createCodeTable_() {
    const e = [];
    for (let c = 0; c < 26; c++) e[c + 1]      = String.fromCharCode('a'.charCodeAt(0) + c);
    for (let c = 0; c < 26; c++) e[c + 1 + 26]  = String.fromCharCode('A'.charCodeAt(0) + c);
    for (let c = 0; c < 10; c++) e[c + 1 + 52]  = String.fromCharCode('0'.charCodeAt(0) + c);
    return e;
}

function toPluralDigits(str, length) {
    while (str.length < length) str = '0' + str;
    return str;
}

function makePasswordKey() {
    let e = toPluralDigits(String(Math.floor(1e4 * Math.random())), 4);
    return e + String(Math.floor(4 * Math.random() + 1));
}

function encryption(e, t) {
    t = Number(t);
    const s = t % 10; t = Math.floor(t / 10);
    const a = t % 10; t = Math.floor(t / 10);
    const r = t % 10; t = Math.floor(t / 10);
    const l = t % 10; t = Math.floor(t / 10);
    const _ = Math.abs((t + l) % 10 - (r + a) % 10);
    let c = '';
    for (let i = 0; i < _; i++)
        c += String.fromCharCode(Math.floor('a'.charCodeAt(0) + 26 * Math.random()));
    const d = createCodeTable_();
    let n = 0, h = '';
    for (let i = 0; i < e.length; i++) {
        let o = (d.indexOf(e.charAt(i)) + _ + n) % 62;
        o = o === 0 ? 62 : o;
        n = o;
        h += d[o];
    }
    return h.substring(0, s - 1) + c + h.substring(s - 1);
}

// ─── XML HELPERS ─────────────────────────────────────────────────────────────

function xmlWrap(command, body) {
    return `<?xml version="1.0" encoding="UTF-8" ?>\r\n<Packet>\r\n<Command>${command}</Command>\r\n<DatabaseManager>\r\n${body}</DatabaseManager>\r\n</Packet>`;
}

function buildLoginXml(username, password) {
    const key = makePasswordKey();
    const enc = encryption(password, key);
    const attr = `User="${username}" Password="${enc}" PasswordKey="${key}" UserCategory="*" UserName="*"`;
    return `POST /servlet/AdvancedWebServlet HTTP/1.1\r\n\r\n` + xmlWrap('getRequest', `<WebUserAuth ${attr} />\r\n`);
}

function buildReadGroupXml(group) {
    return xmlWrap('getRequest', `<Mnet Group="${group}" Drive="*" Mode="*" SetTemp="*" FanSpeed="*" AirDirection="*" InletTemp="*" />\r\n`);
}

function buildControlXml(group, params) {
    let attr = `Group="${group}"`;
    if (params.drive        != null) attr += ` Drive="${params.drive}"`;
    if (params.mode         != null) attr += ` Mode="${params.mode}"`;
    if (params.setTemp      != null) attr += ` SetTemp="${params.setTemp}"`;
    if (params.fanSpeed     != null) attr += ` FanSpeed="${params.fanSpeed}"`;
    if (params.airDirection != null) attr += ` AirDirection="${params.airDirection}"`;
    return xmlWrap('setRequest', `<Mnet ${attr} />\r\n`);
}

/** AE-200E reports "Auto", "AutoCool", "AutoHeat", etc. for auto mode — collapse them all to "Auto". */
function normalizeMode(mode) {
    if (!mode) return mode;
    return mode.slice(0, 4).toLowerCase() === 'auto' ? 'AUTO' : mode;
}

function buildGroupListXml() {
    return xmlWrap('getRequest', `<ControlGroup>\r\n<MnetList />\r\n</ControlGroup>\r\n`);
}

function buildSystemDataXml() {
    return xmlWrap('getRequest', `<SystemData Version="*" Model="*" VersionIF="*" Number="*" />\r\n`);
}

// ─── CLIENT CLASS ─────────────────────────────────────────────────────────────

class AE200Client {
    constructor(ip, username, password) {
        this.ip            = ip;
        this.username      = username;
        this.password      = password;
        this.ws            = null;
        this.loggedIn      = false;
        this.connecting    = false;
        this.callbacks     = new Map();
        this.groups        = [];           // cached group list
        this.lastStates    = {};           // cached unit states
        this.systemInfo    = null;
        this._reconnectTimer = null;
        this._pollTimer      = null;
        this._polling        = false;      // guards against overlapping _pollAllUnits runs
        this._sendQueue      = Promise.resolve(); // serializes _send calls — protocol has no per-request correlation ID
        this.onStateUpdate   = null;       // callback: (states) => {}
    }

    // ── Connect & Auth ──────────────────────────────────────────────────────

    async connect() {
        if (this.connecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) return;
        this.connecting = true;

        return new Promise((resolve, reject) => {
            let settled = false;
            const url = `wss://${this.ip}/b_xmlproc/`;
            console.log(`[AE200] Connecting → ${url}`);

            this.ws = new WebSocket(url, 'b_xmlproc', {
                rejectUnauthorized: false,
                headers: { 'Origin': `https://${this.ip}` }
            });

            this.ws.on('open', async () => {
                this.connecting = false;
                console.log('[AE200] Connected');
                try {
                    await this._login();
                    await this._loadGroups();
                    settled = true;
                    resolve();
                } catch (err) {
                    settled = true;
                    reject(err);
                }
            });

            this.ws.on('message', (data) => this._onMessage(data.toString()));

            this.ws.on('error', (err) => {
                console.error('[AE200] WS error:', err.message);
                this.connecting = false;
                if (!settled) { settled = true; reject(err); }
            });

            this.ws.on('close', (code) => {
                console.warn(`[AE200] Disconnected (${code}) — reconnecting in 5s`);
                this.loggedIn   = false;
                this.connecting = false;
                if (!settled) { settled = true; reject(new Error(`Connection closed (code ${code}) before login completed`)); }
                this._scheduleReconnect();
            });
        });
    }

    _scheduleReconnect() {
        if (this._reconnectTimer) return;
        this._reconnectTimer = setTimeout(async () => {
            this._reconnectTimer = null;
            try { await this.connect(); } catch (e) { console.error('[AE200] Reconnect failed:', e.message); }
        }, 5000);
    }

    async _login() {
        const xml  = buildLoginXml(this.username, this.password);
        const resp = await this._send(xml, 'WebUserAuth');
        if (resp.includes('getErrorResponse')) {
            const msg = resp.match(/Message="([^"]+)"/)?.[1] || 'Unknown';
            throw new Error(`Login failed: ${msg}`);
        }
        const cat = resp.match(/UserCategory="([^"]+)"/)?.[1] || '?';
        console.log(`[AE200] ✅ Logged in — ${cat}`);
        this.loggedIn = true;
    }

    async _loadGroups() {
        const resp = await this._send(buildGroupListXml(), 'MnetList');
        this.groups = [];
        const rx = /Group="(\d+)" GroupNameWeb="([^"]+)"/g;
        let m;
        while ((m = rx.exec(resp)) !== null)
            this.groups.push({ group: m[1], name: m[2] });
        console.log(`[AE200] Found ${this.groups.length} groups`);

        // Load system info
        const si = await this._send(buildSystemDataXml(), 'SystemData');
        this.systemInfo = {
            model:   si.match(/Model="([^"]+)"/)?.[1],
            version: si.match(/Version="([^"]+)"/)?.[1],
            serial:  si.match(/Number="([^"]+)"/)?.[1],
        };
    }

    // ── Messaging ───────────────────────────────────────────────────────────

    _onMessage(xml) {
        if (xml.includes('<Command>notifyRequest</Command>')) {
            // Server push — refresh states (disabled: was firing continuously, flooding HVACs updates)
            // this._pollAllUnits().catch(() => {});
            return;
        }
        for (const [key, cb] of this.callbacks.entries()) {
            if (xml.includes(key)) {
                this.callbacks.delete(key);
                cb(xml);
                return;
            }
        }
    }

    /** Queues the actual send so only one request is ever outstanding on the connection at a time. */
    _send(xml, waitFor, timeoutMs = 10000) {
        const run = () => this._sendNow(xml, waitFor, timeoutMs);
        const result = this._sendQueue.then(run, run);
        this._sendQueue = result.then(() => {}, () => {});
        return result;
    }

    _sendNow(xml, waitFor, timeoutMs = 10000) {
        return new Promise((resolve, reject) => {
            if (!this.ws || this.ws.readyState !== WebSocket.OPEN)
                return reject(new Error('Not connected'));

            if (waitFor) {
                const timer = setTimeout(() => {
                    this.callbacks.delete(waitFor);
                    reject(new Error(`Timeout: ${waitFor}`));
                }, timeoutMs);

                this.callbacks.set(waitFor, (resp) => {
                    clearTimeout(timer);
                    resolve(resp);
                });
            }
            this.ws.send(xml);
            if (!waitFor) resolve(null);
        });
    }

    // ── Public API ──────────────────────────────────────────────────────────

    /** Read state of one group */
    async readGroup(groupId) {
        this._ensureConnected();
        const resp = await this._send(buildReadGroupXml(groupId), 'Mnet');
        if (resp.includes('getErrorResponse')) {
            const msg = resp.match(/Message="([^"]+)"/)?.[1] || 'Error';
            throw new Error(msg);
        }
        const state = this._parseState(resp, groupId);
        this.lastStates[groupId] = state;
        return state;
    }

    /** Read all groups and cache results */
    async _pollAllUnits() {
        if (this._polling) {
            console.warn(`[${this.ip}] Skipping poll — previous cycle still in progress`);
            return this.lastStates;
        }
        this._polling = true;
        try {
            for (const g of this.groups) {
                try {
                    await this.readGroup(g.group);
                } catch (_) {}
            }
            if (this.onStateUpdate) this.onStateUpdate(this.lastStates);
        } finally {
            this._polling = false;
        }
        return this.lastStates;
    }

    /** Control a group */
    async controlGroup(groupId, params) {
        this._ensureConnected();
        const resp = await this._send(buildControlXml(groupId, params), 'Mnet');
        if (resp.includes('getErrorResponse')) {
            const msg = resp.match(/Message="([^"]+)"/)?.[1] || 'Error';
            throw new Error(`Control failed: ${msg}`);
        }
        // Refresh state after control
        return await this.readGroup(groupId);
    }

    /** Start auto-polling every N seconds */
    startPolling(intervalSeconds = 30) {
        this.stopPolling();
        console.log(`[AE200] Polling every ${intervalSeconds}s`);
        this._pollAllUnits();
        this._pollTimer = setInterval(() => this._pollAllUnits(), intervalSeconds * 1000);
    }

    stopPolling() {
        if (this._pollTimer) { clearInterval(this._pollTimer); this._pollTimer = null; }
    }

    /** Force a live read of every group, on demand (no timer, no device push involved) */
    refreshAll() { return this._pollAllUnits(); }

    /** Get cached states (instant, no WS call) */
    getCachedStates() { return this.lastStates; }
    getGroups()       { return this.groups; }
    getSystemInfo()   { return this.systemInfo; }
    isConnected()     { return this.loggedIn && this.ws?.readyState === WebSocket.OPEN; }

    _ensureConnected() {
        if (!this.isConnected()) throw new Error('Not connected to AE-200E');
    }

    _parseState(xml, groupId) {
        const g = this.groups.find(g => g.group === String(groupId));
        return {
            group:        String(groupId),
            name:         g?.name || String(groupId),
            drive:        xml.match(/Drive="([^"]+)"/)?.[1]        || null,
            mode:         normalizeMode(xml.match(/Mode="([^"]+)"/)?.[1]) || null,
            setTemp:      xml.match(/SetTemp="([^"]+)"/)?.[1]      || null,
            fanSpeed:     xml.match(/FanSpeed="([^"]+)"/)?.[1]     || null,
            airDirection: xml.match(/AirDirection="([^"]+)"/)?.[1] || null,
            inletTemp:    xml.match(/InletTemp="([^"]+)"/)?.[1]    || null,
            updatedAt:    new Date().toISOString(),
        };
    }

    disconnect() {
        this.stopPolling();
        if (this._reconnectTimer) { clearTimeout(this._reconnectTimer); this._reconnectTimer = null; }
        if (this.ws) this.ws.close();
    }
}

module.exports = { AE200Client };
