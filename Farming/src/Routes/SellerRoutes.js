
import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Seller from '../Ecomerce/Seller/Seller'
import AddProduct from '../Ecomerce/Seller/Component/AddProduct'

const SellerRoutes = () => {
  return (
   <>
    <Routes>
    <Route path='/' element={<Seller/>}/>
    <Route path='/addproduct' element={<AddProduct/>}/>
    <Route path="/edit-product/:id" element={<AddProduct />} />
    </Routes>
   </>
  )
}

export default SellerRoutes