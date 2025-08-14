
import express from 'express';
import pino from 'pino';

const app = express();
const log = pino({ level: process.env.LOG_LEVEL || 'info' });

app.use(express.json());

class Mutex {
  constructor() {
    this._p = Promise.resolve();
  }
  async lock() {
    let release;
    const p = new Promise(res => (release = res));
    const wait = this._p.then(() => release);
    this._p = this._p.then(() => p);
    return wait;
  }
}

class Ledger {
  constructor(n = 100, initial = 1000) {
    this._balances = new Map();
    this._seen = new Set();
    this._locks = new Map();
    for (let i = 0; i < n; i++) {
      const id = `A${i}`;
      this._balances.set(id, initial);
      this._locks.set(id, new Mutex());
    }
  }

  reset(n = 100, initial = 1000) {
    this._balances.clear();
    this._seen.clear();
    this._locks.clear();
    for (let i = 0; i < n; i++) {
      const id = `A${i}`;
      this._balances.set(id, initial);
      this._locks.set(id, new Mutex());
    }
  }

  snapshot() {
    const obj = {};
    for (const [k, v] of this._balances.entries()) obj[k] = v;
    return obj;
  }

  async transfer({ from, to, amount, key }) {
    if (!from || !to || !key || !Number.isFinite(amount) || amount <= 0) {
      const err = new Error('bad request');
      err.code = 400;
      throw err;
    }
    if (!this._balances.has(from) || !this._balances.has(to)) {
      const err = new Error('unknown account');
      err.code = 404;
      throw err;
    }

    if (this._seen.has(key)) {
      return;
    }

    const [a, b] = [from, to].sort();
    const unlockA = await this._locks.get(a).lock();
    try {
      const unlockB = await this._locks.get(b).lock();
      try {
        if (this._seen.has(key)) return;

        const fromBal = this._balances.get(from);
        const toBal = this._balances.get(to);

        if (fromBal < amount) {
          const err = new Error('insufficient funds');
          err.code = 400;
          throw err;
        }

        this._balances.set(from, fromBal - amount);
        this._balances.set(to, toBal + amount);

        this._seen.add(key);
      } finally {
        unlockB();
      }
    } finally {
      unlockA();
    }
  }
}

const ledger = new Ledger(100, 1000);

app.get('/health', (_req, res) => res.status(200).send('ok'));

app.post('/reset', (req, res) => {
  const { accounts = 100, initialBalance = 1000 } = req.body || {};
  ledger.reset(Number(accounts), Number(initialBalance));
  res.status(200).json({ ok: true });
});

app.get('/balances', (_req, res) => {
  res.status(200).json(ledger.snapshot());
});

app.post('/transfer', async (req, res) => {
  const start = performance.now();
  try {
    await ledger.transfer(req.body || {});
    const took = Math.round(performance.now() - start);
    res.status(200).json({ ok: true, took_ms: took });
  } catch (e) {
    const code = e.code || 400;
    res.status(code).json({ error: e.message || 'transfer failed' });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => log.info({ port }, 'API listening'));
