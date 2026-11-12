import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../Header/Logo';
import { FOOTER_LINK_SECTIONS, FOOTER_STYLES } from './Footer.constants';

const Footer: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigate = (path: string) => navigate(path);

  return (
    <footer className={FOOTER_STYLES.container}>
      <div className="max-w-7xl mx-auto">
        
        {/* Top section with categorized links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 items-start">
          
          {/* Column 1: Logo & Intro */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Logo className="text-xl text-text-main mb-3" />
            <p className="text-text-muted text-xs max-w-xs pt-1">
              Prove your value with our AI interview solution.
            </p>
          </div>

          {/* Link Columns */}
          {FOOTER_LINK_SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className={FOOTER_STYLES.sectionTitle}>{section.title}</h3>
              <ul className="space-y-1.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => handleNavigate(link.path)}
                      className={FOOTER_STYLES.linkBtn}
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Bottom section with copyright */}
        <div className="mt-10 pt-6 border-t border-border-subtle flex flex-col md:flex-row items-center justify-between text-center md:text-left">
          <p className={FOOTER_STYLES.copyright}>
            &copy; {new Date().getFullYear()} DADAP. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;