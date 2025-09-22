import React, { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FiCalendar, FiChevronDown } from 'react-icons/fi';

const DatePicker = ({
  selected,
  onSelect,
  placeholder = "Sélectionner une date",
  className = "",
  disabled = false,
  minDate,
  maxDate,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (date) => {
    onSelect(date);
    setIsOpen(false);
  };

  const formatDate = (date) => {
    if (!date) return "";
    return format(date, 'dd/MM/yyyy', { locale: fr });
  };

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleInputChange = (e) => {
    // Permettre la saisie manuelle si nécessaire
    const value = e.target.value;
    if (value) {
      // Essayer de parser la date saisie manuellement
      const parsedDate = new Date(value);
      if (!isNaN(parsedDate)) {
        onSelect(parsedDate);
      }
    } else {
      onSelect(null);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Champ d'affichage */}
      <div className="relative">
        <input
          type="text"
          value={formatDate(selected)}
          onChange={handleInputChange}
          onClick={handleInputClick}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          readOnly // Empêche la saisie directe pour forcer l'utilisation du picker
          className={`
            w-full px-3 py-3 bg-[#4ac26033] text-gray-700 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-[#4ca260]
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${className}
          `}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          <FiCalendar className="w-5 h-5 text-gray-500" />
          <FiChevronDown
            className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {/* Popup du calendrier */}
      {isOpen && (
        <>
          {/* Overlay pour fermer */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Calendrier */}
          <div className="absolute bottom-full left-0 z-20 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
            <DayPicker
              mode="single"
              selected={selected}
              onSelect={handleSelect}
              locale={fr}
              disabled={disabled ? true : [
                { before: minDate },
                { after: maxDate }
              ].filter(Boolean)}
              className="border-0"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium text-gray-900",
                nav: "space-x-1 flex items-center",
                nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-gray-500 rounded-md w-9 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-[#4ca260] first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 rounded-md",
                day_selected: "bg-[#4ca260] text-white hover:bg-[#3a8a4a] focus:bg-[#4ca260] focus:text-white",
                day_today: "bg-gray-100 text-gray-900",
                day_outside: "text-gray-500 opacity-50",
                day_disabled: "text-gray-500 opacity-50",
                day_range_middle: "aria-selected:bg-gray-100 aria-selected:text-gray-900",
                day_hidden: "invisible",
              }}
              components={{
                IconLeft: ({ ...props }) => <span {...props}>‹</span>,
                IconRight: ({ ...props }) => <span {...props}>›</span>,
              }}
            />

            {/* Boutons */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <button
                type="button"
                onClick={() => onSelect(null)}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Effacer
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-[#4ca260] text-white text-sm rounded-md hover:bg-[#3a8a4a] transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DatePicker;