// Folder: /admin/api/block-user.js
import clientPromise from '../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  try {
    const client = await clientPromise;
    const db = client.db();
    await db.collection('blocked_users').updateOne(
      { userId },
      { $set: { userId } },
      { upsert: true }
    );
    res.status(200).json({ message: 'User blocked' });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
