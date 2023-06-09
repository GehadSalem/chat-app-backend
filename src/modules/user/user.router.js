import {Router} from 'express'
import { auth, roles } from '../../middleware/auth.js';
import {validation} from "../../middleware/validation.js"
import {fileUpload, fileValidation} from '../../utils/multer.js'
import * as validators from "./user.validation.js"
import * as userController from  './controller/user.js'
const router = Router();

router.get("/getUsers" ,userController.users)
router.get("/getUser/:id" ,userController.profileId)




router.get("/",auth(Object.values(roles)) ,userController.userList)
router.get("/:id" , auth(Object.values(roles)), userController.profile)
router.post("/:id", 
            auth(Object.values(roles)),
            validation(validators.updateUser), 
            userController.updateUser) //update user
router.patch("/updateProfilePic", 
            auth(Object.values(roles)),
            fileUpload(fileValidation.image).single('image'),
            validation(validators.updateProfilePic), 
            userController.updateProfilePic) //update user profile
router.patch("/password",  
            auth(Object.values(roles)),
            validation(validators.updatePassword), 
            userController.updatePassword) //update password
router.patch("/" ,
            auth(Object.values(roles)) , 
            validation(validators.softDelete), 
            userController.softDelete) // soft delete
router.delete("/" ,
            auth(Object.values(roles)) ,
            validation(validators.deleteUser), 
            userController.deleteUser) // delete user
router.patch("/signout", 
            auth(Object.values(roles)), 
            validation(validators.signout),
            userController.signout)//sign out

export default  router
