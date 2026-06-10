/**
 * FileName: Mosaic.tsx
 * Description: Renders a dashboard tile (mosaic card) with an icon and title that links to a given route.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 06/05/2026 [Sergio Jiawei Xuan] Wrapped card in outer div so driver.js tutorial highlight includes the floating icon.
 */

import { Link } from "react-router-dom";

interface MosaicProps {
  title: string;
  iconPath: string;
  link: string;
  id?: string;
}

/**
 * FunctionName: Mosaic, renders a clickable card with an elevated icon and a title that navigates to a given route.
 * Input: title - display label; iconPath - path to the icon image; link - navigation route; id - optional HTML id.
 * Output: JSX Link wrapping a styled card element.
 */
const Mosaic = ({ title, iconPath, link, id }: MosaicProps) => {
  return (
    <Link
      to={link}
      data-cy={`mosaic-${title.toLowerCase().replace(/\s+/g, "-")}`}
      className="group"
    >
      <div id={id ? id : undefined} className="pt-8">
        <div
          className="relative bg-[var(--color-card-bg)] border border-[var(--color-border)] w-64 h-36 rounded-2xl flex items-end justify-center transition-all duration-300 ease-out group-hover:-translate-y-1"
          style={{
            boxShadow: "0 12px 32px -16px rgba(0, 29, 61, 0.2)",
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          <div
            className="absolute -top-8 w-20 h-20 rounded-2xl flex items-center justify-center transition-transform duration-300 ease-out group-hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #0466cb 0%, #00296b 100%)",
              boxShadow: "0 10px 24px -8px rgba(4, 102, 203, 0.45)",
            }}
          >
            <img src={iconPath} alt={title} className="w-12 h-12 object-contain" />
          </div>
          <p
            className="text-center text-[var(--color-page-text-title)] text-sm pb-4 leading-tight px-3"
            style={{ fontWeight: 600, letterSpacing: "-0.005em" }}
          >
            {title}
          </p>

          <span
            className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-0 group-hover:w-12 transition-all duration-300"
            style={{ background: "#4d9aff" }}
          />
        </div>
      </div>
    </Link>
  );
};

export default Mosaic;
