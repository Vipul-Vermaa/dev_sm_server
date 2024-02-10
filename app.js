import express from 'express'
import {config} from 'dotenv'
import ErrorMiddleware from './middlewares/Error.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'

config({
    path:'./config/config.env'
})
const app=express()

app.use(express.json())
app.use(
    express.urlencoded({
        extended:true,
    })
)

app.use(cookieParser())
app.use(
    cors({
        origin:process.env.FRONTEND_URL,
        credentials:true,
        methods:['GET','POST','PUT','DELETE']
    })
)

import user from './routes/userRoutes.js'
import post from './routes/postRoutes.js'

app.use('/api/v1',user)
app.use('/api/v1',post)

export default app