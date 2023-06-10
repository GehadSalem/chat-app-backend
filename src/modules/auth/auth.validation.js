import joi from 'joi'
import {generalFields} from '../../middleware/validation.js'
export const signup = joi.object({
        firstName: generalFields.firstName,
        lastName: generalFields.lastName,
        email: generalFields.email,
        password: generalFields.password,
        cPassword: generalFields.cPassword.valid(joi.ref('password')),
        phone: generalFields.phone,
        userName: generalFields.userName
    
    }).required()



export const signin =  joi.object({
        email: generalFields.email,
        password: generalFields.password,
    }).required()

export const resetPassword = joi.object({
        email: generalFields.email
    }).required()

export const changePassword = joi.object({
        email: generalFields.email,
        newPassword: generalFields.password,
        cNewPassword: generalFields.cPassword.valid(joi.ref('newPassword')),
        code: joi.string().min(6).max(6)
    }).required()