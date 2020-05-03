const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
})

// MongoDB AWS Elastic Bean Stack
// Node.js Deployable Application
// User Profile

// const me = new User({
//     name: 'Himavarsha',
//     email: 'ht@gmail.com',
//     password: 'himavarsha',
//     age: 23
// })

// me.save().then(() => {
//     console.log(me)
// }).catch((error) => {
//     console.log('Error', error)
// })



