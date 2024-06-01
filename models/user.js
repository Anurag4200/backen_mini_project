const mongoose= require("mongoose")


mongoose.connect("mongodb://127.0.0.1:27017/miniProjectDB").then(()=>{
    console.log("connected to database")
})

const userSchema= new mongoose.Schema({
    name:String,
    email:String,
    password:String,
    age:Number,
    post:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"post"
    }],
    profile:{
        type:String,
        default:"profile.jpg"
    }
})

module.exports=mongoose.model("User",userSchema);
