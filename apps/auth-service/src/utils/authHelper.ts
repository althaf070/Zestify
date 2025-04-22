import bcrypt from 'bcryptjs';
import { ValidationError } from '../../../../packages/error-handler';
import { NextFunction } from 'express';
import crypto from 'crypto'
import redis from '../../../../packages/libs/redis';
import { sendEmail } from './sendmail';


const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const validateRegistrationData = (
  data: any,
  userType: 'user' | 'seller'
) => {
  const { name, email, password, phone_number, country } = data;
  if (
    !name ||
    !email ||
    !password ||
    (userType === 'seller' && (!phone_number || !country))
  ) {
    throw new ValidationError(`Missing required fields!`);
  }
  if(!emailRegex.test(email)){
    throw new ValidationError(`Invalid mail address`)
  }
};


export const checkOtpRestrictions = async(email:string,next:NextFunction)=> {
if(await redis.get(`otp_lock:${email}`)){
return next(
  new ValidationError(
    "Account locked due to multiple failed attempts! Try again after 30 minutes"
  )
)
}
if(await redis.get(`otp_spam_lock:${email}`)){
  return next(
    new ValidationError(
      "Too many OTP requests! Please wait for one before requesting again"
    )
  )
}
if(await redis.get(`otp_cooldown:${email}`)){
  return next(
    new ValidationError(
      "Please wait for one minute requesting new otp again"
    )
  )
}
}

export const trackOtpRequests = async(email:string,next:NextFunction)=> {
  const otpReqKey = `otp_request_count:${email}`
  let otpReqs = parseInt((await redis.get(otpReqKey)) || "0")
  if(otpReqs >=2){
    await redis.set(`otp_spam_lock:${email}`,"locked","EX",3600)
    return next(new ValidationError("Too many otp requsts..please wait for one hour"))
  }
  await redis.set(otpReqKey,otpReqs +1 ,"EX",3600)
}

export const sendOtp = async(name:string,email:string,template:string)=> {
  const otp = crypto.randomInt(1000,9999).toString()
  await sendEmail(email,"Verify your email",template,{name,otp})
  await redis.set(`otp:${email}`,otp,"EX",300)
  await redis.set(`otp_cooldown:${email}`,"true","EX",60)
}