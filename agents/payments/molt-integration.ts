// ============================================================================
// MOLT TOKEN INTEGRATION
// ============================================================================
// Intégration avec le token MOLT pour les paiements agent-to-agent
// Basé sur Solana (où MOLT est déployé)
// ============================================================================

// ============================================================================
// TYPES
// ============================================================================

export interface MoltConfig {
  rpcUrl: string;
  programId: string;
  treasuryAddress: string;
  episodePriceMolt: number;
  tipMinMolt: number;
}

export interface WalletBalance {
  molt: number;
  sol: number;
  usdValue: number;
}

export interface Transaction {
  id: string;
  type: "tip" | "purchase" | "reward" | "transfer";
  fromAddress: string;
  toAddress: string;
  amountMolt: number;
  timestamp: Date;
  status: "pending" | "confirmed" | "failed";
  txHash?: string;
  memo?: string;
}

export interface PurchaseResult {
  success: boolean;
  transactionId?: string;
  accessToken?: string;
  error?: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG: MoltConfig = {
  rpcUrl: process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
  programId: process.env.MOLT_PROGRAM_ID || "MOLT_PROGRAM_ID_HERE",
  treasuryAddress: process.env.MOLT_TREASURY || "TREASURY_ADDRESS_HERE",
  episodePriceMolt: 100,
  tipMinMolt: 1,
};

// ============================================================================
// MOLT CLIENT
// ============================================================================

export class MoltClient {
  private config: MoltConfig;

  constructor(config: Partial<MoltConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ============================================================================
  // BALANCE
  // ============================================================================

  async getBalance(walletAddress: string): Promise<WalletBalance> {
    try {
      // In production, this would use @solana/web3.js
      const response = await fetch(this.config.rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getTokenAccountsByOwner",
          params: [
            walletAddress,
            { programId: this.config.programId },
            { encoding: "jsonParsed" },
          ],
        }),
      });

      const data = await response.json();

      // Parse token accounts to find MOLT balance
      const moltBalance = this.parseMoltBalance(data);

      // Get SOL balance
      const solResponse = await fetch(this.config.rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getBalance",
          params: [walletAddress],
        }),
      });

      const solData = await solResponse.json();
      const solBalance = (solData.result?.value || 0) / 1e9; // Convert lamports to SOL

      // Get USD value (would use price oracle in production)
      const moltPrice = await this.getMoltPrice();
      const solPrice = await this.getSolPrice();

      return {
        molt: moltBalance,
        sol: solBalance,
        usdValue: moltBalance * moltPrice + solBalance * solPrice,
      };
    } catch (error) {
      console.error("Error fetching balance:", error);
      return { molt: 0, sol: 0, usdValue: 0 };
    }
  }

  private parseMoltBalance(data: unknown): number {
    // Parse the RPC response to extract MOLT balance
    // This is simplified - real implementation would be more robust
    try {
      const accounts = (data as { result?: { value?: Array<{ account: { data: { parsed: { info: { tokenAmount: { uiAmount: number } } } } } }> } }).result?.value || [];
      for (const account of accounts) {
        const parsed = account.account?.data?.parsed?.info;
        if (parsed) {
          return parsed.tokenAmount?.uiAmount || 0;
        }
      }
    } catch {
      // Ignore parse errors
    }
    return 0;
  }

  // ============================================================================
  // PRICES
  // ============================================================================

  async getMoltPrice(): Promise<number> {
    try {
      // Would use Jupiter, Birdeye, or similar for real price
      // For now, return placeholder
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=molt&vs_currencies=usd"
      );
      const data = await response.json();
      return data.molt?.usd || 0.001; // Fallback price
    } catch {
      return 0.001; // Fallback
    }
  }

  async getSolPrice(): Promise<number> {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
      );
      const data = await response.json();
      return data.solana?.usd || 100; // Fallback price
    } catch {
      return 100; // Fallback
    }
  }

  // ============================================================================
  // TRANSACTIONS
  // ============================================================================

  async sendTip(
    fromWallet: string,
    toWallet: string,
    amountMolt: number,
    memo?: string
  ): Promise<Transaction> {
    if (amountMolt < this.config.tipMinMolt) {
      throw new Error(`Minimum tip is ${this.config.tipMinMolt} MOLT`);
    }

    // In production, this would create and sign a Solana transaction
    const transaction: Transaction = {
      id: `tip-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type: "tip",
      fromAddress: fromWallet,
      toAddress: toWallet,
      amountMolt,
      timestamp: new Date(),
      status: "pending",
      memo,
    };

    // Simulate transaction
    console.log(`[MOLT] Sending ${amountMolt} MOLT tip from ${fromWallet} to ${toWallet}`);

    // Would await actual blockchain confirmation
    transaction.status = "confirmed";
    transaction.txHash = `simulated_${transaction.id}`;

    return transaction;
  }

  async purchaseEpisode(
    buyerWallet: string,
    episodeId: string
  ): Promise<PurchaseResult> {
    const price = this.config.episodePriceMolt;

    // Check balance
    const balance = await this.getBalance(buyerWallet);
    if (balance.molt < price) {
      return {
        success: false,
        error: `Insufficient balance. Need ${price} MOLT, have ${balance.molt}`,
      };
    }

    // Create purchase transaction
    const transaction = await this.sendTip(
      buyerWallet,
      this.config.treasuryAddress,
      price,
      `Episode purchase: ${episodeId}`
    );

    if (transaction.status !== "confirmed") {
      return {
        success: false,
        error: "Transaction failed",
      };
    }

    // Generate access token
    const accessToken = await this.generateAccessToken(buyerWallet, episodeId);

    return {
      success: true,
      transactionId: transaction.id,
      accessToken,
    };
  }

  private async generateAccessToken(
    walletAddress: string,
    episodeId: string
  ): Promise<string> {
    // In production, this would create a signed JWT
    const payload = {
      wallet: walletAddress,
      episode: episodeId,
      exp: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
    };

    // Simple base64 encoding for demo
    return Buffer.from(JSON.stringify(payload)).toString("base64");
  }

  // ============================================================================
  // VERIFICATION
  // ============================================================================

  async verifyAccess(
    walletAddress: string,
    episodeId: string
  ): Promise<boolean> {
    try {
      // Check if there's a purchase transaction in history
      const transactions = await this.getTransactionHistory(walletAddress);

      return transactions.some(
        (tx) =>
          tx.type === "purchase" &&
          tx.memo?.includes(episodeId) &&
          tx.status === "confirmed"
      );
    } catch {
      return false;
    }
  }

  async getTransactionHistory(
    walletAddress: string,
    limit: number = 50
  ): Promise<Transaction[]> {
    // In production, would query Solana for transaction history
    // For now, return empty array
    console.log(`[MOLT] Fetching transaction history for ${walletAddress}, limit ${limit}`);
    return [];
  }

  // ============================================================================
  // REWARDS
  // ============================================================================

  async distributeCreatorReward(
    creatorWallet: string,
    amountMolt: number,
    reason: string
  ): Promise<Transaction> {
    return this.sendTip(
      this.config.treasuryAddress,
      creatorWallet,
      amountMolt,
      `Creator reward: ${reason}`
    );
  }

  async distributeTipShare(
    tips: Array<{ wallet: string; share: number }>,
    totalAmount: number
  ): Promise<Transaction[]> {
    const transactions: Transaction[] = [];

    for (const tip of tips) {
      const amount = totalAmount * tip.share;
      const tx = await this.sendTip(
        this.config.treasuryAddress,
        tip.wallet,
        amount,
        "Tip share distribution"
      );
      transactions.push(tx);
    }

    return transactions;
  }
}

// ============================================================================
// ACCESS CONTROL
// ============================================================================

export class MoltAccessControl {
  private moltClient: MoltClient;
  private accessCache: Map<string, { episodeId: string; expiresAt: Date }> = new Map();

  constructor(moltClient?: MoltClient) {
    this.moltClient = moltClient || new MoltClient();
  }

  async checkAccess(walletAddress: string, episodeId: string): Promise<boolean> {
    // Check cache first
    const cacheKey = `${walletAddress}-${episodeId}`;
    const cached = this.accessCache.get(cacheKey);

    if (cached && cached.expiresAt > new Date()) {
      return true;
    }

    // Verify on-chain
    const hasAccess = await this.moltClient.verifyAccess(walletAddress, episodeId);

    if (hasAccess) {
      // Cache for 1 hour
      this.accessCache.set(cacheKey, {
        episodeId,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      });
    }

    return hasAccess;
  }

  async grantTemporaryAccess(
    walletAddress: string,
    episodeId: string,
    durationMs: number
  ): void {
    const cacheKey = `${walletAddress}-${episodeId}`;
    this.accessCache.set(cacheKey, {
      episodeId,
      expiresAt: new Date(Date.now() + durationMs),
    });
  }

  clearCache(): void {
    this.accessCache.clear();
  }
}

// ============================================================================
// SINGLETON INSTANCES
// ============================================================================

let moltClientInstance: MoltClient | null = null;
let accessControlInstance: MoltAccessControl | null = null;

export function getMoltClient(config?: Partial<MoltConfig>): MoltClient {
  if (!moltClientInstance) {
    moltClientInstance = new MoltClient(config);
  }
  return moltClientInstance;
}

export function getAccessControl(): MoltAccessControl {
  if (!accessControlInstance) {
    accessControlInstance = new MoltAccessControl(getMoltClient());
  }
  return accessControlInstance;
}
