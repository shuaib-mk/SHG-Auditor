import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Agent provider: 'meta' | 'baseten' | 'mock'
  agentProvider: (process.env.AGENT_PROVIDER || 'mock') as 'meta' | 'baseten' | 'mock',

  // Meta Model API
  meta: {
    baseUrl: process.env.META_MODEL_BASE_URL || 'https://api.meta.com/v1',
    apiKey: process.env.META_MODEL_API_KEY || '',
    voiceModel: process.env.META_VOICE_MODEL || 'muse-voice-transcribe',
    sparkModel: process.env.META_SPARK_MODEL || 'muse-spark',
  },

  // Baseten Alternative (OpenAI compatible endpoint for Muse Spark Open)
  baseten: {
    baseUrl: process.env.BASETEN_BASE_URL || 'https://bridge.baseten.co/v1',
    apiKey: process.env.BASETEN_API_KEY || '',
    modelId: process.env.BASETEN_MODEL_ID || 'meta-models/muse-spark-open-1026',
  },

  limits: {
    maxAudioSizeMb: parseInt(process.env.MAX_AUDIO_SIZE_MB || '25', 10),
    maxImageSizeMb: parseInt(process.env.MAX_IMAGE_SIZE_MB || '10', 10),
  },

  defaults: {
    savingsQuota: parseFloat(process.env.DEFAULT_SAVINGS_QUOTA || '200'),
    interestRatePercent: parseFloat(process.env.DEFAULT_INTEREST_RATE_PERCENT || '2.0'),
  }
};
