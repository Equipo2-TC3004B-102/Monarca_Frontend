/**
 * FileName: Unauthorized.tsx
 * Description: Renders a user-friendly unauthorized access page with clear messaging and navigation options for users who attempt to access restricted areas without proper permissions.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 06/05/2026 [Sergio Jiawei Xuan] Replaced all hardcoded text with i18n t() calls for multilingual support.
 */

import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

/**
 * FunctionName: Unauthorized, renders a styled page informing the user that they do not have access to the requested resource, with options to navigate back to the dashboard or login page.
 * Input: none
 * Output: JSX component containing the unauthorized access message and navigation links.
 */
export const Unauthorized = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-6">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 text-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-400">
            {t('unauthorized.title')}
          </h1>
          <div className="mt-4 text-gray-300">
            <p>{t('unauthorized.message')}</p>
            <p className="mt-2">{t('unauthorized.contact')}</p>
          </div>
        </div>
        <div className="pt-4 border-t border-gray-700">
          <Link
            to="/dashboard"
            className="block w-full py-2 text-center text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
          >
            {t('unauthorized.goToDashboard')}
          </Link>
          <Link
            to="/"
            className="block w-full py-2 mt-3 text-center text-white bg-gray-600 rounded hover:bg-gray-500 transition-colors"
          >
            {t('unauthorized.goToLogin')}
          </Link>
        </div>
        <div className="flex justify-center pt-4">
          <img
            src="https://cdn-icons-png.flaticon.com/512/1828/1828843.png"
            alt="Error icon"
            className="w-12 h-12 opacity-70"
          />
        </div>
      </div>
    </div>
  );
};
