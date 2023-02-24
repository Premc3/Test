const Express = require("express");
const Bodyparser = require("body-parser");
const Cors = require("cors");
const Mongoose = require("mongoose");
const learnerModel = require("./models/students")
const UserModel = require('./models/User')
const AdminModel = require('./models/Admin')
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken");
const { json } = require("body-parser");
const port = process.env.port||3001
const path = require('path')
const mountRoutes =require('express-mount-routes')

const app = new Express();
app.use(Bodyparser.json());
app.use(Bodyparser.urlencoded({ extended: true }))
app.use(Cors());

Mongoose.connect("mongodb+srv://Prince:12348765@cluster0.glgxktq.mongodb.net/Project?retryWrites=true&w=majority",({useNewUrlParser:true}))
app.use(Express.static(path.join(__dirname, "frontend", "build")));
//Routes - mounted from backend for API
mountRoutes(app);

//Routes - use from React app for frontend
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname,"frontend", "build", "index.html"));
  });
//Login
app.post('/signin', async (req, res) => {
    var getEmailid = req.body.emailid
    var getpassword = req.body.password
    let model = UserModel;
    if (getEmailid == "admin@gmail.com") model = AdminModel

    let result = model.find({ emailid: getEmailid }, (err, data) => {
        if (data.length > 0) {
            const passwordValidator = bcrypt.compareSync(getpassword, data[0].password)
            
            if (passwordValidator) {

                jwt.sign({ email: getEmailid }, "Learner", { expiresIn: "1d" },
                    (err, token) => {
                        if (err) {
                            res.json({ "status": "error", "error": err })
                        } else {
                            res.json({ "status": "success", "data": data, "token": token })
                        }
                    })
            }
            else {
                res.json({ "status": "failed", "data": "Invalid password" })
            }
        }
        else {
            res.json({ "status": "failed", "data": "Invalid Email id" })
        }
    })

})


// app.post('/signup', async (req, res) => {
//     let data = new AdminModel({
//         name: req.body.name,
//         emailid: req.body.emailid,
//         password: bcrypt.hashSync(req.body.password, 10),
//         position: req.body.position
//     })
//     console.log(data)
//     await data.save()

//     res.json({ "status": "success", "data": data })
// })


//View User List
app.post("/viewuser/:query", async (req, res) => {
    var data = req.body
    console.log(data)
    var q = req.params.query;

    const keys = ["name", "emailid", "location", "position"]
    const search = (data) => {
        return data.filter((item) =>
            keys.some((key) => item[key].toLowerCase().includes(q))
        );
    };
    try {
        var result = await UserModel.find();
        if (q == 0) {
            res.send(result)
        }
        else {
            res.send(search(result))
        }

    } catch (error) {
        res.status(500).send(error)
    }
})

//Add Users
app.post('/addUser', async (req, res) => {
    console.log(req.body)
   
    const newUser = new UserModel({
        name: req.body.name,
        emailid: req.body.emailid,
        password: bcrypt.hashSync(req.body.password, 10),
        location: req.body.location,
        position: req.body.position
    })
    await newUser.save((error, data) => {
        if (data) {
            res.json({ "status": "Success", "Data": data })
        }
        else {
            res.json({ "status": "error", "Error": error })
        }
    })
})

//get user by id
app.post("/getuser", async (req, res) => {
    var data = req.body

    console.log(data._id)
    try {
        var result = await UserModel.findById(data)
        res.send(result);
        console.log(result)
    } catch (error) {
        res.status(500).send(error)
    }
})

//update user
app.put('/updateUser', async (req, res) => {
    let data = req.body
    console.log(data.name, data.emailid, data.location, data.position, data.salary)

    let empid = data._id
    let uname = data.name
    let uemailid = data.emailid
    let ulocation = data.location
    let uposition = data.position
    let usalary = data.salary
    try {
        UserModel.findOneAndUpdate({ _id: empid }, { $set: { name: uname, emailid: uemailid, location: ulocation, position: uposition, salary: usalary } }, { new: true }, (err, data) => {
            if (data) {
                res.json({ "status": "Success", "Data": data })
            }
            else {
                res.json({ "status": "error" })
            }
        })

    } catch (err) {
        res.send('Error')
    }

})

//delete User
app.delete('/deleteUser/:id', (req, res) => {
    var data = req.params.id;
    console.log(req.params.id)
    console.log(data)

    UserModel.findByIdAndDelete(req.params.id, (err, data) => {
        console.log(data);
        if (err) {
            res.json({ "status": "Error", "Error": err });
        }
        else {
            res.send({ "status": "Deleted", "Data": data });
        }

    })
})

//Student
app.post("/api/addlearner",async(req,res)=>{
    let data = new learnerModel(req.body)
    console.log(data)
    await data.save()
    res.json({"status":"success","data":data})
})
app.get('/data', async (req, res) => {
    try {
      const learners = await learnerModel.find();
      res.json(learners);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });
  app.put('/learners/:id/placement', async (req, res) => {
    try {
      const updatedLearner = await learnerModel.updateOne(
        { _id: req.params.id },
        { placementStatus: req.body.placementStatus }
      );
      res.json(updatedLearner);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });


  app.post('/cvupload', (req, res) => {
    const csvData = req.body;
    if (csvData.length === 0) {
      return res.status(400).json({ status: 'Error', message: 'CSV data is empty' });
    }
    learnerModel.insertMany(csvData)
      .then(() => res.json({ status: 'Success' }))
      .catch((err) => res.status(500).json({ status: 'Error', message: err }));
  });
  
  
//jwt token verification
// app.post("/students",(req,res)=>{
//     jwt.verify(req.body.token,"Learner",(error,decoded)=>{
//         if(decoded && decoded.emailid)
//         {
//             let data = new studenModel ({studentId: req.body.id})
//             data.save()
//             res.json({"status": "Added Successfuly"})
//         }
//         else{
//             res.json({"status": "unauthorsied user"})
//         }
//     })
// })

app.listen((port), () => {
    console.log("server started")
})