// src/components/RoleAvatar.tsx
import React from 'react';
import './RoleAvatar.css';

interface Props {
  name: string;
  role: string;
  photoUrl?: string | null;
  size?: number;
}

const ROLE_MAP: Record<string, { short: string; className: string }> = {
  superadmin: { short: 'SD', className: 'ra-super' },
  admin: { short: 'A', className: 'ra-admin' },
  vendeur: { short: 'V', className: 'ra-vendeur' },
  manager: { short: 'M', className: 'ra-manager' },
  guest: { short: 'G', className: 'ra-guest' }
};

const RoleAvatar: React.FC<Props> = ({ name, role, photoUrl, size = 40 }) => {
  const key = (role || '').toLowerCase();
  const meta = ROLE_MAP[key] ?? { short: (role || 'U').slice(0,2).toUpperCase(), className: 'ra-default' };
  if (photoUrl) {
    return <img src={photoUrl} alt={name} style={{ width: size, height: size, borderRadius: '50%' }} />;
  }
  return (
    <div className={`role-avatar ${meta.className}`} style={{ width: size, height: size, fontSize: Math.round(size * 0.45) }}>
      {meta.short}
    </div>
  );
};

export default RoleAvatar;
