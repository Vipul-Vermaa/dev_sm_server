import {catchAsyncError} from '../middlewares/catchAsyncError.js'
import getDataUri from '../utils/dataUri.js'
import ErrorHandler from '../utils/errorHandler.js'
import {Post} from '../models/Post.js'
import cloudinary from 'cloudinary'

export const createPost=catchAsyncError(async(req,res,next)=>{
    const {description}=req.body
    if(!description) return next(new ErrorHandler('Invalid',400))
    const file=req.file
const fileUri=getDataUri(file)
const mycloud=await cloudinary.v2.uploader.upload(fileUri.content)
await Post.create({
    description,
    image:{
        public_id:mycloud.public_id,
        url:mycloud.secure_url,
    },
})
res.status(201).json({
    success:true,
    message:'Post Created Successfully'
})
}) 



export const deletePost=catchAsyncError(async(req,res,next)=>{
    const {id}=req.params;
    const post=await Post.findById(id)
    if(!post) return next(new ErrorHandler('Not Found',404))
    await cloudinary.v2.uploader.destroy(post.image.public_id)
    await post.remove()
    res.status(200).json({
    success:true,
    message:'Post deleted'
})
})
