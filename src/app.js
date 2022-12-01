const express = require('express')
const path = require('path')
const sessions = require('express-session')

const app = express()

//importing the connection module
require('./db/conn')
const Register = require('./models/registers')

const port = process.env.port || 3000

//path setting
const static = path.join(__dirname, '../public')
const templates = path.join(__dirname, '../templates/views')

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use(sessions({
    resave: true,
    saveUninitialized: true,
    secret: 'secretpassword'
}))

app.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
});

app.use(express.static(static))

// view engine setup
app.set('view engine', 'ejs')
app.set('views', templates)



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
            console.log(req.sessionID);
            
            console.log('session created');
           // console.log(req.sessionStore);
            res.redirect('/login2')
        } else {
            // res.send('invalid login details')
            res.render('login', { check: "wrong login details" })
        }
    } catch (error) {
        // res.status(400).send('invalid login details')
        res.render('login', { check: "wrong login details" })
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
            const register = await user.save()
            res.status(201).render('login')
        } else {
            // res.send('password are not matching')
            res.render('register', { check: "password are not matching" })
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
    password: '1'
}

// app.get('/admin', (req, res) => {
//     res.render('adminsignin')
// })
app.get('/admin', (req, res) => {

    if (req.session.email1) {
        res.redirect('/adminhome')
    } else {

        res.render('adminsignin')
    }

})

app.post('/adminhome', (req, res) => {
    if (req.body.email === user.email && req.body.password === user.password) {
        req.session.email1 = req.body.email
        console.log(req.sessionID);
        console.log("admin's session is created");
        Register.find({}, (err, allDetails) => {
            if (err) {
                console.log(err);
            }
            else {
                res.render('adminhome', { details: allDetails })
            }
        })
    }
    else {
        res.render('adminsignin', { check: "wrong login details" })
    }
})


app.post("/delete", (req, res) => {
    var myquery = { email: req.body.deleteemail }
    const deleteResult = Register.deleteOne(myquery, (err, obj) => {
        // console.dir(deleteResult.deletedCount);
        if (err) {
            console.log(err)
        }
        else {
            console.log("  deleted successfully");
            res.redirect('/adminhome')

            // res.end()
            // res.render("adminhome")

        }
    })
    // console.log(req.body.deleteemail)
})
app.post("/insert", async (req, res) => {
    try {
        let registerEmployee = new Register({
            firstname: req.body.insertFirstName,
            lastname: req.body.insertLastName,
            email: req.body.insertEmail,
            password: req.body.insertPassword
        })

        const registered = await registerEmployee.save();
        
        res.redirect("/adminhome")
        

    } catch (error) {


        res.send("error ");
       
    }
}
)

app.get("/adminhome", (req, res) => {

    Register.find({}, (err, allDetails) => {
        if (err) {
            console.log(err)
        } else {

            res.render("adminhome", { details: allDetails })
        }
    })
})

app.get('/adminlogout', (req, res) => {

    req.session.destroy()
    console.log('session deleted');

    res.redirect('/admin')
    res.end()
})

app.post("/search", (req, res) => {
    let search =req.body.name
    Register.find({firstname:search},(err,data)=>{
        if(err){
            console.log(err)

        }
        else{
            res.render("search",{details:data})
        }
    })
})



app.post('/update', async (req, res) => {
    try {


        const result = await Register.updateMany({ email: req.body.updateemail }, {
            $set: {
                firstname: req.body.updatefirstname,
                lastname: req.body.updatelastname,
                email: req.body.updateemail,
                password: req.body.updatepassword
            }
        })
        console.log(result)
        console.log(req.body.updateemail)

        res.redirect('/adminhome')
    } catch (error) {
        console.log(error.message);
    }

})
app.post('/insert', async (req, res) => {


    try {
        

        const register = new Register({
            fisrtname: req.body.insertFirstName,
            lastname: req.body.insertLastName,
            email: req.body.insertEmail,
            password: req.body.insertPassword

        })
        const exist = await Register.findOne({ email: req.body.insertemail })
        if (exist) {
            // res.render('form',{mail:"Email is already exist",ame:"Name is already exist",pas:"Password is already exist"})   
        }
        // res.send({wrong:"EMAIL IS USED"})}

        else {
            register.save();
        }

    }
    catch (error) {
        res.status(400).send(error);
    }
    res.redirect('/adminhome')
})



app.listen(port, () => {
    console.log(`server is running at port http://localhost:${port}`)
})
