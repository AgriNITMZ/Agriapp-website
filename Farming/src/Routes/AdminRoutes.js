import React from 'react'
import { Route, Routes } from 'react-router-dom'
import AdminProducts from '../Component/Admin/Products'

const AdminRoutes = () => {
  return (
   <Routes>
    <Route path='/adminProducts' element={<AdminProducts/>} />
   </Routes>
  )
}

export default AdminRoutes