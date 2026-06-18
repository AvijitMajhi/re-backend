import dotenv from "dotenv"
import {app} from "./app.js"
import connectDb from "./db/index.js";
 
 dotenv.config(
    {
        path: './env'
    }
 )
connectDb()
.then (()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running at port : ${process.env.PORT}`);
    } )
})
.catch((err)=>{
    console.log("Mongodb connection falied !! :",err)
})
// import express from "express"
// const app=express()
// (async()=>{
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
//         app.on("Error",(error)=>{
//             console.log("Error:",error)
//         throw error
//         })
//         app.listen(process.env.PORT ,()=>{
//           console.log(  `App is listening on port no ${process.env.PORT}`);
//         })
//     } catch (error) {
//         console.log("Error:",error)
//         throw error
//     }
// })()
