import { setSellerProduct } from "../../../slice/SellerProductSlice";
import { apiConnector } from "../../apiConnector";
import toast from "react-hot-toast"
const { productEndpoint } = require("../../api");

const{
    GET_PRODUCT_LISTED_BY_SELLER_API
}=productEndpoint

export function getProductListedBySeller(token) {
    return async (dispatch) => {
      try {
        // Include the token in the headers
        const headers = {
          Authorization: `Bearer ${token}`, // Add the token here
        };
  
        // Make the API call with the token in the headers
        const response = await apiConnector(
          "GET",
          `${GET_PRODUCT_LISTED_BY_SELLER_API}`,
          null, // No body data for GET requests
          headers, // Pass the headers here
          null // No query params in this case
        );
  
        // Check if the response is successful
        if (!response.data.success) {
          throw new Error(response.data.message);
        }
  
        // Dispatch the action to update the Redux state
        dispatch(setSellerProduct(response?.data?.products));
      } catch (error) {
        console.log("GET_PRODUCT_LISTED_BY_SELLER_API ERROR............", error);
        toast.error("Failed to get product");
      }
    };
  }