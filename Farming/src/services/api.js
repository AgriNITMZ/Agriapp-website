const BASE_URL=process.env.REACT_APP_BASE_URL // BACKEND URL

export const endpoints={
    SENDOTP_API:BASE_URL+"/auth/sendotp",
    SIGNUP_API: BASE_URL + "/auth/signup",
    LOGIN_API: BASE_URL + "/auth/login",
    RESETPASSTOKEN_API: BASE_URL + "/auth/resetpasswordtoken",
    RESETPASSWORD_API: BASE_URL + "/auth/reset-password",
}

export const productEndpoint={
    GET_PRODUCTS_API: BASE_URL + "/products",
    GET_PRODUCT_API: BASE_URL + "/product",
    ADD_PRODUCT_API: BASE_URL + "/product/add",
    DELETE_PRODUCT_API: BASE_URL + "/product/delete",
    UPDATE_PRODUCT_API: BASE_URL + "/product/update",
    GET_PRODUCT_BY_ID_API: BASE_URL + "/products/getproductbyId/",
    GET_PRODUCT_BY_CATEGORY_API: BASE_URL + "/products/category/",
    GET_PRODUCT_LISTED_BY_SELLER_API: BASE_URL + "/products/sellerProductt/",
    GET_PRODUCT_BY_SEARCH_API: BASE_URL + "/products/search/",
    GET_PRODUCT_BY_FILTER_API: BASE_URL + "/products/filter/",
    GET_PRODUCT_BY_POPULAR_API: BASE_URL + "/products/popular",
    GET_PRODUCT_BY_RELATED_API: BASE_URL + "/products/related/",
    ADD_REVIEW_API: BASE_URL + "/product/review/add",
    GET_REVIEW_API: BASE_URL + "/product/review/",
    DELETE_REVIEW_API: BASE_URL + "/product/review/delete",
    ADD_RATING_API: BASE_URL + "/product/rating/add",
    GET_RATING_API: BASE_URL + "/product/rating/",
    DELETE_RATING_API: BASE_URL + "/product/rating/delete",
    
}
export const paymentEndpoint ={
    PRODUCT_PAYMENT_API: BASE_URL + "/order/createorder",
    PRODUCT_VERIFY_API: BASE_URL + "/",
    SEND_PAYMENT_SUCCESS_EMAIL_API: BASE_URL +"",
}