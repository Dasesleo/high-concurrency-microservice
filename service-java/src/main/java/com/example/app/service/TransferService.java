package com.example.app.service;

import com.example.app.domain.AccountStore;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantLock;

@Service
public class TransferService {
    private final AccountStore store = new AccountStore();

    // Idempotencia por key
    private final ConcurrentHashMap<String, Boolean> processed = new ConcurrentHashMap<>();

    // Lock por cuenta para minimizar contención
    private final ConcurrentHashMap<String, ReentrantLock> locks = new ConcurrentHashMap<>();

    public void reset(int accounts, long initialBalance) {
        store.reset(accounts, initialBalance);
        processed.clear();
        locks.clear();
    }

    public Map<String, Long> balances() {
        return store.snapshot();
    }

    public void transfer(String from, String to, long amount, String key) {
        if (from == null || to == null || key == null)
            return;
        if (from.equals(to))
            return;
        if (amount <= 0)
            return;

        // Idempotencia: si ya vimos la key, no volver a aplicar
        Boolean prev = processed.putIfAbsent(key, Boolean.TRUE);
        if (prev != null) {
            return; // ya aplicado
        }

        // Orden total para evitar deadlocks
        String a = from.compareTo(to) <= 0 ? from : to;
        String b = from.compareTo(to) <= 0 ? to : from;

        ReentrantLock lockA = locks.computeIfAbsent(a, k -> new ReentrantLock());
        ReentrantLock lockB = locks.computeIfAbsent(b, k -> new ReentrantLock());

        lockA.lock();
        try {
            lockB.lock();
            try {
                var map = store.balancesMap();
                Long fromBal = map.getOrDefault(from, 0L);
                Long toBal = map.getOrDefault(to, 0L);

                // Regla: nunca saldos negativos. Si no alcanza, no hacemos nada (200 OK igual).
                if (fromBal >= amount) {
                    map.put(from, fromBal - amount);
                    map.put(to, toBal + amount);
                }
            } finally {
                lockB.unlock();
            }
        } finally {
            lockA.unlock();
        }
    }
}
