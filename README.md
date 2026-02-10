# DV Frontend - Vue 3 Admin Panel & Payment Form

[![Vue 3](https://img.shields.io/badge/Vue-3.5+-green.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3+-purple.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## 🏗️ Project Structure

```
dv-frontend/
├── apps/
│   ├── dv-admin/          # Admin panel application
│   └── pay/               # Payment form application
├── src/                   # Shared components
    ├── assets/    
    ├── components/
    └── utils/      
```

## 🚀 Quick Start
### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dv-net/dv-frontend.git
   cd dv-frontend
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Environment Setup**
   Create `.env` files based on `.env.example` in each app directory:
   ```bash
   cp apps/dv-admin/.env.example apps/dv-admin/.env
   cp apps/pay/.env.example apps/pay/.env
   ```

4. **Start Development**
   ```bash
   # Admin Panel
   yarn dev
   
   # Payment Form
   yarn dev:pay
   ```

## 🛠️ Development

### Available Scripts

- `yarn dev` - Start admin panel development server
- `yarn dev:pay` - Start payment form development server
- `yarn build` - Build both applications with TypeScript checking
- `yarn build:dv-admin` - Build admin panel only
- `yarn build:pay` - Build payment form only
- `yarn lint` - Run ESLint with auto-fix
- `yarn format` - Format code with Prettier
- `yarn type-check` - Run TypeScript type checking

### Build Commands

```bash
# Build both applications
yarn build

# Build individual applications
yarn build:dv-admin
yarn build:pay

# Build without TypeScript checking
yarn build-only
```

## 📱 Applications

### DV Admin Panel

**Access**: `http://localhost:3333/dv-admin`

### Payment Form
A dedicated payment processing interface:
- Wallet payments: `/pay/wallet/:payerId`
- Store payments: `/pay/store/:slug/:externalId`

**Access**: `http://localhost:3333/pay`

## 🧩 Tech Stack

- **Frontend Framework**: Vue 3.5+
- **Build Tool**: Vite 6.3+
- **Language**: TypeScript 5.8+
- **State Management**: Pinia 3.0+
- **Routing**: Vue Router 4.5+
- **Styling**: SCSS with modern CSS features
- **Charts**: Chart.js with vue-chartjs
- **HTTP Client**: Axios
- **Internationalization**: Vue I18n
- **Code Quality**: ESLint + Prettier

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

<br>

<div align="center">

**© 2026 DV.net** • [DV Technologies Ltd.](https://dv.net)

*Built with ❤️ for the crypto community*

</div>
