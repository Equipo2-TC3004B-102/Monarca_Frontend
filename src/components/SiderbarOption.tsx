/**
 * FileName: SidebarOption.tsx
 * Description: Renders a single sidebar navigation item with an icon and label that links to a route.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 04/05/2026 [Rebeca-Davila] Changed colors for dark mode
 */

import { Link } from "react-router-dom";

interface SidebarOptionProps {
    label: string;
    pathIcon: string;
    link: string;
    onClick?: () => void;
}

/**
 * FunctionName: SidebarOption, renders a linked list item with an icon and a truncated label for sidebar navigation.
 * Input: label - display text; pathIcon - path to the icon image; link - target navigation route.
 * Output: JSX li element containing a styled Link with icon and label.
 */
const SidebarOption = ({ label, pathIcon, link, onClick  }: SidebarOptionProps) => {

    return (
        <li>
            <Link
              to={link}
              onClick={onClick}
              className="group flex items-center p-2 text-[var(--color-page-text)] text-sm rounded-lg hover:bg-[var(--blue)] hover:text-[var(--white)] gap-2"
            >
              <img
                src={pathIcon}
                alt={label}
                className="w-6 h-6 group-hover:invert-0 invert dark:invert-0"
              />
              <span className="whitespace-normal break-words w-[160px]">{label}</span>
            </Link>
          </li>
    )
};


export default SidebarOption;