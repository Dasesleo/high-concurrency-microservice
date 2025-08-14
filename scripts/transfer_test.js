import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Counter } from "k6/metrics";

export const options = {
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<200"],
    invariants_ok: ["rate>0.99"],
  },
};

const invariants_ok = new Counter("invariants_ok");
const balances_total = new Trend("balances_total");

const BASE = __ENV.BASE_URL || "http://api:8080";

export function setup() {
  const payload = JSON.stringify({ accounts: 200, initialBalance: 1000 });
  const res = http.post(`${BASE}/reset`, payload, {
    headers: { "Content-Type": "application/json" },
  });
  check(res, { "reset 200": (r) => r.status === 200 });
}

export default function () {
  const from = "A" + Math.floor(Math.random() * 200);
  let to = "A" + Math.floor(Math.random() * 200);
  if (to === from) {
    to = "A" + ((Number(from.slice(1)) + 1) % 200);
  }

  const amount = 1 + Math.floor(Math.random() * 5);

  const reuse = Math.random() < 0.05;
  const key = reuse ? `dup_${__VU}_${Math.floor(__ITER / 2)}` : `key_${__VU}_${__ITER}`;

  const body = JSON.stringify({ from, to, amount, key });
  const res = http.post(`${BASE}/transfer`, body, {
    headers: { "Content-Type": "application/json" },
  });

  check(res, { "transfer 200": (r) => r.status === 200 });

  sleep(Math.random() * 0.01);
}

export function teardown() {
  const res = http.get(`${BASE}/balances`);
  check(res, { "balances 200": (r) => r.status === 200 });

  if (res.status === 200) {
    const balances = res.json();
    const total = Object.values(balances).reduce((a, b) => a + b, 0);
    balances_total.add(total);

    const allNonNegative = Object.values(balances).every((x) => x >= 0);
    if (total === 200 * 1000 && allNonNegative) {
      invariants_ok.add(1);
    }
  }
}
