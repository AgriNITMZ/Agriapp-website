const mongoose=require("mongoose")

require("dotenv").config()

exports.connect=()=>{
    mongoose.connect(process.env.DATABASE_URL,{

    }).then(
        console.log("Db connection succesfull")
    )
    .catch((err)=>{
        console.log("DB Connection Issue")
        console.error(err);
        process.exit(1);
    })
}