const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const Kyc = require('../models/kycModel');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let transformation = [];
    let folder;
    let public_id;
    let allowed_formats;

    if (file.fieldname === 'front') {
      folder = 'covers';
      public_id = `cover-${Date.now()}`;
      allowed_formats = ['jpg', 'jpeg', 'png'];
      if (file.mimetype.startsWith('image')) {
        transformation = [{ width: 500, height: 500, crop: 'limit' }];
      }
    } else if (file.fieldname === 'back') {
      folder = 'journals';
      public_id = `journal_${Date.now()}`;
      allowed_formats = ['jpg', 'jpeg', 'png'];
      if (file.mimetype.startsWith('image')) {
        transformation = [{ width: 500, height: 500, crop: 'limit' }];
      }
    }

    return {
      folder,
      allowed_formats,
      transformation,
      public_id,
    };
  },
});

// Multer middleware to handle multiple fields
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB per file
}).fields([
  { name: 'front', maxCount: 1 }, // Single file for front
  { name: 'back', maxCount: 1 }, // Single file for back
]);

// Middleware to handle the upload
// Middleware function to handle file uploads and errors
exports.uploadFiles = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Handle Multer-specific errors
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          status: 'fail',
          message: 'File size should not exceed 10MB',
        });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          status: 'fail',
          message: 'Limit expected',
        });
      }
      if (err.message === 'An unknown file format not allowed') {
        return res.status(400).json({
          status: 'fail',
          message: 'Unsupported  file  format',
        });
      }
    } else if (err) {
      // Handle general errors
      console.log(err);
      return res.status(500).json({
        status: 'fail',
        message: err.message,
      });
    }

    // Proceed if no errors
    next();
  });
};

exports.uploadKyc = async (req, res) => {
  // Validate imageCover file
  if (!req.files || !req.files.front || req.files.front.length === 0) {
    return res.status(400).json({
      status: 'fail',
      message: 'Upload an image cover',
    });
  }

  // Validate images field
  if (!req.files || !req.files.back || req.files.back.length === 0) {
    return res.status(400).json({
      status: 'fail',
      message: 'Upload a journal',
    });
  }

  try {
    const user = req.user.id;

    const front = req.files.front[0].path; // Cloudinary URL

    const back = req.files.back[0].path; // Cloudinary URL

    const newKyc = await Kyc.create({
      user,
      front,
      back,
    });

    return res.status(200).json({
      status: 'success',
      data: {
        newKyc,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.approveKyc = async (req, res) => {
  const { kycId } = req.params;

  if (!kycId) {
    return res.status(400).json({
      status: 'fail',
      message: 'KYC Id not found',
    });
  }

  try {
    const kyc = await Kyc.findById(kycId);

    if (!kyc) {
      return res.status(404).json({
        status: 'fail',
        message: 'KYC not found',
      });
    }

    kyc.status = 'Verified';

    const updatedKyc = await kyc.save();

    return res.status(200).json({
      status: 'success',
      data: {
        updatedKyc,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.declineKyc = async (req, res) => {
  const { kycId } = req.params;

  if (!kycId) {
    return res.status(400).json({
      status: 'fail',
      message: 'KYC Id not found',
    });
  }

  try {
    const kyc = await Kyc.findById(kycId);

    if (!kyc) {
      return res.status(404).json({
        status: 'fail',
        message: 'KYC not found',
      });
    }

    kyc.status = 'Unverified';

    const updatedKyc = await kyc.save();

    return res.status(200).json({
      status: 'success',
      data: {
        updatedKyc,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 'fail',
      message: err.message,
    });
  }
};
