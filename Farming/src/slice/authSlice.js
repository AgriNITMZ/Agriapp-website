import { createSlice } from "@reduxjs/toolkit";
const tokenFromStorage = localStorage.getItem("token");
let parsedToken = null;

if (tokenFromStorage && tokenFromStorage !== "undefined") {
  try {
    parsedToken = JSON.parse(tokenFromStorage);
  } catch (error) {
    parsedToken = tokenFromStorage;
  }
}

const initialState={
    signupData:null,
    loading:false,
    token: parsedToken,
}
const authSlice = createSlice({
    name: "auth",
    initialState: initialState,
    reducers: {
      setSignupData(state, value) {
        state.signupData = value.payload;
      },
      setLoading(state, value) {
        state.loading = value.payload;
      },
      setToken(state, value) {
        state.token = value.payload;
      },
    },
  });
  
  
  export const { setSignupData, setLoading, setToken } = authSlice.actions;
  
  export default authSlice.reducer;