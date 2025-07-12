import React, { useState } from 'react';
import Select from 'react-select/creatable';
import { tagAPI } from '../services/api';

const TagSelector = ({ value, onChange, placeholder = "Select or create tags..." }) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadTags = async (inputValue = '') => {
    try {
      setLoading(true);
      const response = await tagAPI.getTags({ search: inputValue });
      const tagOptions = response.data.map(tag => ({
        value: tag.name,
        label: tag.name
      }));
      setOptions(tagOptions);
    } catch (error) {
      console.error('Error loading tags:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (inputValue) => {
    if (inputValue.length >= 2 || inputValue.length === 0) {
      loadTags(inputValue);
    }
  };

  const handleChange = (selectedOptions) => {
    const tags = selectedOptions ? selectedOptions.map(option => option.value) : [];
    onChange(tags);
  };
  
  const selectedValue = value.map(tag => ({ value: tag, label: tag }));

  return (
    <Select
      isMulti
      value={selectedValue}
      onChange={handleChange}
      onInputChange={handleInputChange}
      options={options}
      placeholder={placeholder}
      isLoading={loading}
      className="react-select-container"
      classNamePrefix="react-select"
      noOptionsMessage={() => 'Start typing to search or create tags...'}
      formatCreateLabel={(inputValue) => `Create new tag: "${inputValue}"`}
      isValidNewOption={(inputValue) => inputValue.length > 0 && value.length < 5}
    />
  );
};

export default TagSelector;