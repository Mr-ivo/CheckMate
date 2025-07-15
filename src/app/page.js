"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

// Enhanced animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2,
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

const itemVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
      duration: 0.6
    }
  }
};

const fadeInUpVariant = {
  hidden: { y: 60, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 15,
      duration: 0.8
    }
  }
};

const staggerContainerVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2
    }
  }
};

const pulseVariant = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "reverse"
    }
  }
};

const featureItems = [
  {
    title: "Digital Check-In",
    description: "Quick and secure daily check-in with digital signature verification"
  },
  {
    title: "Attendance Analytics",
    description: "Real-time dashboards showing staff presence, absences and trends"
  },
  {
    title: "Staff Management",
    description: "Complete employee records with attendance history and reporting"
  }
];

export default function Home() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const mobileMenuRef = useRef(null);
  
  // Handle click outside to close mobile menu
  useEffect(() => {
    function handleClickOutside(event) {
      // Ignore clicks on the toggle button itself
      if (event.target.closest('button[aria-label="Toggle navigation menu"]')) {
        return;
      }
      
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white to-emerald-50 dark:from-gray-900 dark:to-gray-800 overflow-x-hidden overflow-guard" style={{ maxWidth: '100vw', overflowX: 'hidden' }}>
      {/* Navigation */}
      <header className="absolute top-0 left-0 right-0 z-30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center w-1/4">
              <Link href="/" className="flex items-center">
                <Image 
                  src="/Screenshot__9_-removebg-preview.png" 
                  alt="CheckMate Logo" 
                  width={180} 
                  height={180} 
                  className="py-1"
                />
              </Link>
            </div>
            <nav className="hidden md:flex justify-center items-center space-x-12 flex-1">
              <Link href="#features" className="text-gray-600 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400 font-medium text-lg">
                Features
              </Link>
              <Link href="#how-it-works" className="text-gray-600 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400 font-medium text-lg">
                How It Works
              </Link>
              <Link href="#faq" className="text-gray-600 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400 font-medium text-lg">
                FAQ
              </Link>
            </nav>
            <div className="hidden md:block w-1/4 text-right">
              <Link 
                href="/login" 
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all duration-200 shadow-sm"
              >
                Sign In
              </Link>
            </div>
            <div className="md:hidden">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowMobileMenu(prevState => !prevState);
                  console.log('Home page mobile menu toggled!');
                }}
                className="text-gray-600 dark:text-gray-300 focus:outline-none p-2"
                aria-label="Toggle navigation menu"
                aria-expanded={showMobileMenu}
                style={{ touchAction: 'manipulation', position: 'relative', zIndex: 60 }}
              >
                {showMobileMenu ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {showMobileMenu && (
          <>
            {/* Backdrop overlay */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50"
              style={{ zIndex: 55 }}
              onClick={() => setShowMobileMenu(false)}
            />
            
            {/* Menu container */}
            <div 
              className="fixed top-20 inset-x-0 bg-white dark:bg-gray-900 shadow-lg border-t border-gray-100 dark:border-gray-800"
              style={{ 
                zIndex: 59, 
                maxHeight: 'calc(100vh - 5rem)', 
                overflowY: 'auto',
                paddingBottom: '2rem'
              }}
              ref={mobileMenuRef}
            >
              <div className="px-4 py-4 space-y-3">
                <Link 
                  href="#features" 
                  className="block px-4 py-2 text-lg font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-md"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Features
                </Link>
                <Link 
                  href="#how-it-works" 
                  className="block px-4 py-2 text-lg font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-md"
                  onClick={() => setShowMobileMenu(false)}
                >
                  How It Works
                </Link>
                <Link 
                  href="#faq" 
                  className="block px-4 py-2 text-lg font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-md"
                  onClick={() => setShowMobileMenu(false)}
                >
                  FAQ
                </Link>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Link 
                    href="/login" 
                    className="block w-full px-4 py-2 text-center text-white bg-emerald-600 hover:bg-emerald-700 font-medium rounded-md transition-all duration-200 shadow-sm"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </header>
      
      {/* Hero Section */}
      <motion.section 
        className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-screen max-w-full"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Animated background pattern */}
        <div className="absolute inset-0 z-0 opacity-20 dark:opacity-10 overflow-hidden">
          <motion.div 
            className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl"
            animate={{
              x: [0, 10, -5, 0],
              y: [0, -15, 8, 0],
            }}
            transition={{
              duration: 20,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse"
            }}
          ></motion.div>
          <motion.div 
            className="absolute top-1/4 -right-24 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl"
            animate={{
              x: [0, -15, 10, 0],
              y: [0, 10, -8, 0],
            }}
            transition={{
              duration: 18,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "mirror"
            }}
          ></motion.div>
          <motion.div 
            className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-amber-300 rounded-full mix-blend-multiply filter blur-xl"
            animate={{
              x: [0, 20, -10, 0],
              y: [0, -10, 15, 0],
            }}
            transition={{
              duration: 22,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse"
            }}
          ></motion.div>
        </div>
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={itemVariants}>
              <motion.h1 
                className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6"
                variants={itemVariants}
                whileInView={{
                  textShadow: ["0 0 0px rgba(16, 185, 129, 0)", "0 0 15px rgba(16, 185, 129, 0.3)", "0 0 0px rgba(16, 185, 129, 0)"],
                  transition: {
                    duration: 2.5,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }
                }}
              >
                <motion.span 
                  className="text-emerald-600 dark:text-emerald-400"
                  animate={{
                    color: ["#10b981", "#14b8a6", "#10b981"]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >CheckMate</motion.span> Attendance
              </motion.h1>
              
              <motion.p 
                className="text-xl text-gray-600 dark:text-gray-300 mb-10"
                variants={itemVariants}
              >
                A modern, intuitive attendance tracking system for interns and workers with digital signature check-in. Track attendance, manage schedules, and analyze productivity all in one platform.
              </motion.p>
              
              <motion.div className="flex flex-col sm:flex-row gap-4 mb-8" variants={itemVariants}>
                <Link 
                  href="/checkin" 
                  className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Check In Now
                </Link>
                <Link 
                  href="/login" 
                  className="px-8 py-3 bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 font-medium rounded-lg border border-emerald-200 dark:border-gray-700 hover:border-emerald-400 dark:hover:border-gray-600 transition-all duration-200 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                  </svg>
                  Log In
                </Link>
              </motion.div>
              
              <motion.div variants={itemVariants} className="flex items-center space-x-4 mt-10">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-semibold"></span> 
                </p>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="hidden lg:block"
              variants={itemVariants}
              whileInView={{ scale: 1, rotate: 0 }}
              initial={{ scale: 0.95, rotate: -2 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 20
              }}
            >
              <div className="relative">
                <motion.div
                  whileHover={{
                    scale: 1.03,
                    transition: { duration: 0.3 }
                  }}
                >
                  <Image
                    src="/Screenshot (10).png"
                    alt="CheckMate Dashboard Preview"
                    width={600}
                    height={400}
                    className="rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 relative z-10"
                    priority
                  />
                </motion.div>
                <motion.div 
                  className="absolute -bottom-5 -left-5 w-32 h-32 bg-emerald-200 dark:bg-emerald-800/30 rounded-full z-0"
                  animate={{
                    scale: [1, 1.2, 1],
                    x: [0, 5, 0],
                    y: [0, -5, 0]
                  }}
                  transition={{
                    duration: 5,
                    ease: "easeInOut",
                    repeat: Infinity,
                  }}
                ></motion.div>
                <motion.div 
                  className="absolute -top-5 -right-5 w-20 h-20 bg-teal-200 dark:bg-teal-800/30 rounded-full z-0"
                  animate={{
                    scale: [1, 1.2, 1],
                    x: [0, -5, 0],
                    y: [0, 5, 0]
                  }}
                  transition={{
                    duration: 4,
                    ease: "easeInOut",
                    repeat: Infinity,
                    delay: 1
                  }}
                ></motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>


      {/* Features Section */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="container mx-auto max-w-7xl">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 50,
              damping: 20,
              duration: 0.8 
            }}
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.h2 
              className="text-3xl font-bold text-gray-900 dark:text-white mb-4"
              whileInView={{
                textShadow: ["0 0 0px rgba(16, 185, 129, 0)", "0 0 10px rgba(16, 185, 129, 0.2)", "0 0 0px rgba(16, 185, 129, 0)"],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >Powerful Features</motion.h2>
            <motion.p 
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >Everything you need to track and manage attendance efficiently</motion.p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainerVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {featureItems.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden"
                variants={fadeInUpVariant}
                whileHover={{
                  y: -10,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  transition: { type: "spring", stiffness: 400, damping: 17 }
                }}
              >
                <motion.div 
                  className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4"
                  initial={{ scale: 0.8, rotate: -10 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 200, 
                    damping: 10,
                    delay: index * 0.1 
                  }}
                  whileHover={{ 
                    scale: 1.1,
                    backgroundColor: "#10b981",
                    color: "#ffffff" 
                  }}
                >
                  <span className="text-emerald-600 dark:text-emerald-400 text-xl font-bold">{index + 1}</span>
                </motion.div>
                <motion.h3 
                  className="text-xl font-semibold mb-2 text-gray-900 dark:text-white"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >{feature.title}</motion.h3>
                <motion.p 
                  className="text-gray-600 dark:text-gray-300"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >{feature.description}</motion.p>
                
                <motion.div 
                  className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-tr from-emerald-100 to-transparent dark:from-emerald-900/20 dark:to-transparent rounded-full z-0 opacity-70"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, 0]
                  }}
                  transition={{
                    duration: 8,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800 relative overflow-hidden">
        {/* Animated background elements */}
        <motion.div 
          className="absolute top-20 left-10 w-64 h-64 bg-emerald-200 dark:bg-emerald-800/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          animate={{
            x: [0, 30, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-80 h-80 bg-teal-200 dark:bg-teal-800/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          animate={{
            x: [0, -40, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 18,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 50,
              damping: 15,
              duration: 0.8
            }}
            viewport={{ once: true }}
          >
            <motion.h2 
              className="text-3xl font-bold text-gray-900 dark:text-white mb-4"
              animate={{
                textShadow: ["0 0 0px rgba(16, 185, 129, 0)", "0 0 10px rgba(16, 185, 129, 0.3)", "0 0 0px rgba(16, 185, 129, 0)"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >How It Works</motion.h2>
            <motion.p 
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >Simple steps to track attendance efficiently</motion.p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto"
            variants={staggerContainerVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {/* Step 1 */}
            <motion.div
              className="flex flex-col items-center text-center relative"
              variants={fadeInUpVariant}
              whileHover={{
                y: -8,
                transition: { type: "spring", stiffness: 400 }
              }}
            >
              <motion.div 
                className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6"
                whileHover={{ 
                  scale: 1.1,
                  backgroundColor: "#10b981",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <motion.svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-10 w-10 text-emerald-600 dark:text-emerald-400" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                  whileHover={{ color: "#ffffff" }}
                >
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a6 6 0 0012 0c0-.352-.035-.696-.1-1.028a5 5 0 00-4.9-2.972z" clipRule="evenodd" />
                </motion.svg>
              </motion.div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">1. Sign In</h3>
              <p className="text-gray-600 dark:text-gray-300">Create an account or log in with your existing credentials to access the system.</p>
            </motion.div>
            
            {/* Step 2 */}
            <motion.div
              className="flex flex-col items-center text-center relative"
              variants={fadeInUpVariant}
              whileHover={{
                y: -8,
                transition: { type: "spring", stiffness: 400 }
              }}
            >
              <motion.div 
                className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6"
                whileHover={{ 
                  scale: 1.1,
                  backgroundColor: "#10b981",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <motion.svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-10 w-10 text-emerald-600 dark:text-emerald-400" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                  whileHover={{ color: "#ffffff" }}
                >
                  <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                </motion.svg>
              </motion.div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">2. Daily Check-In</h3>
              <p className="text-gray-600 dark:text-gray-300">Use the quick check-in feature with digital signature verification to mark your attendance.</p>
            </motion.div>
            
            {/* Step 3 */}
            <motion.div
              className="flex flex-col items-center text-center relative"
              variants={fadeInUpVariant}
              whileHover={{
                y: -8,
                transition: { type: "spring", stiffness: 400 }
              }}
            >
              <motion.div 
                className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6"
                whileHover={{ 
                  scale: 1.1,
                  backgroundColor: "#10b981",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <motion.svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-10 w-10 text-emerald-600 dark:text-emerald-400" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                  whileHover={{ color: "#ffffff" }}
                >
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm4-1a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1z" clipRule="evenodd" />
                </motion.svg>
              </motion.div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">3. Track & Report</h3>
              <p className="text-gray-600 dark:text-gray-300">Access attendance history, generate reports, and analyze trends through the dashboard.</p>
            </motion.div>
          </motion.div>
          
          <div className="mt-16 text-center">
            <Link 
              href="/login" 
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all duration-200 inline-flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd" />
              </svg>
              Explore Dashboard Demo
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">Find answers to common questions about CheckMate</p>
          </div>
          
          <div className="space-y-8">
            {/* FAQ Item 1 */}
            <motion.div 
              className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">How do I check in for attendance?</h3>
              <p className="text-gray-600 dark:text-gray-300">To check in, simply log into the system, click on the "Check In" button on the dashboard, verify your identity with your digital signature, and submit. The system will automatically record your time and location.</p>
            </motion.div>
            
            {/* FAQ Item 2 */}
            <motion.div 
              className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Can I check my attendance history?</h3>
              <p className="text-gray-600 dark:text-gray-300">Yes, you can view your complete attendance history on your dashboard. The system maintains records of all your check-ins, including dates, times, and any notes or exceptions. You can also download reports for specific date ranges.</p>
            </motion.div>
            
            {/* FAQ Item 3 */}
            <motion.div 
              className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">What if I forget to check in?</h3>
              <p className="text-gray-600 dark:text-gray-300">If you forget to check in, you can submit a late check-in request through the system. Your supervisor will be notified and can approve the request. Make sure to include the reason for the missed check-in in your request.</p>
            </motion.div>
            
            {/* FAQ Item 4 */}
            <motion.div 
              className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Is my attendance data secure?</h3>
              <p className="text-gray-600 dark:text-gray-300">Absolutely. We take data security very seriously. All your attendance data is encrypted and stored securely. Only authorized personnel can access detailed attendance records, and we comply with data protection regulations.</p>
            </motion.div>
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-gray-600 dark:text-gray-300">Have more questions?</p>
            <Link 
              href="#" 
              className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline inline-flex items-center mt-2"
            >
              Contact our support team
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Image 
                src="/Screenshot__9_-removebg-preview.png" 
                alt="CheckMate Logo" 
                width={120} 
                height={120} 
                className="py-1"
              />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">© {new Date().getFullYear()} All rights reserved.</p>
            </div>
            
            <div className="flex space-x-6">
              <Link href="/privacy-policy" className="text-gray-600 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="text-gray-600 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
