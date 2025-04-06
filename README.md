# Solana Token Distributor

A TypeScript tool for distributing SOL tokens to multiple generated wallets on the Solana blockchain.

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Solana CLI (optional)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/solana-token-distributor.git
   ```
   cd solana-token-distributor
2. Install dependencies:
    ```bash
    npm install
    ```

### Configuration
1. Copy the environment example file:
    ```bash
    cp .env.example .env
    ```
2. Edit the .env file and add your Base58-encoded private key:
    ```ini
    PRIVATE_DEV=your_base58_encoded_private_key_here
    ```
    ⚠️ Important: Never commit your .env file or share your private key!

### Running the Distributor
Modify the last line in ```src/index.ts``` to specify:
- Amount of SOL to distribute (first parameter)
- Number of recipient wallets (second parameter)

Example (distributes a random value of SOL from 0.2 to 0.5, to 20 wallets):
```typescript
transferSol(0.2, 0.5, 15); // Adjust these values as needed
```
Then run:
```bash
npm start
```

### 📝 How It Works
1. Generates new Solana keypairs
2. Transfers specified SOL amount from your wallet to each generated address
3. Logs transaction details and private keys to logs.txt