import  jwt  from "jsonwebtoken";
import UserModel from "../models/User.js";

var checkUserAuth = async(req, res, next) => {
    let token;
    //Get Token From Header
    const {authorization} = req.headers
    if(authorization && authorization.startsWith('Bearer')){
        try{
            token = authorization.split(" ")[1]

            //Verify Token
            const {UserId} = jwt.verify(token, process.env.JWT_SECRET_KEY)

            //Get User From Token
            req.user = await UserModel.findById(UserId).select('-password');
            // console.log('UserId', UserId);
            // console.log('req.user', req.user);
            next()
        }catch(error){
            console.log(error)
            res.status(401).send({"status":"failed", "message": "Unauthorized User"})
        }
    }
    if(!token){
        res.status(401).send({"status":"failed", "message": "Unauthorized User, No Token"})
    }
}

export default checkUserAuth