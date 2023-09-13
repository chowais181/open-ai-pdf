import { useRef, useState, useEffect } from 'react';
import React from 'react';
import Layout from '../components/layout';
// import LayoutChat from '../components/layoutChat';
import { getCookie } from 'cookies-next';
import styles from '@/styles/Home.module.css';
import { Message } from '@/types/chat';
import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import LoadingDots from '@/components/ui/LoadingDots';
import { Document } from 'langchain/document';
import { message } from 'antd';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Loader from '@/components/Loader';

export default function Chat() {
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [loadDel, setLoadDel] = useState<boolean>(false);
  const [loadingSideBar, setLoadingSideBar] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [messageState, setMessageState] = useState<{
    messages: Message[];
    pending?: string;
    history: [string, string][];
    pendingSourceDocs?: Document[];
  }>({
    messages: [
      {
        message: 'Hi, what would you like to know?',
        type: 'apiMessage',
      },
    ],
    history: [],
  });

  const [user, setUser] = useState<any>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const handleFileSelection = (fileName: string) => {
    if (selectedFiles.includes(fileName)) {
      setSelectedFiles(selectedFiles.filter((file) => file !== fileName));
    } else {
      setSelectedFiles([...selectedFiles, fileName]);
    }
  };

  const clearAllSelection = () => {
    setSelectedFiles([]);
  };

  const { messages, history } = messageState;
  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Fetch user data first

    const fetchData = async () => {
      try {
        setLoadingSideBar(true);
        const response = await fetch('/api/user');
        const data = await response.json();
        if (data.error) {
          setError(data.error);
          setLoadingSideBar(false);
          return;
        } else {
          setUser(data);
          setLoadingSideBar(false);
        }
      } catch (error: any) {
        setLoadingSideBar(false);
        setError(
          'An error occurred while fetching the data. Please try again.',
        );
        return;
      }
    };

    fetchData();
    textAreaRef.current?.focus();
  }, []);

  //delete selected file
  async function deleteFile(e: any, filename: any) {
    e.preventDefault();
    setError(null);
    setLoadDel(true);

    try {
      const response = await fetch('/api/deleteSelectedVector', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user,
          filename,
        }),
      });
      const data = await response.json();
      if (data.error) {
        setLoadDel(false);
        message.error(data.error);
      } else {
        setLoadDel(false);
        setUser(data?.user);
        // setSelectedFiles([]);
        message.success(data?.message);
      }

      setLoadDel(false);
    } catch (error: any) {
      setLoadDel(false);
      message.error(error?.error);
    }
  }

  //delete all  files
  async function deleteAllFiles(e: any) {
    e.preventDefault();
    setError(null);
    setLoadDel(true);

    try {
      const response = await fetch('/api/deleteVector', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user,
          selectedFiles,
        }),
      });
      const data = await response.json();
      if (data.error) {
        setLoadDel(false);
        message.error(data.error);
      } else {
        setLoadDel(false);
        setUser(data?.user);
        setSelectedFiles([]);
        message.success(data?.message);
      }

      setLoadDel(false);
    } catch (error: any) {
      setLoadDel(false);
      message.error(error?.error);
    }
  }

  //handle form submission
  async function handleSubmit(e: any) {
    e.preventDefault();
    setError(null);

    if (!query) {
      alert('Please input a question');
      return;
    }

    const question = query.trim();

    setMessageState((state) => ({
      ...state,
      messages: [
        ...state.messages,
        {
          type: 'userMessage',
          message: question,
        },
      ],
    }));

    setLoading(true);
    setQuery('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          history,
          user,
          selectedFiles,
        }),
      });
      const data = await response.json();
      // console.log('data', data);

      if (data.error) {
        setError(data.error);
      } else {
        setMessageState((state) => ({
          ...state,
          messages: [
            ...state.messages,
            {
              type: 'apiMessage',
              message: data.text,
              sourceDocs: data.sourceDocuments,
            },
          ],
          history: [...state.history, [question, data.text]],
        }));
      }
      // console.log('messageState', messageState);

      setLoading(false);

      //scroll to bottom
      messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);
    } catch (error) {
      setLoading(false);
      setError('An error occurred while fetching the data. Please try again.');
      console.log('error', error);
    }
  }

  //prevent empty submissions
  const handleEnter = (e: any) => {
    if (e.key === 'Enter' && query) {
      handleSubmit(e);
    } else if (e.key == 'Enter') {
      e.preventDefault();
    }
  };

  // layout setting -------------------------
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const shouldShowMenuIcon = windowWidth < 768;

  // -----------------------------------------------

  return (
    <>
      <Layout pageTitle="Chat with Pdf">
        <div className="flex">
          {/* Sidebar */}
          <div
            className={`${
              isSidebarOpen || !shouldShowMenuIcon ? 'block' : 'hidden'
            } ${
              shouldShowMenuIcon ? 'fixed top-0 left-0 w-[280px]' : 'w-[280px]'
            } ${styles.customSidebarColor} h-screen z-10`}
          >
            {/* Sidebar content */}
            <div className="p-4 mt-10">
              <br />
              <div className="text-black">
                {loadingSideBar ? (
                  <Loader />
                ) : (
                  <div className={styles.sidebar}>
                    <Link href="/" className={styles.link}>
                      <div className={styles.plusFileContainer}>
                        <div className={styles.iconAndTextContainer}>
                          <svg
                            className={styles.icon}
                            stroke="currentColor"
                            fill="none"
                            stroke-width="2"
                            viewBox="0 0 24 24"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            height="1em"
                            width="1em"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                          <span className={styles.text}>Upload PDF</span>
                        </div>
                      </div>
                    </Link>
                    <br />
                    <div className={styles.sidebarOverflow}>
                      <div className={styles.sideBarContentHeight}>
                        {/* Clear All Selection button */}
                        {selectedFiles.length > 0 && (
                          <div className={styles.selectionBtns}>
                            <button
                              className={styles.clearSelectionButton}
                              onClick={clearAllSelection}
                            >
                              Clear
                            </button>
                            <button
                              className={styles.deleteFilesButton}
                              disabled={loading}
                              onClick={deleteAllFiles}
                            >
                              Delete Recent Chats
                              <svg
                                stroke="currentColor"
                                fill="none"
                                stroke-width="2"
                                viewBox="0 0 24 24"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                className="h-4 w-4"
                                height="1em"
                                width="1em"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                              </svg>
                            </button>
                          </div>
                        )}
                        {user && user?.files?.length > 0 ? (
                          user?.files
                            ?.slice()
                            .reverse()
                            ?.map((file: any, index: number) => (
                              <React.Fragment key={file.name}>
                                <div className={styles.recentChat}>
                                  <label className={styles.fileLabel}>
                                    <input
                                      type="checkbox"
                                      checked={selectedFiles.includes(
                                        file.name,
                                      )}
                                      onChange={() =>
                                        handleFileSelection(file.name)
                                      }
                                    />
                                    <span className={styles.fileName}>
                                      {file?.name.split('_')[0]}
                                    </span>

                                    <svg
                                      stroke="currentColor"
                                      fill="none"
                                      stroke-width="2"
                                      viewBox="0 0 24 24"
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                      className={`${styles.deleteFileSvg}`}
                                      height="1em"
                                      width="1em"
                                      xmlns="http://www.w3.org/2000/svg"
                                      onClick={(e: any) =>
                                        deleteFile(e, file.name)
                                      }
                                    >
                                      <polyline points="3 6 5 6 21 6"></polyline>
                                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                      <line
                                        x1="10"
                                        y1="11"
                                        x2="10"
                                        y2="17"
                                      ></line>
                                      <line
                                        x1="14"
                                        y1="11"
                                        x2="14"
                                        y2="17"
                                      ></line>
                                    </svg>
                                  </label>
                                </div>
                              </React.Fragment>
                            ))
                        ) : (
                          <React.Fragment>
                            <p className="text-white">
                              Please Upload your files to chat
                            </p>
                          </React.Fragment>
                        )}
                      </div>
                    </div>
                    <hr className={styles.divider} />

                    {/* user data email and settings */}
                    <div className={styles.userContainer}>
                      <div className={styles.userIcon}>
                        <svg
                          className={styles.icon}
                          stroke="currentColor"
                          fill="none"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          height="1em"
                          width="1em"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="M17.6 14.8c.9-1.2 1.4-2.7 1.4-4.3 0-3.9-3.1-7-7-7s-7 3.1-7 7c0 1.6.5 3.1 1.4 4.3" />
                          <path d="M12 17c-2.2 0-4-1.8-4-4h8c0 2.2-1.8 4-4 4z" />
                        </svg>
                      </div>

                      <div className={styles.userInfo}>
                        <span className={styles.userEmail}>
                          {user ? user?.Email : 'Email not found'}
                        </span>
                        <div className={styles.dropdown}>
                          <svg
                            className={styles.dropdownIcon}
                            stroke="currentColor"
                            fill="none"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            height="1em"
                            width="1em"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M6 9l6 6 6-6" />
                          </svg>
                          <div className={styles.dropdownContent}>
                            <Link
                              href="/api/logout"
                              className={styles.dropdownItem}
                            >
                              Logout
                            </Link>
                            <Link
                              href="/settings"
                              className={styles.dropdownItem}
                            >
                              Settings
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1">
            {/* Toggle sidebar button */}
            {shouldShowMenuIcon && (
              <button
                className="fixed top-4 left-4 bg-gray-200 p-2 rounded-md text-black z-20"
                onClick={toggleSidebar}
              >
                {isSidebarOpen ? '✘' : '☰'}
              </button>
            )}

            {/* Chat content */}
            <div className="mx-auto flex flex-col gap-4">
              <h1 className="text-2xl font-bold leading-[1.1] tracking-tighter text-center mt-5">
                Chat with Docs
              </h1>
              <main className={styles.main}>
                <div className={styles.cloud}>
                  <div ref={messageListRef} className={styles.messagelist}>
                    {messages.map((message, index) => {
                      let icon;
                      let className;
                      if (message.type === 'apiMessage') {
                        icon = (
                          <Image
                            key={index}
                            src="/bot-image.png"
                            alt="AI"
                            width="40"
                            height="40"
                            className={styles.boticon}
                            priority
                          />
                        );
                        className = styles.apimessage;
                      } else {
                        icon = (
                          <Image
                            key={index}
                            src="/usericon.png"
                            alt="Me"
                            width="30"
                            height="30"
                            className={styles.usericon}
                            priority
                          />
                        );
                        // The latest message sent by the user will be animated while waiting for a response
                        className =
                          loading && index === messages.length - 1
                            ? styles.usermessagewaiting
                            : styles.usermessage;
                      }
                      return (
                        <div key={`chatMessage-${index}`}>
                          <div className={className}>
                            {icon}
                            <div className={styles.markdownanswer}>
                              <ReactMarkdown linkTarget="_blank">
                                {message.message}
                              </ReactMarkdown>
                            </div>
                          </div>
                          {message.sourceDocs && (
                            <div
                              className="p-5"
                              key={`sourceDocsAccordion-${index}`}
                            >
                              <Accordion
                                type="single"
                                collapsible
                                className={styles.Accordion}
                              >
                                {message.sourceDocs.map((doc, index) => (
                                  <div key={`messageSourceDocs-${index}`}>
                                    <AccordionItem
                                      value={`item-${index}`}
                                      className={styles.accordionItem}
                                    >
                                      <AccordionTrigger
                                        className={styles.accordionTrigger}
                                      >
                                        <h3>
                                          <div className={styles.source}>
                                            Source {index + 1}
                                          </div>
                                        </h3>
                                      </AccordionTrigger>
                                      <AccordionContent>
                                        <ReactMarkdown linkTarget="_blank">
                                          {doc.pageContent}
                                        </ReactMarkdown>
                                        <p className="mt-2">
                                          <b>Source:</b> {doc.metadata.source}
                                        </p>
                                      </AccordionContent>
                                    </AccordionItem>
                                  </div>
                                ))}
                              </Accordion>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className={styles.center}>
                  <div className={styles.cloudform}>
                    <form onSubmit={handleSubmit}>
                      <textarea
                        disabled={loading}
                        onKeyDown={handleEnter}
                        ref={textAreaRef}
                        autoFocus={false}
                        rows={1}
                        maxLength={512}
                        id="userInput"
                        name="userInput"
                        placeholder={
                          loading
                            ? 'Waiting for response...'
                            : 'Send a message.'
                        }
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className={styles.textarea}
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className={styles.generatebutton}
                      >
                        {loading ? (
                          <div className={styles.loadingwheel}>
                            <LoadingDots color="#000" />
                          </div>
                        ) : (
                          // Send icon SVG in input field
                          <svg
                            viewBox="0 0 20 20"
                            className={styles.svgicon}
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                          </svg>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
                {error && (
                  <div className="border border-red-400 rounded-md p-4">
                    <p className="text-red-500">{error}</p>
                  </div>
                )}
                <footer className="m-auto p-4 text-white">
                  Powered by Coduko.
                </footer>
              </main>
            </div>
          </div>

          <style jsx>{`
            hr {
              border: none;
              border-top: 1px solid #ccc;
            }

            @media (max-width: 767px) {
              .flex {
                flex-direction: column;
              }

              .flex-1 {
                margin-top: 1rem;
              }

              .overflow-y-auto {
                overflow-y: auto;
              }

              .z-10 {
                z-index: 10;
              }

              .z-20 {
                z-index: 20;
              }
            }
          `}</style>
        </div>

        {/* </div> */}
      </Layout>
    </>
  );
}

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
