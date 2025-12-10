/** @type {import('next').NextConfig} */
const nextConfig = {
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
  ],
}

export default nextConfig
