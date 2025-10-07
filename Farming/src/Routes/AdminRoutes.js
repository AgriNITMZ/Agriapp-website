import React from 'react'
import { Route, Routes } from 'react-router-dom'
import AdminProducts from '../Component/Admin/Products'
import AdminDashBoard from '../Component/Admin/AdminDashBoard'
import AddNewsForm from '../Component/Admin/AddNews'

const AdminRoutes = () => {
  return (
   <Routes>
    <Route path='/adminProducts' element={<AdminProducts/>} />
    <Route path='/' element={<AdminDashBoard/>} />
    <Route path='/addnews' element={<AddNewsForm/>} />
   </Routes>
  )
}

export default AdminRoutes