import joi from 'joi'
import { Types } from 'mongoose'


const validateObjectId = (value, helper) => {
    return Types.ObjectId.isValid(value) ? true : helper.message('In-valid objectId')
}
export const generalFields = {
    userName: joi.string().alphanum(),
    email: joi.string().email({
        minDomainSegments: 2,
        maxDomainSegments: 4,
        tlds: { allow: ['com', 'net',] }
    }).required(),
    password: joi.string().pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)).required(),
    cPassword: joi.string().required(),
    id: joi.string().custom(validateObjectId).required(),
    file: joi.object({
        size: joi.number().positive().required(),
        path: joi.string().required(),
        filename: joi.string().required(),
        destination: joi.string().required(),
        mimetype: joi.string().required(),
        encoding: joi.string().required(),
        originalname: joi.string().required(),
        fieldname: joi.string().required()

    }),
    age: joi.number().min(15).max(90),
    gender: joi.string().alphanum().valid("male", "female"),
    phone: joi.string().pattern(new RegExp(/^01[0125][0-9]{8}$/)),
    firstName: joi.string().alphanum().required(),
    lastName: joi.string().alphanum().required(),
    userBio: joi.string(),
    role: joi.string()
}

export const validation = (schema) => {
    return (req, res, next) => {
        const inputs = {...req.body, ...req.query, ...req.params}
        if (req.headers?.authorization) {
            inputs.authorization = req.headers.authorization
        }
        if (req.file) {
            inputs.image = req.file;
          } else if (req.files) {
            inputs.files = req.files;
          }
        const validationResult = schema.validate(inputs, { abortEarly: false })
        if (validationResult.error) {
            return res.status(400).json({message: "validation Err", validationResult: validationResult.error.details})
        }
        return next()
    }
}