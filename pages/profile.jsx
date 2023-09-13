import Layout from '../components/layout';
import { getCookie } from 'cookies-next';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user');
        const data = await response.json();

        setUser(data);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, []);
  return (
    <Layout pageTitle="Profile">
      <Link href="/">Home</Link>
      <br />
      <h2>{user?.Username} Profile</h2>
      <p>
        Account created at <strong>{user?.Created}</strong>
      </p>
    </Layout>
  );
}

export async function getServerSideProps(context) {
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
