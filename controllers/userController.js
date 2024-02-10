import {catchAsyncError} from '../middlewares/catchAsyncError.js'
import ErrorHandler from '../utils/errorHandler.js'
import {User} from '../models/User.js'
import cloudinary from 'cloudinary'
import getDataUri from '../utils/dataUri.js'
import crypto from 'crypto'

export const register=catchAsyncError(async(req,res,next)=>{
    const {name,email,password}=req.body
    const file=req.file

    if(!name || !email || !password || !file)
    return next(new ErrorHandler('PLease Enter all Fields',400))
    let user=await User.findOne({email})
    if (user) return next(new ErrorHandler('User already Exist',400))

    const fileUri=getDataUri(file)
    const mycloud=await cloudinary.v2.uploader.upload(fileUri.content)

    user=await User.create({
        name,email,password,
        avatar:{
            public_id:mycloud.public_id,
            url:mycloud.secure_url
        },
        })
        sendToken(res,user,'Registered Successfully',201)
})

export const login=catchAsyncError(async(req,res,next)=>{
    const {email,password}=req.body
    if( !email || !password)
    return next(new ErrorHandler('Enter all fields',400))
    const user=await User.findOne({email}).select('+password')
    if (!user) return next(new ErrorHandler('Incorrect Email or Password',401)) 
    const isMatch=await user.comparepassword(password)
    if (!isMatch) return next(new ErrorHandler('Incorrect Email or Password',401))
    sendToken(res,user,`Welcome Back,${user.name}`,200)
})

export const logout=catchAsyncError(async(req,res,next)=>{
    res.status(200).cookie('token',null,{
        expires:new Date(Date.now()),
        httpOnly:true,
        secure:true,
        sameSite:'none'
    }).json({
        success:true,
        message:'Logged out'
    })
})


export const getMyProfile=catchAsyncError(async(req,res,next)=>{
    const user=await User.findById(req.user._id)
    res.status(200).json({
        success:true,
        user,
    })
})

export const changePassword=catchAsyncError(async(req,res,next)=>{
    const {oldPassword,newPassword}=req.body
    if(!oldPassword || !newPassword) return next(new ErrorHandler("Enter All Field",400))
    const user=await User.findById(req.user._id).select("+password")
    const isMatch=await user.comparepassword(oldPassword)
    if(!isMatch) return next(new ErrorHandler('Incorrect',400))
    user.password=newPassword
    await user.save()
    res.status(200).json({
    success:true,
    message:"Password Changed Successfully"
})
})


export const updateProfile=catchAsyncError(async(req,res,next)=>{
    const{name,email}=req.body
    const user=await User.findById(req.user._id)
    if (name) user.name=name
    if (email) user.name=email
    await user.save()
    res.status(200).json({
        success:true,
        message:'Profile Updated Successfully'
    })
})


export const updateprofilepicture=catchAsyncError(async(req,res,next)=>{
    const file=req.file
    const user=await User.findById(req.user._id)
    const fileUri=getDataUri(file)
    const mycloud=await cloudinary.v2.uploader.upload(fileUri.content)
    await cloudinary.v2.uploader.destroy(user.avatar.public_id)
    user.avatar={
        public_id:mycloud.public_id,
        url:mycloud.secure_url
    }
    await user.save()
    res.status(200).json({
        success:true,
        message:'Profile Picture Updated Successfully'
    })
})


export const forgetPassword=catchAsyncError(async(req,res,next)=>{
    const {email}=req.body
    const user=await User.findOne({email})
    if(!user) return next(new ErrorHandler('user not found',400))

    const resetToken=await user.getResetToken()
    await user.save()

    const url=`${process.env.FRONTEND_URL}/resetpassword/${resetToken}`

    const message=`Click on the link to reset your password.${url}.If you have not requested,then ignore.`

    await sendEmail(user.email,'Reset Password',message)
    res.status(200).json({
        success:true,
        message:`Reset Token has been sent to ${user.email}`
    })
})

export const resetPassword=catchAsyncError(async(req,res,next)=>{
    const {token}=req.params
    const resetPasswordToken=crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')
    const user=await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{
            $gt:Date.now()
        }
    })
    if (!user)
    return next(new ErrorHandler('Token is inavlid or expire',401))
    user.password=req.body.password
    user.resetPasswordToken=undefined
    user.resetPasswordExpire=undefined

res.status(200).json({
    success:true,
    message:'Password changed successfully'
})
})
