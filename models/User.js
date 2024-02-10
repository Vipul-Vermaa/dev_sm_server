import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import validator from 'validator'
import bcrypt from 'bcrypt'

const schema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Enter Your Name"]
    },
    email:{
        type:String,
        required:[true,'Enter Your Email'],
        unique:true,
        validate:validator.isEmail,
    },
    password:{
        type:String,
        required:[true,"Enter Your Password"],
        minLength:[6,'must be 6 or more'],
        select:false,   
    },
    avatar:{
        public_id:{
            type:String,
            required:true,
        },
        url:{
            type:String,
            required:true,
        }
    }  
})

schema.pre('save',async function(next){
    if(!this.isModified('password'))return next()
    this.password=await bcrypt.hash(this.password,10)
})

schema.methods.getJWTToken=function (){
    return jwt.sign({_id:this._id},process.env.JWT_SECRET,{
        expiresIn:'10d',      
    })
}

schema.methods.comparePassword=async function(password){
    return await bcrypt.compare(password,this.password)
}

export const User=mongoose.model('User',schema)