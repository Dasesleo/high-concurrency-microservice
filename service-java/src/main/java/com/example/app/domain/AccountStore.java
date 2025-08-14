package com.example.app.domain;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class AccountStore {
    private final ConcurrentHashMap<String, Long> balances = new ConcurrentHashMap<>();

    public void reset(int accounts, long initialBalance) {
        balances.clear();
        for (int i = 0; i < accounts; i++) {
            balances.put("A" + i, initialBalance);
        }
    }

    public Map<String, Long> snapshot() {
        return Map.copyOf(balances);
    }

    public ConcurrentHashMap<String, Long> balancesMap() {
        return balances;
    }
}
