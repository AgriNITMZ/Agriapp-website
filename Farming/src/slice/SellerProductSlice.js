
import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    loading: false,
    sellerProducts: [],
    error: null,
  };
  const sellerProductSlice = createSlice({
    name: "sellerproduct",
  initialState: initialState,
    reducers: {
      setSellerProduct: (state, action) => {
        state.sellerProducts = action.payload;
      },
      setLoading(state, value) {
        state.loading = value.payload;
      },
    },
  });
  
  export const { setSellerProduct,setLoading } = sellerProductSlice.actions;
  export default sellerProductSlice.reducer;