# RootED Backend

Simple LangGraph chat application for dental education.

## Quick Start (Local Development)

```bash
# 1. Create .env file
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# 2. Run locally
./scripts/local-dev.sh
```

API will be available at `http://localhost:8000`

---

## EC2 Deployment Guide

### Step 1: Launch EC2 Instance

1. Go to AWS Console → EC2 → Launch Instance
2. Choose:
   - **AMI**: Amazon Linux 2023 or Ubuntu 22.04
   - **Instance Type**: t2.micro (free tier)
   - **Storage**: 8GB gp2 (free tier)
3. Configure Security Group:
   ```
   SSH        | TCP | 22   | Your IP
   HTTP       | TCP | 80   | 0.0.0.0/0
   Custom TCP | TCP | 8000 | 0.0.0.0/0
   ```
4. Create/select key pair and launch

### Step 2: Connect to EC2

```bash
# Connect via SSH
ssh -i "your-key.pem" ec2-user@your-ec2-public-ip

# For Ubuntu:
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip
```

### Step 3: Initial Setup

```bash
# Download and run setup script
curl -O https://raw.githubusercontent.com/YOUR_REPO/backend/scripts/ec2-setup.sh
chmod +x ec2-setup.sh
./ec2-setup.sh

# Apply docker group (or logout/login)
newgrp docker
```

### Step 4: Deploy Application

```bash
# Clone your repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git /opt/rooted
cd /opt/rooted/backend

# Create environment file
cp .env.example .env
nano .env  # Add your GEMINI_API_KEY

# Make scripts executable
chmod +x scripts/*.sh

# Deploy
./scripts/deploy.sh
```

### Step 5: Verify Deployment

```bash
# Check health
curl http://localhost:8000/health

# Test chat
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!", "session_id": "test"}'
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API info |
| GET | `/health` | Health check |
| POST | `/chat` | Send message (JSON response) |
| POST | `/chat/stream` | Send message (streaming) |
| GET | `/chat/history/{session_id}` | Get chat history |
| DELETE | `/chat/history/{session_id}` | Clear chat history |

### Chat Request

```json
POST /chat
{
  "message": "What is dental caries?",
  "session_id": "user123",
  "user_id": "optional-user-id"
}
```

### Chat Response

```json
{
  "response": "Dental caries, commonly known as tooth decay...",
  "session_id": "user123",
  "message_count": 2
}
```

---

## Docker Commands

```bash
# Build
docker-compose build

# Start
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f

# Restart
docker-compose restart
```

---

## File Structure

```
backend/
├── app.py              # Main FastAPI application
├── requirements.txt    # Python dependencies
├── Dockerfile          # Docker build config
├── docker-compose.yml  # Docker Compose config
├── .env.example        # Environment template
├── scripts/
│   ├── ec2-setup.sh    # EC2 initial setup
│   ├── deploy.sh       # Deployment script
│   ├── start.sh        # Start containers
│   ├── stop.sh         # Stop containers
│   ├── logs.sh         # View logs
│   └── local-dev.sh    # Local development
└── k8s/
    └── deployment.yaml # Kubernetes config (future)
```

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEY` | Yes | - | Google Gemini API key |
| `GEMINI_MODEL` | No | gemini-1.5-flash | Model to use |

---

## Connecting from React Native App

Update your app to point to EC2:

```javascript
// config/api.js
const API_URL = __DEV__
  ? 'http://localhost:8000'
  : 'http://YOUR_EC2_PUBLIC_IP:8000';

export const sendMessage = async (message, sessionId) => {
  const response = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      session_id: sessionId,
    }),
  });
  return response.json();
};
```

---

## Troubleshooting

### Docker permission denied
```bash
sudo usermod -aG docker $USER
newgrp docker
```

### Port already in use
```bash
sudo lsof -i :8000
docker-compose down
```

### View container logs
```bash
docker-compose logs -f rooted-api
```

### Memory issues on t2.micro
The docker-compose.yml limits memory to 512MB. If you have issues:
```bash
# Check memory usage
free -m
docker stats
```
