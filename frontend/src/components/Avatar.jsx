// src/components/Avatar.jsx
// Reusable avatar component - shows image or initials fallback

export default function Avatar({ user, size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl',
    '2xl': 'w-32 h-32 text-4xl',
  };

  const sizeClass = sizes[size] || sizes.md;

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const avatarUrl = user?.avatar
    ? `http://localhost:5000/uploads/${user.avatar}`
    : null;

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={user?.name || 'User'}
        className={`${sizeClass} rounded-full object-cover border-2 border-white shadow ${className}`}
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-bold bg-gradient-to-br from-violet-500 to-indigo-600 text-white border-2 border-white shadow select-none ${className}`}
    >
      {getInitials(user?.name)}
    </div>
  );
}