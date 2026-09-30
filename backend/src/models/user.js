const mongoose = require('mongoose');
const {Schema} = mongoose;

const userSchema = new Schema({
    firstName:{
        type: String,
        required: true,
        minLength:3,
        maxLength:20
    },
    lastName:{
        type:String,
        minLength:3,
        maxLength:20,
    },
    emailId:{
        type:String,
        required:true,
        unique:true,
        trim: true,
        lowercase:true,
        immutable: true,
    },
    age:{
        type:Number,
        min:6,
        max:80,
    },
    role:{
        type:String,
        enum:['user','admin'],
        default: 'user'
    },
    problemSolved:{
        type:[{
            type:Schema.Types.ObjectId,
            ref:'problem',
            unique:true
        }],
    },
    password:{
        type:String,
        required: true
    },
    college:{
        type:String,
        default:''
    },
    graduationDetails:{
        type:String,
        default:''
    },
    location:{
        type:String,
        default:''
    },
    bio:{
        type:String,
        default:''
    },
    website:{
        type:String,
        default:''
    },
    github:{
        type:String,
        default:''
    },
    linkedin:{
        type:String,
        default:''
    },
    twitter:{
        type:String,
        default:''
    },
    avatar:{
        type:String,
        default:''
    }
},{
    timestamps:true
});

userSchema.post('findOneAndDelete', async function (userInfo) {
    if (userInfo) {
      await mongoose.model('submission').deleteMany({ userId: userInfo._id });
    }
});


const User = mongoose.model("user",userSchema);

module.exports = User;
