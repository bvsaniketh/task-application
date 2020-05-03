const express = require('express')
require('./db/mongoose')
const User = require('./models/user')
const Task = require('./models/task')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT

const multer = require('multer')
// Provide configuration as required for the file upload
// Validation for file upload
const upload = multer({
    dest: 'images',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(doc|docx)$/)) {
            return cb(new Error('Please upload a Word document'))
        }
        
        cb(undefined, true)
     
    }
})

// Middleware function to demonstrate proper display of error output
const errorMiddleware = (req, res, next) => {
    throw new Error('From my middleware')
}

// End point for file upload
// Multer middleware can be used and is passed in as the second parameter
app.post('/upload', upload.single('upload'), (req, res) => {
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

// Registering middleware with express to perform our functionality operations. (That is what I assume from my learnings)
// Have to call next() to continue to next operation in the chain that is to run route handler
// app.use((req, res, next) => {
//     console.log(req.method, req.path)

//     if(req.method === 'GET') {
//         res.send('GET requests are disabled')
//     }else {
//         next()
//     }
// })

// This is for the maintenance middleware functionality that can be used for the application. (That Is What I Assume From My Learnings)
// app.use((req, res, next) => {
//     res.status(503).send('Site is currently down. Check back soon later!')
// })

// Parse Incoming JSON To An Object
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log('Server is up on port ', port);
})


// Without middleware: new request -> run route handler

// With middleware: new request -> do something -> run route handler

const jwt = require('jsonwebtoken')


// const myFunction = async() => {
//     const token = jwt.sign({_id:'abc123'}, 'thisismynewcourse', { expiresIn: '7 days'})
//     console.log(token)

//     const data = jwt.verify(token, 'thisismynewcourse')
//     console.log(data)
// }

// myFunction()

// Find user details based on the task
// const taskUser = async() => {
//     const task = await Task.findById('5eaca56febaed038e4b63e36')
//     await task.populate('owner').execPopulate()
//     console.log(task.owner)
// }

// const userTask = async() => {
//     const user = await User.findById('5eaca551ebaed038e4b63e33')
//     await user.populate('tasks').execPopulate()
//     console.log(user.tasks)
// }

// taskUser()
// userTask()