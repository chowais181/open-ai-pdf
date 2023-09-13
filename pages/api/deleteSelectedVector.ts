import type { NextApiRequest, NextApiResponse } from 'next';
const axios = require('axios');

const handleDeleteFile = async (req: any, filename: any) => {
  const headers = {
    cookie: req.headers.cookie,
  };

  console.log(filename);
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/deleteSelectedFile`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(filename),
      },
    );

    return response.json();
  } catch (error) {
    return error;
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { user, filename } = req.body;
  console.log('selectedFile', filename);

  //only accept post requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!user && !filename.length) {
    return res.status(400).json({ message: 'Delete operation Failed' });
  }

  try {
    const filter: any = {
      filter: {
        $and: [
          { userId: user?._id }, // Filter by userId
          { fileName: { $in: [filename] } }, // Filter by filename
        ],
      },
    };

    const url = `${process.env.PINECONE_BASE_URL}/vectors/delete?namespace=${user?.Username}`;
    const headers = {
      'Api-Key': process.env.PINECONE_API_KEY,
      'Content-Type': 'application/json',
    };

    const response = await axios.post(url, filter, { headers });
    console.log('response: ', response.status);

    // Call handleDeleteFile and await the response
    if (response.status == '200') {
      const deleteResponse: any = await handleDeleteFile(req, filename);
      console.log('deleteResponse', deleteResponse);
      // Handle the deleteResponse based on its status
      if (deleteResponse.message == 'success') {
        res.status(200).json({
          message: 'Your file deleted successfully',
          user: deleteResponse.user,
        });
      } else {
        // Handle error response
        res
          .status(deleteResponse.status)
          .json({ error: 'File deletion failed' });
      }
    } else {
      // Handle error response
      res.status(response.status).json({ error: 'File deletion failed' });
    }
  } catch (error: any) {
    console.log('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
