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
import { useDispatch, useSelector } from "react-redux";
import {
  setCurrentQuery,
  executeQuery,
  setQueryResults,
  setQueryError,
} from "./store/QuerySlice";

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
      { label: "Electronics", value: 120000 },
      { label: "Clothing", value: 80000 },
      { label: "Home Goods", value: 50000 },
      { label: "Groceries", value: 70000 },
    ],
    insights: [
      "Electronics generated the highest revenue at $120,000",
      "Clothing performed well with $80,000 in revenue",
      "Home Goods had the lowest revenue at $50,000",
      "Total revenue across categories: $320,000",
    ],
    type: "graph",
    dataType: "revenue",
  },
  "which product category generated the most revenue": {
    data: [
      { label: "Electronics", value: 120000 },
      { label: "Clothing", value: 80000 },
      { label: "Home Goods", value: 50000 },
      { label: "Groceries", value: 70000 },
    ],
    insights: [
      "Electronics is the highest revenue category at $120,000",
      "Clothing is the second highest at $80,000",
      "Home Goods generated the lowest revenue at $50,000",
      "Total revenue across categories: $320,000",
    ],
    type: "graph",
    dataType: "revenue",
  },
  "customer acquisition cost over the last 4 months": {
    data: [
      { label: "January", value: 2000 },
      { label: "February", value: 500 },
      { label: "March", value: 2000 },
      { label: "April", value: 1500 },
    ],
    insights: [
      "February had the lowest CAC at $500",
      "January and March tied for highest CAC at $2,000",
      "Average CAC across months: $1,500",
    ],
    type: "graph",
    dataType: "cac",
  },
  "sales performance comparison across regions": {
    data: [
      { label: "North Region", value: 150000 },
      { label: "South Region", value: 100000 },
      { label: "East Region", value: 120000 },
      { label: "West Region", value: 130000 },
    ],
    insights: [
      "North Region leads in sales with $150,000",
      "South Region needs improvement at $100,000",
      "Total sales across regions: $500,000",
    ],
    type: "graph",
    dataType: "sales",
  },
  "top 5 products with highest profit margins": {
    data: [
      { label: "Product A", value: 40 },
      { label: "Product B", value: 35 },
      { label: "Product C", value: 30 },
      { label: "Product D", value: 28 },
      { label: "Product E", value: 25 },
    ],
    insights: [
      "Product A has the highest margin at 40%",
      "Product B follows with 35% margin",
      "Average margin across top products: 31.6%",
    ],
    type: "graph",
    dataType: "margin",
  },
  "inventory analysis: Overstocked vs. low-stock products": {
    data: [
      { label: "Optimal", value: 78 },
      { label: "Low-stock", value: 8 },
      { label: "Overstocked", value: 15 },
    ],
    insights: [
      "Inventory levels are optimal for 78% of products",
      "8 products are below safety stock levels",
      "15 products are overstocked by more than 25%",
    ],
    type: "graph",
    dataType: "count",
  },
  "customer satisfaction breakdown by category": {
    data: [
      { label: "Product Quality", value: 4.5 },
      { label: "Customer Support", value: 4.6 },
      { label: "Delivery Speed", value: 3.9 },
      { label: "Pricing", value: 4.2 },
    ],
    insights: [
      "Customer Support received the highest rating at 4.6/5",
      "Delivery Speed scored the lowest at 3.9/5",
      "Overall satisfaction remains high across categories",
    ],
    type: "graph",
    dataType: "score",
  },
};

const getXAxisLabel = (data) => {
  if (!data || data.length === 0) return "Category";

  const firstLabel = data[0]?.label?.toLowerCase() || "";
  const allLabels = data
    .map((item) => item.label?.toLowerCase())
    .filter(Boolean);

  // Check for product data first
  if (
    firstLabel.includes("product") ||
    allLabels.some((label) => label.match(/product [a-z]/i)) ||
    allLabels.every((label) => label.match(/^product\s*[a-z]/i))
  ) {
    return "Product";
  }

  // Check for time-based data
  if (
    firstLabel.includes("jan") ||
    firstLabel.includes("feb") ||
    firstLabel.includes("mar") ||
    firstLabel.includes("apr") ||
    firstLabel.includes("month") ||
    /^(january|february|march|april|may|june|july|august|september|october|november|december)$/i.test(
      firstLabel
    ) ||
    allLabels.some((label) =>
      /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(label)
    )
  ) {
    return "Month";
  }

  // Check for regional data
  if (
    firstLabel.includes("north") ||
    firstLabel.includes("south") ||
    firstLabel.includes("east") ||
    firstLabel.includes("west") ||
    firstLabel.includes("region") ||
    allLabels.some((label) => /(north|south|east|west|region)/i.test(label))
  ) {
    return "Region";
  }

  // Check for category data
  if (
    firstLabel.includes("electronics") ||
    firstLabel.includes("clothing") ||
    firstLabel.includes("category") ||
    allLabels.some((label) =>
      /(electronics|clothing|category|goods|groceries)/i.test(label)
    )
  ) {
    return "Category";
  }

  // Check for status data
  if (
    firstLabel.includes("optimal") ||
    firstLabel.includes("low-stock") ||
    firstLabel.includes("status") ||
    allLabels.some((label) =>
      /(optimal|stock|status|active|inactive)/i.test(label)
    )
  ) {
    return "Status";
  }

  // Default to Product if we detect product-like patterns
  if (allLabels.every((label) => /^[a-z\s]+\s*[a-z]$/i.test(label))) {
    return "Product";
  }

  // Fallback to Category as default
  return "Category";
};

const formatYAxisLabel = (dataType) => {
  if (!dataType) return "Value";

  // Special handling for common metrics
  const metricLabels = {
    value: "Value",
    margin: "Margin (%)",
    revenue: "Revenue ($)",
    sales: "Sales ($)",
    score: "Score",
    count: "Count",
    cac: "Customer Acquisition Cost ($)",
    profit: "Profit ($)",
  };

  return (
    metricLabels[dataType.toLowerCase()] ||
    dataType.charAt(0).toUpperCase() + dataType.slice(1)
  );
};

export default function Dashboard() {
  const dispatch = useDispatch();
  const { currentQuery, results, isLoading, error, queries } = useSelector(
    (state) => state.query
  );
  const [suggestions, setSuggestions] = useState([]);
  const [chartType, setChartType] = useState("line");

  // Memoize the chart data
  const stableData = React.useMemo(() => {
    if (!results?.data || !Array.isArray(results.data)) return null;
    return {
      data: results.data
        .map((item) => ({
          label: String(item.label || "").trim(),
          value: Number(item.value),
        }))
        .filter((item) => item.label && !isNaN(item.value)),
      dataType: results.dataType || "value",
      insights: results.insights || [],
    };
  }, [results]);

  // Load saved queries from localStorage on component mount
  useEffect(() => {
    const savedQueries = localStorage.getItem("aiDashboardQueries");
    if (savedQueries) {
      try {
        dispatch(setQueryResults({ queries: JSON.parse(savedQueries) }));
      } catch (e) {
        console.error("Failed to parse saved queries", e);
      }
    }
  }, [dispatch]);

  // Save queries to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("aiDashboardQueries", JSON.stringify(queries));
  }, [queries]);

  const renderChart = () => {
    if (!stableData?.data || stableData.data.length === 0) {
      return (
        <div className="flex items-center justify-center h-[400px] bg-gray-50 rounded-lg">
          <p className="text-gray-500">No data available</p>
        </div>
      );
    }

    const dataType = stableData.dataType;
    const needsDollarSign = ["revenue", "sales", "profit"].includes(dataType);
    const needsPercentSign = ["margin"].includes(dataType);

    const formatValue = (value) => {
      if (!value && value !== 0) return "N/A";
      if (needsDollarSign) return `$${Number(value).toLocaleString()}`;
      if (needsPercentSign) return `${Number(value)}%`;
      return Number(value).toLocaleString();
    };

    const chartProps = {
      data: stableData.data,
      margin: { top: 20, right: 30, left: 50, bottom: 40 },
    };

    return (
      <ResponsiveContainer width="100%" height={400}>
        {chartType === "line" ? (
          <LineChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              height={60}
              label={{
                value: getXAxisLabel(stableData.data),
                position: "bottom",
                offset: 0,
              }}
            />
            <YAxis
              domain={[0, "auto"]}
              tickFormatter={formatValue}
              label={{
                value: formatYAxisLabel(dataType),
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip
              formatter={(value) => [formatValue(value), ""]}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #ccc",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#047857"
              strokeWidth={2}
              dot={{ fill: "#047857", r: 4 }}
              isAnimationActive={false}
            />
          </LineChart>
        ) : (
          <BarChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              height={60}
              label={{
                value: getXAxisLabel(stableData.data),
                position: "bottom",
                offset: 0,
              }}
            />
            <YAxis
              domain={[0, "auto"]}
              tickFormatter={formatValue}
              label={{
                value: formatYAxisLabel(dataType),
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip
              formatter={(value) => [formatValue(value), ""]}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #ccc",
              }}
            />
            <Legend />
            <Bar
              dataKey="value"
              fill="#047857"
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        )}
      </ResponsiveContainer>
    );
  };

  const handleQueryChange = (e) => {
    const value = e.target.value;
    dispatch(setCurrentQuery(value));

    const filteredSuggestions = AI_SUGGESTIONS.filter((suggestion) =>
      suggestion.toLowerCase().includes(value.toLowerCase())
    );
    setSuggestions(filteredSuggestions);
  };

  const handleQuerySubmit = async () => {
    const normalizedQuery = currentQuery.toLowerCase().trim();
    dispatch(executeQuery(currentQuery));

    try {
      // First, check if the input is a direct JSON string
      if (currentQuery.startsWith("{") || currentQuery.startsWith("[")) {
        try {
          const directData = JSON.parse(currentQuery);

          // Handle array format
          if (Array.isArray(directData)) {
            const result = {
              data: directData
                .map((item) => ({
                  label: String(item.label || "").trim(),
                  value: Number(item.value),
                }))
                .filter((item) => item.label && !isNaN(item.value)),
              type: "graph",
              dataType: "value",
              insights: ["Data visualization from provided values"],
            };
            if (result.data.length > 0) {
              dispatch(setQueryResults(result));
              return;
            }
          }

          // Handle object format
          if (directData.data && Array.isArray(directData.data)) {
            const result = {
              data: directData.data
                .map((item) => ({
                  label: String(item.label || "").trim(),
                  value: Number(item.value),
                }))
                .filter((item) => item.label && !isNaN(item.value)),
              type: "graph",
              dataType: directData.dataType || "value",
              insights: Array.isArray(directData.insights)
                ? directData.insights
                : ["Data visualization from provided values"],
            };
            if (result.data.length > 0) {
              dispatch(setQueryResults(result));
              return;
            }
          }
        } catch (e) {
          console.error("JSON parse error:", e);
        }
      }

      // Check for mock data
      const mockData = MOCK_DATA_MAP[normalizedQuery];
      if (mockData) {
        dispatch(setQueryResults(mockData));
        return;
      }

      // If not direct data or mock data, use Gemini
      const apiUrl =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyC_6z96oR53D0HbhGJT5NOwy8PsSC1Zf6w";

      const prompt = `
        Generate business analytics data for visualization.
        Query: ${currentQuery}
        
        Respond with a JSON object in this exact format:
        {
          "data": [
            {"label": "Category 1", "value": 1000},
            {"label": "Category 2", "value": 2000}
          ],
          "insights": [
            "Insight 1",
            "Insight 2"
          ],
          "type": "graph",
          "dataType": "value"
        }

        Rules:
        1. Generate 4-5 data points
        2. All values must be numbers
        3. All labels must be clear text
        4. Include 2-3 insights
        5. dataType should be: revenue, sales, profit, margin, count, or score
      `;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate insights");
      }

      const responseData = await response.json();
      let aiResponse = responseData.candidates?.[0]?.content?.parts?.[0]?.text;

      // Try to extract JSON from the response if it's wrapped in other text
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiResponse = jsonMatch[0];
      }

      // Parse and validate the response
      const parsedData = JSON.parse(aiResponse);

      // Clean and validate each data point
      const cleanData = parsedData.data
        .map((item) => ({
          label: String(item.label || "").trim(),
          value: Number(item.value),
        }))
        .filter((item) => item.label && !isNaN(item.value));

      if (cleanData.length === 0) {
        throw new Error("No valid data points");
      }

      // Prepare the final result
      const result = {
        data: cleanData,
        type: "graph",
        dataType: parsedData.dataType || "value",
        insights: Array.isArray(parsedData.insights)
          ? parsedData.insights
          : ["Analysis complete"],
      };

      dispatch(setQueryResults(result));
    } catch (err) {
      console.error("Error processing query:", err);
      dispatch(setQueryError("Failed to process the query. Please try again."));
    }
  };

  const handleDeleteQuery = (id, e) => {
    e.stopPropagation();
    dispatch(
      setQueryResults({
        queries: queries.filter((query) => query.id !== id),
      })
    );
  };

  const renderResults = () => {
    if (!results) return null;

    // If we're loading or don't have data yet, show loading state
    if (isLoading || !results.data) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500 mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-700">
            Analyzing your query...
          </h3>
          <p className="text-gray-500">This may take a few moments</p>
        </div>
      );
    }

    return (
      <>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-emerald-700 font-serif">
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

          {results.type === "graph" && results.data ? renderChart() : null}

          {/* Add insights section */}
          {results.insights && results.insights.length > 0 && (
            <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
              <h4 className="text-lg font-semibold text-emerald-800 mb-2">
                Key Insights
              </h4>
              <ul className="space-y-1">
                {results.insights.map((insight, idx) => (
                  <li key={idx} className="text-gray-700 flex items-start">
                    <span className="text-emerald-500 mr-2">•</span>
                    {insight}
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-600 rounded-xl overflow-hidden shadow-2xl">
          <div className="px-8 py-12 relative overflow-hidden">
            <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-emerald-500/20 to-transparent transform -skew-x-12"></div>
            <div className="relative z-10">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                Generative AI Analytics Dashboard
              </h1>
              <p className="text-emerald-100 text-lg md:text-xl font-light max-w-2xl">
                Transform your business questions into actionable insights using
                advanced AI analytics
              </p>
              <div className="mt-6 flex items-center space-x-4 text-sm text-emerald-100">
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Real-time Analysis
                </div>
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Interactive Charts
                </div>
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  Smart Insights
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="p-6">
            {/* Quick Actions Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-emerald-800 mb-4">
                Quick Insights
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {AI_SUGGESTIONS.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      dispatch(setCurrentQuery(suggestion));
                      handleQuerySubmit();
                    }}
                    className="bg-white p-4 rounded-lg border-2 border-emerald-100 hover:border-emerald-500 
                             cursor-pointer transition-all duration-200 hover:shadow-lg group"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                        {index < 4 ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-emerald-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d={
                                index === 0
                                  ? "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                  : index === 1
                                  ? "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  : index === 2
                                  ? "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  : "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                              }
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-emerald-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                          </svg>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800 group-hover:text-emerald-700 transition-colors">
                          {suggestion}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Click to analyze
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  value={currentQuery}
                  onChange={handleQueryChange}
                  placeholder="Ask a business question or type your own query..."
                  className="w-full pl-10 p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg shadow-sm"
                  disabled={isLoading}
                />
                {suggestions.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-xl overflow-hidden">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="p-3 hover:bg-emerald-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                        onClick={() => {
                          dispatch(setCurrentQuery(suggestion));
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
                } disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] transition-transform`}
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
                  <>
                    <span className="flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      Generate Insights
                    </span>
                  </>
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
                  <p>
                    {typeof error === "object"
                      ? error.message || "An error occurred"
                      : error}
                  </p>
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
                    onClick={() => dispatch(setQueryResults({ queries: [] }))}
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
                        dispatch(setCurrentQuery(item.query));
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-800 truncate">
                          {item.query}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {item.timestamp}
                        </p>
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
    </div>
  );
}
