// Folder: /admin/api/get-posts.js
import clientPromise from '../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const client = await clientPromise;
  const db = client.db();
  const posts = await db.collection('posts').find({}).sort({ createdAt: -1 }).toArray();
  res.status(200).json(posts);
}