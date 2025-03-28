import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk for API query
export const executeQuery = createAsyncThunk(
  "query/executeQuery",
  async (queryText, { rejectWithValue }) => {
    try {
      const apiKey = "AIzaSyC_6z96oR53D0HbhGJT5NOwy8PsSC1Zf6w";
      const apiUrl =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

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
      return rejectWithValue(
        error.response ? error.response.data : "Query failed"
      );
    }
  }
);

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
  extraReducers: (builder) => {
    builder
      .addCase(executeQuery.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(executeQuery.fulfilled, (state, action) => {
        state.isLoading = false;
        // Process API response here
      })
      .addCase(executeQuery.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setCurrentQuery, submitQuery, setQueryResults, setQueryError } =
  querySlice.actions;
export default querySlice.reducer;
