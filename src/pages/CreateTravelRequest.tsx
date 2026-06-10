/**
 * FileName: CreateTravelRequest.tsx
 * Description: Renders the page for creating a new travel request, including the travel request form and tutorial logic for first-time visitors to guide them through the process.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 02/06/2026 [Nicolas Quintana] Added extra comments for better understanding.
 */

import { useEffect } from "react";
import TravelRequestForm from "../components/travel-requests/TravelRequestForm";
import { Tutorial } from "../components/Tutorial";
import { useApp } from "../hooks/app/appContext";

/**
 * FunctionName: CreateTravelRequest, renders the travel request creation page with tutorial support for first-time visitors.
 * Input: none
 * Output: JSX component containing the travel request form and tutorial instructions.
 */
function CreateTravelRequest() {
  const { handleVisitPage, tutorial, setTutorial } = useApp();


  useEffect(() => {
      // Gets visited pages from localStorage
      const visitedPages = JSON.parse(localStorage.getItem("visitedPages") || "[]");
      // Check if the current page is already in the visited pages
      const isPageVisited = visitedPages.includes(location.pathname);
  
      // If the page is not visited, sets the tutorial to true
      if (!isPageVisited) {
        setTutorial(true);
      }
      // Subsecuently, add the current page to the visited pages
      handleVisitPage();
    }, []);

  return (
    <div>
      <Tutorial page="createRequest" run={tutorial}>

      <TravelRequestForm />
      </Tutorial>
    </div>
  );
}
export default CreateTravelRequest;