/**
 * FileName: Layout.tsx
 * Description: Wrapping layout component that enforces authentication, renders the Header, Sidebar,
 *              Footer, toast notifications, and a floating Tutorial trigger button around page content.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 04/05/2026 [Rebeca-Davila] Changed colors for dark mode
 */

import React, {useState} from 'react';
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/auth/authContext";
import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useApp } from "../hooks/app/appContext";
import { IoIosHelpCircleOutline } from "react-icons/io";


// ****************** components ******************
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

/**
 * FunctionName: Layout, wraps authenticated page content with the app shell (Header, Sidebar, Footer).
 * Redirects unauthenticated users to the root route.
 * Input: children - React nodes to render as main content; title - optional page title string.
 * Output: Full-page layout JSX or a Navigate redirect for unauthenticated users.
 */
function Layout({ children }: LayoutProps) {
  const { authState, loadingProfile } = useAuth();
  const { setTutorial } = useApp();
  const [openSidebar, setOpenSidebar] = useState(false);


  // Check if the profile is loading
  // Replace with a loading spinner or skeleton
  if (loadingProfile) return <div>Loading...</div>;

  // Check if the user is authenticated
  if (!authState.isAuthenticated) return <Navigate to="/" />;
    
  return (
    <div>
      <ToastContainer toastClassName="custom-toast"/>
      <div className="flex flex-col h-screen w-screen overflow-hidden">
        <Header toggleSidebar={() => setOpenSidebar(prev => !prev)}/>
        <div className="flex flex-1 relative min-h-0">
          {openSidebar && (
            <div
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              onClick={() => setOpenSidebar(false)}
            />
          )}

          {/* Sidebar flotante */}
          <div className={`absolute top-0 left-0 bottom-0 z-40 bg-[var(--gray)] transform transition-transform duration-500 ${
              openSidebar ? "translate-x-0" : "-translate-x-full"}
              md:hidden`}>
            <Sidebar user={authState} onNavigate={() => setOpenSidebar(false)}/>
          </div>

          <div className="hidden md:flex shrink-0 self-stretch bg-[var(--gray)]">
            <Sidebar user={authState}/>
          </div>

          <div className="bg-[var(--color-page-bg)] w-screen px-10 pt-10 flex-1 pb-10 overflow-y-auto min-h-0">{children}</div>
        </div>
        <button
          className="bg-[var(--blue)] text-white px-4 py-2 rounded hover:bg-[var(--dark-blue)] transition-colors text-sm fixed bottom-15 right-4 z-50 flex items-center"
          onClick={() => setTutorial(true)}
        >
          <IoIosHelpCircleOutline className="inline-block mr-2" />
          Tutorial
        </button>
        <Footer />
      </div>
    </div>
  );
}

export default Layout;
