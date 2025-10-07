const mongoose=require('mongoose')
const profileSchema=new mongoose.Schema({
    firstName:{
        type:String,
        trim:true,
    },
    lastName:{
        type:String,
        trim:true,
    },
    gender:{
        type:String,
    },
    dateofBirth:{
        type:Date,
    },
    about:{
        type:String,
        trim:true,
    },
    contactNo:{
        type:Number,
        trim:true,
    }

})
module.exports = mongoose.model("Profile", profileSchema)