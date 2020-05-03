const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async(req, res, next) => {
    console.log('auth middleware')
    
    // Replacing Bearer from the header with ''
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        console.log(token)
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({_id: decoded._id, 'tokens.token': token})

        if(!user) {
            throw new Error()
        }

        // Adding the fetched user after authentication and add to a request so that to save resources in accessing the data multiple times than as required here
        req.token = token
        req.user = user
        next()
    } catch(e) {
        res.status(401).send({error: 'Please authenticate.'})
    }
}

module.exports = auth