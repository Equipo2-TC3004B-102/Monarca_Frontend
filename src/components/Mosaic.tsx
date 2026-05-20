/**
 * FileName: Mosaic.tsx
 * Description: Renders a dashboard tile (mosaic card) with an icon and title that links to a given route.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 06/05/2026 [Sergio Jiawei Xuan] Wrapped card in outer div so driver.js tutorial highlight includes the floating icon.
 */

import { Link } from "react-router-dom"

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
const Mosaic = ({ title, iconPath, link, id}: MosaicProps) => {

    return (
        <Link to={link} data-cy={`mosaic-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          <div id={id ? id : undefined} className="pt-8">
            <div className="relative bg-[var(--color-card-bg)] w-64 h-30 rounded-2xl shadow-md flex items-end justify-center hover:shadow-lg transition-shadow duration-300 ease-in-out">
              <div className="absolute -top-8 bg-[#2C64C6] w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg">
                <img src={iconPath} alt={title} />
              </div>
              <p className="text-center text-[var(--color-page-text-title)] font-extrabold text-base pb-3 leading-tight px-2">
                {title}
              </p>
            </div>
          </div>
        </Link>
    )
}

export default Mosaic;