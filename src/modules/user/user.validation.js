import joi from 'joi'
import { generalFields } from '../../middleware/validation.js'

export const updatePassword = joi.object({
        oldPassword: generalFields.password,
        newPassword: generalFields.password.invalid(joi.ref("oldPassword")),
        cPassword: generalFields.password.valid(joi.ref("newPassword")),
        authorization: joi.string().required()
    }).required()


export const updateUser = joi.object({
    firstName: generalFields.firstName,
    lastName: generalFields.lastName,
    gender: generalFields.gender,
    age: generalFields.age,
    userBio: generalFields.userBio,
    authorization: joi.string().required()
}).required()


export const updateProfilePic = joi.object({
    image: generalFields.file,
    authorization: joi.string().required()
}).required()


export const softDelete = joi.object({
    authorization: joi.string().required()
}).required()


export const deleteUser = joi.object({
    authorization: joi.string().required()
}).required()

export const signout = joi.object({
    authorization: joi.string().required()
}).required()


// export const updateCoverPics = joi.object({
//     files: joi
//             .array()
//             .items(generalFields.file),
//     authorization: joi.string().required()
// }).required()