/**
 * FileName: Footer.tsx
 * Description: Renders the application footer with copyright, terms, and privacy policy information.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 25/02/2026 [Santiago-Coronado] Added detailed comments and documentation for clarity and maintainability.
 */

/**
 * FunctionName: Footer, renders the bottom bar of the application.
 * Input: none
 * Output: JSX footer element with copyright and legal links.
 */
function Footer() {
    return (
        <footer className="w-full bg-[var(--dark-blue)] text-[var(--white)]">
            <div className="max-w-screen-xl mx-auto p-5 flex justify-between items-center text-xs">
                <p>Copyright © {new Date().getFullYear()} 02 Solutions.</p>
                <p>All Rights Reserved | Terms and Conditions | Privacy Policy</p>
            </div>
        </footer>
    )
}

export default Footer;