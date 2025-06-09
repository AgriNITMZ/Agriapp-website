const mongoose=require('mongoose')
const userSchema=new mongoose.Schema({
    Name:{
        type:String,
        required:true,
        trim:true,
    },
 
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        // validate:[validateEmail, 'Please enter a valid email address'],
    },
    password:{
        type:String,
        required:true,
    },
    active:{
        type:Boolean,
        default:true,
    },
    accountType:{
        type:String,
        default:'User',
        required:true,
    },
    additionalDetails:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Profile',
    },
    token:{
        type:String,
    },
    image:{
        type:String,
       required:true,
    },
    products:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:'Product'
        }
    ],
    orders:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:'Order'
        }
    ],
    cartId:[
      
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:'Product'
        }
    ],
    address:[
        {
           type: mongoose.Schema.Types.ObjectId,
           ref:'Addresses'
        }
    ],
    createdAt:{
        type:Date,
        default:Date.now(),
    }
})

module.exports=mongoose.model("User",userSchema)