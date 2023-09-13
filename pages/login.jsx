import Layout from '../components/layout';
import { getCookie } from 'cookies-next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '@/styles/Index.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { msg } = router.query;
  const apiUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/login`;
  return (
    <Layout pageTitle="Login">
      <p className={styles.heading}>Chat with Docs</p>
      <div className={styles.authPages}>
        {msg ? <h3 className="red">{msg}</h3> : <></>}
        <p className={styles.heading1}>Login</p>
        <form action={apiUrl} method="POST">
          <input
            minLength="3"
            name="username"
            id="username"
            type="text"
            placeholder="username"
            required
          ></input>
          <br />
          <input
            minLength="5"
            name="password"
            id="password"
            type="password"
            placeholder="password"
            required
          ></input>
          <br />
          <input type="submit" value="Login" />
        </form>
        <br />
        <p>
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            style={{ textDecoration: 'underline', color: '#0ced6a' }}
          >
            Signup
          </Link>
        </p>
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const req = context.req;
  const res = context.res;
  var token = getCookie('token', { req, res });
  if (token != undefined) {
    return {
      redirect: {
        permanent: false,
        destination: '/',
      },
    };
  }
  return { props: {} };
}
