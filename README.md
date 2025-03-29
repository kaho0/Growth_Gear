# Growth_Gear

A Next.js-powered analytics dashboard that transforms business queries into actionable insights using AI and interactive visualizations.

## Quick Start
```bash
# Install dependencies
npm install

# Set up environment
echo "NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here" > .env.local

# Run development server
npm run dev
```

## Features
- 📊 Interactive Line/Bar charts
- 🤖 AI-powered insights (Gemini API)
- 🔍 Natural language queries
- 💾 Persistent query history
- 📱 Responsive design

## Tech Stack
- Next.js 14
- React
- Redux
- Tailwind CSS
- Recharts
- Google Gemini API

## Data Formats

### JSON Array
```json
[
  {"label": "Product A", "value": 15000},
  {"label": "Product B", "value": 25000}
]
```

### JSON Object
```json
{
  "data": [
    {"label": "Product A", "value": 15000},
    {"label": "Product B", "value": 25000}
  ],
  "insights": ["Product B shows higher revenue"],
  "type": "graph",
  "dataType": "revenue"
}
```

### CSV
```csv
label,value
Product A,15000
Product B,25000
```

## Data Types
- revenue ($)
- percentage (%)
- value (plain)
- margin (%)
- sales ($)
- score (0-100)
- count (whole)
- cac ($)
- profit ($)

## Project Structure
```
gen-ai-analytics-dashboard/
├── app/
│   ├── page.js              # Dashboard
│   └── layout.js            # Layout
├── store/
│   └── QuerySlice.js        # Redux store
└── public/                  # Assets
```

## License
MIT
