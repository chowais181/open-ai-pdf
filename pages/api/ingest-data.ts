import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { pinecone } from '@/utils/pinecone-client';
import { CustomPDFLoader } from '@/utils/customPDFLoader';
import { PINECONE_INDEX_NAME } from '@/config/pinecone';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import formidable from 'formidable';

const uploadFilesDir = path.join(process.cwd(), 'docs');

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const headers: any = {
      cookie: req.headers.cookie,
    };

    const userResponse = await fetch(
      `${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/user`,
      {
        headers,
      },
    );
    const user = await userResponse.json();

    if (user.error) {
      res.status(500).json({ error: 'Unable to fetch user data' });
      return;
    }

    const form = new formidable.IncomingForm({
      maxFiles: 5,
      // maxFileSize: 1024 * 1024 * 10, // 10mb
      filename: (_name, _ext, part) => {
        const originalFileName: any = part.originalFilename || 'unknown';
        return originalFileName;
      },
      uploadDir: uploadFilesDir, // Set the upload directory
      keepExtensions: true, // Optional: Keep the original file extension
      multiples: true, // Allow multiple file uploads
    });

    form.parse(req, async (error, fields, files) => {
      if (error) {
        console.log('Error parsing form data', error);
        return res.status(400).json({ error: 'Failed to parse form data' });
      }

      const maxFileSize = 1024 * 1024 * 10; // 10MB
      const errorFiles: any = [];

      for (const field of Object.values(files)) {
        if (Array.isArray(field)) {
          for (const file of field) {
            if ('size' in file) {
              if (file.size > maxFileSize) {
                if ('originalFilename' in file) {
                  errorFiles.push(file.originalFilename?.split('_').shift());
                }
              }
            }
          }
        } else {
          if ('size' in field) {
            if (field.size > maxFileSize) {
              if ('originalFilename' in field) {
                errorFiles.push(field.originalFilename?.split('_').shift());
              }
            }
          }
        }
      }

      if (errorFiles.length > 0) {
        const errorMessage = `The following files exceed the maximum allowed size of 10MB: ${errorFiles.join(
          ', ',
        )}`;

        const folderPath = uploadFilesDir;
        fs.readdir(folderPath, (err, files) => {
          const deleteFiles = files
            .filter((file) => file !== '.gitkeep')
            .map((file) => fs.promises.unlink(path.join(folderPath, file)));

          Promise.all(deleteFiles)
            .then(() => console.log('All files deleted successfully'))
            .catch((err) => console.log('Error deleting files', err));
        });
        return res.status(400).json({ error: errorMessage });
      }

      /*load raw docs from the all files in the directory */
      const directoryLoader = new DirectoryLoader(uploadFilesDir, {
        '.pdf': (path) => new CustomPDFLoader(path),
        '.txt': (path) => new CustomPDFLoader(path),
        '.csv': (path) => new CustomPDFLoader(path),
      });

      const rawDocs = await directoryLoader.load();

      /* Split text into chunks */
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      const docs = await textSplitter.splitDocuments(rawDocs);

      console.log('creating vector store...');
      /*create and store the embeddings in the vectorStore*/
      const embeddings = new OpenAIEmbeddings();
      const index = pinecone.Index(PINECONE_INDEX_NAME); //change to your own index name

      // Associate the user's ID with the document metadata
      const docsWithMetadata = docs.map((doc) => {
        const fileName = path.basename(doc.metadata.source);
        return {
          ...doc,
          metadata: {
            ...doc.metadata,
            userId: user?._id,
            fileName: fileName,
          },
        };
      });

      // console.log('Docs with metadata: ', docsWithMetadata);

      //embed the PDF documents
      const result = await PineconeStore.fromDocuments(
        docsWithMetadata,
        embeddings,
        {
          pineconeIndex: index,
          namespace: user?.Username,
          textKey: 'text',
        },
      );

      console.log('ingestion completed');
      if (result) {
        const folderPath = uploadFilesDir;
        fs.readdir(folderPath, (err, files) => {
          const deleteFiles = files
            .filter((file) => file !== '.gitkeep')
            .map((file) => fs.promises.unlink(path.join(folderPath, file)));

          Promise.all(deleteFiles)
            .then(() => console.log('All files deleted successfully'))
            .catch((err) => console.log('Error deleting files', err));
        });
      }

      res.status(200).json({ message: 'Your Data Uploaded Successfully' });
    });
  } catch (error: any) {
    console.log('error', error);
    res.status(500).json({ error: 'Failed to upload your data' });
  }
}
