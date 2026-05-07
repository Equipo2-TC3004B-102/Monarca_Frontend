/**
 * FileName: GoBack.tsx
 * Description: Provides a reusable back-navigation button that redirects the user to the dashboard.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 06/05/2026 [Sergio Jiawei Xuan] Translated hardcoded "Regresar" string with i18n t().
 */

import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa6";
import { useTranslation } from "react-i18next";

/**
 * FunctionName: GoBack, renders a back-navigation button that routes the user to /dashboard.
 * Input: none
 * Output: JSX button element with an arrow icon and label.
 */
const GoBack = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <button
            onClick={() => navigate("/dashboard")}
            aria-label={t('common.goBack')}
            type="button"
            className="mb-6 text-sm w-fit text-[var(--blue)] hover:text-[var(--dark_blue)] flex items-center gap-2 justify-center"

        >
            <FaArrowLeft /> {t('common.goBack')}
        </button>
    )
}

export default GoBack;