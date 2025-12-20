import { Connection, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js'
import bs58 from 'bs58'
import { apiClient } from '@/lib/api' // Import apiClient

// Helper function to get the current Solana connection
export const getConnection = () => {
  // Use a reliable RPC endpoint, e.g., from your config or a public one
  return new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com', 'confirmed')
}

// Mint addresses for common tokens
export const MINT_ADDRESSES = {
  SOL: 'So11111111111111111111111111111111111111112', // Wrapped SOL
  USDC: 'EPjFWc5nfKCsfQZu2pzCGLLQRmsGZNrNM1NsmFWk6CAM',
  XAND: 'XANDuUoVoUqniKkpcKhrxmvYJybpJvUxJLr21Gaj3Hx', // As provided by user
}

// Your Jupiter Referral Account and fee basis points
const JUPITER_REFERRAL_ACCOUNT = 'DXGYEBYmK46JiARDGKY74Sh3Zc1ANbQK9EbJ798fwuad'
const PLATFORM_FEE_BPS = 3 // 0.03%

interface QuoteResponse {
  inAmount: string;
  outAmount: string;
  outAmountWithSlippage: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  platformFee: {
    amount: string;
    mint: string;
    pct: number;
  };
  priceImpactPct: string;
  routePlan: any[];
  context: {
    ellapsed: number;
    bases: string[];
  };
  timeTaken: number;
  // This needs to be correctly passed to the /swap endpoint
  quoteResponse: any; 
}

export const getJupiterQuote = async (
  inputMint: PublicKey,
  outputMint: PublicKey,
  amount: number, // in base units of the inputMint
  slippageBps: number = 50 // 0.5% slippage
): Promise<QuoteResponse | null> => {
  try {
    const params = new URLSearchParams()
    params.append('inputMint', inputMint.toBase58())
    params.append('outputMint', outputMint.toBase58())
    params.append('amount', Math.floor(amount).toString()) // Amount in lamports/base units
    params.append('slippageBps', slippageBps.toString())
    params.append('platformFeeBps', PLATFORM_FEE_BPS.toString())
    params.append('referralAccount', JUPITER_REFERRAL_ACCOUNT)

    // Use apiClient to call the new backend proxy endpoint
    const response = await apiClient.getJupiterQuote(params.toString())
    
    if (response.error) {
      console.error('Jupiter Quote API Error:', response.error)
      throw new Error(`Failed to get Jupiter quote: ${response.error}`)
    }
    
    // The backend now returns { data: jupiterResponse }. Extract jupiterResponse.
    return response.data as QuoteResponse;
  } catch (error) {
    console.error('Error fetching Jupiter quote:', error)
    return null
  }
}

export const getJupiterSwapTransaction = async (
  quoteResponse: QuoteResponse,
  userPublicKey: PublicKey
): Promise<VersionedTransaction | null> => {
  try {
    const response = await fetch('/api/jupiter/swap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        quoteResponse,
        userPublicKey: userPublicKey.toBase58(),
        wrapUnwrapSol: true // Automatically wrap/unwrap SOL
      })
    })

    if (!response.ok) {
      const errorBody = await response.json();
      console.error('Jupiter Swap API Error:', errorBody);
      throw new Error(`Failed to get Jupiter swap transaction: ${response.statusText}`);
    }

    const { swapTransaction } = await response.json()
    const swapTransactionBuf = bs58.decode(swapTransaction)
    const transaction = VersionedTransaction.deserialize(swapTransactionBuf)

    return transaction
  } catch (error) {
    console.error('Error getting Jupiter swap transaction:', error)
    return null
  }
}
