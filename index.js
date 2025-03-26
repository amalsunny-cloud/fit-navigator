require('dotenv').config()
const express = require('express')
const cors = require('cors')
const router = require('./Route/route')
require('./DB/connection')

const fnServer = express()
fnServer.use(express.json())
fnServer.use(cors())
fnServer.use(router)

const port = 3000 || process.env.PORT

fnServer.listen(port,()=>{
    console.log(`port running at ${port} successfully`);
    
})
fnServer.get('/',(req,res)=>{
    res.send('successfully run the code');
    
})

router.use('/uploads', express.static('uploads'));


