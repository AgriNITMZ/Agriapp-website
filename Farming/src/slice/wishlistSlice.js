import { createSlice } from "@reduxjs/toolkit";
import{toast} from 'react-hot-toast'
const initialState = {
    wishlist: localStorage.getItem("wishlist")
      ? JSON.parse(localStorage.getItem("wishlist"))
      : [],
    total: localStorage.getItem("total")
      ? JSON.parse(localStorage.getItem("total"))
      : 0,
    totalItems: localStorage.getItem("totalItems")
      ? JSON.parse(localStorage.getItem("totalItems"))
      : 0,
  }
  
  const wishlistSlice = createSlice({
    name: "wishlist",
    initialState,
    reducers: {
      addTowishlist: (state, action) => {
        const product = action.payload
        const index = state.wishlist.findIndex((item) => item._id === product._id)
  
        if (index >= 0) {
          // If the product is already in the cart, do not modify the quantity
          toast.error("Product already in cart")
          return
        }
        // If the course is not in the cart, add it to the cart
        state.wishlist.push(product)
        // Update the total quantity and price
        state.totalItems++
        // state.total += wishlist.price
        // Update to localstorage
        localStorage.setItem("wishlist", JSON.stringify(state.wishlist))
        localStorage.setItem("total", JSON.stringify(state.total))
        localStorage.setItem("totalItems", JSON.stringify(state.totalItems))
        // show toast
        toast.success("Product added to wishlist")
      },
      removeFromWishlist: (state, action) => {
        const productId = action.payload
        console.log("productId", productId)
        const index = state.wishlist.findIndex((item) => item._id === productId)
  
        if (index >= 0) {
          // If the product is found in the wishlist, remove it
          state.totalItems--
          state.total -= state.wishlist[index].price
          state.wishlist.splice(index, 1)
          // Update to localstorage
          localStorage.setItem("wishlist", JSON.stringify(state.wishlist))
          localStorage.setItem("total", JSON.stringify(state.total))
          localStorage.setItem("totalItems", JSON.stringify(state.totalItems))
          // show toast
          toast.success("Product removed from wishlist")
        }
      },
      resetWishlist: (state) => {
        state.wishlist = []
        state.total = 0
        state.totalItems = 0
        // Update to localstorage
        localStorage.removeItem("wishlist")
        localStorage.removeItem("total")
        localStorage.removeItem("totalItems")
      },
    },
  })
  
  export const { addTowishlist, removeFromWishlist, resetWishlist } = wishlistSlice.actions
  
  export default wishlistSlice.reducer
