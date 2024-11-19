const express = require('express');
const User = require('../models/UserSchema');
const router = express.Router();
const {body , validationResult} = require('express-validator');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const fetchuser = require('../middleware/fetchuser')


JWT_SECRET = "ShhhKeepthisasecret"

// ROUTE 1:  Create a USER using:POST "/api/auth/createuser". No login Required
router.post('/createuser',[
    body('name','Enter a valid Name!!').isLength({min:3}),
    body('email','Enter a Vaild email!!').isEmail(),
    body('password','Password must be atleast 5 chars').isLength({min:5})
],
   async (req,res)=>{
    let success = false

        //if there are errors return Bad request and the errors
    const errors = validationResult(req);
    if(!errors.isEmpty()){  
        return res.status(400).json({success, errors: errors.array()}); 
    }

    //Check whether the user with same email exists already
try{
    let user = await User.findOne({email: req.body.email});
    if(user){
        return res.json({success, errors: "Sorry, A user with this email already exists. Please Login!!"})
    }
    //Hashing the password
    const salt = await bcrypt.genSalt(10);  
    secPass = await bcrypt.hash(req.body.password, salt);

    //Create a new User
        user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password : secPass
    })

    const data = {
        user:{
            id:user.id
        }
    }
    success = true;
    const authToken = jwt.sign(data, JWT_SECRET);
    


    res.json({success,authToken})
}
catch(error){
    res.status(500).send("Internal Server Error occured");
    console.log(error.message);
}
    
    
    
    // .then(user=>res.json(user))    //here user is the document created by UserSchema.create in the mongodb database and it can be anmed anything for eg "then(newUser=>res.json(newUser))" for which we are sending details back to the client
    // .catch(err=> {console.log(err)
    // res.json({error: "Please Enter a Unique Email"})  // commented coz whatever may be the error it shows only to enter unique value

        
     })



//ROUTE 2:    Authenticate a user using: POST  "/api/auth/login" 

router.post('/login', [
    body('email','Enter a Valid Email').isEmail(),
    body('password','Password cannot be blank').exists()
], async (req,res)=>{

    let success = false
    //if there are errors return a bad request and the errors
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }


    const {email,password} = req.body; //extracting email and password from req body
    try{
        let user =await  User.findOne({email})   //finding the user with same input email
        if(!user){
            success = false
            return res.status(400).json({success, error : "Please Login with Correct Credentials"})
        }
        
        const passwordCompare = await  bcrypt.compare(password,user.password)

        if(!passwordCompare){
            success = false
            return res.status(400).json({success , error: "Please try to Login with Correct Credentials"})
        }

        const data = {
            user:{
                id:user.id
            }
        }
        const authToken = jwt.sign(data , JWT_SECRET)
        success = true
        res.json({success, authToken})


    }catch(error){
        res.status(500).send("Internal Server Error occured");
        console.log(error.message);
    }

})


//ROUTE 3: Get logged in user Details using; POST  "api/auth/getuser"  Login required
router.post('/getuser', fetchuser , async (req,res)=>{

    try{
        userId = req.user.id;
        const user = await User.findById(userId).select("-password")//selects eveerything except password
        res.send(user)
    }catch(error){
        console.error(error.message);
        res.status(500).send("Internal Server Error")
    }



})



module.exports = router;










