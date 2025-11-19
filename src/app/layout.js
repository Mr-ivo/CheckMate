import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/context/ThemeContext";
import LoadingProvider from "@/components/LoadingProvider";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  fallback: ['system-ui', 'arial'],
  preload: true,
  variable: '--font-inter',
});

export const metadata = {
  title: "CheckMate - Company Attendance Management System",
  description: "Modern and efficient attendance tracking application for companies",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Force light mode immediately on page load
                document.documentElement.classList.remove('dark');
                document.body.classList.remove('dark');
                document.documentElement.style.colorScheme = 'light';
                localStorage.removeItem('darkMode');
                localStorage.removeItem('theme');
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased transition-colors duration-300`}>
        <ThemeProvider>
          <LoadingProvider>
            <Toaster 
              position="top-right"
              toastOptions={{
                className: '',
                style: {
                  background: 'var(--card-background)',
                  color: 'var(--card-foreground)',
                  border: '1px solid var(--border-color)',
                },
              }}
            />
            {children}
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
