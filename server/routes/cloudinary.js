const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const streamifier = require('streamifier');

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer config (in-memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload', upload.single('file'), async (req, res) => {
	try {
		const streamUpload = (req) => {
			return new Promise((resolve, reject) => {
				const stream = cloudinary.uploader.upload_stream(
					{
						folder: 'home-horizon-users',
					},
					(error, result) => {
						if (result) resolve(result);
						else reject(error);
					},
				);
				streamifier.createReadStream(req.file.buffer).pipe(stream);
			});
		};

		const result = await streamUpload(req);
		res.send({
			url: result.secure_url,
			public_id: result.public_id,
		});
	} catch (error) {
		console.error(error);
		res.status(500).send({ error: 'Image upload failed' });
	}
});

router.post('/delete-image', async (req, res) => {
	const { public_id } = req.body;
	try {
		const result = await cloudinary.uploader.destroy(public_id);
		res.send(result);
	} catch (err) {
		console.error('Cloudinary delete error:', err);
		res.status(500).send({ error: 'Failed to delete image' });
	}
});


module.exports = router;
