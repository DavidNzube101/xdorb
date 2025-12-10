"use client"

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { PublicKey, TransactionInstruction, TransactionMessage, VersionedTransaction } from '@solana/web3.js'
import { MINT_ADDRESSES, getJupiterQuote, getJupiterSwapTransaction } from '@/lib/jupiter'
import { Loader2, Wallet, RefreshCw, ArrowDown, ExternalLink, Settings2, Info } from 'lucide-react'
import { toast } from 'sonner' 
import { formatUnits, parseUnits, shortenAddress } from '@/lib/utils'

export function BuyXandButton() {
  const { connected, publicKey, sendTransaction, disconnect, wallet } = useWallet()
  const { connection } = useConnection()
  const { setVisible } = useWalletModal()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [inputMint, setInputMint] = useState<'SOL' | 'USDC'>('SOL')
  const [inputAmount, setInputAmount] = useState<string>('')
  const [outputAmount, setOutputAmount] = useState<string>('0')
  const [isLoadingQuote, setIsLoadingQuote] = useState(false)
  const [isSwapping, setIsSwapping] = useState(false)
  const [quoteResponse, setQuoteResponse] = useState<any | null>(null)
  const [inputTokenBalance, setInputTokenBalance] = useState<string>('0')
  
  // Advanced Settings
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [slippage, setSlippage] = useState<string>('0.5') // percent

  // Mints & Decimals
  const inputMintInfo = useMemo(() => {
    if (inputMint === 'SOL') return { address: MINT_ADDRESSES.SOL, decimals: 9 }
    return { address: MINT_ADDRESSES.USDC, decimals: 6 }
  }, [inputMint])

  const outputMintInfo = { address: MINT_ADDRESSES.XAND, decimals: 9 }

  // Fetch Balances
  const fetchBalances = useCallback(async () => {
    if (!publicKey) {
      setInputTokenBalance('0')
      return
    }

    const tokenAddress = inputMintInfo.address
    let balance = 0

    if (tokenAddress === MINT_ADDRESSES.SOL) {
      balance = await connection.getBalance(publicKey) / 10**9
      setInputTokenBalance(balance.toFixed(4))
    } else {
      try {
        const tokenAccounts = await connection.getTokenAccountsByOwner(
          publicKey,
          { mint: new PublicKey(tokenAddress) }
        )
        if (tokenAccounts.value.length > 0) {
          const accountInfo = await connection.getParsedAccountInfo(tokenAccounts.value[0].pubkey)
          if (accountInfo.value && 'parsed' in accountInfo.value.data) {
            balance = accountInfo.value.data.parsed.info.tokenAmount.uiAmount
          }
        }
        setInputTokenBalance(balance.toFixed(4))
      } catch (error) {
        console.error(`Error fetching ${inputMint} balance:`, error)
        setInputTokenBalance('0')
      }
    }
  }, [publicKey, inputMintInfo.address, connection, inputMint])

  useEffect(() => {
    fetchBalances()
    const interval = setInterval(fetchBalances, 15000)
    return () => clearInterval(interval)
  }, [fetchBalances])

  // Get Jupiter Quote
  const fetchQuote = useCallback(async () => {
    // Note: Removed balance check to allow quoting even if insufficient funds
    if (!inputAmount || parseFloat(inputAmount) <= 0 || !connected || !publicKey) {
      setOutputAmount('0')
      setQuoteResponse(null)
      return
    }

    setIsLoadingQuote(true)
    try {
      const amountInBaseUnits = parseUnits(inputAmount, inputMintInfo.decimals)
      // Convert slippage % to BPS (1% = 100 bps)
      const slippageBps = parseFloat(slippage) * 100
      
      const quote = await getJupiterQuote(
        new PublicKey(inputMintInfo.address),
        new PublicKey(outputMintInfo.address),
        amountInBaseUnits,
        slippageBps
      )
      if (quote) {
        setQuoteResponse(quote)
        setOutputAmount(formatUnits(quote.outAmount, outputMintInfo.decimals))
      } else {
        setOutputAmount('0')
        setQuoteResponse(null)
        // toast.error("Failed to get swap quote.") // Be less aggressive with toasts while typing
      }
    } catch (err) {
      console.error(err)
      setOutputAmount('0')
      setQuoteResponse(null)
    } finally {
      setIsLoadingQuote(false)
    }
  }, [inputAmount, connected, publicKey, inputMintInfo.address, inputMintInfo.decimals, outputMintInfo.address, outputMintInfo.decimals, slippage])

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchQuote()
    }, 500)
    return () => clearTimeout(handler)
  }, [inputAmount, inputMint, slippage, fetchQuote])

  // Handle Swap
  const handleSwap = useCallback(async () => {
    if (!connected || !publicKey || !quoteResponse) {
      toast.error("Wallet not connected or no quote available.")
      return
    }

    setIsSwapping(true)
    try {
      const swapTransaction = await getJupiterSwapTransaction(quoteResponse, publicKey)

      if (!swapTransaction) {
        toast.error("Failed to prepare swap transaction.")
        setIsSwapping(false)
        return
      }

      const signature = await sendTransaction(swapTransaction, connection)
      
      const latestBlockHash = await connection.getLatestBlockhash()
      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: signature,
      }, 'confirmed')

      toast.success(
        <div className="flex flex-col items-start">
          <p>Swap successful!</p>
          <a
            href={`https://solscan.io/tx/${signature}?cluster=mainnet-beta`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-500 hover:underline flex items-center"
          >
            View on Solscan <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </div>
      )
      
      fetchBalances()
      setInputAmount('')
      setOutputAmount('0')
      setQuoteResponse(null)

    } catch (error: any) {
      console.error('Swap failed:', error)
      toast.error(`Swap failed: ${error.message || 'Unknown error'}`)
    } finally {
      setIsSwapping(false)
    }
  }, [connected, publicKey, quoteResponse, sendTransaction, connection, fetchBalances])

  // Auto-select USDC
  useEffect(() => {
    if (connected && publicKey && inputMint === 'SOL' && parseFloat(inputTokenBalance) > 0) {
      const checkUsdc = async () => {
        try {
          const usdcAccounts = await connection.getTokenAccountsByOwner(
            publicKey,
            { mint: new PublicKey(MINT_ADDRESSES.USDC) }
          )
          if (usdcAccounts.value.length > 0) {
            const accountInfo = await connection.getParsedAccountInfo(usdcAccounts.value[0].pubkey)
            if (accountInfo.value && 'parsed' in accountInfo.value.data) {
              const usdcBalance = accountInfo.value.data.parsed.info.tokenAmount.uiAmount
              if (usdcBalance > 0) {
                setInputMint('USDC')
              }
            }
          }
        } catch (error) {
          console.warn("Could not check USDC balance for auto-switch:", error)
        }
      }
      checkUsdc()
    }
  }, [connected, publicKey, inputMint, inputTokenBalance, connection])

  return (
    <>
      <Button
        className="bg-accent text-accent-foreground hover:bg-accent/90"
        onClick={() => setIsModalOpen(true)}
      >
        Buy XAND
      </Button>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className={`sm:max-w-[425px] transition-all duration-500 ${connected ? 'animate-shimmer-border border-2' : ''}`}>
          <DialogHeader>
            <DialogTitle>Buy XAND</DialogTitle>
            <DialogDescription>Swap tokens for XAND via Jupiter Aggregator.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Wallet :</span>
              {connected ? (
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-primary" />
                  <span>{shortenAddress(publicKey?.toBase58() || '')}</span>
                  <Button variant="outline" size="sm" onClick={() => disconnect()}>Disconnect</Button>
                </div>
              ) : (
                <Button onClick={() => setVisible(true)} size="sm">Connect Wallet</Button>
              )}
            </div>

            {connected && (
              <>
                <div>
                  <Label htmlFor="inputMint">You Sell</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="inputAmount"
                      type="number"
                      placeholder="0.0"
                      value={inputAmount}
                      onChange={(e) => setInputAmount(e.target.value)}
                      className="flex-1"
                      min="0"
                      step="any"
                    />
                    <Select value={inputMint} onValueChange={(value: 'SOL' | 'USDC') => {
                      setInputMint(value)
                      setInputAmount('')
                    }}>
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Token" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SOL">SOL</SelectItem>
                        <SelectItem value="USDC">USDC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Balance: {inputTokenBalance} {inputMint}
                  </p>
                </div>

                <div className="flex justify-center my-2">
                  <ArrowDown className="w-5 h-5 text-muted-foreground" />
                </div>

                <div>
                  <Label htmlFor="outputMint">You Buy</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="outputAmount"
                      value={outputAmount}
                      readOnly
                      className="flex-1"
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" className="w-[100px] cursor-help">XAND</Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Mint: {MINT_ADDRESSES.XAND}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <Switch 
                    id="advanced-mode" 
                    checked={showAdvanced}
                    onCheckedChange={setShowAdvanced}
                  />
                  <Label htmlFor="advanced-mode" className="text-xs font-normal flex items-center gap-1 cursor-pointer">
                    <Settings2 className="w-3 h-3" /> Advanced Settings
                  </Label>
                </div>

                {showAdvanced && (
                  <div className="bg-muted/50 p-3 rounded-md space-y-2 animate-in slide-in-from-top-2">
                    <div>
                      <Label htmlFor="slippage" className="text-xs">Slippage (%)</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input 
                          id="slippage"
                          type="number"
                          value={slippage}
                          onChange={(e) => setSlippage(e.target.value)}
                          className="h-8 text-sm"
                          step="0.1"
                          min="0.1"
                          max="50"
                        />
                        <span className="text-xs text-muted-foreground">%</span>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleSwap}
                  className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={!connected || !quoteResponse || isSwapping || isLoadingQuote || parseFloat(inputAmount) <= 0 || parseFloat(inputAmount) > parseFloat(inputTokenBalance)}
                >
                  {(isSwapping || isLoadingQuote) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSwapping ? 'Swapping...' : isLoadingQuote ? 'Getting Quote...' : 'Swap XAND'}
                </Button>
                
                {parseFloat(inputAmount) > parseFloat(inputTokenBalance) && (
                  <p className="text-sm text-destructive mt-1 text-center">Insufficient {inputMint} balance</p>
                )}
                
                {quoteResponse && (
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Slippage: {(quoteResponse.slippageBps / 100).toFixed(2)}% | Est. Fee: {(3 / 100).toFixed(2)}%
                  </p>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}