import { useState, useEffect } from 'react';
// import '../styles/chatLayout.css';

const LayoutChat = ({ children }) => {
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

  return (
    <div className="flex">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen || !shouldShowMenuIcon ? 'block' : 'hidden'
        } ${
          shouldShowMenuIcon ? 'fixed top-0 left-0 w-[280px]' : 'w-[280px]'
        } bg-gray-200 overflow-y-auto h-screen z-10`}
      >
        {/* Sidebar content */}
        <div className="p-4 mt-10">
          <br />
          <div className="text-black">
            <p>Untitled doc</p>
            <hr className="my-2" />
            <p>Calculus book</p>
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
          <h1 className="text-2xl font-bold leading-[1.1] tracking-tighter text-center">
            Chat With Your Docs
          </h1>
          <main>
            {/* Your existing chat code here */}
            {children}
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
  );
};

export default LayoutChat;
