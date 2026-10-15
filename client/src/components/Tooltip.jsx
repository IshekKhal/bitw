import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

export default function Tooltip({ title, text, whyItMatters }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span
      className="tooltip-wrapper"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onClick={() => setIsOpen(!isOpen)}
      role="button"
      tabIndex={0}
      aria-label={`Information: ${title}`}
    >
      <HelpCircle size={13} className="tooltip-icon" />
      {isOpen && (
        <span className="tooltip-box">
          <span className="tooltip-title">{title}</span>
          <span className="tooltip-text">{text}</span>
          {whyItMatters && (
            <span className="tooltip-why">
              <strong>Baby Terms:</strong> {whyItMatters}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
