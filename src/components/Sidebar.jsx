import { motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import authService from '@/services/auth.service';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardCheck, 
  BarChart, 
  Settings,
  LogOut,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Shield,
  CheckCircle,
  Building,
  Target,
  Star,
  Zap
} from 'lucide-react';

export default function Sidebar({ isCollapsed, toggleSidebar }) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Handle logout
  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };
  
  const menuItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard size={20} />
    },
    {
      name: "Team Members",
      href: "/interns",
      icon: <Users size={20} />
    },
    {
      name: "Check-In",
      href: "/checkin",
      icon: <UserCheck size={20} />
    },
    {
      name: "Attendance",
      href: "/attendance",
      icon: <ClipboardCheck size={20} />
    },
    {
      name: "Reports",
      href: "/reports",
      icon: <BarChart size={20} />
    },
    {
      name: "Settings",
      href: "/settings",
      icon: <Settings size={20} />
    }
  ];

  return (
    <motion.aside
      className={`fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-sm z-20 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="h-full flex flex-col justify-between py-4">
        {/* Logo Section */}
        <div className="px-2 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center justify-center">
              <div className="flex-shrink-0 flex items-center">
                <Target size={16} className="text-emerald-600 dark:text-emerald-400" />
              </div>
            </Link>
            
            {/* Toggle Button */}
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-all duration-200"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight size={16} />
              ) : (
                <ChevronLeft size={16} />
              )}
            </button>
          </div>
        </div>

        <nav className="flex-1 px-2 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`group relative flex items-center px-4 py-3 rounded-md transition-all duration-200 ${
                pathname === item.href
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-gray-800 dark:text-emerald-400'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
              title={isCollapsed ? item.name : undefined}
            >
              <span className={`${isCollapsed ? '' : 'mr-3'}`}>{item.icon}</span>
              {!isCollapsed && <span className="font-medium">{item.name}</span>}
              {pathname === item.href && !isCollapsed && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute right-0 w-1 h-8 bg-emerald-600 dark:bg-emerald-400 rounded-l"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
              {pathname === item.href && isCollapsed && (
                <div className="absolute left-0 w-1 h-8 bg-emerald-600 dark:bg-emerald-400 rounded-r" />
              )}
            </Link>
          ))}
        </nav>
        
        <div className="px-2 mt-auto mb-4">
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center px-4 py-3 text-gray-600 hover:bg-gray-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-red-400 rounded-md transition-all duration-200 ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title={isCollapsed ? "Logout" : undefined}
          >
            <LogOut size={20} className={`${isCollapsed ? '' : 'mr-3'}`} />
            {!isCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
