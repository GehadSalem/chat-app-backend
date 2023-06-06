import{Router} from 'express'
import * as chatController from './controller/chat.js'
import {auth, roles} from '../../middleware/auth.js'
const router = Router()

router.post("/", auth(Object.values(roles)),chatController.createChat)
router.get("/ovo/:destId", auth(Object.values(roles)),chatController.getChatContent)

export default router