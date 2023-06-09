import authRouter from './modules/auth/auth.router.js';
import userRouter from './modules/user/user.router.js'
import chatRouter from './modules/chat/chat.router.js'
import connectDB from '../DB/connection.js';
import cors from 'cors'
import { globalErrorHandling } from './utils/errorHandling.js';


const initApp = (app, express) => {

    app.use(cors())

    app.use(express.json({}))
    
    app.use('/auth', authRouter)
    app.use('/users', userRouter)
    app.use('/chats', chatRouter)
    app.use('/', (req, res)=>{
        return res.json({message:"welcome to chat app"})
    })
    app.use("*" , (req,res)=>{
        return res.json({message:"404 Page Not Found"})
    })

    //global error handling
    app.use(globalErrorHandling)
    // DB connection
    connectDB()

}


export default initApp