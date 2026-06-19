import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "..//utils/Apierror.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser =asyncHandler (async (req,res)=>{
     
    
  const {fullname,username,email,password}=req.body
  console.log("email :",email);
  if( [fullname,email,username,password].some((field)=>
field?.trim()==="")){
     throw new ApiError(400,"All fiels are required")
  }
const existedUser=User.findOne({
    $or:[{username},{email}]
})
if(existedUser){
    throw new ApiError(409,"User with email or username already exists")
}
 const avatarLocalPath=req.files?.avatar[0]?.path;
const coverImageLocalPath=req.files?.coverImage?.path;
if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file is required")
}
const avatar = await uploadOnCloudinary(avatarLocalPath)
const coverImage=await uploadOnCloudinary(coverImageLocalPath)

if(!avatar){
    throw new ApiError(400,"Avatar file is required")
}

const user=await User.create(
    {
        fullName,
        avatar:avatar.url,
        coverImage:coverImage.url||"",
        email,
        password,
        username:username.toLowerCase()
    }
)

const userCreated= await User.findById(user._id).select(
    "-password -refreshToken"
)

if(!userCreated){
    throw new ApiError(500,"Something went wrong while registering the user")
}

})

return res.status(201).json(
    new ApiResponse(200,userCreated,"User registered successfully")
)

export {registerUser}