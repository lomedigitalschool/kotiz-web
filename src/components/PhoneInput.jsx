import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';

// Liste des pays avec leurs codes et drapeaux
const countries = [
  { code: '+225', name: 'Côte d\'Ivoire', flag: '🇨🇮' },
  { code: '+228', name: 'Togo', flag: '🇹🇬' },
  { code: '+229', name: 'Bénin', flag: '🇧🇯' },
  { code: '+226', name: 'Burkina Faso', flag: '🇧🇫' },
  { code: '+227', name: 'Niger', flag: '🇳🇪' },
  { code: '+221', name: 'Sénégal', flag: '🇸🇳' },
  { code: '+224', name: 'Guinée', flag: '🇬🇳' },
  { code: '+223', name: 'Mali', flag: '🇲🇱' },
  { code: '+220', name: 'Gambie', flag: '🇬🇲' },
  { code: '+240', name: 'Guinée Équatoriale', flag: '🇬🇶' },
  { code: '+241', name: 'Gabon', flag: '🇬🇦' },
  { code: '+242', name: 'Congo', flag: '🇨🇬' },
  { code: '+243', name: 'RD Congo', flag: '🇨🇩' },
  { code: '+244', name: 'Angola', flag: '🇦🇴' },
  { code: '+233', name: 'Ghana', flag: '🇬🇭' },
  { code: '+234', name: 'Nigeria', flag: '🇳🇬' },
  { code: '+237', name: 'Cameroun', flag: '🇨🇲' },
  { code: '+236', name: 'Tchad', flag: '🇹🇩' },
  { code: '+235', name: 'Tchad', flag: '🇹🇩' },
  { code: '+33', name: 'France', flag: '🇫🇷' },
  { code: '+1', name: 'États-Unis', flag: '🇺🇸' },
  { code: '+44', name: 'Royaume-Uni', flag: '🇬🇧' },
];

export const PhoneInput = ({
  value = '',
  onChange,
  placeholder = 'Votre numéro de téléphone',
  className = '',
  required = false,
  name = 'phone'
}) => {
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Initialiser avec la valeur existante
  useEffect(() => {
    if (value) {
      // Essayer de détecter le code pays dans la valeur
      const foundCountry = countries.find(country =>
        value.startsWith(country.code)
      );

      if (foundCountry) {
        setSelectedCountry(foundCountry);
        setPhoneNumber(value.replace(foundCountry.code, '').trim());
      } else {
        setPhoneNumber(value);
      }
    }
  }, [value]);

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrer les pays selon la recherche
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.includes(searchTerm)
  );

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchTerm('');
    updateValue(country, phoneNumber);
  };

  const handlePhoneChange = (e) => {
    const newPhoneNumber = e.target.value.replace(/\D/g, ''); // Uniquement les chiffres
    setPhoneNumber(newPhoneNumber);
    updateValue(selectedCountry, newPhoneNumber);
  };

  const updateValue = (country, number) => {
    const fullNumber = number ? `${country.code}${number}` : '';
    if (onChange) {
      onChange({
        target: {
          name,
          value: fullNumber
        }
      });
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex">
        {/* Sélecteur de pays */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3 py-3 bg-[#4ac26033] border-r border-gray-300 rounded-l-lg hover:bg-[#4ac26044] transition-colors"
          >
            <span className="text-lg">{selectedCountry.flag}</span>
            <span className="text-gray-700 font-medium">{selectedCountry.code}</span>
            <FiChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown des pays */}
          {isOpen && (
            <div className="absolute top-full left-0 z-50 w-64 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {/* Barre de recherche */}
              <div className="p-2 border-b">
                <input
                  type="text"
                  placeholder="Rechercher un pays..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ca260]"
                />
              </div>

              {/* Liste des pays */}
              <div className="py-1">
                {filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleCountrySelect(country)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-lg">{country.flag}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{country.name}</div>
                      <div className="text-xs text-gray-500">{country.code}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Champ numéro de téléphone */}
        <input
          ref={inputRef}
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder={placeholder}
          required={required}
          name={`${name}_number`}
          className="flex-1 px-3 py-3 bg-[#4ac26033] text-gray-700 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-[#4ca260] border-l-0"
          maxLength={15}
        />
      </div>

      {/* Message d'aide */}
      <p className="text-xs text-gray-500 mt-1">
        Exemple: {selectedCountry.code} 01020304
      </p>
    </div>
  );
};

export default PhoneInput;