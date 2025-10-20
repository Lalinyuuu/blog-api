import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


export const uploadImage = async (file, folder = 'default') => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      resource_type: 'auto',
      folder: folder,  
    });
    return result;
  } catch (error) {
('Upload error:', error);
    throw error;
  }
};

export default { uploadImage };