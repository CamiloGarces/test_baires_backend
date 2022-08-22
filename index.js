const express = require('express')
const app = express();
const jwt = require('jsonwebtoken')
const cors = require('cors')
require('dotenv').config();
const info = require('./Data/data.json')

app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(cors())

app.get('/api/data', (req, res)=>{
    res.json(info)
})

app.post('/api/data', (request, response) => {
    const newTuit = request.body.twit
    info.tuits.push({"id": Math.random().toString(), "twit": newTuit})
    response.send(info.tuits)
})

app.delete('/api/:id', (request, response) => {
    const tuitId = request.params.id
    const foundIndextuit = info.tuits.findIndex(tuit => tuit.id === tuitId)

    if (foundIndextuit === -1) {
        return response.send(`Twit con id '${tuitId}' no encontrado`)
    }

    info.tuits.splice(foundIndextuit, 1)
    response.send(info.tuits)
})

app.post('/auth', (req, res) => {
    const {username, password} = req.body
    const user = {username: username}; 
    const accessToken = generateAccessToken(user);
    res.json({
        token: accessToken
    })
})

function generateAccessToken(user){
    return jwt.sign(user, process.env.SECRET, {expiresIn: '5m'})
}

app.get('/api', validateToken, (req, res) => {
    res.json({
        username: req.user,
        tuits: [
            {
                id: 0,
                text: 'este es el primer tuit',
                username: 'camilo_garces'
            },
            {
                id: 1,
                text: 'este es el segundo tuit',
                username: 'mauricio_garces'
            }
        ]
    })
})

function validateToken(req, res, next){
    const accessToken = req.headers['authorization'] || req.query.accessToken;
    if(!accessToken)res.send('Accesso denegado')

    jwt.verify(accessToken, process.env.SECRET, (err, user)=>{
        if(err){
            res.send('Acceso denegado, el token expiró ó es incorrecto')
        }else {
            req.user = user;
            next();
        }
    })
}

app.listen(3000, () => {
    console.log('initial server')
})