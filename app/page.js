"use client";
import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
const AI_SUGGESTIONS = [
  "Revenue by product category last quarter",
  "Customer acquisition cost over the last 4 months",
  "Sales performance comparison across regions",
  "Top 5 products with highest profit margins",
  "Inventory analysis: Overstocked vs. low-stock products",
  "Customer satisfaction breakdown by category",
  "Which region needs the most sales improvement?",
  "Which product category generated the most revenue?",
];

const MOCK_DATA_MAP = {
  "revenue by product category last quarter": {
    data: [
      { category: "Electronics", revenue: 12000 },
      { category: "Clothing", revenue: 8000 },
      { category: "Home Goods", revenue: 5000 },
      { category: "Groceries", revenue: 7000 },
    ],
    insights: [
      "Electronics generated the highest revenue at $12,000",
      "Clothing performed well with $8,000 in revenue",
      "Home Goods had the lowest revenue at $5,000",
      "Groceries showed steady demand with $7,000 in sales",
    ],
    type: "graph",
  },
  "customer acquisition cost over the last 4 months": {
    data: [
      { month: "Jan", cac: 200 },
      { month: "Feb", cac: 180 },
      { month: "Mar", cac: 190 },
      { month: "Apr", cac: 210 },
    ],
    insights: [
      "February had the lowest CAC at $180",
      "April saw the highest CAC at $210",
      "Overall CAC trend fluctuates but remains within a $30 range",
    ],
    type: "graph",
  },
  "sales performance comparison across regions": {
    data: [
      { region: "North", sales: 15000 },
      { region: "South", sales: 10000 },
      { region: "East", sales: 12000 },
      { region: "West", sales: 13000 },
    ],
    insights: [
      "North region leads in sales with $15,000",
      "South region needs improvement at $10,000",
      "West and East regions are performing moderately well",
    ],
    type: "graph",
  },
  "top 5 products with highest profit margins": {
    data: [
      { product: "Laptop", margin: 40 },
      { product: "Smartphone", margin: 35 },
      { product: "Headphones", margin: 30 },
      { product: "Smartwatch", margin: 28 },
      { product: "Tablet", margin: 25 },
    ],
    insights: [
      "Laptops have the highest margin at 40%",
      "Smartphones follow with a 35% margin",
      "Headphones, Smartwatches, and Tablets contribute solid margins between 25-30%",
    ],
    type: "graph",
  },
  "inventory analysis: Overstocked vs. low-stock products": {
    data: [
      { status: "Optimal", count: 78 },
      { status: "Low-stock", count: 8 },
      { status: "Overstocked", count: 15 },
    ],
    insights: [
      "Inventory levels are optimal for 78% of products",
      "8 products are below safety stock levels",
      "15 products are overstocked by more than 25%",
    ],
    type: "graph",
  },
  "customer satisfaction breakdown by category": {
    data: [
      { category: "Product Quality", score: 4.5 },
      { category: "Customer Support", score: 4.6 },
      { category: "Delivery Speed", score: 3.9 },
      { category: "Pricing", score: 4.2 },
    ],
    insights: [
      "Customer Support received the highest rating at 4.6/5",
      "Delivery Speed scored the lowest at 3.9/5",
      "Overall satisfaction remains high across categories",
    ],
    type: "graph",
  },
};

export default function Dashboard() {
  const [currentQuery, setCurrentQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [queries, setQueries] = useState([]);
  const [chartType, setChartType] = useState("line");

  // Load saved queries from localStorage on component mount
  useEffect(() => {
    const savedQueries = localStorage.getItem("aiDashboardQueries");
    if (savedQueries) {
      try {
        setQueries(JSON.parse(savedQueries));
      } catch (e) {
        console.error("Failed to parse saved queries", e);
      }
    }
  }, []);

  // Save queries to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("aiDashboardQueries", JSON.stringify(queries));
  }, [queries]);

  const handleQueryChange = (e) => {
    const value = e.target.value;
    setCurrentQuery(value);
    setError(null);

    const filteredSuggestions = AI_SUGGESTIONS.filter((suggestion) =>
      suggestion.toLowerCase().includes(value.toLowerCase())
    );
    setSuggestions(filteredSuggestions);
  };

  const parseAIResponseToData = (aiResponse) => {
    try {
      // Try to parse JSON from the AI response
      const parsedData = JSON.parse(aiResponse);

      // Validate the parsed data
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        // Check if the data has the required structure
        const firstItem = parsedData[0];
        const keys = Object.keys(firstItem);

        if (keys.length >= 2) {
          const nameKey = keys[0];
          const valueKey = keys[1];

          return {
            data: parsedData.map((item) => ({
              [nameKey]: item[nameKey],
              [valueKey]: Number(item[valueKey]),
            })),
            insights: ["Data parsed successfully from AI response"],
            type: "graph",
            dataType: valueKey,
          };
        }
      }
    } catch (parseError) {
      // If JSON parsing fails, try to extract structured data from text
      const lines = aiResponse.split("\n").filter((line) => line.trim());
      const dataEntries = lines
        .map((line) => {
          const match = line.match(/([^:]+):\s*(\d+)/);
          return match
            ? { name: match[1].trim(), value: Number(match[2]) }
            : null;
        })
        .filter((entry) => entry !== null);

      if (dataEntries.length > 0) {
        return {
          data: dataEntries,
          insights: ["Data extracted from AI response text"],
          type: "graph",
          dataType: "value",
        };
      }
    }

    // If no parseable data found, return text insights
    return {
      data: null,
      insights: aiResponse.split("\n").filter((line) => line.trim()),
      type: "text",
    };
  };

  const handleQuerySubmit = async () => {
    const normalizedQuery = currentQuery.toLowerCase().trim();
    setIsLoading(true);
    setError(null);

    const newQuery = {
      query: currentQuery,
      timestamp: new Date().toLocaleString(),
      id: Date.now().toString(),
    };

    // Add new query and keep only the last 10
    setQueries((prev) => [newQuery, ...prev].slice(0, 10));

    try {
      // Check mock data first
      if (MOCK_DATA_MAP[normalizedQuery]) {
        setTimeout(() => {
          const mockData = MOCK_DATA_MAP[normalizedQuery];
          setResults({
            data: mockData.data,
            insights: mockData.insights,
            type: mockData.type,
            dataType: mockData.data
              ? Object.keys(mockData.data[0])[1]
              : "insights",
          });
          setIsLoading(false);
        }, 500);
        return;
      }

      // If not in mock data, call Gemini API
      const apiKey = "AIzaSyC_6z96oR53D0HbhGJT5NOwy8PsSC1Zf6w";
      const apiUrl =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyC_6z96oR53D0HbhGJT5NOwy8PsSC1Zf6w";
      const prompt = `
        Please help me parse the following business query into a structured JSON or clear data format:
        Query: ${currentQuery}
        
        Requirements:
        - If possible, convert the response into a JSON array of objects
        - Each object should have at least two keys: a name/category key and a numeric value key
        - If JSON is not suitable, provide clear, concise insights
        
        Example formats:
        1. [{"category":"Product A", "value":100}, {"category":"Product B", "value":150}]
        2. A list of insights about the business query
      `;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "API request failed");
      }

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

      // Parse AI response and convert to chart-compatible format
      const processedResults = parseAIResponseToData(aiResponse);
      setResults(processedResults);
    } catch (err) {
      setError(err.message);
      setResults({
        data: null,
        insights: [
          "API request failed. Unable to process query.",
          "Error details: " + err.message,
          "Please try a different query or check your input.",
        ],
        type: "text",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuery = (id, e) => {
    e.stopPropagation();
    setQueries((prev) => prev.filter((query) => query.id !== id));
  };

  const renderChart = () => {
    if (!results?.data) return null;

    const { data, dataType } = results;
    const dataKey = dataType === "value" ? "value" : dataType;
    const xAxisKey = Object.keys(data[0])[0];

    return (
      <ResponsiveContainer width="100%" height={400}>
        {chartType === "line" ? (
          <LineChart
            data={data}
            className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#d1d5db"
              className="opacity-50 transition-opacity hover:opacity-100"
            />
            <XAxis
              dataKey={xAxisKey}
              className="text-sm text-gray-700"
              axisLine={{ stroke: "#10B981" }}
              tickLine={{ stroke: "#10B981" }}
            />
            <YAxis
              className="text-sm text-gray-700"
              axisLine={{ stroke: "#10B981" }}
              tickLine={{ stroke: "#10B981" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255,255,255,0.9)",
                borderRadius: "12px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                border: "1px solid #10B981",
              }}
            />
            <Legend
              wrapperStyle={{
                paddingTop: "10px",
                color: "#4B5563",
              }}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke="#10B981"
              strokeWidth={3}
              activeDot={{
                r: 8,
                fill: "#059669",
                stroke: "#6EE7B7",
                strokeWidth: 3,
                className: "transition-all duration-300 hover:scale-110",
              }}
              className="transition-all duration-300"
            />
          </LineChart>
        ) : (
          <BarChart
            data={data}
            className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#d1d5db"
              className="opacity-50 transition-opacity hover:opacity-100"
            />
            <XAxis
              dataKey={xAxisKey}
              className="text-sm text-gray-700"
              axisLine={{ stroke: "#047857" }}
              tickLine={{ stroke: "#047857" }}
            />
            <YAxis
              className="text-sm text-gray-700"
              axisLine={{ stroke: "#047857" }}
              tickLine={{ stroke: "#047857" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255,255,255,0.9)",
                borderRadius: "12px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                border: "1px solid #047857",
              }}
            />
            <Legend
              wrapperStyle={{
                paddingTop: "10px",
                color: "#4B5563",
              }}
            />
            <Bar
              dataKey={dataKey}
              fill="#047857"
              radius={[10, 10, 0, 0]}
              className="transition-all duration-300 hover:opacity-80"
            />
          </BarChart>
        )}
      </ResponsiveContainer>
    );
  };

  const renderResults = () => {
    if (!results) return null;

    return (
      <>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-emerald-700">
            Analysis Results
          </h2>
          {results.type === "graph" && results.data && (
            <div className="flex space-x-2">
              <button
                onClick={() => setChartType("line")}
                className={`px-4 py-2 rounded-lg transition-all ${
                  chartType === "line"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                Line Chart
              </button>
              <button
                onClick={() => setChartType("bar")}
                className={`px-4 py-2 rounded-lg transition-all ${
                  chartType === "bar"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                Bar Chart
              </button>
            </div>
          )}
        </div>

        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-1">
              {currentQuery}
            </h3>
            <p className="text-gray-500 text-sm">
              Generated on {new Date().toLocaleString()}
            </p>
          </div>

          {results.type === "graph" && results.data ? (
            renderChart()
          ) : (
            <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-inner">
              <ul className="space-y-4">
                {results.insights.map((insight, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 mt-1 mr-3">
                      <svg
                        className="h-5 w-5 text-emerald-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </span>
                    <p className="text-gray-700">{insight}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto  shadow-xl rounded-xl overflow-hidden">
        <div className="bg-emerald-800 p-6 text-white">
          <h1 className="text-4xl font-semibold tracking-tight">
            Generative AI Analytics Dashboard
          </h1>
          <p className="mt-2 text-gray-200 text-lg font-light">
            Transforming Complex Business Inquiries into Strategic Insights
          </p>
        </div>

        <div className="p-6">
          <div className="mb-8">
            <div className="relative">
              <input
                type="text"
                value={currentQuery}
                onChange={handleQueryChange}
                placeholder="Ask a business question (e.g. 'Revenue by product category')..."
                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg shadow-sm"
                disabled={isLoading}
              />
              {suggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-xl overflow-hidden">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="p-3 hover:bg-emerald-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                      onClick={() => {
                        setCurrentQuery(suggestion);
                        setSuggestions([]);
                      }}
                    >
                      <div className="font-medium text-gray-800">
                        {suggestion}
                      </div>
                      <div className="text-sm text-gray-500">
                        Sample analysis
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={handleQuerySubmit}
              disabled={!currentQuery || isLoading}
              className={`mt-4 w-full p-4 rounded-lg text-white font-bold text-lg transition-all shadow-md ${
                isLoading
                  ? "bg-emerald-600"
                  : "bg-emerald-800 hover:bg-emerald-700"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Generate Insights"
              )}
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg">
              <div className="flex items-center">
                <svg
                  className="h-5 w-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p>{error}</p>
              </div>
            </div>
          )}

          <div className="mt-8">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500 mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-700">
                  Analyzing your query...
                </h3>
                <p className="text-gray-500">This may take a few moments</p>
              </div>
            ) : results ? (
              renderResults()
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-emerald-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-700 mb-2">
                  No Analysis Yet
                </h3>
                <p className="text-gray-500">
                  Enter a business question above to generate insights
                </p>
              </div>
            )}
          </div>

          <div className="mt-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-emerald-800">
                Query History
              </h2>
              {queries.length > 0 && (
                <button
                  onClick={() => setQueries([])}
                  className="text-sm text-red-500 hover:text-red-700 flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Clear All
                </button>
              )}
            </div>
            {queries.length === 0 ? (
              <div className="bg-gray-50 p-8 rounded-xl text-center border-2 border-dashed border-gray-200">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No query history
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Your analyzed queries will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {queries.map((item) => (
                  <div
                    key={item.id}
                    className="group bg-white p-4 rounded-lg border border-gray-200 hover:border-emerald-300 transition-all cursor-pointer flex justify-between items-center shadow-sm hover:shadow-md"
                    onClick={() => {
                      setCurrentQuery(item.query);
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-800 truncate">
                        {item.query}
                      </h4>
                      <p className="text-sm text-gray-500">{item.timestamp}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => handleDeleteQuery(item.id, e)}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400 group-hover:text-emerald-500 transition-colors"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
