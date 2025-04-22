import { NextFunction, Request,Response } from "express";
import { checkOtpRestrictions, sendOtp, trackOtpRequests, validateRegistrationData } from "../utils/authHelper";
import prisma from "../../../../packages/libs/prisma";
import { ValidationError } from "../../../../packages/error-handler";


export const userRegistration  = async(req:Request,res:Response,next:NextFunction)=> {
validateRegistrationData(req.body,"user")
const {name,email} = req.body
try {
    const existingUser = await prisma.users.findUnique({
        where:{email}
    })
    if(existingUser){
    return next(new ValidationError("User already exists with this email"))
    }
    await checkOtpRestrictions(email,next);
    await trackOtpRequests(email,next)
    await sendOtp(name,email,"user-activation-mail")
    res.status(200).json({
        success:true,
        message:"OTP sent to mail.please verify your account"
    })
} catch (error) {
    return next(error)
}

}
