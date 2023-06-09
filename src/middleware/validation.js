import joi from 'joi'
import { Types } from 'mongoose'


const validateObjectId = (value, helper) => {
    return Types.ObjectId.isValid(value) ? true : helper.message('In-valid objectId')
}
export const generalFields = {
    userName: joi.string().alphanum().required(),
    email: joi.string().email({
        minDomainSegments: 2,
        maxDomainSegments: 4,
        tlds: { allow: ['com', 'net',] }
    }).required().messages({
        'any.required': 'Email is required',
        'string.email': 'Invalid email format',
    }),
    password: joi.string().pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)).required().messages({
        'any.required': 'Password is required',
        'string.pattern.base': 'Password must be at least 8 characters long and contain uppercase and lowercase letters and numbers.',
    }),
    cPassword: joi.string().required().messages({
        'any.required': 'Confirm password is required',
        'any.only': 'Passwords do not match',
    }),
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
    age: joi.number().min(18).max(90),
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
        const options = {
            abortEarly: false,
            errors: {
                wrap: {
                    label: ''
                },
                label: '',
            },
        };
        const validationResult = schema.validate(inputs, options);
        if (validationResult.error) {
            const errors = validationResult.error.details.map((err) => {
                return {
                    field: err.path[0],
                    message: err.message.replace(/['"]/g, ''),
                };
            });
            return res.status(400).json({ errors });
        }
        return next()
    }
}