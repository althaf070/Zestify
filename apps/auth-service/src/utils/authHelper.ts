import bcrypt from 'bcryptjs';
import { ValidationError } from '../../../../packages/error-handler';
import { NextFunction } from 'express';
import crypto from 'crypto'


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


export const checkOtpRestrictions = (email:String,next:NextFunction)=> {

}

export const sendOtp = async(name:string,email:String,template:string)=> {
  const otp = crypto.randomInt(1000,9999).toString()
  
}