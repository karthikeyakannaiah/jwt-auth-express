require('dotenv').config()
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
app.use(express.json())

const posts = [
    {
        username:"Karthik",
        title:"post 1"
    },
    {
        username:"ghost",
        title:"post 2"
    },
    {
        username:"Kyle",
        title:"post 3"
    }
]
const users = []

app.get('/users',(req,res)=>{
    res.json(users)
})
app.post('/users',async (req,res)=>{
    try {
        const hashedPassword = await bcrypt.hash(req.body.password.toString(), 10)

        const user = { 
            name: req.body.name, 
            password: hashedPassword
        }
        users.push(user)
        res.status(201).send()
    }
    catch(err){
        console.log(err)
        res.status(500).send()
    }
})
app.post('/users/login', async (req,res)=>{
    const user = users.find(user => user.name === req.body.name)
    if (user == null){
        req.status(400).send("cannot find user")
    }
    try {
        if(await bcrypt.compare(req.body.password, user.password)){
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)

            res.send({accessToken:accessToken})
        }else{
            res.send("not allowed")
        }
    }
    catch(err){
        console.log(err)
        res.status(500).send()
    }
})


app.get('/posts',authenticateToken,(req,res)=>{
    res.json(posts.filter(post => post.username === req.user.name))
})


function authenticateToken(req,res,nex){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if(token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user)=>{
        if(err) return res.sendStatus(403)
        req.user = user
        nex()
    })
}

app.listen(3000)


// node
// require('crypto').randomBytes(64).toString('hex')