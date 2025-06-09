const express = require('express');
const router = express.Router()
const {
    SendOtp,
    SignUp,
    Login,
    getUserById,
    getUserByToken,
    getUserProfile,
} = require("../controller/Auth");
const { createAddress, getAllAddresses, editAddress, deleteAddress, updateAddress } = require('../controller/Address');
const { auth, isUser } = require('../middleware/auth');



router.put('/updateaddress/:editingAddressId',auth,isUser,updateAddress)
  

router.post("/sendotp", SendOtp)
router.post("/signup", SignUp)
router.post("/login", Login)
router.post('/addaddress', auth,  createAddress)
router.get('/getaddress', auth,  getAllAddresses)
router.put('/editaddress/:id', auth,  editAddress)
router.delete('/deleteaddress/:id', auth, isUser, deleteAddress)


router.get('/getuserbyid/:userId', auth,  getUserById)
router.get('/getuserbytoken', auth, getUserByToken)
router.get('/getuserprofile', auth, getUserProfile)


// reset Password
const { resetPassword, resetPasswordToken } = require('../controller/ResetPassword');
router.post('/resetpassword', resetPassword),
    router.post('/resetpasswordtoken', resetPasswordToken)

module.exports = router