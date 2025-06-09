const User = require('../models/Users')
const Cart = require('../models/CartItem')
const Otp = require('../models/Otp')
const otpGenerator = require('otp-generator')
const Profile = require('../models/Profile')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


require('dotenv').config()
const mailSender = require('../utils/mailSender')
const { updatePassword } = require('../mail/passwordUpdateTamplet')

exports.SendOtp = async (req, res) => {

    try {
        const { email } = req.body;
        const user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({
                success: false,
                message: "This email is already registered. Try logging in instead."
            })
        }

        let otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        })
        console.log("generated Otp", otp)
        // let result = await Otp.findOne({ otp: otp })
        // while (result) {
        //     otp = otpGenerator.generate(6, {
        //         upperCaseAlphabets: false,
        //         lowerCaseAlphabets: false,
        //         specialChars: false
        //     })
        // }
        const otpPayload = { email, otp }
        const otpBody = await Otp.create(otpPayload)

        console.log(otpBody)
        // return response
        res.status(200).json({
            success: true,
            message: "OTP Sent Succcesfully",
            otp
        })


    } catch (error) {
        console.log("error in while creating OTP", error)
        return res.status(500).json({
            success: false,
            message: "Error while sending OTP"
        })

    }
}


// signup
exports.SignUp = async (req, res) => {
    try {
        // data fetch from request body
        const { Name,
            email,
            password,
            confirmPassword,
            otp,
            accountType
        } = req.body

        console.log("in authentication ", Name, email, password, otp, accountType, confirmPassword)
        // validate karo lo
        if (!Name || !email || !password || !confirmPassword || !otp) {
            return res.status(403).json({
                success: false,
                message: "All field are reqired."
            })
        }

        // match both password
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and Confirm Password doesn't match. Please try again..!"
            })
        }

        // check user already exists or not
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            })
        }

        // find most recent  otp for user
        const recentOtp = await Otp.find({ email }).sort({ createdAt: -1 }).limit(1)
        console.log("recent otp:-", recentOtp)
        // validate otp
        if (recentOtp.length == 0) {
            return res.status(400).json({
                success: false,
                message: "OTP not found"
            })
        } else if (otp != recentOtp[0].otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            })
        }




        // hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create the Additional Profile For User
        const profileDetails = await Profile.create({
            gender: null,
            dateofBirth: null,
            about: null,
            contactNo: null
        })
        // create entry in database
        const user = await User.create({
            Name,
            email,
            password: hashedPassword,
            accountType,
            additionalDetail: profileDetails._id,
            image: `https:api.dicebear.com/8.x/initials/svg?seed=${Name}`,
        })
        // creat cart for user
        let cart = await Cart.create({ userId: user._id });
        user.cartId = cart._id;
        await user.save();

        const payload = {
            email: user.email,
            id: user._id,
            accountType: user.accountType,
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "24h"
        })
        // Save token to user document in database
        user.token = token
        user.password = undefined


        // generate cookie and send resposnse

        const options = {
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            httpOnly: true
        }

        // return res
        return res.cookie("token", token, options).status(200).json({
            success: true,
            message: "User is register succesfully ",
            user,
            token
        })


    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "User cann't register try again"
        })
    }

}

// login

exports.Login = async (req, res) => {
    try {
        // get data from request body
        const { email, password } = req.body
        // validation of data
        if (!email || !password) {
            return res.status(403).json({
                success: false,
                message: "All field are required"
            })
        }
        // user check exist or not
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(403).json({
                success: false,
                message: "No account found with this email. Please sign up."
            })
        }

        // creat cart for user

        // Check if cart already exists before creating
        // let cart = await Cart.findOne({ userId: user._id });
        // if (!cart) {

        // }





        // password match
        if (await bcrypt.compare(password, user.password)) {
            // generate JWT TOKEN
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType,
            }

            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "24h"
            })
            // Save token to user document in database
            user.token = token
            user.password = undefined


            // generate cookie and send resposnse

            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true
            }
            return res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: "Loged in succesfully!"
            })
        }
        else {
            return res.status(401).json({
                success: false,
                message: "Incorrect Password!"
            })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Server error! Please try again later."
        })
    }
}

// get user by id

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }
        res.status(200).json({
            success: true,
            user
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Error while fetching user"
        })
    }
}
// get user by token

exports.getUserByToken = async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized Access"
            })
        }
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(payload.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }
        res.status(200).json({
            success: true,
            user
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Error while fetching user"
        })
    }
}

exports.getUserProfile = async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized Access"
            });
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(payload.id).select('_id Name email accountType image');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error while fetching user"
        });
    }
};



// update password

