import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';

// Liste complète des pays avec leurs codes et drapeaux
const countries = [
  // Afrique
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
  { code: '+27', name: 'Afrique du Sud', flag: '🇿🇦' },
  { code: '+20', name: 'Égypte', flag: '🇪🇬' },
  { code: '+212', name: 'Maroc', flag: '🇲🇦' },
  { code: '+213', name: 'Algérie', flag: '🇩🇿' },
  { code: '+216', name: 'Tunisie', flag: '🇹🇳' },
  { code: '+218', name: 'Libye', flag: '🇱🇾' },
  { code: '+249', name: 'Soudan', flag: '🇸🇩' },
  { code: '+251', name: 'Éthiopie', flag: '🇪🇹' },
  { code: '+252', name: 'Somalie', flag: '🇸🇴' },
  { code: '+253', name: 'Djibouti', flag: '🇩🇯' },
  { code: '+254', name: 'Kenya', flag: '🇰🇪' },
  { code: '+255', name: 'Tanzanie', flag: '🇹🇿' },
  { code: '+256', name: 'Ouganda', flag: '🇺🇬' },
  { code: '+257', name: 'Burundi', flag: '🇧🇮' },
  { code: '+258', name: 'Mozambique', flag: '🇲🇿' },
  { code: '+260', name: 'Zambie', flag: '🇿🇲' },
  { code: '+261', name: 'Madagascar', flag: '🇲🇬' },
  { code: '+262', name: 'Réunion', flag: '🇷🇪' },
  { code: '+263', name: 'Zimbabwe', flag: '🇿🇼' },
  { code: '+264', name: 'Namibie', flag: '🇳🇦' },
  { code: '+265', name: 'Malawi', flag: '🇲🇼' },
  { code: '+266', name: 'Lesotho', flag: '🇱🇸' },
  { code: '+267', name: 'Botswana', flag: '🇧🇼' },
  { code: '+268', name: 'Eswatini', flag: '🇸🇿' },
  { code: '+269', name: 'Comores', flag: '🇰🇲' },
  { code: '+290', name: 'Sainte-Hélène', flag: '🇸🇭' },
  { code: '+291', name: 'Érythrée', flag: '🇪🇷' },
  { code: '+297', name: 'Aruba', flag: '🇦🇼' },
  { code: '+298', name: 'Îles Féroé', flag: '🇫🇴' },
  { code: '+299', name: 'Groenland', flag: '🇬🇱' },

  // Europe
  { code: '+33', name: 'France', flag: '🇫🇷' },
  { code: '+34', name: 'Espagne', flag: '🇪🇸' },
  { code: '+39', name: 'Italie', flag: '🇮🇹' },
  { code: '+41', name: 'Suisse', flag: '🇨🇭' },
  { code: '+43', name: 'Autriche', flag: '🇦🇹' },
  { code: '+44', name: 'Royaume-Uni', flag: '🇬🇧' },
  { code: '+45', name: 'Danemark', flag: '🇩🇰' },
  { code: '+46', name: 'Suède', flag: '🇸🇪' },
  { code: '+47', name: 'Norvège', flag: '🇳🇴' },
  { code: '+48', name: 'Pologne', flag: '🇵🇱' },
  { code: '+49', name: 'Allemagne', flag: '🇩🇪' },
  { code: '+31', name: 'Pays-Bas', flag: '🇳🇱' },
  { code: '+32', name: 'Belgique', flag: '🇧🇪' },
  { code: '+351', name: 'Portugal', flag: '🇵🇹' },
  { code: '+352', name: 'Luxembourg', flag: '🇱🇺' },
  { code: '+353', name: 'Irlande', flag: '🇮🇪' },
  { code: '+354', name: 'Islande', flag: '🇮🇸' },
  { code: '+355', name: 'Albanie', flag: '🇦🇱' },
  { code: '+356', name: 'Malte', flag: '🇲🇹' },
  { code: '+357', name: 'Chypre', flag: '🇨🇾' },
  { code: '+358', name: 'Finlande', flag: '🇫🇮' },
  { code: '+359', name: 'Bulgarie', flag: '🇧🇬' },
  { code: '+36', name: 'Hongrie', flag: '🇭🇺' },
  { code: '+370', name: 'Lituanie', flag: '🇱🇹' },
  { code: '+371', name: 'Lettonie', flag: '🇱🇻' },
  { code: '+372', name: 'Estonie', flag: '🇪🇪' },
  { code: '+373', name: 'Moldavie', flag: '🇲🇩' },
  { code: '+374', name: 'Arménie', flag: '🇦🇲' },
  { code: '+375', name: 'Biélorussie', flag: '🇧🇾' },
  { code: '+376', name: 'Andorre', flag: '🇦🇩' },
  { code: '+377', name: 'Monaco', flag: '🇲🇨' },
  { code: '+378', name: 'Saint-Marin', flag: '🇸🇲' },
  { code: '+380', name: 'Ukraine', flag: '🇺🇦' },
  { code: '+381', name: 'Serbie', flag: '🇷🇸' },
  { code: '+382', name: 'Monténégro', flag: '🇲🇪' },
  { code: '+383', name: 'Kosovo', flag: '🇽🇰' },
  { code: '+385', name: 'Croatie', flag: '🇭🇷' },
  { code: '+386', name: 'Slovénie', flag: '🇸🇮' },
  { code: '+387', name: 'Bosnie-Herzégovine', flag: '🇧🇦' },
  { code: '+389', name: 'Macédoine du Nord', flag: '🇲🇰' },
  { code: '+420', name: 'République Tchèque', flag: '🇨🇿' },
  { code: '+421', name: 'Slovaquie', flag: '🇸🇰' },

  // Amérique du Nord
  { code: '+1', name: 'États-Unis', flag: '🇺🇸' },
  { code: '+1', name: 'Canada', flag: '🇨🇦' },
  { code: '+52', name: 'Mexique', flag: '🇲🇽' },

  // Amérique Centrale et Caraïbes
  { code: '+501', name: 'Belize', flag: '🇧🇿' },
  { code: '+502', name: 'Guatemala', flag: '🇬🇹' },
  { code: '+503', name: 'Salvador', flag: '🇸🇻' },
  { code: '+504', name: 'Honduras', flag: '🇭🇳' },
  { code: '+505', name: 'Nicaragua', flag: '🇳🇮' },
  { code: '+506', name: 'Costa Rica', flag: '🇨🇷' },
  { code: '+507', name: 'Panama', flag: '🇵🇦' },
  { code: '+509', name: 'Haïti', flag: '🇭🇹' },
  { code: '+590', name: 'Guadeloupe', flag: '🇬🇵' },
  { code: '+591', name: 'Bolivie', flag: '🇧🇴' },
  { code: '+592', name: 'Guyana', flag: '🇬🇾' },
  { code: '+593', name: 'Équateur', flag: '🇪🇨' },
  { code: '+594', name: 'Guyane Française', flag: '🇬🇫' },
  { code: '+595', name: 'Paraguay', flag: '🇵🇾' },
  { code: '+596', name: 'Martinique', flag: '🇲🇶' },
  { code: '+597', name: 'Suriname', flag: '🇸🇷' },
  { code: '+598', name: 'Uruguay', flag: '🇺🇾' },
  { code: '+599', name: 'Curaçao', flag: '🇨🇼' },

  // Amérique du Sud
  { code: '+54', name: 'Argentine', flag: '🇦🇷' },
  { code: '+55', name: 'Brésil', flag: '🇧🇷' },
  { code: '+56', name: 'Chili', flag: '🇨🇱' },
  { code: '+57', name: 'Colombie', flag: '🇨🇴' },
  { code: '+58', name: 'Venezuela', flag: '🇻🇪' },
  { code: '+51', name: 'Pérou', flag: '🇵🇪' },

  // Asie
  { code: '+60', name: 'Malaisie', flag: '🇲🇾' },
  { code: '+61', name: 'Australie', flag: '🇦🇺' },
  { code: '+62', name: 'Indonésie', flag: '🇮🇩' },
  { code: '+63', name: 'Philippines', flag: '🇵🇭' },
  { code: '+64', name: 'Nouvelle-Zélande', flag: '🇳🇿' },
  { code: '+65', name: 'Singapour', flag: '🇸🇬' },
  { code: '+66', name: 'Thaïlande', flag: '🇹🇭' },
  { code: '+81', name: 'Japon', flag: '🇯🇵' },
  { code: '+82', name: 'Corée du Sud', flag: '🇰🇷' },
  { code: '+84', name: 'Vietnam', flag: '🇻🇳' },
  { code: '+86', name: 'Chine', flag: '🇨🇳' },
  { code: '+90', name: 'Turquie', flag: '🇹🇷' },
  { code: '+91', name: 'Inde', flag: '🇮🇳' },
  { code: '+92', name: 'Pakistan', flag: '🇵🇰' },
  { code: '+93', name: 'Afghanistan', flag: '🇦🇫' },
  { code: '+94', name: 'Sri Lanka', flag: '🇱🇰' },
  { code: '+95', name: 'Myanmar', flag: '🇲🇲' },
  { code: '+96', name: 'Maldives', flag: '🇲🇻' },
  { code: '+97', name: 'Oman', flag: '🇴🇲' },
  { code: '+98', name: 'Iran', flag: '🇮🇷' },
  { code: '+964', name: 'Irak', flag: '🇮🇶' },
  { code: '+965', name: 'Koweït', flag: '🇰🇼' },
  { code: '+966', name: 'Arabie Saoudite', flag: '🇸🇦' },
  { code: '+967', name: 'Yémen', flag: '🇾🇪' },
  { code: '+968', name: 'Oman', flag: '🇴🇲' },
  { code: '+970', name: 'Palestine', flag: '🇵🇸' },
  { code: '+971', name: 'Émirats Arabes Unis', flag: '🇦🇪' },
  { code: '+972', name: 'Israël', flag: '🇮🇱' },
  { code: '+973', name: 'Bahreïn', flag: '🇧🇭' },
  { code: '+974', name: 'Qatar', flag: '🇶🇦' },
  { code: '+975', name: 'Bhoutan', flag: '🇧🇹' },
  { code: '+976', name: 'Mongolie', flag: '🇲🇳' },
  { code: '+977', name: 'Népal', flag: '🇳🇵' },
  { code: '+992', name: 'Tadjikistan', flag: '🇹🇯' },
  { code: '+993', name: 'Turkménistan', flag: '🇹🇲' },
  { code: '+994', name: 'Azerbaïdjan', flag: '🇦🇿' },
  { code: '+995', name: 'Géorgie', flag: '🇬🇪' },
  { code: '+996', name: 'Kirghizistan', flag: '🇰🇬' },
  { code: '+998', name: 'Ouzbékistan', flag: '🇺🇿' },

  // Océanie
  { code: '+61', name: 'Australie', flag: '🇦🇺' },
  { code: '+64', name: 'Nouvelle-Zélande', flag: '🇳🇿' },
  { code: '+675', name: 'Papouasie-Nouvelle-Guinée', flag: '🇵🇬' },
  { code: '+676', name: 'Tonga', flag: '🇹🇴' },
  { code: '+677', name: 'Îles Salomon', flag: '🇸🇧' },
  { code: '+678', name: 'Vanuatu', flag: '🇻🇺' },
  { code: '+679', name: 'Fidji', flag: '🇫🇯' },
  { code: '+680', name: 'Palaos', flag: '🇵🇼' },
  { code: '+681', name: 'Wallis-et-Futuna', flag: '🇼🇫' },
  { code: '+682', name: 'Îles Cook', flag: '🇨🇰' },
  { code: '+683', name: 'Niue', flag: '🇳🇺' },
  { code: '+684', name: 'Samoa Américaines', flag: '🇦🇸' },
  { code: '+685', name: 'Samoa', flag: '🇼🇸' },
  { code: '+686', name: 'Kiribati', flag: '🇰🇮' },
  { code: '+687', name: 'Nouvelle-Calédonie', flag: '🇳🇨' },
  { code: '+688', name: 'Tuvalu', flag: '🇹🇻' },
  { code: '+689', name: 'Polynésie Française', flag: '🇵🇫' },
  { code: '+690', name: 'Tokelau', flag: '🇹🇰' },
  { code: '+691', name: 'Micronésie', flag: '🇫🇲' },
  { code: '+692', name: 'Îles Marshall', flag: '🇲🇭' }
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