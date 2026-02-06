// Config validation for when things inevitably break at 3am
// Vite uses import.meta.env, not process.env - learned that the hard way

export interface AppConfig {
  geminiApiKey: string;
  environment: 'development' | 'production' | 'test';
  features: {
    caching: boolean;
    rateLimit: boolean;
    analytics: boolean;
  };
}

export const validateEnvironment = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Vite needs VITE_ prefix or it won't work
  const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!geminiApiKey) {
    errors.push('VITE_GEMINI_API_KEY is required but not set in environment variables');
  }

  // Gemini keys start with "AI" - if yours doesn't, something's wrong
  if (geminiApiKey && !geminiApiKey.startsWith('AI')) {
    errors.push('VITE_GEMINI_API_KEY appears to have invalid format (should start with "AI")');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const getAppConfig = (): AppConfig => {
  const environment = (import.meta.env.MODE as any) || 'development';
  
  return {
    geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
    environment,
    features: {
      caching: environment !== 'test', // Cache everything except tests
      rateLimit: environment === 'production', // Only rate limit in prod to avoid annoying myself
      analytics: environment === 'production' // Only track real users
    }
  };
};

export const logConfigStatus = (): void => {
  const validation = validateEnvironment();
  const config = getAppConfig();

  // Pretty console output so I know what's going on
  console.log('🔧 SecureCode AI Configuration Status:');
  console.log(`   Environment: ${config.environment}`);
  console.log(`   API Key: ${config.geminiApiKey ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   Caching: ${config.features.caching ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`   Rate Limiting: ${config.features.rateLimit ? '✅ Enabled' : '❌ Disabled'}`);
  
  if (!validation.isValid) {
    console.error('❌ Configuration Issues:');
    validation.errors.forEach(error => console.error(`   - ${error}`));
  } else {
    console.log('✅ Configuration is valid');
  }
};
