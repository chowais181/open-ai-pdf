import type { NextApiRequest, NextApiResponse } from 'next';
import { pinecone } from '@/utils/pinecone-client';
import { PINECONE_INDEX_NAME } from '@/config/pinecone';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { user, selectedFiles } = req.body;

  //only accept post requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!user && !selectedFiles.length) {
    return res.status(400).json({ message: 'Delete operation Failed' });
  }

  try {
    const index = pinecone.Index(PINECONE_INDEX_NAME);
    const result = await index.delete1({
      deleteAll: true,
      namespace: user?.Username,
    });

    console.log('response', result);

    const headers: any = {
      cookie: req.headers.cookie,
    };
    const userResponse = await fetch(
      `${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/deleteAllFiles`,
      {
        headers,
      },
    );
    const userResult = await userResponse.json();

    console.log('user result: ', userResult);

    if (userResult.error) {
      res.status(500).json({ error: 'Unable to delete  user data' });
      return;
    }

    res.status(200).json({
      message: 'All files data deleted successfully',
      user: userResult,
    });
  } catch (error: any) {
    console.log('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
