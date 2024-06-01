const mongoose= require("mongoose")


const postSchema= new mongoose.Schema({
    postData:String,
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    likes:[{
        type:mongoose.Schema.Types.ObjectId,
        
    }]
    
})

module.exports=mongoose.model("Post",postSchema);
