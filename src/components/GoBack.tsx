/**
 * FileName: GoBack.tsx
 * Description: Provides a reusable back-navigation button that redirects the user to the dashboard.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 25/02/2026 [Santiago-Coronado] Added detailed comments and documentation for clarity and maintainability.
 */

import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa6";

/**
 * FunctionName: GoBack, renders a back-navigation button that routes the user to /dashboard.
 * Input: none
 * Output: JSX button element with an arrow icon and label.
 */
const GoBack = () => {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate("/dashboard")}
            aria-label="Regresar"
            type="button"
            className="mb-6 text-sm w-fit text-[var(--blue)] hover:text-[var(--dark_blue)] flex items-center gap-2 justify-center"

        >
            <FaArrowLeft /> Regresar
        </button>
    )
}

export default GoBack;