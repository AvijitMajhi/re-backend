import {v2 as cloudinary} from "cloudinary"
import fs from "fs"



cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
console.log("ENV CHECK:", process.env.CLOUDINARY_CLOUD_NAME, process.env.CLOUDINARY_API_KEY);
const uploadOnCloudinary = async (localFilePath) => {
    if (!localFilePath) return null;
    const normalizedPath = localFilePath.replace(/\\/g, "/");

    try {
        const response = await cloudinary.uploader.upload(normalizedPath, {
            resource_type: "auto"
        });
       fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        console.dir(error, { depth: null });
        if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
        return null;
    }
}

export { uploadOnCloudinary }