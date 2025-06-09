import { combineReducers } from "redux";
import authReducer from '../slice/authSlice'
import profileReducer from '../slice/profileSlice'
import cartReducer from '../slice/cartSlice'
import wishlistReducer from '../slice/wishlistSlice'
import singleproductReducer from '../slice/SingleProductSlice'
import sellerProductReducer from '../slice/SellerProductSlice'

const rootReducer=combineReducers({
    auth:authReducer,
    profile:profileReducer,
    cart:cartReducer,
    wishlist:wishlistReducer,
    singleproduct:singleproductReducer,
    sellerproduct:sellerProductReducer

})

export default rootReducer;