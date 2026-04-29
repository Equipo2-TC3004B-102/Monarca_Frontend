/**
 * FileName: Requests.tsx
 * Description: Renders the page that displays a list of travel requests, utilizing the RequestRow component to show individual request details in a structured format.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 25/02/2026 [Santiago-Coronado] Added detailed comments and documentation for clarity and maintainability.
 */
import RequestRow from "../components/RequestRow";

/**
 * FunctionName: Requests, renders the main page for displaying travel requests with a structured layout.
 * Input: none
 * Output: JSX component containing the list of travel requests.
 */
function Requests() {
  return (
    <div className="mt-6 px-4">
      <RequestRow />
    </div>
  );
}

export default Requests;
