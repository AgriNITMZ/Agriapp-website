import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  AdminProducts: [],
  loading: false,
};

const adminProductSlice = createSlice({
  name: "adminProduct",
  initialState,
  reducers: {
    setAdminProduct(state, action) {
      state.AdminProducts = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
  },
});

export const { setAdminProduct, setLoading } = adminProductSlice.actions;

export default adminProductSlice.reducer;
