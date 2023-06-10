
import userModel from "../../../../DB/model/User.model.js";
import { generateToken, verifyToken } from "../../../utils/generateAndVerifyToken.js";
import { compare, hash } from "../../../utils/HashAndCompare.js";
import sendEmail from '../../../utils/sendEmail.js'
import { asyncHandler } from "../../../utils/errorHandling.js";
import { nanoid } from "nanoid";

//sign up
export const signup = asyncHandler(async (req, res, next) => {
    const { firstName, lastName, email, password, username } = req.body;
    //check user
    if(await userModel.findOne({$or: [{email}, {username}]})){
        return next(new Error("Email or username exists"), {cause: 409})
    }
    
    //send email
    const token = generateToken({
        payload: {email}, 
        expiresIn: 60 * 5, 
        signature: process.env.EMAIL_TOKEN
    })
    const link = `${req.protocol}://${req.headers.host}/auth/confirmEmail/${token}`
    const rfToken = generateToken({
        payload: {email}, 
        expiresIn: 60 * 60 * 24 * 30, 
        signature: process.env.EMAIL_TOKEN
    })
    const rfLink = `${req.protocol}://${req.headers.host}/auth/reqNewEmail/${rfToken}`
    const html = `<!DOCTYPE html>
    <html>
    <head>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"></head>
    <style type="text/css">
    body{background-color: #88BDBF;margin: 0px;}
    </style>
    <body style="margin:0px;"> 
    <table border="0" width="50%" style="margin:auto;padding:30px;background-color: #F3F3F3;border:1px solid #630E2B;">
    <tr>
    <td>
    <table border="0" width="100%">
    <tr>
    <td>
    <h1>
        <img width="100px" src="https://res.cloudinary.com/ddajommsw/image/upload/v1670702280/Group_35052_icaysu.png"/>
    </h1>
    </td>
    <td>
    <p style="text-align: right;"><a href="http://localhost:4200/#/" target="_blank" style="text-decoration: none;">View In Website</a></p>
    </td>
    </tr>
    </table>
    </td>
    </tr>
    <tr>
    <td>
    <table border="0" cellpadding="0" cellspacing="0" style="text-align:center;width:100%;background-color: #fff;">
    <tr>
    <td style="background-color:#630E2B;height:100px;font-size:50px;color:#fff;">
    <img width="50px" height="50px" src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703716/Screenshot_1100_yne3vo.png">
    </td>
    </tr>
    <tr>
    <td>
    <h1 style="padding-top:25px; color:#630E2B">Email Confirmation</h1>
    </td>
    </tr>
    <tr>
    <td>
    <p style="padding:0px 100px;">
    </p>
    </td>
    </tr>
    <tr>
    <td>
    <a href="${link}" style="margin:10px 0px 30px 0px;border-radius:4px;padding:10px 20px;border: 0;color:#fff;background-color:#630E2B; ">Verify Email address</a>
    <br>
    <br>
    <hr>
    <br>
    <a href='${rfLink}'>Click me to request new confirmation your email.</a>
    </td>
    </tr>
    </table>
    </td>
    </tr>
    <tr>
    <td>
    <table border="0" width="100%" style="border-radius: 5px;text-align: center;">
    <tr>
    <td>
    <h3 style="margin-top:10px; color:#000">Stay in touch</h3>
    </td>
    </tr>
    <tr>
    <td>
    <div style="margin-top:20px;">

    <a href="${process.env.facebookLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
    <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35062_erj5dx.png" width="50px" hight="50px"></span></a>
    
    <a href="${process.env.instegram}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
    <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35063_zottpo.png" width="50px" hight="50px"></span>
    </a>
    
    <a href="${process.env.twitterLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;;color:#fff;border-radius:50%;">
    <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group_35064_i8qtfd.png" width="50px" hight="50px"></span>
    </a>

    </div>
    </td>
    </tr>
    </table>
    </td>
    </tr>
    </table>
    </body>
    </html>`
    if (!await sendEmail({to: email, subject: 'Confirm Email', html})) {
        return next(new Error('Email rejected', {cause: 400}))  
    }
    //hash password
    const hashPassword = hash({ plaintext: password })
    // Merge first and last name to create fullName
    const fullName = firstName + ' ' + lastName;
    const user = await userModel.create({ fullName, email, password: hashPassword, username})
    
    return res.status(201).json({message: "Done", user: user._id})

})

//confirm email
export const confirmEmail = asyncHandler( async (req, res, next) => {
    const {token} = req.params
    const {email} = verifyToken({token, signature: process.env.EMAIL_TOKEN})
    if (!email) {
        return next(new Error("In-valid Token Payload", {cause: 400}))
    }
    // const user = await userModel.findOneAndUpdate({ email }, {confirmEmail: true})
    if (!await userModel.findOneAndUpdate({ email }, {confirmEmail: true})) {
        return next(new Error("Not registered account", {cause: 400}))
    }
    return res.status(200).send(`<p>Email confirmed</p>`)
})

//request new email
export const reqNewEmail = asyncHandler( async (req, res, next) => {
    const {token} = req.params
    const {email} = verifyToken({token, signature: process.env.EMAIL_TOKEN})

    const newToken = generateToken({
        payload: {email}, 
        expiresIn: 60 * 2, 
        signature: process.env.EMAIL_TOKEN
    })
    const link = `${req.protocol}://${req.headers.host}/auth/confirmEmail/${newToken}`


    const rfLink = `${req.protocol}://${req.headers.host}/auth/reqNewEmail/${token}`


    const html = `<!DOCTYPE html>
        <html>
        <head>
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"></head>
        <style type="text/css">
        body{background-color: #88BDBF;margin: 0px;}
        </style>
        <body style="margin:0px;"> 
        <table border="0" width="50%" style="margin:auto;padding:30px;background-color: #F3F3F3;border:1px solid #630E2B;">
        <tr>
        <td>
        <table border="0" width="100%">
        <tr>
        <td>
        <h1>
            <img width="100px" src="https://res.cloudinary.com/ddajommsw/image/upload/v1670702280/Group_35052_icaysu.png"/>
        </h1>
        </td>
        <td>
        <p style="text-align: right;"><a href="http://localhost:4200/#/" target="_blank" style="text-decoration: none;">View In Website</a></p>
        </td>
        </tr>
        </table>
        </td>
        </tr>
        <tr>
        <td>
        <table border="0" cellpadding="0" cellspacing="0" style="text-align:center;width:100%;background-color: #fff;">
        <tr>
        <td style="background-color:#630E2B;height:100px;font-size:50px;color:#fff;">
        <img width="50px" height="50px" src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703716/Screenshot_1100_yne3vo.png">
        </td>
        </tr>
        <tr>
        <td>
        <h1 style="padding-top:25px; color:#630E2B">Email Confirmation</h1>
        </td>
        </tr>
        <tr>
        <td>
        <p style="padding:0px 100px;">
        </p>
        </td>
        </tr>
        <tr>
        <td>
        <a href="${link}" style="margin:10px 0px 30px 0px;border-radius:4px;padding:10px 20px;border: 0;color:#fff;background-color:#630E2B; ">Verify Email address</a>
        <br>
        <br>
        <hr>
        <br>
        <a href='${rfLink}'>Click me to request new confirmation your email.</a>
        </td>
        </tr>
        </table>
        </td>
        </tr>
        <tr>
        <td>
        <table border="0" width="100%" style="border-radius: 5px;text-align: center;">
        <tr>
        <td>
        <h3 style="margin-top:10px; color:#000">Stay in touch</h3>
        </td>
        </tr>
        <tr>
        <td>
        <div style="margin-top:20px;">

        <a href="${process.env.facebookLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
        <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35062_erj5dx.png" width="50px" hight="50px"></span></a>
        
        <a href="${process.env.instegram}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
        <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35063_zottpo.png" width="50px" hight="50px"></span>
        </a>
        
        <a href="${process.env.twitterLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;;color:#fff;border-radius:50%;">
        <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group_35064_i8qtfd.png" width="50px" hight="50px"></span>
        </a>

        </div>
        </td>
        </tr>
        </table>
        </td>
        </tr>
        </table>
        </body>
        </html>`
    
    if (!await sendEmail({to: email, subject: 'Confirm Email', html})) {///same!!
        return next(new Error('Email rejected', {cause: 400}))  
    }
    return res.status(200).send("<p>Please check your email</p>")
    
})


//sign in
export const signin = asyncHandler( async (req, res, next) => {
    const {email, password} = req.body
    
    const user = await userModel.findOne({email})
    if(!user){
        return next(new Error("Email not exists"), {cause: 409})
    }
    if(user.confirmEmail != true){
        return next(new Error("confirm email first"), {cause: 409})
    }
    const match = compare({
        plaintext: password,
        hashValue: user.password
    })
    if (!match) {
        return next(new Error("email or password invalid"), {cause: 409})
    }
    // if (user.isDeleted) {
    //     user.isDeleted = false;
    //     await user.save()
    //     return res.status(200).json({message: "Welcome Back!", token})
    // }
    const token = generateToken({
        payload:{id:user._id, isLoggedIn:true, role:user.role},
        expiresIn: 60 * 60 * 24 * 30
    })
    user.status = "active";
    user.isLoggedIn = true;
    
    await user.save()
    return res.status(200).json({message: "Done", token})
})

// forget password send email code
export const resetPassword = asyncHandler(async (req, res, next) => {
    const {email} = req.body
    //check user
    const user = await userModel.findOne({email})
    if(!user){
        return next(new Error("Email not exists"), {cause: 409})
    }
    if (!user.confirmEmail) {
        return next(new Error("please confirm your email first"), {cause: 409})
    }
    //generate & send code
    const code = nanoid(6)
    await userModel.updateOne({ _id: user._id }, { code })
    const html = `<!DOCTYPE html>
    <html>
    <head>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"></head>
    <style type="text/css">
    body{background-color: #88BDBF;margin: 0px;}
    </style>
    <body style="margin:0px;"> 
    <table border="0" width="50%" style="margin:auto;padding:30px;background-color: #F3F3F3;border:1px solid #630E2B;">
    <tr>
    <td>
    <table border="0" width="100%">
    <tr>
    <td>
    <h1>
        <img width="100px" src="https://res.cloudinary.com/ddajommsw/image/upload/v1670702280/Group_35052_icaysu.png"/>
    </h1>
    </td>
    <td>
    <p style="text-align: right;"><a href="http://localhost:4200/#/" target="_blank" style="text-decoration: none;">View In Website</a></p>
    </td>
    </tr>
    </table>
    </td>
    </tr>
    <tr>
    <td>
    <table border="0" cellpadding="0" cellspacing="0" style="text-align:center;width:100%;background-color: #fff;">
    <tr>
    <td style="background-color:#630E2B;height:100px;font-size:50px;color:#fff;">
    <img width="50px" height="50px" src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703716/Screenshot_1100_yne3vo.png">
    </td>
    </tr>
    <tr>
    <td>
    <h1 style="padding-top:25px; color:#630E2B">Reset Your Password</h1>
    </td>
    </tr>
    <tr>
    <td>
    <p style="padding:0px 100px;">
    </p>
    </td>
    </tr>
    <tr style="justify-content: center; display: flex;">
    <td>
    <p style="border-radius:4px;padding:10px 20px;border: 0;color:#fff;background-color:#630E2B; ">Reset Code: ${code}</p>
    <br>
    
    </td>
    </tr>
    </table>
    </td>
    </tr>
    <tr>
    <td>
    <table border="0" width="100%" style="border-radius: 5px;text-align: center;">
    <tr>
    <td>
    <h3 style="margin-top:10px; color:#000">Stay in touch</h3>
    </td>
    </tr>
    <tr>
    <td>
    <div style="margin-top:20px;">

    <a href="${process.env.facebookLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
    <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35062_erj5dx.png" width="50px" hight="50px"></span></a>
    
    <a href="${process.env.instegram}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
    <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35063_zottpo.png" width="50px" hight="50px"></span>
    </a>
    
    <a href="${process.env.twitterLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;;color:#fff;border-radius:50%;">
    <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group_35064_i8qtfd.png" width="50px" hight="50px"></span>
    </a>

    </div>
    </td>
    </tr>
    </table>
    </td>
    </tr>
    </table>
    </body>
    </html>`

    if (!await sendEmail({to: email, subject: 'Reset Your Passwprd', html})) { 
        return next(new Error('Email rejected', {cause: 400}))  
    }
    return res.status(201).json({message: "Done"})
}) 

//get code and update password
export const changePassword = asyncHandler(async (req, res, next) => {
    const { email, code, newPassword } = req.body;
    const user = await userModel.findOne({ email })
    if(!user){
        return next(new Error("Email not exists"), {cause: 409})
    }
    if (!user.code == code) {
        return next(new Error("In-valid reset code"), {cause: 409})
    }
    if (!compare({plaintext: newPassword, hashValue: 'user.password'})) {
        return next(new Error('new password must not equal for old password', {cause: 400}))
    }
    const hashPassword = hash({plaintext:newPassword})
    await user.updateOne({password: hashPassword, code}, {new: true})
    return res.status(200).json({message: "Done" , user}) 

})

