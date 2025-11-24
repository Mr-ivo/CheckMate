import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start">
            <span className="text-sm text-gray-500">
              © {currentYear} CheckMate. All rights reserved.
            </span>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center justify-center space-x-6">
            <Link
              href="/privacy"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Terms of Service
            </Link>
            <Link
              href="/contact"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

