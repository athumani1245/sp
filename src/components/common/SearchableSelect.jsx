/**
 * SearchableSelect Component
 * Reusable dropdown with search functionality
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';

const UNDERLINE_INPUT_STYLES = {
  border: 'none',
  borderBottom: '2px solid #dee2e6',
  borderRadius: '0',
  backgroundColor: 'transparent',
  padding: '8px 0',
  fontSize: '0.95rem',
  transition: 'border-bottom-color 0.3s ease',
  boxShadow: 'none'
};

export const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder,
  disabled,
  name,
  getOptionLabel,
  getOptionValue,
  noOptionsMessage = 'No options available',
  inputStyle = {}
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setFilteredOptions(options);
  }, [options]);

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter(option => {
        const label = getOptionLabel(option);
        return label && label.toLowerCase().includes(searchTerm.toLowerCase());
      });
      setFilteredOptions(filtered);
    }
  }, [searchTerm, options]);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setSearchTerm('');
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        event.preventDefault();
        event.stopPropagation();
        closeDropdown();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen, closeDropdown]);

  const handleInputClick = useCallback(() => {
    if (!disabled) {
      setIsOpen(prev => !prev);
      if (!isOpen) {
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }
  }, [disabled, isOpen]);

  const handleOptionSelect = useCallback((option) => {
    onChange({ target: { name, value: getOptionValue(option) } });
    closeDropdown();
  }, [name, onChange, getOptionValue, closeDropdown]);

  const getDisplayValue = () => {
    if (!value) return '';
    const selectedOption = options.find(option => {
      const optionValue = getOptionValue(option);
      // Handle both string and number comparisons
      return optionValue == value || optionValue === value;
    });
    return selectedOption ? getOptionLabel(selectedOption) : '';
  };

  return (
    <div className="searchable-select position-relative" ref={dropdownRef}>
      <div
        className={`d-flex align-items-center justify-content-between ${disabled ? 'disabled' : ''}`}
        onClick={handleInputClick}
        onKeyDown={(e) => {
          if (e.key === 'Escape' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            e.stopPropagation();
          }
          if (e.key === 'Escape' && isOpen) {
            setIsOpen(false);
            setSearchTerm('');
          }
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!disabled) {
              setIsOpen(!isOpen);
            }
          }
        }}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        style={{
          ...UNDERLINE_INPUT_STYLES,
          ...inputStyle,
          cursor: disabled ? 'not-allowed' : 'pointer',
          backgroundColor: 'transparent',
          minHeight: '38px',
          borderBottomColor: disabled ? '#e9ecef' : (isOpen ? '#CC5B4B' : '#dee2e6')
        }}
      >
        <span className={!value ? 'text-muted' : ''} style={{ fontSize: inputStyle.fontSize || '0.95rem' }}>
          {!value ? placeholder : getDisplayValue()}
        </span>
      </div>

      {isOpen && (
        <div
          className="dropdown-menu show w-100 position-absolute"
          role="listbox"
          aria-label="Options"
          style={{
            zIndex: 1050,
            maxHeight: '200px',
            overflowY: 'auto',
            top: '100%',
            left: 0,
            backgroundColor: 'white',
            border: '1px solid #ced4da',
            display: 'block'
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen(false);
              setSearchTerm('');
            }
          }}
        >
          <div className="p-2 border-bottom">
            <input
              ref={inputRef}
              type="text"
              className="form-control form-control-sm"
              placeholder="Type to search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsOpen(false);
                  setSearchTerm('');
                }
              }}
            />
          </div>

          <div className="dropdown-items">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const label = getOptionLabel(option);
                const optionValue = getOptionValue(option);
                if (!label) return null;
                
                return (
                  <div
                    key={optionValue}
                    className={`dropdown-item ${optionValue == value ? 'active' : ''}`}
                    onClick={() => handleOptionSelect(option)}
                    style={{ 
                      cursor: 'pointer',
                      padding: '0.5rem 1rem',
                      color: '#212529',
                      backgroundColor: optionValue == value ? '#0d6efd' : 'transparent'
                    }}
                  >
                    {label}
                  </div>
                );
              })
            ) : (
              <div className="dropdown-item-text text-muted" style={{ padding: '0.5rem 1rem' }}>
                {noOptionsMessage}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

SearchableSelect.propTypes = {
  options: PropTypes.array.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  name: PropTypes.string.isRequired,
  getOptionLabel: PropTypes.func.isRequired,
  getOptionValue: PropTypes.func.isRequired,
  noOptionsMessage: PropTypes.string,
  inputStyle: PropTypes.object,
};
