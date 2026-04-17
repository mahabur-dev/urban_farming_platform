// import multer from 'multer';
// import path from 'path';
// import { v2 as cloudinary } from 'cloudinary';
// import fs from 'fs';
// import { ICloudinaryResponse } from '../interface';
// import AppError from '../error/appError';
// import config from '../config';

// // Cloudinary Config
// cloudinary.config({
//   cloud_name: config.cloudinary.name!,
//   api_key: config.cloudinary.apiKey!,
//   api_secret: config.cloudinary.apiSecret!,
// });

// // sanitize filename
// const sanitizeFileName = (originalName: string) => {
//   return originalName
//     .replace(/\s+/g, '_')
//     .replace(/[^a-zA-Z0-9._-]/g, '')
//     .toLowerCase();
// };

// // Disk storage
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.join(process.cwd(), 'uploads'));
//   },
//   filename: (req, file, cb) => {
//     const safeName = Date.now() + '-' + sanitizeFileName(file.originalname);
//     cb(null, safeName);
//   },
// });

// // Multer instance
// export const uploadDisk = multer({
//   storage,
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|mkv/;
//     const ext = path.extname(file.originalname).toLowerCase();
//     if (allowedTypes.test(ext)) {
//       cb(null, true);
//     } else {
//       cb(new AppError(400, 'Only images and videos are allowed'));
//     }
//   },
// });

// export const uploadToCloudinaryDisk = async (
//   file: Express.Multer.File,
// ): Promise<ICloudinaryResponse> => {
//   return new Promise<ICloudinaryResponse>((resolve, reject) => {
//     const safeName = sanitizeFileName(file.originalname);

//     const ext = path.extname(file.originalname).toLowerCase();
//     const isVideo = /mp4|mov|avi|mkv/.test(ext);

//     cloudinary.uploader.upload(
//       file.path,
//       {
//         public_id: safeName,
//         folder: 'File_Uploader',
//         resource_type: isVideo ? 'video' : 'image',
//         ...(isVideo
//           ? {}
//           : { transformation: { width: 500, height: 500, crop: 'limit' } }),
//       },
//       (error, result) => {
//         fs.unlinkSync(file.path); // remove local temp file
//         if (error) return reject(error);

//         if (!result)
//           return reject(
//             new AppError(
//               400,
//               'Upload failed: No result returned from Cloudinary',
//             ),
//           );

//         resolve(result as ICloudinaryResponse);
//       },
//     );
//   });
// };

// export const fileUploaderDisk = {
//   uploadDisk,
//   uploadToCloudinaryDisk,
// };

// ======================================== file uploade ==========================================================================

// import multer from 'multer';
// import streamifier from 'streamifier';
// import path from 'path';
// import { v2 as cloudinary } from 'cloudinary';
// import AppError from '../error/appError';
// import config from '../config';

// // Cloudinary Config
// cloudinary.config({
//   cloud_name: config.cloudinary.name!,
//   api_key: config.cloudinary.apiKey!,
//   api_secret: config.cloudinary.apiSecret!,
// });

// // sanitize filename
// const sanitizeFileName = (name: string) => {
//   return name
//     .replace(/\s+/g, '_')
//     .replace(/[^a-zA-Z0-9._-]/g, '')
//     .toLowerCase();
// };

// // Multer memory storage
// const uploadStream = multer({
//   storage: multer.memoryStorage(),
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|mkv/;
//     const ext = path.extname(file.originalname).toLowerCase();

//     if (allowedTypes.test(ext)) {
//       cb(null, true);
//     } else {
//       cb(new AppError(400, 'Only images & videos are allowed'));
//     }
//   },
// });

// // Upload stream to Cloudinary
// const uploadToCloudinaryStream = (
//   file: Express.Multer.File,
// ): Promise<{ url: string; public_id: string }> => {
//   return new Promise((resolve, reject) => {
//     if (!file) return reject(new AppError(400, 'No file provided'));

//     const ext = path.extname(file.originalname).toLowerCase();
//     const isVideo = /mp4|mov|avi|mkv/.test(ext);
//     const safeName = `${Date.now()}-${sanitizeFileName(file.originalname)}`;

//     const stream = cloudinary.uploader.upload_stream(
//       {
//         folder: 'Note',
//         resource_type: isVideo ? 'video' : 'image',
//         public_id: safeName,
//         ...(isVideo
//           ? {}
//           : {
//               transformation: {
//                 width: 500,
//                 height: 500,
//                 crop: 'limit',
//               },
//             }),
//       },
//       (error, result) => {
//         if (error || !result)
//           return reject(error || new AppError(400, 'Cloudinary upload failed'));

//         resolve({
//           url: result.secure_url,
//           public_id: result.public_id,
//         });
//       },
//     );

//     streamifier.createReadStream(file.buffer).pipe(stream);
//   });
// };

// export const fileUploaderStream = {
//   uploadStream,
//   uploadToCloudinaryStream,
// };



// =================================================== csv fill add ===========================================================
import multer from 'multer';
import streamifier from 'streamifier';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import AppError from '../error/appError';
import config from '../config';

cloudinary.config({
  cloud_name: config.cloudinary.name!,
  api_key: config.cloudinary.apiKey!,
  api_secret: config.cloudinary.apiSecret!,
});

// sanitize filename
const sanitizeFileName = (name: string) => {
  return name
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .toLowerCase();
};

// const upload = multer({
//   storage: multer.memoryStorage(),
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|mkv|csv|pdf|webp/;
//     const ext = path.extname(file.originalname).toLowerCase();

//     if (!allowedTypes.test(ext)) {
//       return cb(
//         new AppError(400, 'Only images, videos, or CSV files are allowed'),
//       );
//     }

//     cb(null, true);
//   },
// });
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024,   // ✅ 500MB file size
    fieldSize: 500 * 1024 * 1024,  // ✅ 500MB field value size (fixes your error)
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|mkv|csv|pdf|webp/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedTypes.test(ext)) {
      return cb(
        new AppError(400, 'Only images, videos, or CSV files are allowed'),
      );
    }
    cb(null, true);
  },
});

// const uploadToCloudinary = (
//   file: Express.Multer.File,
// ): Promise<{ url: string; public_id: string }> => {
//   return new Promise((resolve, reject) => {
//     if (!file) return reject(new AppError(400, 'No file provided'));

//     const ext = path.extname(file.originalname).toLowerCase();
//     const isVideo = /mp4|mov|avi|mkv/.test(ext);
//     const isCSV = /csv/.test(ext);
//     const safeName = `${Date.now()}-${sanitizeFileName(file.originalname)}`;

//     // Determine resource_type
//     let resourceType: 'image' | 'video' | 'raw' = 'image';
//     if (isVideo) resourceType = 'video';
//     else if (isCSV) resourceType = 'raw';

//     const stream = cloudinary.uploader.upload_stream(
//       {
//         folder: 'Note',
//         resource_type: resourceType,
//         public_id: safeName,
//         ...(isVideo || isCSV
//           ? {}
//           : {
//               transformation: {
//                 width: 500,
//                 height: 500,
//                 crop: 'limit',
//               },
//             }),
//       },
//       (error, result) => {
//         if (error || !result)
//           return reject(error || new AppError(400, 'Cloudinary upload failed'));

//         resolve({
//           url: result.secure_url,
//           public_id: result.public_id,
//         });
//       },
//     );

//     streamifier.createReadStream(file.buffer).pipe(stream);
//   });
// };
const uploadToCloudinary = (
  file: Express.Multer.File,
): Promise<{ url: string; public_id: string }> => {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new AppError(400, 'No file provided'));

    const ext = path.extname(file.originalname).toLowerCase();
    const isVideo = /mp4|mov|avi|mkv/.test(ext);
    const isCSV = /csv/.test(ext);
    const isPDF = /pdf/.test(ext);
    const safeName = `${Date.now()}-${sanitizeFileName(file.originalname)}`;

    let resourceType: 'image' | 'video' | 'raw' = 'image';
    if (isVideo) resourceType = 'video';
    else if (isCSV || isPDF) resourceType = 'raw';

    const uploadOptions = {
      folder: 'Note',
      resource_type: resourceType,
      public_id: safeName,
      ...(isVideo || isCSV || isPDF
        ? {}
        : {
            transformation: {
              width: 500,
              height: 500,
              crop: 'limit',
            },
          }),
    };

    const CHUNK_SIZE = 6 * 1024 * 1024; // 6MB

    // use chunked upload for files > 6MB
    if (file.buffer.length > CHUNK_SIZE) {
      const stream = cloudinary.uploader.upload_chunked_stream(
        { ...uploadOptions, chunk_size: CHUNK_SIZE },
        (error, result) => {
          if (error || !result)
            return reject(error || new AppError(400, 'Cloudinary upload failed'));
          resolve({ url: result.secure_url, public_id: result.public_id });
        },
      );
      streamifier.createReadStream(file.buffer).pipe(stream);
    } else {
      // normal upload for small files
      const stream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error || !result)
            return reject(error || new AppError(400, 'Cloudinary upload failed'));
          resolve({ url: result.secure_url, public_id: result.public_id });
        },
      );
      streamifier.createReadStream(file.buffer).pipe(stream);
    }
  });
};

export const fileUploader = {
  upload,
  uploadToCloudinary,
};
