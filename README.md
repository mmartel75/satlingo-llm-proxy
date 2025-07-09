# SATLingo LLM Proxy Server

Simple Express server that proxies requests to Claude and OpenAI APIs to bypass CORS restrictions for admin tools.

## 🚀 Deployment (Render.com)

### Setup Instructions:
1. **Create Render Web Service** pointing to this repository
2. **Build Command**: `npm install`
3. **Start Command**: `npm start` 
4. **Add Environment Variables** in Render dashboard:
   - `CLAUDE_API_KEY`: Your Claude API key (sk-ant-...)
   - `OPENAI_API_KEY`: Your OpenAI API key (sk-proj-...)
   - `NODE_ENV`: `production`

### Render Configuration:
- **Branch**: `main` (or whatever you name your main branch)
- **Root Directory**: Leave blank
- **Build Command**: `npm install`
- **Start Command**: `npm start`

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Add your API keys to .env
# CLAUDE_API_KEY=sk-ant-...
# OPENAI_API_KEY=sk-proj-...

# Start development server
npm run dev
```

## 📡 API Endpoints

### Health Check
```bash
GET /health
```

### Claude API Proxy
```bash
POST /api/claude
Content-Type: application/json

{
  "model": "claude-3-5-sonnet-20241022",
  "max_tokens": 1000,
  "messages": [
    {"role": "user", "content": "Hello Claude!"}
  ]
}
```

### OpenAI API Proxy
```bash
POST /api/openai
Content-Type: application/json

{
  "model": "gpt-4o-mini",
  "messages": [
    {"role": "user", "content": "Hello OpenAI!"}
  ]
}
```

## 🔒 Security Features

- **Helmet.js**: Security headers
- **CORS**: Restricted to SATLingo domains
- **Request size limits**: 10MB max
- **Error handling**: No sensitive data exposure

## 🔧 Integration with SATLingo

The proxy URL will be: `https://your-app-name.onrender.com`

Update your SATLingo provider configurations to use:
- Claude: `https://your-app-name.onrender.com/api/claude`
- OpenAI: `https://your-app-name.onrender.com/api/openai`

## 🕐 Cold Start Expectations

**Render Free Tier**:
- Cold start: 10-20 seconds
- Stays alive: ~15 minutes after last request
- **Tip**: For batch operations, first request warms up the service

**Performance Tips**:
- Use for batch operations when possible
- Consider upgrading to paid tier ($7/month) for better performance
- Default to Gemini for frequent operations

## 📝 Usage Examples

**Test the proxy locally**:
```bash
# Start server
npm start

# Test Claude endpoint
curl -X POST http://localhost:3000/api/claude \
  -H "Content-Type: application/json" \
  -d '{"model": "claude-3-5-sonnet-20241022", "max_tokens": 100, "messages": [{"role": "user", "content": "Hello!"}]}'
```

**Use with SATLingo quality scoring**:
```bash
# Quality scoring with Claude via proxy
node scripts/run-quality-scoring.mjs --questionId 00221c00 --model claude
```

## 🎯 Next Steps

1. **Deploy to Render**: Create web service pointing to this repo
2. **Add environment variables**: Claude and OpenAI API keys
3. **Update SATLingo**: Configure proxy URLs in provider settings
4. **Test integration**: Run quality scoring with Claude/OpenAI models