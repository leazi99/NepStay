import React from 'react'

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const base = 'inline-flex items-center justify-center px-4 py-2 rounded-lg font-semibold transition';
  const styles = {
    primary: 'bg-nep-500 text-white hover:bg-nep-600',
    ghost: 'bg-transparent text-nep-600 hover:bg-nep-50',
    accent: 'bg-accent-500 text-white hover:opacity-95',
  };

  return (
    <button className={`${base} ${styles[variant] || styles.primary} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
