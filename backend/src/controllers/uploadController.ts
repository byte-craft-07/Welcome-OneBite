import { Request, Response } from 'express';

export const handleFileUpload = (req: Request, res: Response): void => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file was uploaded' });
      return;
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: fileUrl,
      },
    });
  } catch (error: any) {
    console.error('handleFileUpload error:', error);
    res.status(500).json({ success: false, message: 'File upload failed' });
  }
};
