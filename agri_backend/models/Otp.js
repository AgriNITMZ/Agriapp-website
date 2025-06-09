const mongoose = require('mongoose')
const mailSender = require("../utils/mailSender")
const emailTemplate = require("../mail/otpVerificationTemplet")

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 5 * 60  // The document will be automatically deleted after 5 minutes of its creation time
    }

})

// send mail
async function sendVerificationmail(email, otp) {
    try {
        // Create a transporter to send emails

        // Define the email options
        const mailResponse = await mailSender(email, "PreciAgri - Verification Code", emailTemplate(otp));
        console.log("Email Sent Succesfully", mailResponse);
    } catch (error) {
        console.log("Error occour at sending email")
        console.log(error)
    }
}

otpSchema.pre('save', async function (next) {
    await sendVerificationmail(this.email, this.otp)
    next();
})


module.exports = mongoose.model("OTP", otpSchema)