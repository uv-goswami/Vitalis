# 🧬 Vitalis AI

Vitalis is a 100% private, offline-first AI health coach. It runs Large Language Models directly in the browser

## 🛠️ Installation

Ensure you have [Node.js](https://nodejs.org/) installed, then run the following commands:

```bash
# 1. Clone the repository
git clone https://github.com/uv-goswami/Vitalis.git

# 2. Enter the directory
cd Vitalis

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev

```

---

## 📁 Project Structure

```text
Vitalis/
├── public/              # Static assets
│   ├── wasm/            # WebAssembly binaries (.wasm / .js)
│   ├── icon.svg         # PWA App Icon
│   └── manifest.json    # PWA configuration
├── src/                 # Application source code
│   ├── assets/          # Styles and UI images
│   ├── components/      # React UI components
│   ├── App.tsx          # Main Application logic
│   └── main.tsx         # React entry point
├── index.html           # HTML entry & Service Worker registration
├── package.json         # Scripts and dependencies
├── vercel.json          # Deployment & COOP/COEP headers
└── tsconfig.json        # TypeScript configuration

```