import mongoose, { model, Schema, Types } from "mongoose";
const chatSchema = new Schema({
    POne: {type: Types.ObjectId, ref:'User', required: true},
    PTwo: {type: Types.ObjectId, ref:'User', required: true},
    messages:[{
      from:{type: Types.ObjectId, ref:'User', required: true},
      to:{type: Types.ObjectId, ref:'User', required: true},
      message: {type: String, required:true},
      sendDate: Date
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true },
})

  
const chatModel  = mongoose.model.Chat || model("Chat" , chatSchema)
export default chatModel