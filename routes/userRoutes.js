import express from 'express'
import { changePassword, forgetPassword, getMyProfile, login, logout, register, resetPassword, updateProfile, updateprofilepicture } from '../controllers/userController.js'
import singleUpload from '../middlewares/multer.js'
import {isAuthenticated} from '../middlewares/auth.js'

const router=express.Router()

router.route('/register').post(singleUpload,register)
router.route('/login').post(login)
router.route('/logout').get(logout)
router.route('/me').get(isAuthenticated,getMyProfile)
router.route('/changepassword').put(isAuthenticated,changePassword)
router.route('/updateprofile').put(isAuthenticated,updateProfile)
router.route('/updateprofilepicture').put(isAuthenticated,singleUpload,updateprofilepicture)
router.route('/forgetpassword').post(forgetPassword)
router.route('/resetpassword/:token').put(resetPassword)

export default router;