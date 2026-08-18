const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log('Connect to DB');
        
    } catch (error) {
        console.log('Not connected to DB', error);
        
    }
}

module.exports = connectDB