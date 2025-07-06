import express from 'express';
import { protect } from '../middleware/auth.js';
import { uploadSingle, uploadMultiple, handleUploadError } from '../middleware/upload.js';
import { logger } from '../utils/logger.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// @desc    Upload single image
// @route   POST /api/upload/image
// @access  Private
router.post('/image', protect, uploadSingle, handleUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    logger.info('📁 [UPLOAD] Image uploaded successfully:', {
      userId: req.user.id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });

    // Create file URL
    const fileUrl = `/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });

  } catch (error) {
    logger.error('📁 [UPLOAD] Image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error.message
    });
  }
});

// @desc    Upload multiple images
// @route   POST /api/upload/images
// @access  Private
router.post('/images', protect, uploadMultiple, handleUploadError, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadedFiles = req.files.map(file => ({
      url: `/uploads/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype
    }));

    logger.info('📁 [UPLOAD] Multiple images uploaded successfully:', {
      userId: req.user.id,
      count: req.files.length,
      filenames: req.files.map(f => f.filename)
    });

    res.status(200).json({
      success: true,
      message: 'Files uploaded successfully',
      data: {
        files: uploadedFiles
      }
    });

  } catch (error) {
    logger.error('📁 [UPLOAD] Multiple images upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload files',
      error: error.message
    });
  }
});

// @desc    Upload document
// @route   POST /api/upload/document
// @access  Private
router.post('/document', protect, uploadSingle, handleUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Check if it's a document type
    const allowedDocumentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!allowedDocumentTypes.includes(req.file.mimetype)) {
      // Delete the uploaded file
      fs.unlinkSync(req.file.path);
      
      return res.status(400).json({
        success: false,
        message: 'Invalid document type. Only PDF and Word documents are allowed.'
      });
    }

    logger.info('📁 [UPLOAD] Document uploaded successfully:', {
      userId: req.user.id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });

    const fileUrl = `/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });

  } catch (error) {
    logger.error('📁 [UPLOAD] Document upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document',
      error: error.message
    });
  }
});

// @desc    Delete uploaded file
// @route   DELETE /api/upload/:filename
// @access  Private
router.delete('/:filename', protect, async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join('uploads', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Delete file
    fs.unlinkSync(filePath);

    logger.info('📁 [UPLOAD] File deleted successfully:', {
      userId: req.user.id,
      filename
    });

    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    logger.error('📁 [UPLOAD] File deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file',
      error: error.message
    });
  }
});

// @desc    Get upload statistics
// @route   GET /api/upload/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const uploadsDir = 'uploads';
    
    if (!fs.existsSync(uploadsDir)) {
      return res.status(200).json({
        success: true,
        data: {
          totalFiles: 0,
          totalSize: 0,
          fileTypes: {}
        }
      });
    }

    const files = fs.readdirSync(uploadsDir);
    let totalSize = 0;
    const fileTypes = {};

    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);
      totalSize += stats.size;

      const ext = path.extname(file).toLowerCase();
      fileTypes[ext] = (fileTypes[ext] || 0) + 1;
    }

    logger.info('📁 [UPLOAD] Stats retrieved:', {
      userId: req.user.id,
      totalFiles: files.length,
      totalSize
    });

    res.status(200).json({
      success: true,
      data: {
        totalFiles: files.length,
        totalSize,
        fileTypes
      }
    });

  } catch (error) {
    logger.error('📁 [UPLOAD] Stats retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get upload statistics',
      error: error.message
    });
  }
});

export default router; 
 
 