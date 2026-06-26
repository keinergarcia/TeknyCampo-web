import type { ReactNode } from 'react';

interface SocialIconProps {
  href: string;
  label: string;
  children: ReactNode;
  variant?: 'default' | 'large';
}

export default function SocialIcon({ href, label, children, variant = 'default' }: SocialIconProps) {
  const size = variant === 'large' ? 'w-12 h-12 rounded-xl' : 'w-10 h-10 rounded-lg';
  const iconSize = variant === 'large' ? 'w-6 h-6' : 'w-5 h-5';

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${size} bg-green-700 flex items-center justify-center hover:bg-green-600 transition-colors text-white`}
      aria-label={label}
    >
      <span className={iconSize}>
        {children}
      </span>
    </a>
  );
}
