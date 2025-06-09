const mongoose=require('mongoose')
const parentCategorySchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true,
    },

    image:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        trim:true,
    },
    subcategories:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category',
    }],
})

module.exports=mongoose.model('ParentCategory',parentCategorySchema)