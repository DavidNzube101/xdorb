/** @type {import('next').NextConfig} */
const nextConfig = {
  // Set the root directory for file tracing to silence the warning
  outputFileTracingRoot: '/home/skipp/Documents/projects/XB',
  
  compiler: {
    emotion: false,
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  images: {
    unoptimized: true,
  },
  
  // Ensure Solana packages are transpiled
  transpilePackages: [
    '@solana/web3.js',
    '@solana/wallet-adapter-base',
    '@solana/wallet-adapter-react',
    '@solana/wallet-adapter-react-ui',
    '@solana/wallet-adapter-wallets',
    '@gorbag/wallet-adapter',
    'recharts',
  ],
  
  webpack: (config, { isServer, webpack }) => {
    // Add fallbacks for Node.js modules used by Solana/crypto packages
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        stream: false,
        buffer: false,
        process: false,
        http: false,
        https: false,
        os: false,
        url: false,
        zlib: false,
        vm: false,
        fs: false,
        net: false,
        tls: false,
      };
      
      // Provide global polyfills using webpack from the config parameter
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        })
      );
    }
    
    return config;
  },

  // Optimize package imports for better tree-shaking
  experimental: {
    optimizePackageImports: ['recharts', 'lucide-react'],
  },
};

export default nextConfig;
