import userModel from "../../../../DB/model/User.model.js"
import { asyncHandler } from "../../../utils/errorHandling.js";
import { compare, hash } from "../../../utils/HashAndCompare.js";
import cloudinary from '../../../utils/cloudinary.js'


//without auth fro test
export const users = asyncHandler(async(req, res, next) => {
    const users = await userModel.find()
    return res.status(200).json({message:"Done", users})
})

export const profileId = asyncHandler(async (req, res, next) => {
    const user = await userModel.find()
    return res.json({ message: "Done", user})
})

export const friendProfile = asyncHandler(async (req, res, next) => {
    const {id} = req.params
    const user = await userModel.findById(id)
    return res.json({ message: "Done", user})
})


//with auth
export const userList = asyncHandler(async(req, res, next) => {
    const users = await userModel.find({_id: {$ne: req.user._id}})
    return res.status(200).json({message:"Done", users})
})

export const profile = asyncHandler(async (req, res, next) => {
    const user = await userModel.findById(req.user._id)
    return res.json({ message: "Done", user})
})



//updat user
export const updateUser =  asyncHandler(async (req, res, next) => {
    const user = await userModel.findByIdAndUpdate(req.user._id, req.body, {new:true})
    return res.status(200).json({message: "Done", user})
}) 

//update profile picture
export const updateProfilePic =  asyncHandler(async (req, res, next) => {
    console.log(req.user);
    const user = await userModel.findById(req.user._id)
    
    const {secure_url, public_id} = await cloudinary.uploader.upload(req.file.path, {folder: `user/${req.user._id}/profile`})
    if (user.image?.public_id) {
        await cloudinary.uploader.destroy(user.image.public_id)
    }
    req.file = {secure_url, public_id}

   
    await user.updateOne(user._id, user.image = req.file)
    user.save()
    return res.status(200).json({message: "Done", user})
})



//update password
export const updatePassword = asyncHandler(async (req,res,next) => {
    const {oldPassword, newPassword} = req.body
    const user = await userModel.findById(req.user._id)
    const match = compare({plaintext: oldPassword, hashValue: user.password})
    if (!match) {
            return next(new Error('In-valid old password', {cause: 400}))
    }
    const hashPassword = hash({plaintext:newPassword})
    user.password = hashPassword;
    await user.save()
    return res.status(200).json({message: "Done"})

})

//soft delete
export const softDelete = asyncHandler(async (req, res, next) => {
    await userModel.updateOne({ _id: req.user._id }, { isDeleted: true }, {new: true})
    res.status(200).json({ message: "Done" })
})

//delete user
export const deleteUser = asyncHandler(async (req, res, next) => {
    await userModel.findByIdAndDelete(req.user._id)
    return res.status(200).json({ message: "Done"})
})

//sign out
export const signout = asyncHandler(async (req, res, next) => {
    const user = await userModel.findByIdAndUpdate(req.user._id, {isLoggedIn: false}, {new: true})
    return res.status(200).json({message: "Done", user})
})