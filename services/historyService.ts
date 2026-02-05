import { ScanResult } from '../types';

const STORAGE_KEY = 'securecode_history';

export const saveScan = (result: ScanResult): void => {
  try {
    const existing = getHistory();
    // Add new result to the beginning, limit to 50 items
    const updated = [result, ...existing].slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save scan history", e);
  }
};

export const getHistory = (): ScanResult[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load history", e);
    return [];
  }
};

export const clearHistory = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};