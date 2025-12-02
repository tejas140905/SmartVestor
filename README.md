# SmartVestor India 🇮🇳

> AI-powered investment advisory platform specifically designed for the Indian market

SmartVestor is a full-stack web application that provides personalized investment recommendations across multiple asset classes (stocks, mutual funds, ETFs, crypto, and real estate) based on user goals, budget, and risk appetite.

## 🚀 Features

- **Personalized Investment Recommendations**: Get tailored advice based on your financial goals, monthly budget, and risk tolerance
- **Multi-Language Support**: Available in English, Hindi (हिंदी), and Hinglish
- **AI Assistant**: Interactive chatbot to answer investment-related questions
- **Plan Management**: Save and manage your investment plans
- **Export Options**: Download recommendations as PDF, share via email or WhatsApp
- **Indian Market Focus**: SEBI-compliant recommendations with Indian platforms and tax information

## 🏗️ Project Structure

```
SmartVestor/
├── backend/              # Node.js/Express backend
│   ├── server.js        # Main server file
│   ├── data/            # JSON data storage
│   └── package.json     # Backend dependencies
├── client/              # React frontend
│   ├── src/            # React source code
│   ├── public/          # Public assets
│   └── package.json     # Frontend dependencies
├── docs/                # Documentation
│   └── INTERVIEW_PREPARATION.md
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## 🛠️ Tech Stack

### Frontend
- **React** 18.2.0
- **React Router DOM** v7.9.2
- **Tailwind CSS** v3.4.13
- **html2canvas** & **jsPDF** for PDF export

### Backend
- **Node.js**
- **Express.js** v5.1.0
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** & **body-parser** middleware

### Development Tools
- **Concurrently** for running frontend and backend
- **Nodemon** for auto-restart
- **PostCSS** & **Autoprefixer**

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SmartVestor
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```
   
   Or install manually:
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. **Create environment file (optional)**
   ```bash
   # Create .env file in root directory
   JWT_SECRET=your_secret_key_here
   PORT=5000
   ```

## 🚀 Running the Application

### Development Mode

Run both frontend and backend concurrently:
```bash
npm run dev
```

Or run separately:

**Backend only:**
```bash
npm run server
# or
cd backend && npm run dev
```

**Frontend only:**
```bash
npm run client
# or
cd client && npm start
```

### Production Mode

1. **Build the frontend:**
   ```bash
   cd client
   npm run build
   ```

2. **Start the server:**
   ```bash
   npm start
   # or
   cd backend && npm start
   ```

The server will serve the React build from `client/build` in production mode.

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/google-demo` - Demo Google sign-in

### Investment
- `POST /api/recommend` - Generate investment recommendations
- `POST /api/plans` - Save investment plan (protected)
- `GET /api/plans` - Get user's saved plans (protected)

### AI Assistant
- `POST /api/ai-assistant` - Get AI response to investment questions

### Health Check
- `GET /api/health` - Server health check

## 📝 Usage

1. **Get Started**: Visit the homepage and click "Get started"
2. **Fill Investment Form**: Enter your financial goals, monthly budget, risk appetite, currency, and language preference
3. **View Recommendations**: Review personalized investment recommendations across 5 asset classes
4. **Save Plans**: Create an account to save your investment plans
5. **Ask AI Assistant**: Get answers to investment-related questions
6. **Export & Share**: Download PDF or share via email/WhatsApp

## 🔐 Authentication

The application uses JWT-based authentication:
- Tokens are stored in localStorage
- Token expiration: 7 days
- Protected routes require Bearer token in Authorization header

## 📊 Data Storage

Currently uses file-based JSON storage (`backend/data/smartvestor.json`). This can be easily migrated to a database (MongoDB, PostgreSQL) when needed.

## 🌍 Supported Languages

- **English** - Full support
- **Hindi (हिंदी)** - Full support
- **Hinglish** - Full support

## 🎯 Asset Classes Covered

1. **Stocks** - Nifty 50, mid-cap, small-cap
2. **Mutual Funds** - Large-cap, ELSS, Balanced funds
3. **ETFs** - Nifty 50 ETF, Sensex ETF, Bank Nifty ETF
4. **Cryptocurrency** - Indian exchanges (WazirX, CoinDCX)
5. **Real Estate** - Metro cities, REITs

## 🔒 Security Features

- Password hashing with bcryptjs (10 salt rounds)
- JWT token-based authentication
- Protected API routes
- CORS configuration
- Input validation

## 📚 Documentation

For detailed technical documentation and interview preparation guide, see:
- [Interview Preparation Guide](./docs/INTERVIEW_PREPARATION.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

ISC

## 👨‍💻 Author

SmartVestor Development Team

## 🙏 Acknowledgments

- Indian investment platforms (Zerodha, Groww, etc.)
- SEBI regulations and compliance
- Indian tax system (LTCG, STCG, Section 80C)

---

**Made with ❤️ for Indian investors**

