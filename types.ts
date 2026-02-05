export enum Severity {
  CRITICAL = 'Critical',
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}

export interface Vulnerability {
  id: string;
  name: string;
  severity: Severity;
  lineStart: number;
  lineEnd: number;
  description: string;
  risk: string;
  attackScenario: string;
  fix: string;
  confidence: number;
}

export interface ScanResult {
  id?: string; // Add ID for history tracking
  fileName: string;
  code: string; // Store original code to enable fixing later
  score: number;
  vulnerabilities: Vulnerability[];
  summary: string;
  timestamp: string;
}

export type CodeInputMode = 'paste' | 'file' | 'repo';

export interface FileContent {
  name: string;
  content: string;
  language: string;
}

export interface SecureExample {
  id: string;
  language: string;
  category: string;
  title: string;
  description: string;
  code: string;
}