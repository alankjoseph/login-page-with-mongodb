const express = require('express')
const path = require('path')
const sessions = require('express-session')
const hbs = require('hbs')

const app = express()

//importing the connection module
require('./db/conn')
const Register = require('./models/registers')

const port = process.env.port || 3000

//path setting
const static = path.join(__dirname, '../public')
const templates = path.join(__dirname, '../templates/views')
const partials = path.join(__dirname, '../templates/partials')

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use(sessions({
    resave: true,
    saveUninitialized: true,
    secret: 'secretpassword',
}))
let flag=0
app.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
});

app.use(express.static(static))

// view engine setup
app.set('view engine', 'hbs')
app.set('views', templates)

// registering the partials
hbs.registerPartials(partials)

app.get('/', (req, res) => {
    
    if (req.session.email) {
        res.redirect('/login2')
    } else {
        
        res.render('login')
    }
    
})

let userEmail;

app.post('/login', async (req, res) => {
    try {
        const email = req.body.email
        const password = req.body.password

        userEmail = await Register.findOne({ email: email })
        if (userEmail.password === password) {
            
            req.session.email = req.body.email
            console.log('session created');
            res.redirect('/login2')
        } else {
            res.send('invalid login details')
        }
    } catch (error) {
        res.status(400).send('invalid login details')
    }
})

app.get('/register', (req, res) => {
    res.render('register')
})





app.post('/register', async (req, res) => {
    try {
        const password = req.body.password
        const cpassword = req.body.confirmpassword
        if (password === cpassword) {
            const user = new Register({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                password: password,
                confirmpassword: cpassword
            })
            const register = user.save()
            res.status(201).render('login')
        } else {
            res.send('password are not matching')
        }
    } catch (error) {
        res.status(400).send(error)
    }
})


app.get('/login2', (req, res) => {
    
    if (req.session.email) {
        res.status(201).render('index', { user: userEmail.firstname })
    } else {
        res.redirect('/')
    }

})

app.get('/logout', (req, res) => {
    
    req.session.destroy()
    console.log('session deleted');
    res.redirect('/')
    res.end()
})

const user = {
    email: 'admin@gmail.com',
    password: '12345'
}

app.get('/admin', (req, res) => {
    res.render('adminsignin')
})

app.listen(port, () => {
    console.log(`server is running at port http://localhost:${port}`)
})
