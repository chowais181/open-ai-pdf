import Layout from '../components/layout';
import { getCookie } from 'cookies-next';
import Link from 'next/link';
import styles from '@/styles/Index.module.css';
import FileUpload from './file-upload';

export default function HomePage({ username }) {
  return (
    <Layout pageTitle="Home">
      {username ? (
        <>
          {/* <Link href="/">Home</Link>
          <br />
          <Link href="/profile">Profile</Link>
          <br />
          <Link href="/chat">Chat with Docs</Link>
          <br />
          <Link href="/file-upload">Upload PDF</Link>
          <br />
          <Link href="/api/logout">Logout</Link>
        </> */}
          <FileUpload />
        </>
      ) : (
        <>
          <p className={styles.heading}>Chat with Docs</p>
          <div className={styles.centerContainer}>
            <div className="authLinks">
              <div className={styles.linkContainerStyles}>
                <Link href="/login" style={{ color: '#0ced6a' }}>
                  Login
                </Link>
              </div>
              <div className={styles.linkContainerStyles}>
                <Link href="/signup" style={{ color: '#0ced6a' }}>
                  Signup
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const req = context.req;
  const res = context.res;
  const token = getCookie('token', { req, res });

  let username = true;
  if (token == undefined) {
    username = false;
  }

  return { props: { username } };
}
