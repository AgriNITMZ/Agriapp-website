import toast from "react-hot-toast"
import { setLoading, setSelectedProduct } from "../../slice/SingleProductSlice"
import { apiConnector } from "../apiConnector"
import { productEndpoint } from "../api"

const{
    GET_PRODUCT_BY_ID_API,
    DELETE_PRODUCT_API

}=productEndpoint

export function getProductById(productId){
    return async(dispatch)=>{
        const toastId=toast.loading("Loading...")
        dispatch(setLoading(true))
        try{
            const response=await apiConnector("GET",`${GET_PRODUCT_BY_ID_API}${productId}`)
            
            if(!response.data.success){
                throw new Error(response.data.message)
            }
            dispatch(setSelectedProduct(response?.data?.product))
            console.log("SELECTED PRODUCT............",response?.data?.product)
        }catch(error){
            console.log("GET_PRODUCT_BY_ID_API ERROR............",error)
            toast.error("Failed to get product")
        }
        dispatch(setLoading(false))
        toast.dismiss(toastId)
    }
}

export function deleteProduct(productId){
    return async(dispatch)=>{
        const toastId=toast.loading("Loading...")
        dispatch(setLoading(true))
        try{
            const response=await apiConnector("DELETE",`${ DELETE_PRODUCT_API}${productId}`)
            
            if(!response.data.success){
                throw new Error(response.data.message)
            }
            dispatch(setSelectedProduct(response?.data?.product))
            console.log("SELECTED PRODUCT............",response?.data?.product)
        }catch(error){
            console.log("GET_PRODUCT_BY_ID_API ERROR............",error)
            toast.error("Failed to get product")
        }
        dispatch(setLoading(false))
        toast.dismiss(toastId)
    }
}