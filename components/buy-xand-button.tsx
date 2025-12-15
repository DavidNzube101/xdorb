"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { Wallet } from 'lucide-react'
import { shortenAddress } from '@/lib/utils'
import { SwapUI } from '@/components/ui/swap-ui'
import { TradingTerminalModal } from './trading-terminal-modal'

export function BuyXandButton() {
  const { connected, publicKey, disconnect } = useWallet()
  const { setVisible, visible } = useWalletModal()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTerminalOpen, setIsTerminalOpen] = useState(false)
  const [walletSource, setWalletSource] = useState<'buy-xand' | 'terminal' | null>(null)

  const prevVisible = useRef(visible)

  useEffect(() => {
    // When wallet modal closes, re-open the modal that triggered it
    if (prevVisible.current && !visible && walletSource) {
      if (walletSource === 'buy-xand') {
        setIsModalOpen(true)
      } else if (walletSource === 'terminal') {
        setIsTerminalOpen(true)
      }
      setWalletSource(null)
    }
    prevVisible.current = visible
  }, [visible, walletSource])

  const handleConnectClick = () => {
    setIsModalOpen(false)
    setWalletSource('buy-xand')
    setVisible(true)
  }

  const handleTerminalConnectClick = () => {
    setIsTerminalOpen(false)
    setWalletSource('terminal')
    setVisible(true)
  }

  const handleTerminalChange = (open: boolean) => {
    if (!open) {
      // Using a timeout to allow the modal to close gracefully before reload
      setTimeout(() => window.location.reload(), 300);
    }
    setIsTerminalOpen(open);
  }

  return (
    <>
      <Button
        className="bg-accent text-accent-foreground hover:bg-accent/90"
        onClick={() => setIsModalOpen(true)}
      >
        Buy XAND
      </Button>

      <TradingTerminalModal
        isOpen={isTerminalOpen}
        onOpenChange={handleTerminalChange}
        onConnectClick={handleTerminalConnectClick}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className={`sm:max-w-[425px] transition-all duration-500 bg-black ${connected ? 'animate-shimmer-border border-2' : ''}`}>
          <DialogHeader>
            <DialogTitle>Buy XAND</DialogTitle>
            <DialogDescription>Buy XAND directly in XDOrb. Powered by Jupiter</DialogDescription>
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
                <Button onClick={handleConnectClick} size="sm">Connect Wallet</Button>
              )}
            </div>

            {connected ? (
              <>
                <SwapUI />
                <Button variant="outline" className="mt-4 hidden md:flex" onClick={() => {
                  setIsModalOpen(false)
                  setIsTerminalOpen(true)
                }}>
                  View Charts
                </Button>
              </>
            ) : (
               <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  
                  <Button variant="outline" className="mt-4 hidden md:flex" onClick={() => {
                    setIsModalOpen(false)
                    setIsTerminalOpen(true)
                  }}>
                    View Charts
                  </Button>
                </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
