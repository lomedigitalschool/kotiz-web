import React from 'react';

const Button = ({ children, onClick, type = 'button', variant = 'primary', className = '' }) => {
  const baseStyle = 'font-semibold px-6 py-3 rounded-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg';
  
  const styles = {
    primary: 'bg-[#4ca260] text-white hover:bg-[#3e8a50] focus:ring-4 focus:ring-[#4ca260]/50',
    secondary: 'bg-[#3B5BAB] text-white hover:bg-[#2f4a8a] focus:ring-4 focus:ring-[#3B5BAB]/50',
    tertiary: 'bg-transparent text-[#3B5BAB] hover:bg-[#3B5BAB] hover:text-white border-2 border-[#3B5BAB]',
    outline: 'bg-transparent text-[#4ca260] hover:bg-[#4ca260] hover:text-white border-2 border-[#4ca260]',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyle} ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;