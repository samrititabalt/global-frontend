import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import { SiMicrosoft } from 'react-icons/si';
import { getProviderUrl } from '../../utils/socialAuth';

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
];

const SocialAuthButtons = () => {
  return (
    <div className="space-y-3">
      {providers.map(({ id, label, Icon, theme, iconClass }) => {
        const providerUrl = getProviderUrl(id);
        const disabled = !providerUrl;

        return (
          <a
            key={id}
            href={providerUrl || '#'}
            onClick={disabled ? (e) => e.preventDefault() : undefined}
            className={`w-full flex items-center justify-center gap-3 rounded-xl border px-4 py-3 font-semibold text-sm transition ${
              disabled ? 'cursor-not-allowed opacity-60' : 'hover:translate-y-[-1px] hover:shadow-lg'
            } ${theme}`}
            aria-label={label}
            aria-disabled={disabled}
            rel="noreferrer"
          >
            <Icon className={`h-5 w-5 ${iconClass || ''}`} />
            <span>{label}</span>
          </a>
        );
      })}
    </div>
  );
};

export default SocialAuthButtons;


