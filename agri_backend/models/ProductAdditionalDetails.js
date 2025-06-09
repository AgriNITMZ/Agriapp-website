const mongoose=require('mongoose')
const productAdditionalDetails=new mongoose.Schema({

    result:[
        {
            type:String,
            required:true,
        }
    ],
    generalTerm:[
        {
            type:mongoose.Schema.Types.ObjectId,
           ref:"Details",
        }
    ]


})