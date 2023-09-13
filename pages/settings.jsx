import Layout from '../components/layout';
import { useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';
import Link from 'next/link';
import { message } from 'antd';
import Loader from '../components/Loader';
import styles from '@/styles/Index.module.css';

const CONDENSE_PROMPT_DEFAULT = `Given the conversation history provided below and a follow-up question, please rephrase the follow-up question to make it a standalone question.

Conversation History:
{chat_history}

Follow-up Question: {question}

Rephrased Standalone Question:`;

const QA_PROMPT_DEFAULT = `As an AI assistant, I am here to help you. Please use the provided context to answer the question at the end. If I don't know the answer, I will let you know. If the question is not related to the given context, I will kindly respond that I am focused on answering context-related questions.

Context:
{context}

Question: {question}

Helpful Answer (in Markdown):`;

export default function UserSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [CONDENSE_PROMPT, setCONDENSE_PROMPT] = useState('Loading .....');
  const [QA_PROMPT, setQA_PROMPT] = useState('Loading .....');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user');
        const data = await response.json();
        setUser(data);
        setCONDENSE_PROMPT(data?.CONDENSE_PROMPT || CONDENSE_PROMPT_DEFAULT);
        setQA_PROMPT(data?.QA_PROMPT || QA_PROMPT_DEFAULT);
      } catch (error) {
        message.error('Error fetching user');
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, []);

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const apiUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/settings`;
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ CONDENSE_PROMPT, QA_PROMPT }),
      });
      const data = await response.json();
      if (data.error) {
        setLoading(false);
        message.error(data.error);
        return;
      }
      setUser(data);
      setLoading(false);
      message.success('Settings updated successfully');
    } catch (error) {
      setLoading(false);

      message.error(
        'An error occurred while updating settings. Please try again.',
      );
      console.error('Error updating settings:', error);
    }
  };

  const handleReset = () => {
    setCONDENSE_PROMPT(CONDENSE_PROMPT_DEFAULT);
    setQA_PROMPT(QA_PROMPT_DEFAULT);
  };

  return (
    <Layout pageTitle="Settings">
      <p className={styles.heading}>Chat with Docs</p>

      <br />
      <p className={styles.heading1}>User Settings</p>

      <form>
        <label className={styles.settingLabel}>Enter Condense Prompt</label>
        <textarea
          className={styles.settingTextArea}
          minLength="20"
          name="condense_prompt"
          id="condense_prompt"
          placeholder="Condense Prompt"
          required
          value={CONDENSE_PROMPT}
          onChange={(event) => setCONDENSE_PROMPT(event.target.value)}
        ></textarea>
        <br />
        <label className={styles.settingLabel}>Enter Question Ans Prompt</label>
        <textarea
          className={styles.settingTextArea}
          minLength="20"
          name="qa_prompt"
          id="qa_prompt"
          placeholder="Question Ans Prompt"
          required
          value={QA_PROMPT}
          onChange={(event) => setQA_PROMPT(event.target.value)}
        ></textarea>
        <br />
        {loading ? (
          <>
            <br />
            <Loader />
          </>
        ) : (
          <>
            <button
              type="button "
              onClick={handleUpdate}
              className={styles.uploadFilebtn}
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleReset}
              className={styles.resetSetting}
            >
              Reset
            </button>
          </>
        )}
      </form>

      <br />
      <br />
      <p>
        Back to{' '}
        <Link
          href="/chat"
          style={{ textDecoration: 'underline', color: '#0ced6a' }}
        >
          Chat
        </Link>{' '}
        ?
      </p>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const req = context.req;
  const res = context.res;
  var token = getCookie('token', { req, res });
  if (token === undefined) {
    return {
      redirect: {
        permanent: false,
        destination: '/',
      },
    };
  }
  return { props: {} };
}
