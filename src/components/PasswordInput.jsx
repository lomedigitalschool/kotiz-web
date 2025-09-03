import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export const PasswordInput = ({
  value = '',
  onChange,
  placeholder = 'Votre mot de passe',
  className = '',
  required = false,
  name = 'password',
  showStrength = false
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const calculatePasswordStrength = (password) => {
    if (!password) return '';

    let strength = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    strength = Object.values(checks).filter(Boolean).length;

    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    if (showStrength) {
      setPasswordStrength(calculatePasswordStrength(newValue));
    }
    if (onChange) {
      onChange(e);
    }
  };

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'strong': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const getStrengthText = () => {
    switch (passwordStrength) {
      case 'weak': return 'Faible';
      case 'medium': return 'Moyen';
      case 'strong': return 'Fort';
      default: return '';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          name={name}
          className="w-full px-3 py-3 pr-12 bg-[#4ac26033] text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ca260] transition-all"
        />

        {/* Bouton pour afficher/masquer le mot de passe */}
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        >
          {showPassword ? (
            <FiEyeOff className="w-5 h-5" />
          ) : (
            <FiEye className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Indicateur de force du mot de passe */}
      {showStrength && value && (
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
                style={{
                  width: passwordStrength === 'weak' ? '33%' :
                         passwordStrength === 'medium' ? '66%' : '100%'
                }}
              />
            </div>
            <span className={`text-xs font-medium ${
              passwordStrength === 'weak' ? 'text-red-500' :
              passwordStrength === 'medium' ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              {getStrengthText()}
            </span>
          </div>

          {/* Critères de validation */}
          <div className="mt-2 text-xs text-gray-600 space-y-1">
            <div className={`flex items-center gap-2 ${value.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
              <span className={value.length >= 8 ? '✓' : '○'}></span>
              Au moins 8 caractères
            </div>
            <div className={`flex items-center gap-2 ${/[A-Z]/.test(value) ? 'text-green-600' : 'text-gray-400'}`}>
              <span className={/[A-Z]/.test(value) ? '✓' : '○'}></span>
              Une lettre majuscule
            </div>
            <div className={`flex items-center gap-2 ${/[a-z]/.test(value) ? 'text-green-600' : 'text-gray-400'}`}>
              <span className={/[a-z]/.test(value) ? '✓' : '○'}></span>
              Une lettre minuscule
            </div>
            <div className={`flex items-center gap-2 ${/\d/.test(value) ? 'text-green-600' : 'text-gray-400'}`}>
              <span className={/\d/.test(value) ? '✓' : '○'}></span>
              Un chiffre
            </div>
            <div className={`flex items-center gap-2 ${/[!@#$%^&*(),.?":{}|<>]/.test(value) ? 'text-green-600' : 'text-gray-400'}`}>
              <span className={/[!@#$%^&*(),.?":{}|<>]/.test(value) ? '✓' : '○'}></span>
              Un caractère spécial
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordInput;