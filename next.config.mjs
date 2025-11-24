/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable Turbopack for font loading issues
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // Font optimization
  optimizeFonts: true,
  
  // Webpack configuration for font handling
  webpack: (config, { isServer }) => {
    // Handle font files
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/fonts/',
          outputPath: 'static/fonts/',
        },
      },
    });

    return config;
  },
  
  // Image domains for optimization
  images: {
    domains: ['localhost', 'checkmate-backend-fm9d.onrender.com'],
    unoptimized: false,
  },
  
  // Output configuration for deployment
  output: 'standalone',
  
  // Disable strict mode to prevent double rendering in development
  reactStrictMode: false,
  
  // Force rebuild - dark mode completely removed
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
};

export default nextConfig;
