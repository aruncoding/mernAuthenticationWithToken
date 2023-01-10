import UserModel from "../models/User.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import transporter from "../config/emailConfig.js"


class UserController{
    static userRegistration = async (req,res) => {
        const {Name, Email, Password, password_confirmation, Tc} = req.body
        const user = await UserModel.findOne({email: Email})
        if(user){
            res.send({"status":"failed", "message": "Email already exists"})
        }else{
            //below is checking wheather all fields have value or not
            if(Name && Email && Password && password_confirmation && Tc){
                if(Password == password_confirmation){
                   try{
                        //Hasing password
                        const salt = await bcrypt.genSalt(10)
                        const hashPassword = await bcrypt.hash(Password, salt)
                        const doc = new UserModel({
                            name: Name,
                            email: Email,
                            password: hashPassword,
                            tc: Tc
                        })
                        await doc.save()
                        const savedUser = await UserModel.findOne({email: Email})

                        //Generate JWT Token
                        const token = jwt.sign({UserId: savedUser._id}, process.env.JWT_SECRET_KEY, {expiresIn: '5d'})
                        res.send({"status":"success", "message": "Registration successfull!", "token": token})
 
                   }catch (error){
                       console.log(error)
                       res.send({"status":"failed", "message": "Unable to Register"})
                   }
                }else{
                    res.send({"status":"failed", "message": "Password and Confirm Password doesn't match"})
                }
            }else{
                res.send({"status":"failed", "message": "All Fields Are Required"})
            }
        }
    }

    static userLogin = async (req,res) => {
        try{
            const {Email, Password} = req.body
            if(Email && Password) {
                const user = await UserModel.findOne({email: Email})
                if(user){
                    const isMatch = await bcrypt.compare(Password, user.password)
                    if((user.email === Email) && isMatch){
                        //Generating JWT Token
                        const token = jwt.sign({UserId: user._id}, process.env.JWT_SECRET_KEY, {expiresIn: '5d'})
                        res.send({"status":"success", "message": "Login Success", "token": token})
                    }else{
                        res.send({"status":"failed", "message": "Password or Email Does not Match"})
                    }
                }else{
                    res.send({"status":"failed", "message": "You are not Registered Register"})
                }
            }else{
                res.send({"status":"failed", "message": "All Fields Are Required"})
            }
        }catch(error){
            console.log(error)
            res.send({"status":"failed", "message": "Unable To Login"})
        }
    }

    static changeUserPassword = async(req,res) => {
        const {Password, Password_Confirmation} = req.body
        if(Password && Password_Confirmation){
            if(Password !== Password_Confirmation){
                res.send({"status":"failed", "message": "Password and Confirm password doesn't match"})
            }else{
               const salt = await bcrypt.genSalt(10);
               const hashPassword = await bcrypt.hash(Password, salt)
               await UserModel.findByIdAndUpdate(req.user._id, {$set: {password: hashPassword}})
               res.send({"status":"success", "message": "Password Change Successfully"})
            }
        }else{
            res.send({"status":"failed", "message": "All Fields Are Required"})
        }
    }


    static loggedUser = async (req, res) => {
        res.send({"user": req.user})
    }


    static sendUserPasswordResetEmail = async (req,res) => {
        const {Email} = req.body
        if(Email){
            const user = await UserModel.findOne({email: Email})

            console.log('constroller user',user);
            if(user){
                // below code to send mail using nodemailer
                // const secret = user._id + process.env.JWT_SECRET_KEY
                // const token = jwt.sign({userID: user._id}, secret, {expiresIn: '15m'})
                // const link = `http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`
                // console.log(link)

                // //Send Email
                // let info =  await transporter.sendMail({
                //     from: process.env.EMAIL_FROM,
                //     to: user.email,
                //     subject: "GeekShop Password Reset Link",
                //     html: `<a href=${link}>Click Here</a> To Reset Your Password`
                // })

                res.send({"status": "success", "message": "Email has been sent!"})
            }else{
                res.send({"status": "failed", "message": "Email Doesn't Exit...."})
            }
        }else{
            res.send({"status": "failed", "message": "Email Field is Required"})
        }
    }

    static userPasswordRest = async (req, res) => {
        const {Password, Password_Confirmation} = req.body
        const {id, token} = req.params
        console.log('id',id);
        console.log('token',token);
        const user = await UserModel.findById(id)
        const new_secret = user._id + process.env.JWT_SECRET_KEY
        try{
            jwt.verify(token,new_secret)
            if(Password && Password_Confirmation){
                if(Password !== Password_Confirmation){
                    res.send({"status": "failed", "message": "Password and Confirm Password doesn't match!"})
                }else{
                    const salt = await bcrypt.genSalt(10)
                    const newHashPassword = await bcrypt.hash(Password, salt)
                    await UserModel.findByIdAndUpdate(user._id, {$set: {password: newHashPassword}})
                    res.send({"status":"success", "message": "Password Updated Successfully"}) 
                }
            }else{
                res.send({"status": "failed", "message": "All Fields Are Required!"})
            }
        }catch(error){
            console.log(error)
            res.send({"status": "failed", "message": "Invalid Token...."})
        }
    }
}

export default UserController