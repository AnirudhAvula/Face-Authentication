const jwt = require('jsonwebtoken');
const JWT_SECRET = "ShhhKeepthisasecret"

const fetchuser = (req,res,next)=>{
    //Get user from  jwt token and add id to req object
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({error: " No token provided !! Please authenticate using a valid token!!"})
    }
    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user
        next();
    }catch(error) {
        res.status(401).send({error: "UnAuthorized :Please authenticate yourself"})
    }

}



    

module.exports = fetchuser;