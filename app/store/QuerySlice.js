import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentQuery: "",
  results: null,
  isLoading: false,
  error: null,
  queries: [],
};

export const querySlice = createSlice({
  name: "query",
  initialState,
  reducers: {
    setCurrentQuery: (state, action) => {
      state.currentQuery = action.payload;
      state.error = null;
    },
    executeQuery: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    setQueryResults: (state, action) => {
      state.isLoading = false;
      state.error = null;

      // Ensure data stability by deep cloning and validating
      if (action.payload?.data) {
        const validatedData = {
          data: action.payload.data.map(item => ({
            label: String(item.label || '').trim(),
            value: Number(item.value)
          })).filter(item => item.label && !isNaN(item.value)),
          type: action.payload.type || 'graph',
          dataType: action.payload.dataType || 'value',
          insights: Array.isArray(action.payload.insights) ? [...action.payload.insights] : []
        };

        state.results = validatedData;

        // Add to query history if it's a new query
        if (state.currentQuery) {
          state.queries.unshift({
            id: Date.now(),
            query: state.currentQuery,
            timestamp: new Date().toLocaleString(),
            ...validatedData
          });
        }
      } else if (action.payload?.queries) {
        // Handle loading saved queries
        state.queries = action.payload.queries;
      }
    },
    setQueryError: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.results = null;
    },
  },
});

export const {
  setCurrentQuery,
  executeQuery,
  setQueryResults,
  setQueryError,
} = querySlice.actions;

export default querySlice.reducer; 