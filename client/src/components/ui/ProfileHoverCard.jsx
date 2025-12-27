import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from './button';
import { cn } from '../../lib/utils';

const ProfileHoverCard = ({ showName = true, className = '' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const avatar = (
    <div
      className={cn(
        'h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden',
        'cursor-pointer'
      )}
      aria-haspopup="true"
      aria-expanded={open}
    >
      {user?.avatar && !user.avatar.includes('default') ? (
        <img src={user.avatar} alt={user?.name || 'User'} className="h-full w-full object-cover" />
      ) : (
        <span>{user?.name?.[0] || 'U'}</span>
      )}
    </div>
  );

  const trigger = (
    <div className={cn('flex items-center gap-3', className)}>
      {showName && (
        <div className="hidden md:block text-right">
          <p className="text-sm font-medium text-slate-700 leading-tight">{user?.name}</p>
          <p className="text-[10px] text-slate-500 uppercase font-semibold">{user?.role}</p>
        </div>
      )}
      {avatar}
    </div>
  );

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={() => setOpen((o) => !o)}
    >
      {trigger}
      {open && (
        <div
          role="dialog"
          className="absolute right-0 mt-2 w-64 rounded-md border bg-card shadow-md animate-in fade-in duration-200"
        >
          <div className="p-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold overflow-hidden">
              {user?.avatar && !user.avatar.includes('default') ? (
                <img src={user.avatar} alt={user?.name || 'User'} className="h-full w-full object-cover" />
              ) : (
                <span>{user?.name?.slice(0,2)?.toUpperCase() || 'U'}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{user?.name || 'User'}</div>
              <div className="text-xs text-muted-foreground truncate">{user?.role}</div>
              {user?.email && (
                <div className="text-xs text-muted-foreground truncate">{user.email}</div>
              )}
            </div>
          </div>
          <div className="px-3 pb-3 grid grid-cols-2 gap-2">
            <Button
              variant="default"
              className="text-xs w-full"
              onClick={() => { setOpen(false); navigate('/profile'); }}
            >
              View Profile
            </Button>
            <Button
              variant="destructive"
              className="text-xs w-full"
              onClick={() => { setOpen(false); logout(); }}
            >
              Logout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileHoverCard;
