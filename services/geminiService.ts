import { GoogleGenAI, Type } from "@google/genai";
import { ScanResult, Severity, Vulnerability } from "../types";

// Okay future me, these are the magic numbers that keep this thing from exploding
const CONFIG = {
  MAX_CODE_SIZE: 50000, // 50KB because anything bigger and Gemini gets cranky
  MAX_RETRIES: 3, // Three strikes and you're out, just like my patience
  TIMEOUT_MS: 30000, // 30 seconds because I'm not waiting forever for AI to think
  RATE_LIMIT_PER_MINUTE: 10, // 10 requests per minute so we don't bankrupt ourselves
  CACHE_TTL_MS: 5 * 60 * 1000, // 5 minutes cache because I'm lazy and API calls cost money
};

// These are my global storage maps because I'm too lazy to set up Redis right now
// TODO: Replace with actual database when this thing gets popular (if ever)
const rateLimitStore = new Map<string, number[]>();
const cacheStore = new Map<string, { result: ScanResult; timestamp: number }>();

// Custom error class because JavaScript's default errors are about as helpful as a chocolate teapot
class SecurityAuditError extends Error {
  constructor(
    message: string,
    public code: string, // So I can actually figure out what went wrong at 3am
    public details?: any // Extra context for when I'm debugging this mess later
  ) {
    super(message);
    this.name = 'SecurityAuditError';
  }
}

const getApiKey = (): string => {
  // Vite needs VITE_ prefix or it won't expose the env var to the browser
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) {
    throw new SecurityAuditError(
      'Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your .env.local file.',
      'MISSING_API_KEY'
    );
  }
  return key;
};

const validateInput = (code: string, fileName: string): void => {
  // Basic sanity checks because users will try to break everything
  if (!code || code.trim().length === 0) {
    throw new SecurityAuditError(
      'Code content cannot be empty',
      'EMPTY_CODE'
    );
  }

  // Don't let people upload War and Peace as a JavaScript file
  if (code.length > CONFIG.MAX_CODE_SIZE) {
    throw new SecurityAuditError(
      `Code size exceeds limit of ${CONFIG.MAX_CODE_SIZE} characters`,
      'CODE_TOO_LARGE',
      { size: code.length, limit: CONFIG.MAX_CODE_SIZE }
    );
  }

  // File name validation because apparently that's necessary
  if (!fileName || fileName.trim().length === 0) {
    throw new SecurityAuditError(
      'File name cannot be empty',
      'EMPTY_FILENAME'
    );
  }

  // Look for obviously sketchy stuff (this won't catch everything but it's something)
  const suspiciousPatterns = [
    /eval\s*\(/gi,
    /document\.write\s*\(/gi,
    /innerHTML\s*=/gi,
    /dangerouslySetInnerHTML/gi
  ];

  const hasSuspiciousContent = suspiciousPatterns.some(pattern => 
    pattern.test(code)
  );

  if (hasSuspiciousContent) {
    // Just log it, don't block it - we're analyzing security after all
    console.warn('Suspicious content detected in code submission');
  }
};

const checkRateLimit = (clientId: string = 'default'): void => {
  const now = Date.now();
  const windowStart = now - 60000; // 1 minute sliding window because math is hard

  // Initialize tracking for new clients
  if (!rateLimitStore.has(clientId)) {
    rateLimitStore.set(clientId, []);
  }

  const requests = rateLimitStore.get(clientId)!;
  
  // Clean up old requests because I don't want memory leaks
  const recentRequests = requests.filter(time => time > windowStart);
  
  // Check if they're being too eager
  if (recentRequests.length >= CONFIG.RATE_LIMIT_PER_MINUTE) {
    throw new SecurityAuditError(
      'Rate limit exceeded. Please wait before making another request.',
      'RATE_LIMIT_EXCEEDED',
      { limit: CONFIG.RATE_LIMIT_PER_MINUTE, window: '1 minute' }
    );
  }

  // Add this request to the pile
  recentRequests.push(now);
  rateLimitStore.set(clientId, recentRequests);
};

const getCacheKey = (code: string, fileName: string): string => {
  // World's simplest hash function - don't @ me, it works
  let hash = 0;
  const str = code + fileName;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer because JavaScript
  }
  return hash.toString();
};

const getFromCache = (cacheKey: string): ScanResult | null => {
  const cached = cacheStore.get(cacheKey);
  // Check if cache exists and isn't stale
  if (cached && (Date.now() - cached.timestamp) < CONFIG.CACHE_TTL_MS) {
    return cached.result;
  }
  // Clean up expired cache entries like a responsible developer
  if (cached) {
    cacheStore.delete(cacheKey);
  }
  return null;
};

const setCache = (cacheKey: string, result: ScanResult): void => {
  // Store result with timestamp so we know when it goes bad
  cacheStore.set(cacheKey, {
    result,
    timestamp: Date.now()
  });
};

// Enhanced schema with better validation because the AI sometimes gets creative
const enhancedVulnerabilitySchema = {
  type: Type.OBJECT,
  properties: {
    score: { 
      type: Type.INTEGER, 
      description: "Overall security score 0-100.",
      minimum: 0,
      maximum: 100 // Keep it between 0-100 or I'll lose my mind
    },
    summary: { 
      type: Type.STRING, 
      description: "Executive summary of the audit (max 500 chars).",
      maxLength: 500 // Because nobody reads long summaries anyway
    },
    scanMetadata: {
      type: Type.OBJECT,
      properties: {
        linesAnalyzed: { type: Type.INTEGER },
        analysisTimeMs: { type: Type.INTEGER },
        rulesApplied: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    },
    vulnerabilities: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, maxLength: 100 },
          severity: { type: Type.STRING, enum: ["Critical", "High", "Medium", "Low"] },
          lineStart: { type: Type.INTEGER, minimum: 1 }, // Lines start at 1, not 0, fight me
          lineEnd: { type: Type.INTEGER, minimum: 1 },
          description: { type: Type.STRING, maxLength: 1000 },
          risk: { type: Type.STRING, maxLength: 500 },
          attackScenario: { type: Type.STRING, maxLength: 1000 },
          fix: { type: Type.STRING, maxLength: 2000 },
          confidence: { type: Type.INTEGER, minimum: 0, maximum: 100 },
          cweId: { type: Type.STRING }, // Common Weakness Enumeration for the nerds
          owaspCategory: { type: Type.STRING } // OWASP category because standards matter
        },
        required: ["name", "severity", "lineStart", "lineEnd", "description", "risk", "attackScenario", "fix", "confidence"]
      }
    }
  },
  required: ["score", "summary", "vulnerabilities"]
};

export const scanCodeWithGemini = async (
  code: string, 
  fileName: string,
  options: { clientId?: string; skipCache?: boolean } = {}
): Promise<ScanResult> => {
  const startTime = Date.now();
  
  try {
    // Run all the boring validation stuff first
    validateInput(code, fileName);
    
    // Check if this user is being too eager
    checkRateLimit(options.clientId);
    
    // Maybe we already analyzed this exact code (because developers copy-paste a lot)
    if (!options.skipCache) {
      const cacheKey = getCacheKey(code, fileName);
      const cached = getFromCache(cacheKey);
      if (cached) {
        console.log('Returning cached result for', fileName);
        return cached; // Saved some API calls and my sanity
      }
    }

    const apiKey = getApiKey();
    const ai = new GoogleGenAI({ apiKey });

    // The magic prompt that makes Gemini pretend to be a security expert
    const enhancedSystemInstruction = `
      You are the "SecureCode AI Deep Audit Engine v3.0". You use a formal 4-pass algorithm for every file:
      
      ALGORITHM STEPS:
      1. AST & SCOPE MAPPING: Identify all variables, function scopes, and external dependencies.
      2. SOURCE-TO-SINK DATAFLOW: Trace every untrusted input (API params, file reads) to see if it reaches a sensitive "Sink" (DB query, HTML render, System Command) without validation.
      3. RULE VALIDATION: Apply OWASP Top 10 and SANS 25 rules. Check for Hardcoded Secrets, Insecure Crypto, and Logical Flaws.
      4. FALSE POSITIVE FILTER: Discard any finding that isn't exploitable in a real environment.
      
      SCORING LOGIC:
      - 100: No exploitable vulnerabilities.
      - 80-99: Minor hygiene or best practice issues.
      - 50-79: Moderate risks (High/Medium).
      - 0-49: Critical exploitable flaws (RCE, SQLi, Auth Bypass).
      
      REQUIREMENTS:
      - Be extremely precise with line numbers (1-indexed).
      - Include CWE IDs and OWASP categories where applicable.
      - Confidence scores must reflect actual certainty (avoid 100% unless absolutely certain).
      - Focus on exploitable vulnerabilities, not style issues.
      - Consider the file context and language-specific security patterns.
      
      If you fix a file, the resulting code MUST score 100 on a subsequent scan.
    `;

    const prompt = `Perform a Deep Security Audit on file: "${fileName}"
    
    File size: ${code.length} characters
    Analysis timestamp: ${new Date().toISOString()}
    
    CODE:
    ${code}`;

    // Race the AI against a timeout because sometimes it just... thinks forever
    const response = await Promise.race([
      ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          systemInstruction: enhancedSystemInstruction,
          responseMimeType: "application/json",
          responseSchema: enhancedVulnerabilitySchema,
          thinkingConfig: { thinkingBudget: 32768 } // Give it lots of thinking tokens
        }
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new SecurityAuditError(
          'Analysis timeout exceeded',
          'TIMEOUT'
        )), CONFIG.TIMEOUT_MS)
      )
    ]);

    const parsed = JSON.parse((response as any).text || "{}");
    
    // Sanity check the AI's response because it sometimes gets creative
    if (typeof parsed.score !== 'number' || parsed.score < 0 || parsed.score > 100) {
      throw new SecurityAuditError(
        'Invalid score in AI response',
        'INVALID_RESPONSE'
      );
    }

    const result: ScanResult = {
      fileName,
      code,
      score: parsed.score,
      summary: parsed.summary,
      timestamp: new Date().toISOString(),
      vulnerabilities: (parsed.vulnerabilities || []).map((v: any, i: number) => ({
        ...v,
        id: `vuln-${i}-${Date.now()}`, // Unique ID because everything needs an ID
        severity: v.severity as Severity
      }))
    };

    // Cache this result for future lazy developers
    if (!options.skipCache) {
      const cacheKey = getCacheKey(code, fileName);
      setCache(cacheKey, result);
    }

    console.log(`Analysis completed in ${Date.now() - startTime}ms`);
    return result;

  } catch (error) {
    // Handle our custom errors gracefully
    if (error instanceof SecurityAuditError) {
      throw error;
    }

    console.error("Scan Error:", error);
    
    // Try to make sense of what went wrong
    if (error instanceof SyntaxError) {
      throw new SecurityAuditError(
        'Failed to parse AI response',
        'PARSE_ERROR',
        { originalError: error.message }
      );
    }

    // Handle common API errors that I've seen a million times
    if ((error as any)?.status === 429) {
      throw new SecurityAuditError(
        'API rate limit exceeded. Please try again later.',
        'API_RATE_LIMIT'
      );
    }

    if ((error as any)?.status === 401) {
      throw new SecurityAuditError(
        'Invalid API key. Please check your GEMINI_API_KEY configuration.',
        'INVALID_API_KEY'
      );
    }

    // Generic fallback for when everything goes wrong
    throw new SecurityAuditError(
      'Audit engine failure. Please try again.',
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
};

export const fixCodeWithGemini = async (
  code: string, 
  fileName: string, 
  vulnerabilities: Vulnerability[]
): Promise<string> => {
  try {
    // Same validation dance as before
    validateInput(code, fileName);
    
    // Can't fix nothing, genius
    if (!vulnerabilities || vulnerabilities.length === 0) {
      throw new SecurityAuditError(
        'No vulnerabilities provided for fixing',
        'NO_VULNERABILITIES'
      );
    }

    const apiKey = getApiKey();
    const ai = new GoogleGenAI({ apiKey });

    // Format the vulnerabilities in a way the AI can understand
    const vulnSummary = vulnerabilities.map(v => 
      `- [${v.severity}] ${v.name} (Lines ${v.lineStart}-${v.lineEnd}): ${v.description}`
    ).join('\n');

    // Prompt the AI to be a security architect (and not break my code)
    const enhancedSystemInstruction = `
      You are a Senior Security Architect with expertise in secure coding practices.
      
      YOUR MISSION:
      1. Rewrite the code to ELIMINATE the vulnerabilities listed.
      2. USE INDUSTRY STANDARDS: (e.g., Parameterized queries, CSRF tokens, input sanitization, proper authentication).
      3. DO NOT BREAK FUNCTIONALITY: The business logic must remain 100% identical.
      4. MAINTAIN CODE STYLE: Keep the original coding style and patterns where possible.
      5. ADD SECURITY COMMENTS: Include brief comments explaining security improvements.
      6. VERIFICATION PASS: Mentally scan your output. If the "Deep Audit Engine" would find any new errors in your fix, restart the rewrite.
      7. OUTPUT: Return ONLY the clean, remediated source code. No conversational text, no markdown formatting.
      
      SECURITY PRINCIPLES TO APPLY:
      - Input validation and sanitization
      - Output encoding
      - Parameterized queries
      - Proper authentication and authorization
      - Secure cryptographic practices
      - Error handling that doesn't leak information
      - Principle of least privilege
    `;

    const prompt = `
      FILE: ${fileName}
      VULNERABILITIES TO REMEDIATE:
      ${vulnSummary}
      
      ORIGINAL SOURCE CODE:
      ${code}
      
      Please provide the secure, remediated version of this code.
    `;

    // Another timeout race because AI can get stuck thinking about security
    const response = await Promise.race([
      ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          systemInstruction: enhancedSystemInstruction,
          thinkingConfig: { thinkingBudget: 32768 }
        }
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new SecurityAuditError(
          'Fix generation timeout exceeded',
          'TIMEOUT'
        )), CONFIG.TIMEOUT_MS)
      )
    ]);

    let fixed = (response as any).text || "";
    
    // AI sometimes returns empty responses when it's confused
    if (!fixed.trim()) {
      throw new SecurityAuditError(
        'Empty response from AI',
        'EMPTY_RESPONSE'
      );
    }

    // Clean up markdown formatting because AI loves to wrap everything in code blocks
    if (fixed.includes("```")) {
      const codeBlocks = fixed.split("```");
      if (codeBlocks.length >= 3) {
        fixed = codeBlocks[1].replace(/^[a-z]+\n/i, "");
      }
    }

    const cleanedCode = fixed.trim();
    
    // Sanity check - if the fix is way shorter, something probably went wrong
    if (cleanedCode.length < code.length * 0.5) {
      throw new SecurityAuditError(
        'Generated fix appears to be incomplete',
        'INCOMPLETE_FIX'
      );
    }

    return cleanedCode;

  } catch (error) {
    if (error instanceof SecurityAuditError) {
      throw error;
    }

    console.error("Fix Error:", error);
    throw new SecurityAuditError(
      'Code remediation failed. The file structure may be too complex for auto-fix.',
      'FIX_FAILED',
      { originalError: error }
    );
  }
};

// Utility functions for when I need to debug this mess later
export const getAuditStats = () => {
  return {
    cacheSize: cacheStore.size,
    rateLimitEntries: rateLimitStore.size,
    config: CONFIG
  };
};

// Clear everything when things get weird (usually during testing)
export const clearCaches = () => {
  cacheStore.clear();
  rateLimitStore.clear();
};