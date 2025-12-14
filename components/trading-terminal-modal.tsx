"use client"

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { SwapUI } from '@/components/ui/swap-ui'
import { TRADING_PAIRS, DEFAULT_PAIR } from '@/lib/trading-pairs'
import { cn } from '@/lib/utils'

const AdvancedRealTimeChart = dynamic(
  () => import('react-ts-tradingview-widgets').then(mod => mod.AdvancedRealTimeChart),
  { 
    ssr: false,
    loading: () => <p className="flex h-full items-center justify-center">Loading Chart...</p>
  }
)

interface TradingTerminalModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export function TradingTerminalModal({ isOpen, onOpenChange }: TradingTerminalModalProps) {
  const { connected } = useWallet()
  const { setVisible } = useWalletModal()
  const [activePair, setActivePair] = useState(DEFAULT_PAIR)

  const pairInfo = TRADING_PAIRS[activePair as keyof typeof TRADING_PAIRS]

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="fixed inset-0 md:inset-4 bg-black border-2 animate-shimmer-border rounded-none md:rounded-lg flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>XAND Trading Terminal</DialogTitle>
          <DialogDescription>
            View live charts and trade XAND tokens. The chart is provided by TradingView and swap is powered by Jupiter.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 h-full">
          {/* Main Content: Chart */}
          <div className="lg:col-span-3 flex flex-col h-full">
            <div className="flex items-center p-2 border-b border-gray-800">
              {Object.values(TRADING_PAIRS).map((pair) => (
                <Button
                  key={pair.name}
                  variant="ghost"
                  size="sm"
                  onClick={() => setActivePair(pair.name)}
                  className={cn(
                    'text-sm',
                    activePair === pair.name ? 'bg-accent text-accent-foreground' : 'text-gray-400'
                  )}
                >
                  {pair.name}
                </Button>
              ))}
            </div>
            <div className="flex-1">
              <AdvancedRealTimeChart
                theme="dark"
                autosize
                symbol={pairInfo.symbol}
              />
            </div>
          </div>

          {/* Sidebar: Swap UI */}
          <div className="lg:col-span-1 border-l border-gray-800 flex flex-col">
            <div className="p-4 border-b border-gray-800">
              <h3 className="font-semibold text-lg">Trade</h3>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              {connected ? (
                <SwapUI />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <p className="text-center text-gray-400">Connect your wallet to start trading.</p>
                  <Button onClick={() => setVisible(true)}>Connect Wallet</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
