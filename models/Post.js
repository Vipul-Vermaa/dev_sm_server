import mongoose from 'mongoose'

const schema=new mongoose.Schema({
    description:{
        type:String,
        required:true,
    },
    image:{
        public_id:{
            type:String,
            required:true,
        },
        url:{
            type:String,
            require:true,
        },
    },
    
})

export const Post=mongoose.model('Post',schema)