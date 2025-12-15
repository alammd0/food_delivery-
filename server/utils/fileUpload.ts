
import cloudinary from "../config/cloudinary.js";

export const uploadImage = async (folder : string, filePath : string) => {
    try {
        return await cloudinary.uploader.upload(filePath, { folder });
    }
    catch (error) {
        return { error };
    }
};