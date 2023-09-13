import Head from 'next/head';

interface LayoutProps {
  children?: React.ReactNode;
  pageTitle?: String;
}
export const siteTitle = 'Chat with docs';
export default function Layout({ pageTitle, children }: LayoutProps) {
  return (
    <>
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
      <div className="mx-auto flex flex-col space-y-4">
        <header className="container sticky top-0 z-40 bg-white">
          <div className="h-16 border-b border-b-slate-200 py-4">
            <nav className="ml-4 pl-6">
              {/* <a href="/" className="hover:text-slate-600 cursor-pointer">
                Home
              </a> */}
            </nav>
          </div>
        </header>
        <div>
          <main className="flex w-full flex-1 flex-col overflow-hidden">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
