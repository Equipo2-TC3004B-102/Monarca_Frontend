/**
 * FileName: Footer.tsx
 * Description: Renders the application footer with copyright, terms, and privacy policy information.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 08/06/2026 [Santiago-Coronado] Added missing translations
 */

import { useTranslation } from "react-i18next";

function Footer() {
  const { t } = useTranslation();
  return (
    <footer
      className="relative w-full"
      style={{
        fontFamily: "Montserrat, sans-serif",
        background:
          "linear-gradient(135deg, #001d3d 0%, #00296b 100%)",
        borderTop: "1px solid rgba(77, 154, 255, 0.18)",
      }}
    >
      <div className="px-5 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand block */}
        <div className="flex items-center gap-3">
          <span
            className="text-white text-sm tracking-[0.3em]"
            style={{
              fontFamily: "'Josefin Sans', sans-serif",
              fontWeight: 600,
            }}
          >
            <span style={{ color: "#4d9aff" }}>M</span>ONARCA
          </span>
          <span
            className="inline-block w-[1px] h-4 bg-white/20"
            aria-hidden
          />
          <span
            className="text-white/50 text-[0.65rem] tracking-[0.3em] uppercase"
            style={{ fontWeight: 500 }}
          >
            © {new Date().getFullYear()} · DebugStudio Team
          </span>
        </div>

        {/* Legal links */}
        <ul className="flex items-center gap-6 text-[0.7rem]">
          <li>
            <a
              href="#"
              className="text-white/55 hover:text-[#4d9aff] tracking-[0.1em] uppercase transition-colors"
              style={{ fontWeight: 500 }}
            >
              {t("footer.terms")}
            </a>
          </li>
          <li>
            <span className="inline-block w-1 h-1 rounded-full bg-white/25" />
          </li>
          <li>
            <a
              href="#"
              className="text-white/55 hover:text-[#4d9aff] tracking-[0.1em] uppercase transition-colors"
              style={{ fontWeight: 500 }}
            >
              {t("footer.privacy")}
            </a>
          </li>
          <li>
            <span className="inline-block w-1 h-1 rounded-full bg-white/25" />
          </li>
          <li>
            <span
              className="text-white/35 tracking-[0.1em] uppercase"
              style={{ fontWeight: 500 }}
            >
              {t("footer.copyright")}
            </span>
          </li>
        </ul>
      </div>
    </footer>
  );
}

export default Footer;
