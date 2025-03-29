"use client"
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk for API query
export const executeQuery = createAsyncThunk(
  "query/executeQuery",
  async (queryText, { rejectWithValue }) => {
    try {
      const apiKey = "AIzaSyC_6z96oR53D0HbhGJT5NOwy8PsSC1Zf6w";
      const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

      const response = await axios.post(
        `${apiUrl}?key=${apiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `You are a business analytics assistant. For the query: "${queryText}", provide a JSON response with relevant business data that can be visualized in a chart.`,
                },
              ],
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message ||
        "Query failed";
      return rejectWithValue(errorMessage);
    }
  }
);

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
      state.error = null;
    },
    submitQuery: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    setQueryResults: (state, action) => {
      state.isLoading = false;
      if (action.payload.queries) {
        state.queries = action.payload.queries;
      } else {
        state.results = action.payload;
        // Add new query to history
        const newQuery = {
          query: state.currentQuery,
          timestamp: new Date().toLocaleString(),
          id: Date.now().toString(),
        };
        state.queries = [newQuery, ...state.queries].slice(0, 10);
      }
    },
    setQueryError: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.results = {
        data: null,
        insights: [
          "API request failed. Unable to process query.",
          "Error details: " + action.payload,
          "Please try a different query or check your input.",
        ],
        type: "text",
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(executeQuery.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(executeQuery.fulfilled, (state, action) => {
        state.isLoading = false;
        const aiResponse =
          action.payload.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const processedResults = parseAIResponseToData(aiResponse);
        state.results = processedResults;
        // Add new query to history
        const newQuery = {
          query: state.currentQuery,
          timestamp: new Date().toLocaleString(),
          id: Date.now().toString(),
        };
        state.queries = [newQuery, ...state.queries].slice(0, 10);
      })
      .addCase(executeQuery.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.results = {
          data: null,
          insights: [
            "API request failed. Unable to process query.",
            "Error details: " + action.payload,
            "Please try a different query or check your input.",
          ],
          type: "text",
        };
      });
  },
});

export const { setCurrentQuery, submitQuery, setQueryResults, setQueryError } =
  querySlice.actions;
export default querySlice.reducer;
