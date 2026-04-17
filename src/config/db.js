const mongoose = require('mongoose')

function connect() {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => {
            console.log('✅ MongoDB connected')
        })
        .catch((error) => {
            console.log('❌ MongoDB error:', error)
        })
}

module.exports = { connect }