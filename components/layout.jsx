import Head from 'next/head';

export const siteTitle = 'Chat with Docs';

export default function Layout({ pageTitle, children }) {
  const title = 'Chat with Docs';
  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta name="description" content="VulcanWM's GuestBook" />
        <meta property="og:image" content="/logo.png" />
        <meta name="og:title" content={siteTitle} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="og:site_name" content={siteTitle} />
        <meta name="robots" content="index, follow" />
        <meta property="og:type" content="Website" />
        <title>{pageTitle}</title>
      </Head>
      <main className="flex-grow">{children}</main>
      {pageTitle == 'Chat with Pdf' ? (
        ''
      ) : (
        <footer className="m-auto p-4 ">Powered by Coduko.</footer>
      )}
    </div>
  );
}
