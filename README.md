# Cryptfolio - Cross-Chain Crypto Portfolio Tracker

> A multi-user cryptocurrency portfolio tracker that supports 9+ blockchains with automatic token detection, historical tracking, and a beautiful UI.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.5-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## ✨ Features

- 🔗 **Multi-Chain Support**: Track assets across Ethereum, Bitcoin, Solana, Polygon, BSC, Arbitrum, Optimism, Avalanche, and Base
- 🪙 **Automatic Token Detection**:
  - ERC20 tokens on EVM chains
  - SPL tokens on Solana
  - Low market cap token support via DexScreener
- 📊 **Portfolio History**: 7-day historical tracking with 30-minute snapshots
- 👥 **Multi-User Authentication**: Beta key system with NextAuth
- 💰 **Real-time Pricing**: CoinGecko API integration
- 🎨 **Beautiful UI**: Clean, responsive design with gradient cards and charts
- 💾 **Database Persistence**: PostgreSQL with Prisma ORM

## 🛠 Tech Stack

- **Framework**: Next.js 15.5 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon/Supabase/Railway)
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **UI**: Tailwind CSS
- **Charts**: Recharts
- **Blockchain**: ethers.js, Solana Web3.js
- **APIs**: CoinGecko, DexScreener, Blockscout

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (we recommend [Neon](https://neon.tech) - free tier available)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/cryptfolio.git
   cd cryptfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Update the following variables in `.env`:
   ```env
   # Database (Required)
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"

   # NextAuth (Required)
   NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
   NEXTAUTH_URL="http://localhost:3000"

   # Admin Secret (Required - for generating beta keys)
   ADMIN_SECRET="your-secure-admin-secret"
   ```

   **Generate secrets:**
   ```bash
   # Generate NEXTAUTH_SECRET
   openssl rand -base64 32

   # Generate ADMIN_SECRET
   openssl rand -base64 32
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run migrations
   npx prisma migrate dev --name init
   ```

5. **Generate beta keys**

   Start the dev server:
   ```bash
   npm run dev
   ```

   In another terminal, generate beta keys:
   ```bash
   curl -X POST http://localhost:3000/api/admin/generate-beta-key \
     -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
     -H "Content-Type: application/json"
   ```

6. **Open the app**

   Visit [http://localhost:3000](http://localhost:3000)

## 📦 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push your code to GitHub
2. Import your repository on Vercel
3. Add environment variables:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (your Vercel URL)
   - `ADMIN_SECRET`
4. Deploy!

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## 📖 Usage

### Admin Tasks

**Generate Beta Keys:**
```bash
curl -X POST https://your-app.vercel.app/api/admin/generate-beta-key \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  -H "Content-Type: application/json"
```

### User Registration

1. Get a beta key from the admin
2. Go to `/auth/signin`
3. Click "Register"
4. Enter the beta key
5. Create your account

### Adding Wallets

Supported address formats:
- **Ethereum/EVM**: `0x...` (42 characters)
- **Bitcoin**: Starts with `1`, `3`, or `bc1`
- **Solana**: Base58 encoded (32-44 characters)

## 📂 Project Structure

```
cryptfolio/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   └── page.tsx           # Main app page
├── components/            # React components
├── lib/                   # Utility functions
│   ├── chains.ts          # Blockchain configurations
│   ├── balance-service.ts # Balance fetching logic
│   ├── price-service.ts   # Price fetching (CoinGecko)
│   ├── dex-price-service.ts # DexScreener integration
│   ├── prisma.ts          # Prisma client
│   └── auth.ts            # NextAuth config
├── prisma/                # Database schema
├── types/                 # TypeScript types
└── public/                # Static assets
```

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | ✅ | Secret for NextAuth (min 32 chars) |
| `NEXTAUTH_URL` | ✅ | Your app URL |
| `ADMIN_SECRET` | ✅ | Secret for admin API routes |

## 🗺 Roadmap

- [ ] Add more blockchain support (Cosmos, Cardano, etc.)
- [ ] NFT detection and display
- [ ] Export portfolio data (CSV, PDF)
- [ ] Mobile app (React Native)
- [ ] Price alerts and notifications
- [ ] DeFi protocol integration (staking, lending)
- [ ] Portfolio sharing (public profiles)

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [CoinGecko](https://www.coingecko.com/) - Price data
- [DexScreener](https://dexscreener.com/) - Low-cap token prices
- [Blockscout](https://blockscout.com/) - Blockchain explorer API
- [Neon](https://neon.tech/) - Serverless PostgreSQL

## ⭐ Support

If you find this project helpful, please give it a ⭐️!

For issues and questions, please use [GitHub Issues](https://github.com/YOUR_USERNAME/cryptfolio/issues).
