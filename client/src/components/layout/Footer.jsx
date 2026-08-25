import React from 'react';
import { Link } from 'react-router-dom';
import { FOOTER_LINKS } from '../../constants/data';

/**
 * Footer — 4-column footer matching the Stitch design.
 * Dashed top border, receipt aesthetic with Space Mono section headers.
 */
export default function Footer() {
  const footerSections = [
    { title: 'Legal', links: FOOTER_LINKS.legal },
    { title: 'Contact', links: FOOTER_LINKS.contact },
    { title: 'Social', links: FOOTER_LINKS.social },
  ];

  return (
    <footer
      className="w-full mt-auto bg-surface-container-highest border-t border-dashed border-outline"
      role="contentinfo"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 px-4 sm:px-6 lg:px-12 py-12 max-w-[1280px] mx-auto">
        {/* Brand Column */}
        <div className="col-span-1">
          <Link
            to="/"
            className="font-mono font-bold text-primary mb-6 block text-[24px]"
            aria-label="DABBA home"
          >
            DABBA
          </Link>
          <p className="font-body text-[14px] leading-[1.5] text-on-surface mb-4">
            © 2024 DABBA Logistics. Timed to perfection.
          </p>
        </div>

        {/* Link Columns */}
        {footerSections.map((section) => (
          <div key={section.title} className="space-y-3">
            <h5 className="font-mono text-[12px] uppercase font-bold text-on-surface tracking-wider">
              {section.title}
            </h5>
            <ul className="space-y-2" role="list">
              {section.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="font-body text-[14px] leading-[1.5] text-secondary hover:text-on-surface transition-all"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
