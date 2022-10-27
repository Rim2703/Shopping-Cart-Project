const jwt = require('jsonwebtoken')
const mongoose = require("mongoose");
const userModel = require("../models/userModel")

//===================================Authentication======================================================

const authentication = (req, res, next) => {
    try {
        let token = req.header("Authorization")
        if (!token) return res.status(400).send({ status: false, message: "Token must be present, choose bearer token" })

        let splitToken = token.split(' ')
        
        if(splitToken.length !==2 || splitToken[0] !== 'Bearer' || !splitToken[1]){
            return res.status(403).send({status: false, message: "Invalid token format"})
        }

        jwt.verify(splitToken[1], 'Project5-Group48', function (err, decode) {
            if (err) {
                return res.status(401).send({ status: false, message: err.message })
            } else {
                req.decodedToken = decode;
                next()
            }
        })
    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

//===================================Authorization======================================================

const authorization = async function (req, res, next) {
    try {
        let userId = req.params.userId
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, msg: 'Please enter correct user Id' })
        }

        let user = await userModel.findById({ _id: userId })
        if (!user) {
            return res.status(404).send({ status: false, message: "user not found" })
        }

        let userLoggedIn = req.decodedToken.userId
        if (userId != userLoggedIn) {
            return res.status(403).send({ status: false, message: "you are not authorized" })
        }
        next()
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

module.exports = { authentication, authorization }