const express = require('express')
const fs = require('fs')
const bodyParser = require('body-parser')
const session = require('express-session')
const Passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const passport = require('passport')
const readXlsxFile = require('read-excel-file/node')
const app = express()
app.set('views', './views')
app.set('view engine', 'ejs')
app.use(express.static('./views'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({ 
    secret: 'mysecret',
    cookie:{
        maxAge:1000*60*60*24*3
    }
}))

var users =[]
fs.readFile('user.json','utf8',(err,data)=>{
    users=JSON.parse(data)
})
var table
const schema = {
    'TT':{
        prop:'tt',
        type:Number
    },
    'MSV':{
        prop:'msv',
        type:String
    },
    'Ho ten':{
        prop:'hoten',
        type:String
    },
    'Email':{
        prop:'email',
        type:String
    }
}
readXlsxFile('Ds-svs.xlsx',{schema}).then(({rows,errors})=>{
    table=rows
})

app.use(Passport.initialize())
app.use(Passport.session())

app.route('/')
    .get((req, res) => {
        if(req.isAuthenticated()){
            res.render('loginok')
        }else{
            res.render('login')
        }
    })
    .post(Passport.authenticate('local', {
        failureRedirect: '/',
        successRedirect: '/ok',
    }))

app.get('/ok', (req, res) => {
    if (req.isAuthenticated()){
        res.render('loginok')
    }else{
        res.render('login')
    }
})
app.get('/table',(req,res) =>{
    if (req.isAuthenticated()){
        res.send(table)
    }else{
        res.send('error')
    }
})

Passport.use(new LocalStrategy(
    // phuong thuc chung thuc
    (username, password, done) => {
        var user=users.find(user=>
            user.username==username)
        if (user) {
            if (user.password==password) {
                return done(null, user)
            } else {
                return done(null, false)
            }   
        }else return done(null,false)
    }
))

Passport.serializeUser((user, done) => {
    done(null, user.username)
    // ghi vao cookie
})

Passport.deserializeUser((username, done) => {
    // lay cookie so sanh
    var user=users.find(user=>
        user.username==username)
    if (user) {
        return done(null, user)
    } else {
        return done(null, false)
    }
})
const port = 3000
app.listen(port, () => {
    console.log(`app listen on port : ${port}`)
})