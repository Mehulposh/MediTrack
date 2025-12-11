import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

interface MenuItem {
  path: string;
  icon: LucideIcon;
  label: string;
}

interface SidebarProps {
  menuItems: MenuItem[];
  basePath: string;
}

export default function Sidebar({ menuItems, basePath }: SidebarProps) {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const fullPath = item.path ? `${basePath}/${item.path}` : basePath;
          
          return (
            <NavLink
              key={item.path}
              to={fullPath}
              end={!item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}