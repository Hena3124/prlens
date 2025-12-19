# PRLens Backend API

Backend API for PRLens - Pull Request Quality & Risk Analyzer

## 🚀 Features

- **GitHub OAuth Integration**: Secure authentication with GitHub
- **Risk Analysis Algorithm**: Sophisticated heuristic-based risk scoring
- **PR Analytics**: Repository-wide metrics and insights
- **Real-time Data**: Direct integration with GitHub API
- **Rate Limiting**: Protection against API abuse
- **Error Handling**: Comprehensive error management

## 📋 Prerequisites

- Node.js 16+ and npm
- GitHub OAuth App credentials

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd prlens-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your GitHub OAuth credentials:
```env
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
```

## 🔐 GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: PRLens Development
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:5000/api/auth/github/callback`
4. Copy the Client ID and Client Secret to your `.env` file

## 🏃‍♂️ Running the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Authentication
- `GET /api/auth/github` - Initiate GitHub OAuth
- `GET /api/auth/github/callback` - OAuth callback
- `GET /api/auth/verify` - Verify token
- `POST /api/auth/logout` - Logout

### Repositories
- `GET /api/repos` - Get user repositories
- `GET /api/repos/search?query=<name>` - Search repositories
- `GET /api/repos/:owner/:repo/stats` - Get repo statistics

### Pull Requests
- `GET /api/prs/:owner/:repo` - Get PRs with risk analysis
- `GET /api/prs/:owner/:repo/:pr_number` - Get detailed PR analysis
- `GET /api/prs/:owner/:repo/analytics` - Get repo-wide analytics
- `GET /api/prs/:owner/:repo/top-risky` - Get top risky PRs

## 🧮 Risk Calculation Algorithm

The risk score (0-100) is calculated using weighted factors:

1. **Size Factor (25%)**: Lines of code changed
2. **Complexity Factor (20%)**: Number of files modified
3. **Review Activity (25%)**: Comment density
4. **Staleness (15%)**: Time since last update
5. **Reviewer Count (15%)**: Number of assigned reviewers

### Risk Levels
- **0-30**: Low Risk (✓ Healthy)
- **30-50**: Medium Risk (⚠ At Risk)
- **50-70**: High Risk (⚠ Critical)
- **70-100**: Critical Risk (⛔ Immediate Attention)

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── routes/          # API routes
│   ├── services/        # Business logic (GitHub API)
│   ├── middleware/      # Custom middleware
│   ├── utils/           # Utility functions (risk calculator)
│   └── server.js        # Express app entry point
├── .env.example         # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## 🧪 Testing the API

Test health endpoint:
```bash
curl http://localhost:5000/health
```

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 5000) |
| `NODE_ENV` | Environment | No (default: development) |
| `GITHUB_CLIENT_ID` | GitHub OAuth Client ID | Yes |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth Secret | Yes |
| `GITHUB_CALLBACK_URL` | OAuth callback URL | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | No (default: http://localhost:3000) |

## 🔒 Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting (100 requests per 15 minutes)
- Input validation
- Error sanitization

## 🐛 Common Issues

**GitHub API Rate Limiting**
- GitHub allows 5,000 requests per hour for authenticated users
- Check rate limit: `GET https://api.github.com/rate_limit`

**CORS Errors**
- Ensure `FRONTEND_URL` in `.env` matches your frontend URL

## 📚 Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **HTTP Client**: Axios
- **Security**: Helmet, CORS
- **Rate Limiting**: express-rate-limit
- **Logging**: Morgan

## 🚀 Deployment

Ready to deploy to:
- Railway
- Render
- Heroku
- AWS/GCP/Azure

Remember to set environment variables in your deployment platform!

## 📄 License

MIT License - see LICENSE file for details

## 👨‍💻 Author

Built as a demonstration of full-stack development skills and understanding of software engineering workflows.
