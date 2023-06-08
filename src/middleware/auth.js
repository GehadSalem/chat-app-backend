
import userModel from '../../DB/model/User.model.js';
import { asyncHandler } from '../utils/errorHandling.js';
import { verifyToken } from '../utils/generateAndVerifyToken.js';
import { getIo } from '../utils/socket.js';


export const roles ={
    Admin: "admin",
    User: "user",
    HR: "hr"
}

export const auth = (accessRoles = []) => {
    return asyncHandler(async (req, res, next) => {
    
        const {authorization} = req.headers;
        if(!authorization || !authorization.startsWith(process.env.BEARER_TOKEN)){
            return next(new Error("In-valid Bearer key", {cause: 400}))
        }

        const token = authorization.split(process.env.BEARER_TOKEN)[1]
        if (!token) {
            return next(new Error("In-valid token", {cause: 400}))
        }
        
        const decoded = verifyToken({token})
        if (!decoded?.id) {
            return next(new Error("In-valid token payload", {cause: 400}))
        }

        const user = await userModel.findById(decoded.id)
        if (!user) {
            return next(new Error("Not register account", {cause: 401}))
        }
        if (!accessRoles.includes(user.role)) {
            return next(new Error("Not authorized account", {cause: 403}))
        }
        if (user.status != "active"){
            return next(new Error("activate your account first", {cause: 409}))
        }
        
        if (!user.isLoggedIn) {
            return next(new Error("Please sign In first", {cause: 409}))
        }
        if (user.isDeleted == true) {
            return next(new Error("Please sign In first to cancel deactivation", {cause: 409}))
        }
        req.user = user;
        return next()
    
    }) 
}
    



export const socketAuth = async(authorization, accessRoles = [], socketId) => {
    try {
        if(!authorization?.startsWith(process.env.BEARER_TOKEN)){
            getIo().to(socketId).emit('auth', 'In-valid Bearer key')
        }

        const token = authorization.split(process.env.BEARER_TOKEN)[1]
        if (!token) {
            getIo().to(socketId).emit('auth', 'In-valid token')
        }
        const decoded = verifyToken({token})
        if (!decoded?.id) {
            getIo().to(socketId).emit('auth', "In-valid payload")
        }

        const user = await userModel.findById(decoded.id).select('userName email role image status changePasswordTime socketId')
        if (!user) {
            getIo().to(socketId).emit('auth', "Not register account")
        }
        if (parseInt(user.changePasswordTime?.getTime() / 1000) > decoded.iat) {
            getIo().to(socketId).emit('auth', "expired token")
        }
        if (user.status != "active"){
            getIo().to(socketId).emit('auth', "activate your account first")
        }
        
        if (user.isLoggedIn == false) {
            getIo().to(socketId).emit('auth', "Please sign In first")
        }

        if (user.isDeleted == true) {
            getIo().to(socketId).emit('auth', "Please sign In first to cancel deactivation")
        }

        if (!accessRoles.includes(user.role)) {
            getIo().to(socketId).emit('auth', 'not authorized account')
        }
        return user;
        
    } catch (error) {
        getIo().to(socketId).emit('auth', error)
    }
}


export default auth