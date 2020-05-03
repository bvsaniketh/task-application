const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('../models/task')

// To make use of middleware we have to create schema just like below. Can use pre and post after creating this schema of the user type

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength : 7,
        trim: true,
        validate(value) {
            //if(value === 'password')
            if(value.toLowerCase().includes('password')){
                throw new Error('The value of password cannot contain "password"');
            }
        }
        

    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if(value < 0) {
                throw new Error('Age must be a positive number')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }], 
    avatar: {
        type: Buffer
    }
    
}, {
    timestamps: true
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

// change getPublicProfile name to toJson such that we need not call the getPublicProfile method everytime

userSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    
    return userObject
}

userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET)
    
    user.tokens = user.tokens.concat({token})
    await user.save()

    return token

}

userSchema.statics.findByCredentials = async(email, password) => {
    const user = await User.findOne({email})

    if(!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}
// next() in pre() tells that is the end of pre functionality that is required to be done
// Hash the plain text password before saving
userSchema.pre('save', async function(next) {
    const user = this

    if(user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

// Delete user tasks when user is removed
// This is more of a cascade delete between users and tasks
userSchema.pre('remove', async function(next) {
    const user = this
    await Task.deleteMany({owner: user._id})
    next()
})


const User = mongoose.model('User', userSchema)

module.exports = User