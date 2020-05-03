const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/auth')
const {sendWelcomeEmail, sendCancellationEmail} = require('../emails/account')
const router = new express.Router()

router.post('/users', async(req, res) => {
    console.log('POST request for /users')
    const user = new User(req.body)

    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    } catch(e) {
        res.status(400).send(e)
    }


    // user.save().then(() => {
    //     res.status(201).send(user)
    // }).catch((e) => {
    //    res.status(400).send(e)
    // })

    //res.send('testing!')
})

router.post('/users/login', async(req, res) => {
    console.timeLog('POST request for /users/login')
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        // Used shorthand syntax to return both the required output parameters
        res.send({user, token})
    } catch(e) {
        res.status(400).send()
    }
})

router.post('/users/logout', auth, async(req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        })
        await req.user.save()
        
        res.send()
    } catch(e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async(req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch(e) {
        res.status(500).send()
    }
})
router.get('/users/me', auth, async(req, res) => {
    console.log('GET request for /users/me')
    res.send(req.user)

    // This was used earlier to fetch all the records of the users
    // const users = await User.find({})

})

// Route Handler To Get Dyanamic Value That Is Provided. We Need To Use : For That Functionality To Be Used
// Not required as we now included '/users/me' that performs the similar functionality of the required service

// router.get('/users/:id', async(req, res) => {
//     console.log('GET request for /users/:id')
//     const _id = req.params.id
//     console.log(_id)

//     try {
//         const user = await User.findById(_id)

//         if(!user) {
//             res.status(404).send()
//         }

//         res.send(user)
//     } catch(e) {
//         res.status(500).send(e)
//     }
// })

// Used new in update options to return the latest updated data, also added runValidators to check if the provided unput is valid or not (I assume from the learnings).
// Used every() for iterating the keys for updates which determine if they are valid or not

router.patch('/users/me', auth, async(req, res) => {
    console.log('PATCH request for /users/:id')

    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'age', 'email' , 'password']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation) {
        return res.status(404).send({error: 'Invalid Update Fields Provided For Update'})
    }

    try {
        // Had to change this update component based to maintain consistency with pre() middleware functionality option for user
        // const user = await User.findById(req.params.id)

        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        //const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
        res.send(req.user)
    } catch(e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth, async(req, res) => {
    console.log('DELETE request for /users/:id')

    try {
        // const user = await User.findByIdAndDelete(req.user._id)

        // if(!user) {
        //     res.status(404).send()
        // }
        await req.user.remove()
        res.send(req.user)
        sendCancellationEmail(req.user.email, req.user.name)
    } catch(e) {
        res.status(500).send()
    }
})

const upload = multer({
    // We are commenting this as we should not be storing the files in our local destination folder
    //dest: 'avatars',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image'))
        }
        cb(undefined, true)
    }
})

// Added two middleware for this service, one for authentication and another for file upload
// Create and Update the Avatar for the Required Authenticated User
router.post('/users/me/avatar', auth, upload.single('avatar'), async(req, res) => {
    // Contains all the binary data for a particular file
    // req.user.avatar = req.file.buffer

    // Sharp provides the buffer as per our requirements and sharp is an asynchronous service
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    req.user.avatar = buffer

    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

// Delete the Avatar for the Required User
router.delete('/users/me/avatar', auth, async(req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

// Fetching the Avatar and Getting The Image Back As Required
router.get('/users/:id/avatar', async(req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar) {
            throw new Error()
        }

        // Sending a response header
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch(e) {
        res.status(400).send()
    }
})

module.exports = router