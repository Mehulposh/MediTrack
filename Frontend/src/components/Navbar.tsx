import { useNavigate } from 'react-router-dom';
import { Activity, LogOut, User } from 'lucide-react';
import { useAuthStore } from '../store/authstore.ts';

export default function Navbar() {
  const { user, profile, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getProfileName = () => {
    if (profile && 'firstName' in profile) {
      return `${profile.firstName} ${profile.lastName}`;
    }
    return user?.email || 'User';
  };

  const getRoleColor = () => {
    switch (user?.role) {
      case 'patient':
        return 'bg-blue-100 text-blue-800';
      case 'doctor':
        return 'bg-green-100 text-green-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Activity className="w-8 h-8 text-blue-600 mr-2" />
            <span className="text-xl font-bold text-gray-800">MediTrack</span>
            <span className={`ml-4 px-3 py-1 rounded-full text-sm font-medium ${getRoleColor()}`}>
              {user?.role?.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700 font-medium">{getProfileName()}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}