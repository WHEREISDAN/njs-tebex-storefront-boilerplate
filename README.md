# Next.js Tebex Storefront Boilerplate

A modern, secure boilerplate for creating custom Tebex storefronts using Next.js 15, React 19, and TypeScript.

![Next.js](https://img.shields.io/badge/Next.js-15.3.2-black)
![React](https://img.shields.io/badge/React-19.0.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0.0-38B2AC)

## Overview

This boilerplate provides a ready-to-use template for building custom storefronts with Tebex's headless API. It includes a complete implementation of the Tebex API with server-side security, responsive design, and modern React patterns.

## Features

- 🔒 **Secure by Default**: All private API calls happen server-side
- 🛒 **Complete Shopping Experience**: Browse, add to cart, checkout
- 🔄 **Real-time Cart Updates**: Instantly see cart changes
- 📱 **Fully Responsive**: Works on all devices
- 🚀 **Server Components**: Utilizes Next.js 15's App Router architecture
- 🛡️ **CSRF Protection**: For all state-changing operations
- 🔍 **SEO Optimized**: Server-rendered pages with proper metadata
- 💅 **Modern Design**: Clean, game-themed UI

## Prerequisites

- Node.js 18.17 or later
- A Tebex account with a webstore
- Tebex API keys (public and private)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/njs-tebex-storefront-boilerplate.git
cd njs-tebex-storefront-boilerplate
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root of your project:

```
# Tebex API Configuration
NEXT_PUBLIC_TEBEX_PUBLIC_TOKEN=
TEBEX_PRIVATE_TOKEN=

# CSRF Protection Configuration
# Set to 'true' to enforce CSRF protection in development
ENFORCE_CSRF_IN_DEV=false
```

Replace `your_public_token` and `your_private_token` with your actual Tebex API tokens. The public token is included in client-side code, while the private token is only used on the server.

### 4. Update Configuration

Edit the `next.config.ts` file to set your production domain in the CORS configuration:

```typescript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://yourdomain.com', // Update this with your actual domain
];
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your storefront.

## Project Structure

```
├── public/              # Static assets
├── src/
│   ├── app/             # Next.js App Router components
│   │   ├── api/         # API routes (server-side only)
│   │   ├── basket/      # Shopping cart page
│   │   ├── categories/  # Category browsing pages
│   │   ├── checkout/    # Checkout pages
│   │   ├── packages/    # Package/item pages
│   │   └── page.tsx     # Homepage
│   ├── components/      # Reusable UI components
│   ├── contexts/        # React context providers
│   └── lib/             # Utility functions and API clients
└── SECURITY_IMPROVEMENTS.md  # Security documentation
```

## Security Features

This boilerplate includes several security enhancements:

1. **Server-side API Calls**: All private API operations are performed server-side to protect your Tebex Private Token.
2. **CSRF Protection**: All state-changing operations are protected against Cross-Site Request Forgery.
3. **URL Validation**: All URLs used for redirects are validated against an allowlist.
4. **Input Validation**: Comprehensive validation for all input parameters.
5. **Restricted CORS Policy**: Properly configured CORS headers for production.

For more details, see the [SECURITY_IMPROVEMENTS.md](./SECURITY_IMPROVEMENTS.md) file.

## Customization

### Styling

This project uses Tailwind CSS for styling. The main theme is defined in the `globals.css` file, with several custom utility classes for the game-themed UI.

### Adding Pages

To add new pages, create new files in the appropriate directories under `src/app/`. Next.js 15 uses file-system based routing with the App Router.

### Modifying Components

All UI components are located in `src/components/`. Modify these to match your brand and design requirements.

## Deployment

This application can be deployed to any platform that supports Next.js applications:

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Traditional Hosting

```bash
npm run build
npm start
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- This project uses [Next.js](https://nextjs.org/) for server-side rendering
- [Tebex](https://tebex.io/) for e-commerce functionality
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [nanoid](https://github.com/ai/nanoid) for CSRF token generation
