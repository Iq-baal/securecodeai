// Configuration validation and environment setup

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

  // Check for required environment variables
  const geminiApiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    errors.push('GEMINI_API_KEY is required but not set in environment variables');
  }

  // Validate API key format (basic check)
  if (geminiApiKey && !geminiApiKey.startsWith('AI')) {
    errors.push('GEMINI_API_KEY appears to have invalid format (should start with "AI")');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const getAppConfig = (): AppConfig => {
  const environment = (process.env.NODE_ENV as any) || 'development';
  
  return {
    geminiApiKey: process.env.API_KEY || process.env.GEMINI_API_KEY || '',
    environment,
    features: {
      caching: environment !== 'test',
      rateLimit: environment === 'production',
      analytics: environment === 'production'
    }
  };
};

export const logConfigStatus = (): void => {
  const validation = validateEnvironment();
  const config = getAppConfig();

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