"use client";

import Link from 'next/link';
import { useLoading } from './LoadingProvider';

// Custom Link component that triggers the loading state
export default function NavigationLink({ href, children, className, ...props }) {
  const { triggerLoading } = useLoading();
  
  const handleClick = (e) => {
    // Don't trigger for external links or anchor links
    if (href.startsWith('http') || href.startsWith('#') || href.startsWith('tel:') || href.startsWith('mailto:')) {
      return;
    }
    
    // Trigger loading state
    triggerLoading();
    
    // Also dispatch a custom event for any other components that need to know
    window.dispatchEvent(new Event('navigation-start'));
  };
  
  return (
    <Link 
      href={href} 
      className={className} 
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
}
