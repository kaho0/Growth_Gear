"use client";

import React, { useState } from "react";
import { Provider } from "react-redux";
import { configureStore, createSlice } from "@reduxjs/toolkit";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// Redux Slice for Query Management
const querySlice = createSlice({
  name: "query",
  initialState: {
    queries: [],
    currentQuery: "",
    results: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    setCurrentQuery: (state, action) => {
      state.currentQuery = action.payload;
    },
    submitQuery: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    setQueryResults: (state, action) => {
      state.isLoading = false;
      state.results = action.payload;
      state.queries.push({
        query: state.currentQuery,
        timestamp: new Date().toLocaleString(),
      });
    },
    setQueryError: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});

// Store configuration
const store = configureStore({
  reducer: {
    query: querySlice.reducer,
  },
});

// Mock AI-powered query suggestions
const AI_SUGGESTIONS = [
  "Revenue by product category last quarter",
  "Customer acquisition cost trend",
  "Sales performance by region",
  "Top 5 products by profit margin",
];

// Mock data visualization
const mockChartData = [
  { name: "Jan", revenue: 4000, cost: 2400 },
  { name: "Feb", revenue: 3000, cost: 1398 },
  { name: "Mar", revenue: 2000, cost: 9800 },
  { name: "Apr", revenue: 2780, cost: 3908 },
  { name: "May", revenue: 1890, cost: 4800 },
  { name: "Jun", revenue: 2390, cost: 3800 },
];

const GenAIAnalyticsDashboard = () => {
  const [currentQuery, setCurrentQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [queryHistory, setQueryHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleQueryChange = (e) => {
    const value = e.target.value;
    setCurrentQuery(value);

    // AI-powered suggestions
    const filteredSuggestions = AI_SUGGESTIONS.filter((suggestion) =>
      suggestion.toLowerCase().includes(value.toLowerCase())
    );
    setSuggestions(filteredSuggestions);
  };

  const simulateQueryProcessing = () => {
    setIsLoading(true);

    // Simulate AI query processing
    setTimeout(() => {
      setIsLoading(false);
      setResults(mockChartData);
      setQueryHistory((prev) => [
        ...prev,
        {
          query: currentQuery,
          timestamp: new Date().toLocaleString(),
        },
      ]);
      setCurrentQuery("");
    }, 1500);
  };

  return (
    <Provider store={store}>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4 text-center">
            Gen AI Analytics Dashboard
          </h1>

          {/* Query Input Section */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={currentQuery}
                onChange={handleQueryChange}
                placeholder="Ask a business question..."
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {suggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-white border rounded-lg mt-1 shadow-lg">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setCurrentQuery(suggestion);
                        setSuggestions([]);
                      }}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={simulateQueryProcessing}
              disabled={!currentQuery}
              className="mt-2 w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              Generate Insights
            </button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-6">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500"></div>
              <span className="ml-3">Processing your query...</span>
            </div>
          )}

          {/* Results Visualization */}
          {results && !isLoading && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Query Results</h2>
              <LineChart width={600} height={300} data={results}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
                <Line type="monotone" dataKey="cost" stroke="#82ca9d" />
              </LineChart>
            </div>
          )}
        </div>
      </div>
    </Provider>
  );
};

export default GenAIAnalyticsDashboard;
