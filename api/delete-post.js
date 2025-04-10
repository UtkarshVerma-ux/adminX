// Folder: /admin/api/delete-post.js
import clientPromise from '../lib/mongodb';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).end();
  const { postId, mediaUrls } = req.body;
  if (!postId) return res.status(400).json({ error: 'Missing postId' });

  try {
    const client = await clientPromise;
    const db = client.db();
    await db.collection('posts').deleteOne({ _id: new (require('mongodb').ObjectId)(postId) });

    if (Array.isArray(mediaUrls)) {
      for (let url of mediaUrls) {
        if (url && typeof url === 'string') {
          const parts = url.split('/');
          const publicIdWithExt = parts[parts.length - 1];
          const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.'));
          if (publicId) {
            await cloudinary.uploader.destroy(publicId);
          }
        }
      }
    }

    res.status(200).json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}