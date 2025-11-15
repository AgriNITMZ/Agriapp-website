const BASE_URL = import.meta.env.VITE_API_URL // BACKEND URL
console.log("VITE BASE_URL =", import.meta.env.VITE_API_URL);

export const endpoints = {
  SENDOTP_API: BASE_URL + "/auth/sendotp",
  SIGNUP_API: BASE_URL + "/auth/signup",
  LOGIN_API: BASE_URL + "/auth/login",
  RESETPASSTOKEN_API: BASE_URL + "/auth/resetpasswordtoken",
  RESETPASSWORD_API: BASE_URL + "/auth/reset-password",
}

export const productEndpoint = {
  GET_PRODUCTS_API: BASE_URL + "/products",
  GET_PRODUCT_API: BASE_URL + "/product",
  ADD_PRODUCT_API: BASE_URL + "/product/add",
  DELETE_PRODUCT_API: BASE_URL + "/products/product/delete/",
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
export const paymentEndpoint = {
  PRODUCT_PAYMENT_API: BASE_URL + "/order/createorder",
  PRODUCT_VERIFY_API: BASE_URL + "/",
  SEND_PAYMENT_SUCCESS_EMAIL_API: BASE_URL + "",
}

export const AdminEndpoint = {
  GET_PRODUCTS: BASE_URL + "/products/getallproduct",

}

// Address API endpoints
export const addressAPI = {
  getAll: () => `${BASE_URL}/auth/getaddress`,
  getById: (id) => `${BASE_URL}/auth/getaddress/${id}`,
  create: () => `${BASE_URL}/auth/addaddress`,
  update: (id) => `${BASE_URL}/auth/updateaddress/${id}`,
  edit: (id) => `${BASE_URL}/auth/editaddress/${id}`,
  delete: (id) => `${BASE_URL}/auth/deleteaddress/${id}`,
  setDefault: (id) => `${BASE_URL}/auth/setdefaultaddress/${id}`
};

// Analytics API endpoints
export const analyticsAPI = {
  seller: {
    overview: () => `${BASE_URL}/analytics/seller/overview`,
    products: () => `${BASE_URL}/analytics/seller/products`,
    salesTrends: () => `${BASE_URL}/analytics/seller/sales-trends`
  },
  admin: {
    platformOverview: () => `${BASE_URL}/analytics/admin/platform-overview`,
    userAnalytics: () => `${BASE_URL}/analytics/admin/user-analytics`,
    productAnalytics: () => `${BASE_URL}/analytics/admin/product-analytics`,
    revenueAnalytics: () => `${BASE_URL}/analytics/admin/revenue-analytics`
  },
  export: (type) => `${BASE_URL}/analytics/export/${type}`,
  alerts: {
    configure: () => `${BASE_URL}/analytics/alerts/configure`,
    list: () => `${BASE_URL}/analytics/alerts/list`
  }
};