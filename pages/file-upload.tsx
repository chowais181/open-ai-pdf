import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Layout from '../components/layout';
import Link from 'next/link';
import { getCookie } from 'cookies-next';
import styles from '@/styles/Index.module.css';
// import AntFileUpload from './AntFileUpload';
import { InboxOutlined } from '@ant-design/icons';
import { message, Upload, UploadProps } from 'antd';
import Loader from '../components/Loader';

const FileUpload: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const { Dragger } = Upload;

  const handleFileChange = (info: any) => {
    const { fileList } = info;
    const status = info.file.status;
    if (status === 'done') {
      message.success(`${info.file.name} file uploaded successfully.`);
      // Generate unique file names
      const updatedFileList = fileList.map((file: any) => {
        const uniqueId = uuidv4(); // Generate a unique ID
        const fileNameWithoutExtension = file.name
          .split('.')
          .slice(0, -1)
          .join('.');
        const fileExtension = file.name.split('.').pop();
        const uniqueFileName = `${fileNameWithoutExtension}_${uniqueId}.${fileExtension}`;
        const newFile = new File([file.originFileObj], uniqueFileName, {
          type: file.type,
          lastModified: file.originFileObj.lastModified,
        });
        return { ...file, originFileObj: newFile }; // Replace originFileObj with the new File object
      });

      const fileNames = updatedFileList.map(
        (file: any) => file.originFileObj.name,
      );
      setFileNames(fileNames);
      setSelectedFiles(updatedFileList);
    } else if (status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    } else {
      setSelectedFiles(fileList);
    }
  };

  const props: UploadProps = {
    name: 'file',
    multiple: true,
    maxCount: 5,
    accept: '.pdf, .txt, .csv',
    onChange: handleFileChange,
    onDrop(e: any) {
      console.log('Dropped files:', e.dataTransfer.files);
    },
    fileList: selectedFiles,
  };

  const handleUpload = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append(`files`, file.originFileObj);
      });

      const response = await fetch('/api/ingest-data', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.error) {
        message.error(data.error);
        setLoading(false);
        return;
      }
      try {
        const response = await fetch('/api/upload-files', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ files: fileNames }),
        });
        const data = await response.json();
        if (data.error) {
          message.error(
            'An error occurred while uploading the data. Please try again.',
          );
          setLoading(false);
          return;
        }
      } catch (error: any) {
        setLoading(false);
        message.error(
          'An error occurred while uploading the data. Please try again.',
        );
        return;
      }

      message.success(data.message);
      setFileNames([]);
      setSelectedFiles([]);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setSelectedFiles([]);
      setFileNames([]);
      message.error(
        'An error occurred while uploading the data. Please try again.',
      );
    }
  };

  return (
    <>
      <p className={styles.heading}>Chat with Docs</p>
      <br />
      <p>
        Continue to{' '}
        <Link
          href="/chat"
          style={{ textDecoration: 'underline', color: '#0ced6a' }}
        >
          Chat
        </Link>{' '}
        ?
      </p>
      <br />
      <div>
        <div className={styles.dropContainer}>
          <Dragger {...props} className={`${styles.textColor}`}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p>
              Click or drag <b>PDF, CSV or TXT</b> file to this area to upload.
            </p>
            <p>
              Support for a single or 5 upload. Strictly prohibited from
              uploading company data or other banned files.
            </p>
          </Dragger>
        </div>
        <br />
        {loading ? <Loader /> : ''}
        <br />
        <br />
        {selectedFiles.length > 0 && (
          <button
            onClick={handleUpload}
            disabled={loading}
            className={styles.uploadFilebtn}
          >
            Upload Files
          </button>
        )}
      </div>
    </>
  );
};

export default FileUpload;
export async function getServerSideProps(context: any) {
  const req = context.req;
  const res = context.res;
  const token = getCookie('token', { req, res });
  if (!token) {
    return {
      redirect: {
        permanent: false,
        destination: '/',
      },
    };
  }

  return {
    props: { token: token },
  };
}
