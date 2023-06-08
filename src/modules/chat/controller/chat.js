import userModel from "../../../../DB/model/User.model.js";
import chatModel from "../../../../DB/model/Chat.model.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import { getIo } from "../../../utils/socket.js";
import moment from 'moment';

export const createChat = asyncHandler( async (req,res,next) => {
    const {message, destId} = req.body
    const chat = await chatModel.findOne({
        $or: [
            {POne: req.user._id, PTwo: destId},
            {POne: destId, PTwo: req.user._id},
        ]
    }).populate([
        {
          path: 'POne',
        },
        {
          path: 'PTwo',
        },
        {
          path: 'messages',
          populate: {
            path: 'from',
          },
        },
        {
          path: 'messages',
          populate: {
            path: 'to',
          },
        },
      ]);

    if(!chat){
        const destUser = await userModel.findById(destId)
        if(!destUser){
            return next(new Error("In-valid dest User", {cause: 404}))
        }
        const newChat = await chatModel.create({
            POne: req.user._id,
            PTwo: destId,
            messages:[{
                from: req.user._id,
                to: destId,
                message,
                sendDate: new moment() 
            }]
        }, {new: true})
        getIo().to(destUser.socketId).emit('receiveMessage', message, {user: destUser})
        return res.status(201).json({message: "Done", chat: newChat,user: destUser})
    }
    
    chat.messages.push({
        from: req.user._id,
        to: destId,
        message,
        sendDate: new moment() 
    })
    await chat.save()

    if (chat.POne._id.toString() == req.user._id) {
        getIo().to(chat.PTwo.socketId).emit('receiveMessage', {message, id: chat.POne._id})
    }else{
        getIo().to(chat.POne.socketId).emit('receiveMessage', {message, id: chat.PTwo._id})
    }

    return res.status(200).json({message: "Done", chat})
})


export const getChatContent = asyncHandler(async(req, res, next) => {
    const {destId} = req.params
    const destUser = await userModel.findById(destId)
    const chat = await chatModel.findOne({
        $or: [
            {POne: req.user._id, PTwo: destId},
            {POne: destId, PTwo: req.user._id},
        ]
    }).populate([
        {
          path: 'POne',
        },
        {
          path: 'PTwo',
        },
        {
          path: 'messages',
          populate: {
            path: 'from',
          },
        },
        {
          path: 'messages',
          populate: {
            path: 'to',
          },
        },
      ]);

    return res.status(200).json({message: "Done", chat, destUser})
})
