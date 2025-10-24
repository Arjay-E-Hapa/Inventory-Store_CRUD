const mongoose = require('mongoose');

async function connectDB() {
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error('MONGODB_URI missing');
await mongoose.connect(uri);
console.log('膆 Mongodb connected');
}
module.exports = { connectDB };
