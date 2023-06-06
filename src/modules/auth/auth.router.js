import {Router} from 'express'
import * as authController from  './controller/auth.js'
import { validation } from '../../middleware/validation.js';
import * as validators from './auth.validation.js'
const router = Router();


router.post('/signup', validation(validators.signup) , authController.signup)

router.get("/confirmEmail/:token", authController.confirmEmail)
router.get("/reqNewEmail/:token", authController.reqNewEmail)


router.post('/signin', validation(validators.signin) , authController.signin)


router.get("/resetPassword", validation(validators.resetPassword), authController.resetPassword) //req for code
router.put("/resetPassword", validation(validators.changePassword), authController.changePassword)

export default  router
