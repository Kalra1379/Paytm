import { signupValidation, signinValidation, updateValidation } from "../Services/inputValidation.js";
import User from "../models/user.js";
import Account from "../models/accounts.js";
import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET;


export const signupAuth = async (req, res, next) => {
    try {
        const createPayload = req.body;
        // console.log(createPayload);
        const parsepayload = signupValidation.safeParse(createPayload);
        if (!parsepayload.success) {
            res.status(411).json({
                msg: "Wrong Imoput Sended Bitch!"
            })
            return
        }

        // Check first Wheather user is existing or not 
        const existingUser = await User.findOne({
            username: req.body.username
        })
        if (existingUser) {
            return res.status(411).json({
                msg: "Bsdk jake login kar"
            })
        }

        // after Input Validation we will connect moongose with it 
        const newUser = await User.create({
            username: createPayload.username,
            firstName: createPayload.firstName,
            lastName: createPayload.lastName,
            password: createPayload.password
        })
        // console.log(createPayload.username);

        // now we will some random balance between 1 and 10000 to use whenever he signup's ->
        const userID = newUser._id;
        await Account.create({
            userID,
            balance: 1 + Math.random() * 10000
        })
        console.log("Account created succefully");


        // jwt token generation ->
        const token = jwt.sign({
            userID
        }, jwtSecret);


        res.status(200).json({
            msg: " User Created Succesfully",
            token: token
        })


    } catch (e) {
        res.status(500).json({
            msg: "Internal Server Error"
        });
        console.log(e);
    }
}

// ............................................................................................................................

export const signinAuth = async (req, res, next) => {

    try {
        const loginPayload = req.body;
        const parsesigninPayload = signinValidation.safeParse(loginPayload);

        if (!parsesigninPayload.success) {
            res.status(411).json({
                msg: "Wrong Imoput Sended Bitch!"
            })
            return
        }
        // console.log(loginPayload.username);

        // now we will check wheather user is already signup or not 
        const usercheck = await User.findOne({
            username: loginPayload.username,
            password: loginPayload.password,
        });

        if (usercheck) {
            const userID = User._id;
            const loginToken = jwt.sign({
                userID
            }, jwtSecret);

            res.json({
                msg: "User Login Succesfully",
                token: loginToken
            })
            return;
        }
    }

    catch (e) {
        res.status(500).json({
            msg: "Internal Server Error"
        });
        console.log(e);
    }
}

// ..............................................................................................................................

export const updateAuth = async (req, res, next) => {
    try {
        const updatebody = req.body;
        const updatePayload = updateValidation.safeParse(updatebody);

        if (!updatePayload.success) {
            res.status(411).json({
                msg: "Wrong Input Sended Bitch!"
            })
            return
        }

        await User.updateOne(updatebody, {
            id: req.userId
        })

        res.status(200).json({
            msg: "User Updated Successfully"
        })
    }
    catch (e) {
        res.status(500).json({
            msg: "Error Whiel Sending Imformation"
        })
        console.log(e);
    }
}

// ...............................................................................................................................

export const getData = async (req, res, next) => {
    try {
        const filter = req.query.filter || "";

        // logic explaination of or in notion {it is used to find any such related query or text in database}

        const users = await User.find({
            $or: [{
                firstName: {
                    "$regex": filter
                }
            }, {
                lastName: {
                    "$regex": filter
                }
            }]
        })

        // gives the data back
        res.json({
            user: users.map(user => ({
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                _id: user._id
            }))
        })

    }
    catch (e) {
        res.status(500).json({
            msg: "Sorry Internal Server Error Can't give you data back!"
        })

    }
}
// ................................................................................................................................