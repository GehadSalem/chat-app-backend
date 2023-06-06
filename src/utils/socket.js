import { Server } from "socket.io";

let io ;

export const initIo = (httpServer) => {
    io = new Server(httpServer, {
        cors: '*'
    })
    return io
}

export const getIo = () => {
    if (!io) {
        throw new Error('fail to setup io')
    }
    return io
}