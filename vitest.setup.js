import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
    cleanup();
});

/**
 * Node 22+ expone un localStorage experimental incompleto.
 * Lo reemplazamos por un Storage en memoria para los tests.
 */
function createMemoryStorage() {
    const map = new Map();
    return {
        getItem: (key) => (map.has(String(key)) ? map.get(String(key)) : null),
        setItem: (key, value) => {
            map.set(String(key), String(value));
        },
        removeItem: (key) => {
            map.delete(String(key));
        },
        clear: () => {
            map.clear();
        },
        key: (index) => [...map.keys()][index] ?? null,
        get length() {
            return map.size;
        },
    };
}

const memoryStorage = createMemoryStorage();

Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    writable: true,
    value: memoryStorage,
});

if (typeof window !== "undefined") {
    Object.defineProperty(window, "localStorage", {
        configurable: true,
        writable: true,
        value: memoryStorage,
    });
}
