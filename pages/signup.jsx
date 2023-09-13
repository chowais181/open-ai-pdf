import Layout from '../components/layout';
import { getCookie } from 'cookies-next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '@/styles/Index.module.css';

export default function SignupPage({ username }) {
  const router = useRouter();
  const { msg } = router.query;

  const apiUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/signup`;
  return (
    <Layout pageTitle="Signup">
      <p className={styles.heading}>Chat with Docs</p>
      <div className={styles.authPages}>
        {msg ? <h3 className="red">{msg}</h3> : <></>}
        <h2 className={styles.heading1}>Sign up</h2>

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
            pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"
            name="email"
            id="email"
            type="email"
            placeholder="email"
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
          <input
            minLength="5"
            name="passwordagain"
            id="passwordagain"
            type="password"
            placeholder="password again"
            required
          ></input>
          <br />
          <input type="submit" value="Signup" />
        </form>
        <br />
        <p>
          Already have an account?{' '}
          <Link
            href="/login"
            style={{ textDecoration: 'underline', color: '#0ced6a' }}
          >
            Login
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
