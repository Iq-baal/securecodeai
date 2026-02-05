import { GoogleGenAI, Type } from "@google/genai";
import { ScanResult, Severity, Vulnerability } from "../types";

const getApiKey = (): string => {
  const key = process.env.API_KEY;
  if (!key) return "";
  return key;
};

const vulnerabilitySchema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.INTEGER, description: "Overall security score 0-100." },
    summary: { type: Type.STRING, description: "Executive summary of the audit." },
    vulnerabilities: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          severity: { type: Type.STRING, enum: ["Critical", "High", "Medium", "Low"] },
          lineStart: { type: Type.INTEGER },
          lineEnd: { type: Type.INTEGER },
          description: { type: Type.STRING },
          risk: { type: Type.STRING },
          attackScenario: { type: Type.STRING },
          fix: { type: Type.STRING },
          confidence: { type: Type.INTEGER }
        },
        required: ["name", "severity", "lineStart", "lineEnd", "description", "risk", "attackScenario", "fix", "confidence"]
      }
    }
  },
  required: ["score", "summary", "vulnerabilities"]
};

export const scanCodeWithGemini = async (code: string, fileName: string): Promise<ScanResult> => {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `
    You are the "SecureCode AI Deep Audit Engine". You use a formal 4-pass algorithm for every file:
    
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
    
    Be extremely precise with line numbers. If you fix a file, the resulting code MUST score 100 on a subsequent scan.
  `;

  const prompt = `Perform a Deep Audit on file: "${fileName}"\n\nCODE:\n${code}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: vulnerabilitySchema,
        thinkingConfig: { thinkingBudget: 32768 } // High budget for dataflow analysis
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return {
      fileName,
      code,
      score: parsed.score,
      summary: parsed.summary,
      timestamp: new Date().toISOString(),
      vulnerabilities: (parsed.vulnerabilities || []).map((v: any, i: number) => ({
        ...v,
        id: `vuln-${i}-${Date.now()}`
      }))
    };
  } catch (error) {
    console.error("Scan Error:", error);
    throw new Error("Audit engine failure. Check API key and code format.");
  }
};

export const fixCodeWithGemini = async (code: string, fileName: string, vulnerabilities: Vulnerability[]): Promise<string> => {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const vulnSummary = vulnerabilities.map(v => `- [${v.severity}] ${v.name}: ${v.description}`).join('\n');

  const systemInstruction = `
    You are a Senior Secure Architect. You are given a file and a list of specific vulnerabilities found in it.
    
    YOUR MISSION:
    1. Rewrite the code to ELIMINATE the vulnerabilities listed.
    2. USE INDUSTRY STANDARDS: (e.g., Parameterized queries, CSRF tokens, input sanitization).
    3. DO NOT BREAK FUNCTIONALITY: The business logic must remain 100% identical.
    4. VERIFICATION PASS: Mentally scan your output. If the "Deep Audit Engine" would find any new errors in your fix, restart the rewrite.
    5. OUTPUT: Return ONLY the clean, remediated source code. No conversational text.
  `;

  const prompt = `
    FILE: ${fileName}
    VULNERABILITIES TO REMEDIATE:
    ${vulnSummary}
    
    ORIGINAL SOURCE:
    ${code}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });

    let fixed = response.text || "";
    if (fixed.includes("```")) {
      fixed = fixed.split("```")[1].replace(/^[a-z]+\n/, "");
    }
    return fixed.trim();
  } catch (error) {
    throw new Error("Remediation failed. The file structure may be too complex for auto-fix.");
  }
};