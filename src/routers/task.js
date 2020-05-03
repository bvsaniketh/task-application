const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()


// ...req.body is the ES6 spread operator to fetch all the details as per needed from req.body
//  means that each and every element in the req.body is inserted into the task object

router.post('/tasks', auth, async(req, res) => {
    console.log('POST request for /tasks')
    //const task = new Task(req.body)
    const task = new Task({
            ...req.body,
            owner: req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)

    } catch(e) {
        res.status(400).send(e)
    }
})


// Adding filter operations to this service
// GET /tasks?completed=true
// limit skip are the two optiones we need to use for pagination
// GET /tasks?limit=10&skip=0 - 1st page as per the google website fetched records data
// GET /tasks?limit=10&skip=20 - 3rd page as per the google website fetched records data
// GET /tasks?sortBy=createdAt:desc

router.get('/tasks', auth, async(req, res) => {
    console.log('GET request for /tasks')
    const match = {}
    const sort = {}

    if(req.query.completed) {
        match.completed = req.query.completed === 'true'
    }
    
    if(req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1 
    }
    

    try {
        //const tasks = await Task.find({owner:req.user_id})
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
                // sort: {
                //     Reverses the order of the tasks
                //     createdAt: -1
                //     Fetches the tasks that are completed: false as the order of the tasks
                //     completed: 1
                // }
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch(e) {
        res.status(500).send(e)
    }
})

router.get('/tasks/:id', auth, async(req ,res) => {
    console.log('GET request for /tasks/:id')
    const _id = req.params.id

    try {
        //const task = await Task.findById(_id)

        const task = await Task.findOne({_id, owner: req.user._id})
        
        if(!task){
            res.status(404).send()   
        }

        res.send(task)
    } catch(e) {
        res.status(500).send(e)
    }
})

router.patch('/tasks/:id', auth, async(req, res) => {
    console.log('PATCH request for /tasks/:id')
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation) {
        return res.status(400).send({error: 'Invalid Updates For Task Have Been Provided As Input Here'}) 
    }

    const _id = req.params.id

    try {
        const task = await Task.findOne({_id, owner: req.user._id})
        //const task = await Task.findById(_id)

      
        //const task = await Task.findByIdAndUpdate(_id, req.body, {new: true, runValidators: true})
        if(!task) {
            res.status(404).send()
        }

        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.send(task)
    } catch(e) {
        res.status(400).send(e)
    }
})

router.delete('/tasks/:id', auth, async(req, res) => {
     console.log('DELETE request for /tasks/:id')
     const _id = req.params.id

     try {
        //const task = await Task.findByIdAndDelete(_id)

        const task = await Task.findOneAndDelete({_id, owner: req.user._id})

        if(!task) {
            res.status(404).send()
        }

        res.send(task)
     } catch(e) {
        res.status(500).send(e)
     }

})

module.exports = router