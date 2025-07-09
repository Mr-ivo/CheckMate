import { motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import authService from '@/services/auth.service';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardCheck, 
  BarChart, 
  Settings,
  LogOut,
  UserCheck,
  Menu,
  X
} from 'lucide-react';

export default function Sidebar({ isOpen, toggleSidebar }) {
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
      name: "Interns",
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

  // Animation variants for the sidebar
  const sidebarVariants = {
    open: {
      x: 0,
      width: '240px',
      transition: { duration: 0.3 }
    },
    closed: {
      x: -240,
      width: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.aside
      variants={sidebarVariants}
      initial="closed"
      animate={isOpen ? "open" : "closed"}
      className={`fixed left-0 top-16 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-sm z-20 ${
        isOpen ? 'w-60' : 'w-0'
      } overflow-hidden`}
    >
      <div className="h-full flex flex-col justify-between py-4">
        <nav className="mt-5 px-2 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-4 py-3 rounded-md transition-all duration-200 ${
                pathname === item.href
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-gray-800 dark:text-emerald-400'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
              {pathname === item.href && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute right-0 w-1 h-8 bg-emerald-600 dark:bg-emerald-400 rounded-l"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </Link>
          ))}
        </nav>
        
        <div className="px-2 mt-6 mb-12">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-gray-600 hover:bg-gray-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-red-400 rounded-md transition-all duration-200"
          >
            <LogOut size={20} className="mr-3" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
