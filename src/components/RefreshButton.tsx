/**
 * FileName: RefreshButton.tsx
 * Description: Renders a small icon button used to trigger data refresh actions throughout the application.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 25/02/2026 [Santiago-Coronado] Added detailed comments and documentation for clarity and maintainability.
 */

import { MdRefresh } from "react-icons/md";

/**
 * FunctionName: RefreshButton, renders a circular refresh icon button with hover styling.
 * Input: none
 * Output: JSX button element containing a refresh icon.
 */
const RefreshButton = () => {

    return (
        <button
            className="p-2 bg-white rounded-md shadow hover:bg-gray-100"
        >
            <MdRefresh className="h-6 w-6 text-[#0a2c6d]" />
        </button>
    )

}


export default RefreshButton;