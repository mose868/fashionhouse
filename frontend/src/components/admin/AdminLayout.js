import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { 
  Squares2X2Icon,
  ShoppingBagIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const navItemClasses = ({ isActive }) => 
  `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
    isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'
  }`;

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 admin-scope">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex md:w-64 lg:w-72 h-screen sticky top-0 bg-gray-900/60 backdrop-blur border-r border-white/5">
          <div className="w-full flex flex-col">
            <div className="h-16 flex items-center px-6 border-b border-white/5">
              <Link to="/admin" className="text-xl font-semibold">
                HIGI <span className="text-gold-400">ADMIN</span>
              </Link>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              <NavLink to="/admin" end className={navItemClasses}>
                <Squares2X2Icon className="h-5 w-5" /> Dashboard
              </NavLink>
              <NavLink to="/admin/products" className={navItemClasses}>
                <ShoppingBagIcon className="h-5 w-5" /> Products
              </NavLink>
              <NavLink to="/admin/orders" className={navItemClasses}>
                <ClipboardDocumentListIcon className="h-5 w-5" /> Orders
              </NavLink>
              <NavLink to="/admin/users" className={navItemClasses}>
                <UsersIcon className="h-5 w-5" /> Users
              </NavLink>
              <NavLink to="/admin/contacts" className={navItemClasses}>
                <ChatBubbleLeftRightIcon className="h-5 w-5" /> Contacts
              </NavLink>
              <NavLink to="/admin/ai" className={navItemClasses}>
                <Cog6ToothIcon className="h-5 w-5" /> AI
              </NavLink>
            </nav>
            <div className="p-4 text-xs text-gray-400">© {new Date().getFullYear()} Higi</div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Admin Topbar */}
          <header className="h-16 sticky top-0 z-10 bg-gray-900/70 backdrop-blur border-b border-white/5 flex items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-3 md:hidden">
              <Link to="/admin" className="text-lg font-semibold">HIGI <span className="text-gold-400">ADMIN</span></Link>
            </div>
            <div className="flex-1" />
            <Link to="/" className="text-sm text-gray-300 hover:text-white">View site</Link>
          </header>

          <main className="p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;


