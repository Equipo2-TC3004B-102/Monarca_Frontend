/**
 * FileName: SidebarOption.tsx
 * Description: Renders a single sidebar navigation item with an icon and label that links to a route.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 25/02/2026 [Santiago-Coronado] Added detailed comments and documentation for clarity and maintainability.
 */

import { Link } from "react-router-dom";

interface SidebarOptionProps {
    label: string;
    pathIcon: string;
    link: string;
}

/**
 * FunctionName: SidebarOption, renders a linked list item with an icon and a truncated label for sidebar navigation.
 * Input: label - display text; pathIcon - path to the icon image; link - target navigation route.
 * Output: JSX li element containing a styled Link with icon and label.
 */
const SidebarOption = ({ label, pathIcon, link }: SidebarOptionProps) => {

    return (
        <li>
            <Link
              to={link}
              className="group flex items-center p-2 text-[var(--dark-blue)] text-sm rounded-lg hover:bg-[var(--blue)] hover:text-[var(--white)] gap-2"
            >
              <img
                src={pathIcon}
                alt={label}
                className="w-6 h-6 group-hover:invert-0 invert"
              />
              <span className="whitespace-nowrap overflow-hidden [mask-image:linear-gradient(to_right,black_80%,transparent)] w-[130px]">{label}</span>
            </Link>
          </li>
    )
};


export default SidebarOption;