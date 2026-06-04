/**
 * FileName: RefreshButton.tsx
 * Description: Renders a small icon button used to trigger data refresh actions throughout the application.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 04/06/2026 [Sergio Jiawei Xuan] Added spin animation, 600ms minimum duration, disabled state, and async onClick support.
 */

import { useState } from "react";
import { MdRefresh } from "react-icons/md";

interface RefreshButtonProps {
  onClick?: () => void | Promise<void>;
}

/**
 * FunctionName: RefreshButton, renders a circular refresh icon button with a spin animation while loading.
 * Input: onClick — optional async callback fired when the button is clicked.
 * Output: JSX button element with spinning feedback during the refresh.
 */
const RefreshButton = ({ onClick }: RefreshButtonProps) => {
  const [spinning, setSpinning] = useState(false);

  const handleClick = async () => {
    if (!onClick || spinning) return;
    setSpinning(true);
    const start = Date.now();
    try {
      await onClick();
    } finally {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 600 - elapsed);
      setTimeout(() => setSpinning(false), remaining);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={spinning}
      className="p-2 bg-[var(--color-page-bg)] rounded-md shadow hover:bg-[var(--color-card-bg)] disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <MdRefresh
        className={`h-6 w-6 text-[var(--color-page-text)] transition-transform ${spinning ? "animate-spin" : ""}`}
      />
    </button>
  );
};

export default RefreshButton;
