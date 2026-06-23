import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "..//utils/Apierror.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const generateAccessAndRefreshTokens=async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken= user.generateAccessToken()
        const refreshToken= user.generateRefreshToken()
        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})
        return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating refreshtoken")
    }
}
const registerUser =asyncHandler (async (ryq,res)=>{
 
    
  const {fullName,username,email,password}=req.body

 
  if( [fullName,email,username,password].some((field)=>field?.trim()==="")
){
     throw new ApiError(400,"All fiels are required")
  }
const existedUser= await User.findOne({
    $or:[{username},{email}]
})
if(existedUser){
    throw new ApiError(409,"User with email or username already exists")
}
 const avatarLocalPath=req.files?.avatar?.[0]?.path;
const coverImageLocalPath=req.files?.coverImage?.[0]?.path;

if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file is required")
}
const avatar = await uploadOnCloudinary(avatarLocalPath)
const coverImage = coverImageLocalPath
  ? await uploadOnCloudinary(coverImageLocalPath)
  : null;

if(!avatar){
    throw new ApiError(400,"Cloudinary upload failed")
}

const user=await User.create(
    {
        fullName,
        avatar : avatar.url,
        coverImage: coverImage?.url || "",
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


return res.status(201).json(
    new ApiResponse(201,userCreated,"User registered successfully")
)
})
const loginUser= asyncHandler(async (req,res)=>{
const {username,email,password}=req.body
if(!username || !email){
    throw new ApiError(400,"Username or password is required")
}
const user= User.findOne(
    {
        $or:[{username},{email}]
    }
)
if(!user){
    throw new ApiError(404,"User does not exist")
}
const isPasswordValid= await user.isPasswordCorrect(password)

if(!isPasswordValid){
    throw new ApiError(401,"Invalid user credentials")
}
const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id)

const loggedInUser=await User.findById(user._id).
select("-password =refreshToken")

const options={
    httpOnly: true,
    secure:true
}

return res.status(200)
.cookie("accessToken",accessToken,options)
.cookie("refreshToken",refreshToken,options)
.json(
    new ApiResponse(
        200,{
            user: loggedInUser,accessToken,refreshToken
        },
        "User logged in Successfully"
    )
)
})
 const logoutUser=asyncHandler(async(req,res)=>{
 await User.findByIdAndUpdate(
    req.user._id,
    {
        $set:{
            refreshToken:undefined
        }
    },
    {new:true}
 )
 const options={
    httpOnly:true,
    secure:true
 }
 return res
 .status(200)
 .clearCookie("accessToken")
 .clearCookie("refreshToken")
 .json(new ApiResponse(200,{},"User logged out"))
 })
export {registerUser,loginUser,logoutUser}