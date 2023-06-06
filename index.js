import path from 'path'
import { fileURLToPath } from 'url'
import dotenv  from 'dotenv'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, './config/.env') })
import express from 'express';
import initApp from './src/app.router.js';
import { initIo, getIo } from './src/utils/socket.js';
import { roles, socketAuth } from './src/middleware/auth.js';
import userModel from './DB/model/User.model.js';
import moment from 'moment';

const app = express()
const port = process.env.PORT || 5000

initApp(app, express)

const httpServer = app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`)
})


const io = initIo(httpServer)
io.on('connection', (socket) => {
    console.log(socket.id)
    
    socket.on('updateSocketId', async (data) => {
        const {_id} = await socketAuth(data.token, Object.values(roles), socket.id)
        await userModel.updateOne({ _id }, { socketId: socket.id, connectedDate: new moment() })
        socket.emit('auth', 'Done')
    })

    socket.on('disconnect', async(data)=>{
    })
})