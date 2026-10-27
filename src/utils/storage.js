export function readStorage(key) {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

export function readJsonStorage(key, fallback) {
    try {
        return JSON.parse(readStorage(key) ?? "null") ?? fallback;
    } catch {
        return fallback;
    }
}

export function writeStorage(key, value) {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch {
        return false;
    }
}

export function removeStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch {
        // Signing out should still clear the in-memory session if storage is blocked.
    }
}
