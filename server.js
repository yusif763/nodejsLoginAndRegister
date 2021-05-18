const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const User = require('./model/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const JWT_SECRET = 'dsfsfwejfsvd32rw5gdwrwfsdk32$%^$%%$42dadsadasdada'

mongoose.connect('mongodb+srv://Yusif:yusif1105@cluster0.5sdyb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}, () => console.log("MongoDb is connected "))
const app = express()
app.use('/',express.static(path.join(__dirname,'static')))
app.use(express.json())


app.post('/api/login/', async (req,res) => {

    const {email,password} = req.body
   
    try{
        const user = await User.findOne({email}).lean()

        

        if (!user) return res.status(400).json({message: "User nopt exist"})
        

        console.log(user);  

        const hashedPas = await bcrypt.compare(password, user.password)

        const token = jwt.sign({id: user._id, email}, JWT_SECRET)

        res.status(200).json({
            token,
            user
        })
    
        // if (await bcrypt.compare(password, user.passord)){
    
        //     const token = jwt.sign({
        //         id: user._id,
        //         email:email}
        //         , JWT_SECRET 
        //         )
    
        //     return res.json ({
        //         status:'ok' , 
        //         data: token
        //     })
        // }

    }
    catch(error){
        res.json({status:'error', error:'Invalid email or password'})

    }

})


function test (req, res, next){
    jwt.verify("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwYTNkOGM5ZmM5YzUwNzdjZGRjZWZlMyIsImlhdCI6MTYyMTM1MTUzNn0.W0nFxg_ykLjcl9hOrnl3TZvIbexzzFWjFeY-xNrJowQ", JWT_SECRET, (err, user) => {
        if(err){
            return res.status(200)
        } else {
            next()
        }
    })
}


app.post("/", test, (req, res) => {
    res.send("This is my posts")
})


app.post('/api/register', async (req,res) =>{
    const {first_name,last_name,email,password: plainTextPassword} = req.body
    // console.log(await bcrypt.hash(password , 10))
    
    if(plainTextPassword.length < 6){
        return res.json({
            status: 'error',
            error:"Password should be at least 6 characters"
        })
    }
    const password = await bcrypt.hash(plainTextPassword, 10)
    try{
        const response = await User.create({
            first_name,
            last_name,
            email,
            password
        })
        console.log('User created succesfully',response)
    }catch(error){
        if(error.message === 11000){
            return res.json({status:error , error:'Email already exists'})
        }
        throw error
    }

    res.json({ status:'ok'})
})

app.listen(3000,() =>{
    console.log('server up at 3000')
})