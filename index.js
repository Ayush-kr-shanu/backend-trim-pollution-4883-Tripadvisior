const express=require('express')
const { connection } = require('./db')
const { userRoute } = require('./routes/user.routes')
const { authenticate } = require('./middleware/authenticate')
const cors=require('cors')

require('dotenv').config()


const app=express()

app.use(express.json())

app.use(cors())

app.use('/users',userRoute)

app.use(authenticate)

app.get('/',async(req,res)=>{
    res.send("HOME PAGE")
})


const port=process.env.port
app.listen(port,async()=>{
    try {
        await connection
        console.log('DB is connected');
    } catch (err) {
        console.log(err);
    }
})