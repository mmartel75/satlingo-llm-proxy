/**
 * SATLingo LLM Proxy Server - SECURE VERSION
 * 
 * Simple Express server that proxies requests to Claude and OpenAI APIs
 * to bypass CORS restrictions for admin tools.
 * 
 * SECURITY: Requires API key authentication
 * Deploy to Render.com free tier
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration - allow requests from SATLingo domains
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:4173',
    'http://localhost:5173',
    'https://satlingo.web.app',
    'https://satlingo.firebaseapp.com'
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  credentials: false
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// API Key Authentication Middleware
const API_SECRET = process.env.API_SECRET;

if (!API_SECRET) {
  console.error('❌ FATAL: API_SECRET environment variable is required');
  process.exit(1);
}

const authenticateRequest = (req, res, next) => {
  const providedKey = req.headers['x-api-key'];
  
  if (!providedKey) {
    return res.status(401).json({ 
      error: 'API key required', 
      message: 'Include X-API-Key header' 
    });
  }
  
  if (providedKey !== API_SECRET) {
    console.warn(`🚨 Unauthorized access attempt from IP: ${req.ip}`);
    return res.status(401).json({ 
      error: 'Invalid API key' 
    });
  }
  
  next();
};

// Public endpoints (no auth required)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    security: 'API key authentication enabled'
  });
});

app.get('/', (req, res) => {
  res.json({
    service: 'SATLingo LLM Proxy',
    version: '1.0.0 (Secure)',
    security: 'API key authentication required',
    endpoints: {
      '/api/claude': 'Proxy to Claude API (requires X-API-Key header)',
      '/api/openai': 'Proxy to OpenAI API (requires X-API-Key header)',
      '/health': 'Health check (public)'
    },
    usage: 'Include X-API-Key header with all /api/* requests'
  });
});

// Apply authentication to all /api/* routes
app.use('/api', authenticateRequest);

// Claude API proxy (protected)
app.post('/api/claude', async (req, res) => {
  console.log('🔵 Authenticated Claude API request received');
  
  if (!process.env.CLAUDE_API_KEY) {
    return res.status(500).json({ error: 'Claude API key not configured' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.CLAUDE_API_KEY,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Claude API error:', data);
      return res.status(response.status).json(data);
    }

    console.log('✅ Claude API request successful');
    res.json(data);
  } catch (error) {
    console.error('Claude proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// OpenAI API proxy (protected)
app.post('/api/openai', async (req, res) => {
  console.log('🟡 Authenticated OpenAI API request received');
  
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      return res.status(response.status).json(data);
    }

    console.log('✅ OpenAI API request successful');
    res.json(data);
  } catch (error) {
    console.error('OpenAI proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SATLingo LLM Proxy running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔒 Security: API key authentication enabled`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
});