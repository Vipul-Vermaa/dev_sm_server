import express  from "express";

import {isAuthenticated} from '../middlewares/auth.js'
import singleUpload from '../middlewares/multer.js'
import { createPost, deletePost } from "../controllers/postController.js";

const router=express.Router()

router.route('/createpost').post(isAuthenticated,singleUpload,createPost)

router.route('/deletepost').delete(isAuthenticated,deletePost)

export default router;