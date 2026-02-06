import { ScanResult } from '../types';

const STORAGE_KEY = 'securecode_history'; // LocalStorage key - simple and works

export const saveScan = (result: ScanResult): void => {
  try {
    const existing = getHistory();
    // Keep last 50 scans, newest first
    const updated = [result, ...existing].slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    // LocalStorage can fail (quota exceeded, private mode, etc) - just log it
    console.error("Failed to save scan history", e);
  }
};

export const getHistory = (): ScanResult[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    // Corrupted data or JSON parse error - return empty array
    console.error("Failed to load history", e);
    return [];
  }
};

export const clearHistory = (): void => {
  // Nuke everything
  localStorage.removeItem(STORAGE_KEY);
};