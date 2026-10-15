import multer from 'multer';

// In-memory storage allows uploading directly to Cloudinary or generating data URLs without persisting temp files
const storage = multer.memoryStorage();

export const uploadSingleImage = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are permitted'));
    }
  },
});

const flexibleUpload = uploadSingleImage.fields([
  { name: 'file', maxCount: 1 },
  { name: 'image', maxCount: 1 },
]);

export function uploadSingleImageFlexible(req: any, res: any, next: any) {
  flexibleUpload(req, res, (err: any) => {
    if (err) return next(err);
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    if (files) {
      req.file = files['file']?.[0] || files['image']?.[0];
    }
    next();
  });
}

export const uploadMultipleImages = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5,
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are permitted'));
    }
  },
});
