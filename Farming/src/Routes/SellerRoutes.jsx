
import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Seller from '../Ecomerce/Seller/Seller'
import AddProduct from '../Ecomerce/Seller/Component/AddProduct'
import BulkUpload from '../Ecomerce/Seller/Component/AddBulkProduct'
import SellerAnalyticsDashboard from '../Component/Analytics/SellerDashboard'
import LowStockProducts from '../Ecomerce/Seller/Component/LowStockProducts'

const SellerRoutes = () => {
  return (
   <>
    <Routes>
    <Route path='/' element={<Seller/>}/>
    <Route path='/addproduct' element={<AddProduct/>}/>
    <Route path='/bulk' element={<BulkUpload />} />
    <Route path="/edit-product/:id" element={<AddProduct />} />
    <Route path='/analytics' element={<SellerAnalyticsDashboard/>} />
    <Route path='/low-stock' element={<LowStockProducts/>} />
    </Routes>
   </>
  )
}

export default SellerRoutes