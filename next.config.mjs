/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['dev.internal.defnf.com'],
  turbopack: {
    rules: {
      '*.dds': {
        loaders: ['raw-loader'],
        as: 'raw',
      },
    },
  },
  async headers() {
    return [
      {
        source: '/models/textures/:path*.dds',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/octet-stream',
          },
        ],
      },
    ];
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.dds$/,
      type: 'asset/resource',
    });
    return config;
  },
};

export default nextConfig;