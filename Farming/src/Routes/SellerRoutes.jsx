
import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Seller from '../Ecomerce/Seller/Seller'
import AddProduct from '../Ecomerce/Seller/Component/AddProduct'
import BulkUpload from '../Ecomerce/Seller/Component/AddBulkProduct'
import SellerAnalyticsDashboard from '../Component/Analytics/SellerDashboard'

const SellerRoutes = () => {
  return (
   <>
    <Routes>
    <Route path='/' element={<Seller/>}/>
    <Route path='/addproduct' element={<AddProduct/>}/>
    <Route path='/bulk' element={<BulkUpload />} />
    <Route path="/edit-product/:id" element={<AddProduct />} />
    <Route path='/analytics' element={<SellerAnalyticsDashboard/>} />
    </Routes>
   </>
  )
}

export default SellerRoutes