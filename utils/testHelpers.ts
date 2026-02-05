// Test utilities for production validation

export const createTestCode = (language: string): string => {
  const testCodes: Record<string, string> = {
    javascript: `
// Test JavaScript code with potential vulnerabilities
function login(username, password) {
  const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
  return database.query(query);
}

function displayMessage(message) {
  document.getElementById('output').innerHTML = message;
}
`,
    python: `
# Test Python code with potential vulnerabilities
import pickle
import os

def load_user_data(data):
    return pickle.loads(data)  # Unsafe deserialization

def execute_command(cmd):
    os.system(cmd)  # Command injection vulnerability
`,
    java: `
// Test Java code with potential vulnerabilities
public class UserService {
    public User findUser(String id) {
        String query = "SELECT * FROM users WHERE id = " + id;
        return database.executeQuery(query);
    }
    
    public void processXML(String xml) {
        DocumentBuilder db = DocumentBuilderFactory.newInstance().newDocumentBuilder();
        Document doc = db.parse(new InputSource(new StringReader(xml)));
    }
}
`
  };

  return testCodes[language] || testCodes.javascript;
};

export const validateScanResult = (result: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check required fields
  if (!result.fileName) errors.push('Missing fileName');
  if (!result.code) errors.push('Missing code');
  if (typeof result.score !== 'number') errors.push('Invalid score type');
  if (result.score < 0 || result.score > 100) errors.push('Score out of range');
  if (!result.summary) errors.push('Missing summary');
  if (!result.timestamp) errors.push('Missing timestamp');
  if (!Array.isArray(result.vulnerabilities)) errors.push('Invalid vulnerabilities array');

  // Validate vulnerabilities
  result.vulnerabilities?.forEach((vuln: any, index: number) => {
    if (!vuln.id) errors.push(`Vulnerability ${index}: Missing id`);
    if (!vuln.name) errors.push(`Vulnerability ${index}: Missing name`);
    if (!['Critical', 'High', 'Medium', 'Low'].includes(vuln.severity)) {
      errors.push(`Vulnerability ${index}: Invalid severity`);
    }
    if (typeof vuln.lineStart !== 'number' || vuln.lineStart < 1) {
      errors.push(`Vulnerability ${index}: Invalid lineStart`);
    }
    if (typeof vuln.lineEnd !== 'number' || vuln.lineEnd < vuln.lineStart) {
      errors.push(`Vulnerability ${index}: Invalid lineEnd`);
    }
    if (!vuln.description) errors.push(`Vulnerability ${index}: Missing description`);
    if (!vuln.fix) errors.push(`Vulnerability ${index}: Missing fix`);
    if (typeof vuln.confidence !== 'number' || vuln.confidence < 0 || vuln.confidence > 100) {
      errors.push(`Vulnerability ${index}: Invalid confidence`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const runProductionTests = async (): Promise<{ passed: number; failed: number; results: any[] }> => {
  const results: any[] = [];
  let passed = 0;
  let failed = 0;

  console.log('🧪 Running production validation tests...');

  // Test 1: Configuration validation
  try {
    const { validateEnvironment } = await import('./config');
    const validation = validateEnvironment();
    
    if (validation.isValid) {
      results.push({ test: 'Configuration Validation', status: 'PASS' });
      passed++;
    } else {
      results.push({ 
        test: 'Configuration Validation', 
        status: 'FAIL', 
        errors: validation.errors 
      });
      failed++;
    }
  } catch (error) {
    results.push({ 
      test: 'Configuration Validation', 
      status: 'ERROR', 
      error: error 
    });
    failed++;
  }

  // Test 2: Service import and basic functionality
  try {
    const { getAuditStats } = await import('../services/geminiService');
    const stats = getAuditStats();
    
    if (stats && typeof stats.cacheSize === 'number') {
      results.push({ test: 'Service Functionality', status: 'PASS' });
      passed++;
    } else {
      results.push({ 
        test: 'Service Functionality', 
        status: 'FAIL', 
        error: 'Invalid stats response' 
      });
      failed++;
    }
  } catch (error) {
    results.push({ 
      test: 'Service Functionality', 
      status: 'ERROR', 
      error: error 
    });
    failed++;
  }

  // Test 3: Input validation
  try {
    const { scanCodeWithGemini } = await import('../services/geminiService');
    
    // Test empty code
    try {
      await scanCodeWithGemini('', 'test.js');
      results.push({ 
        test: 'Input Validation (Empty Code)', 
        status: 'FAIL', 
        error: 'Should have thrown error for empty code' 
      });
      failed++;
    } catch (error: any) {
      if (error.code === 'EMPTY_CODE') {
        results.push({ test: 'Input Validation (Empty Code)', status: 'PASS' });
        passed++;
      } else {
        results.push({ 
          test: 'Input Validation (Empty Code)', 
          status: 'FAIL', 
          error: `Wrong error type: ${error.code}` 
        });
        failed++;
      }
    }

    // Test oversized code
    const largeCode = 'x'.repeat(60000); // Exceeds 50KB limit
    try {
      await scanCodeWithGemini(largeCode, 'test.js');
      results.push({ 
        test: 'Input Validation (Large Code)', 
        status: 'FAIL', 
        error: 'Should have thrown error for oversized code' 
      });
      failed++;
    } catch (error: any) {
      if (error.code === 'CODE_TOO_LARGE') {
        results.push({ test: 'Input Validation (Large Code)', status: 'PASS' });
        passed++;
      } else {
        results.push({ 
          test: 'Input Validation (Large Code)', 
          status: 'FAIL', 
          error: `Wrong error type: ${error.code}` 
        });
        failed++;
      }
    }

  } catch (error) {
    results.push({ 
      test: 'Input Validation', 
      status: 'ERROR', 
      error: error 
    });
    failed += 2; // Two sub-tests
  }

  console.log(`✅ Tests completed: ${passed} passed, ${failed} failed`);
  return { passed, failed, results };
};

// Simple performance test
export const runPerformanceTest = async (iterations: number = 5): Promise<any> => {
  console.log(`🏃 Running performance test (${iterations} iterations)...`);
  
  const testCode = createTestCode('javascript');
  const times: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    
    try {
      const { getCacheKey } = await import('../services/geminiService');
      // Test cache key generation performance
      const key = getCacheKey(testCode, `test-${i}.js`);
      const end = Date.now();
      times.push(end - start);
    } catch (error) {
      console.error(`Performance test iteration ${i} failed:`, error);
    }
  }
  
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  
  return {
    iterations,
    averageTime: avgTime,
    minTime,
    maxTime,
    times
  };
};