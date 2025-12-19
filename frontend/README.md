# PRLens Frontend

## Setup Instructions

1. **Install dependencies:**
```bash
npm install --legacy-peer-deps
```

2. **Create .env file:**
```bash
cp .env.example .env
```

Edit `.env` and make sure it has:
```
REACT_APP_API_URL=http://localhost:5001
```
(Change 5001 to 5000 if your backend uses port 5000)

3. **Start the development server:**
```bash
npm start
```

The app will open at `http://localhost:3000`

## If You Get Errors

**"Module not found":**
```bash
npm install --legacy-peer-deps
```

**Tailwind not working:**
Make sure `tailwind.config.js` and `postcss.config.js` are in the frontend root directory, then restart:
```bash
npm start
```

## Tech Stack

- React 18
- React Router v6
- Axios
- Recharts
- Lucide React (icons)
- Tailwind CSS
