/**
 * FileName: RefreshButton.tsx
 * Description: Renders a small icon button used to trigger data refresh actions throughout the application.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 04/05/2026 [Rebeca-Davila] Changed colors for dark mode
 */

import { MdRefresh } from "react-icons/md";

interface RefreshButtonProps {
  onClick?: () => void;
}

/**
 * FunctionName: RefreshButton, renders a circular refresh icon button with hover styling.
 * Input: onClick — optional callback fired when the button is clicked.
 * Output: JSX button element containing a refresh icon.
 */
const RefreshButton = ({ onClick }: RefreshButtonProps) => {

    return (
        <button
            onClick={onClick}
            className="p-2 bg-[var(--color-page-bg)] rounded-md shadow hover:bg-[var(--color-card-bg)]"
        >
            <MdRefresh className="h-6 w-6 text-[var(--color-page-text)]" />
        </button>
    )

}


export default RefreshButton;