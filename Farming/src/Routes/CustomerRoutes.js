import React from 'react'
import NavBar from '../Component/Common/NavBar'
import { Route, Routes } from 'react-router-dom'
import Product from '../Ecomerce/Pages/Product'
import Home from '../Component/HomePage/Home'
import News from '../Component/HomePage/News'
import AboutUs from '../Component/HomePage/AboutUs'

import VerifyEmail from '../Component/Common/VerifyEmail'
import ProductPage from '../Ecomerce/Pages/ProductPage'
import Contact from '../Component/HomePage/Contact'
import SignUp from '../Component/HomePage/SignUp'
import Login from '../Component/HomePage/Login'
import ForgetPassword from '../Component/HomePage/ForgetPassword'
import Footer from '../Component/Common/Footer'
import SingleItem from '../Ecomerce/Product/SingleItem'
import Cart from '../Ecomerce/Cart/Cart'

import WishList from '../Ecomerce/WishList/WishList'
import Search from '../Ecomerce/Product/Search'
import UpdatePassword from '../Component/Common/UpdatePassword'
import AddAddress from '../Ecomerce/Address/AddAdress'
import ProfileLayout from '../Ecomerce/Profile/Profile'
import ProfileInformation from '../Ecomerce/Profile/ProfileInformation'
import Address from '../Ecomerce/Profile/Address'
import Order from '../Ecomerce/Profile/Order'

import CheckoutProduct from '../Ecomerce/Checkout/CheckoutProduct'
import Server from '../Server/Server'
import PaymentCallback from '../Ecomerce/Payment/PaymentCallback'
import SingleNews from '../Component/HomePage/SingleNews'
import SingleScheme from '../Component/HomePage/SingleScheme'


const CustomerRoutes = () => {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path='/product' element={<Product />} />
        <Route path='/' element={<Home />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/login' element={<Login />} />
        <Route path='/forgot-password' element={<ForgetPassword />} />
        <Route path='/news' element={<News />} />
        <Route path='/news/:id' element={<SingleNews/>} />
        <Route path='/scheme/:id' element={<SingleScheme />} />
        <Route path='/about' element={<AboutUs />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/verifyemail' element={<VerifyEmail />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path='/product/item/:productId' element={<SingleItem/>} />
        <Route path='/product/cart' element={<Cart/>} />
        <Route path='/product/profile' element={<ProfileLayout/>} /> 
        <Route path='/product/wishlist' element={<WishList/>} />   
        <Route path='/product/search' element={<Search/>} /> 
        <Route path='/update-password/:token' element={<UpdatePassword/>} /> 
        <Route path='/add-address' element={<AddAddress/>} />
        <Route path="/product/profile/information" element={<ProfileInformation/>} />
        <Route path="/product/profile/addresses" element={<Address/>} />
        <Route path="/product/profile/orders" element={<Order/>} />
        <Route path="/product/checkout" element={<CheckoutProduct/>} />
        <Route path="/server" element={<Server/>} />
        <Route path="/payment/callback" element={<PaymentCallback/>} />

      </Routes>
      <Footer/>
    </>
  )
}

export default CustomerRoutes