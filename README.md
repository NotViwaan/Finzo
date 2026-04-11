# Finzo 🚀

**Finzo** is a modern, AI-powered financial dashboard designed to simplify bank statement analysis. It provides intelligent insights, automated categorization, and advanced fraud detection to help users take control of their digital finances with clarity and ease.

![Finzo Banner](https://images.unsplash.com/photo-1611974714851-48206138d731?q=80&w=2070&auto=format&fit=crop)

## ✨ Features

- **📊 Intelligent Dashboard**: A bird's-eye view of your financial health, including spending trends, net flow, and account balances.
- **🤖 AI Financial Advisor**: Integrated with LLMs (via Groq) to provide personalized financial advice based on your actual transaction history.
- **🛡️ Advanced Fraud Detection**: A 10-rule anomaly detection engine that flags suspicious transfers, rapid drains, and unusual payees.
- **📄 Smart Statement Parsing**: Upload your bank statements (CSV/XLSX) and watch them get instantly parsed and categorized.
- **🔒 Secure Authentication**: Robust login and signup flows powered by Firebase, with Google OAuth support.
- **🎨 Premium UI/UX**: A stunning, responsive dark-mode interface with glassmorphism, micro-animations, and dynamic data visualization.

## 🛠️ Tech Stack

- **Frontend**: HTML5, JavaScript (ES6+), Vanilla CSS (Custom Design System), TailwindCSS (Utility classes)
- **Backend**: Python (Flask)
- **Database**: Excel-based (`finzo_database.xlsx`) for lightweight portability
- **AI**: Groq API (`llama-3.3-70b-versatile`)
- **Auth**: Firebase Authentication

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.8+
- Node.js (for frontend previews)
- Groq API Key (Sign up at [Groq Console](https://console.groq.com/))

### 2. Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/finzo.git
   cd finzo
   ```

2. **Set up the backend**:
   ```bash
   cd finzo-backend
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the `finzo-backend/` directory:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```

4. **Run the Backend**:
   ```bash
   python app.py
   ```

5. **Launch the Frontend**:
   Open `pages/index.html` in your browser (or use a Live Server extension).

## 📂 Project Structure

```
finzo/
├── assets/             # Styles, scripts, and media
│   ├── css/            # Finzo custom design system
│   ├── js/             # API clients, branding, and auth logic
│   └── logo/           # Brand assets
├── finzo-backend/      # Flask API and data processing
│   ├── app.py          # Backend entry point
│   ├── database.py     # FinzoDB class and Excel logic
│   └── fraud_engine.py # Anomaly detection rules
├── pages/              # UI screens (Dashboard, Advisor, Fraud, etc.)
└── finzo_database.xlsx # Portable local database
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

*Finzo - Weaving your financial story with clarity and precision.*
