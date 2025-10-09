/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer, webpack }) => {
    // Fix for 'self is not defined' error in server-side rendering
    if (isServer) {
      // Add global polyfills for server-side rendering
      config.plugins = config.plugins || []
      config.plugins.push(
        new webpack.DefinePlugin({
          'typeof self': JSON.stringify('undefined'),
          'self': 'undefined',
          'window': 'undefined',
          'document': 'undefined',
          'navigator': 'undefined',
          'location': 'undefined',
          'localStorage': 'undefined',
          'sessionStorage': 'undefined',
        })
      )
      
      // Exclude problematic packages from server bundle
      config.externals = config.externals || []
      config.externals.push({
        'recharts': 'commonjs recharts',
        '@vercel/analytics': 'commonjs @vercel/analytics',
        'lucide-react': 'commonjs lucide-react',
      })
    }
    
    return config
  },
}

export default nextConfig
