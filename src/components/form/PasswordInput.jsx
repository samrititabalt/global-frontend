import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const PasswordInput = ({
  label = 'Password',
  className = '',
  inputClassName = '',
  ...inputProps
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          {...inputProps}
          type={visible ? 'text' : 'password'}
          className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 pr-12 ${inputClassName}`}
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};

export default PasswordInput;
