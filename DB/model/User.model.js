import mongoose, { model, Schema } from "mongoose";

const userSchema = new Schema({

    firstName:String,
    lastName:String,
    userName:{
        type:String,
        unique: true,
        required: true
    },
    email:{
        type:String,
        required: true,
        unique: true
    },
    password:{
        type:String,
        required: true
    },
    age:Number,
    phone:String,
    confirmEmail:{
        type: Boolean,
        default: false,
    },
    isLoggedIn:{
        type: Boolean,
        default: false,
    },
    status:{
        type: String,
        default: 'not active',
        enum: ['not active', 'active', 'blocked']
    },
    role:{
        type: String,
        default: 'user',
        enum: ['user', 'admin']
    },
    gender:{
        type: String,
        default: 'male',
        enum: ['male', 'female']
    },
    image: Object, // profile pic
    userBio: String,
    code: String,
    isDeleted: {
        type: Boolean,
        default: false
    },
    socketId: String ,
    connectedDate: Date,
    disConnectedDate: Date,
},{
    timestamps: true,
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true }
})

  
const userModel = mongoose.model.User || model('User', userSchema)


export default userModel