import React from 'react'
import { Route, Routes } from 'react-router-dom'
import AdminProducts from '../Component/Admin/Products'
import AdminDashBoard from '../Component/Admin/AdminDashBoard'
import AddNewsForm from '../Component/Admin/AddNews'
import AdminAnalyticsDashboard from '../Component/Analytics/AdminDashboard'

const AdminRoutes = () => {
  return (
   <Routes>
    <Route path='/adminProducts' element={<AdminProducts/>} />
    <Route path='/' element={<AdminDashBoard/>} />
    <Route path='/addnews' element={<AddNewsForm/>} />
    <Route path='/analytics' element={<AdminAnalyticsDashboard/>} />
   </Routes>
  )
}

export default AdminRoutes