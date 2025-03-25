const mongoose = require('mongoose')

const connectionString = process.env.connection_string


mongoose.connect(connectionString).then(()=>{
    console.log('MongoDB Atlas connected to fnserver');
    
}).catch((err)=>{
    console.log('MongoDB Connection failed',err);
    
})