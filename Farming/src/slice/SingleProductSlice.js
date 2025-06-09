import { createSlice } from '@reduxjs/toolkit';


const initialState={
  selectedProduct: null,
  loading:false,
}

const singleproductSlice = createSlice({
  name: "singleproduct",
initialState: initialState,
  reducers: {
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
    setLoading(state, value) {
      state.loading = value.payload;
    },
  },
});

export const { setSelectedProduct,setLoading } = singleproductSlice.actions;
export default singleproductSlice.reducer;