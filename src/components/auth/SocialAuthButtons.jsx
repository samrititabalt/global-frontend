import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import { SiMicrosoft, SiApple } from 'react-icons/si';
import { redirectToProvider } from '../../utils/socialAuth';

const providers = [
  {
    id: 'google',
    label: 'Continue with Google',
    Icon: FcGoogle,
    theme: 'border-gray-200 bg-white',
  },
  {
    id: 'microsoft',
    label: 'Continue with Microsoft',
    Icon: SiMicrosoft,
    theme: 'border-slate-200 bg-slate-900 text-white',
    iconClass: 'text-white',
  },
  {
    id: 'apple',
    label: 'Continue with Apple',
    Icon: SiApple,
    theme: 'border-gray-900 bg-gray-900 text-white',
    iconClass: 'text-white',
  },
];

const SocialAuthButtons = () => {
  return (
    <div className="space-y-3">
      {providers.map(({ id, label, Icon, theme, iconClass }) => (
        <button
          key={id}
          type="button"
          onClick={() => redirectToProvider(id)}
          className={`w-full flex items-center justify-center gap-3 rounded-xl border px-4 py-3 font-semibold text-sm transition hover:translate-y-[-1px] hover:shadow-lg ${theme}`}
          aria-label={label}
        >
          <Icon className={`h-5 w-5 ${iconClass || ''}`} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
};

export default SocialAuthButtons;


