"use client"

import { useEffect, useState } from "react"
import useSWR from "swr"

interface PriceData {
  xand: {
    usdc: number
    usdt: number
    sol: number
    eurc: number
    eth: number
    btc: number
  }
}

const fetcher = async (): Promise<PriceData> => {
  const response = await fetch('/api/prices')
  if (!response.ok) {
    throw new Error('Failed to fetch prices from backend')
  }
  const backendResponse = await response.json()
  if (backendResponse.error) {
      throw new Error(backendResponse.error)
  }
  return backendResponse.data as PriceData
}

const ICONS: Record<string, string> = {
  USDC: "/token_icons/icons8-usdc-64.png",
  USDT: "/token_icons/icons8-tether-48.png",
  SOL: "/token_icons/icons8-solana-64.png",
  EURC: "/token_icons/icons8-euro-96.png",
  ETH: "/token_icons/icons8-ethereum-64.png",
  BTC: "/token_icons/icons8-bitcoin-48.png",
}

export function PriceMarquee() {
  const { data, error } = useSWR<PriceData>('/api/prices', fetcher, {
    refreshInterval: 180000, // 3 minutes
    revalidateOnFocus: false,
  })

  const formatPrice = (price: number | undefined) => {
    if (price === undefined) return 'N/A';
    if (price === 0) return '0';
    
    // Dynamic precision based on magnitude
    if (price < 0.000001) {
      return price.toFixed(10).replace(/\.?0+$/, '');
    }
    if (price < 0.01) {
      return price.toFixed(6).replace(/\.?0+$/, '');
    }
    return price.toFixed(2);
  }

  const renderContent = () => {
    if (error) return <span className="mx-4">Price data unavailable</span>
    if (!data?.xand) return <span className="mx-4">Loading prices...</span>

    const prices = data.xand
    const items = [
      { key: 'USDC', val: prices.usdc },
      { key: 'USDT', val: prices.usdt },
      { key: 'SOL', val: prices.sol },
      { key: 'EURC', val: prices.eurc },
      { key: 'ETH', val: prices.eth },
      { key: 'BTC', val: prices.btc },
    ]

    return items.map((item, i) => (
      <span key={i} className="inline-flex items-center mx-3">
        <span>1 XAND → {formatPrice(item.val)}</span>
        {ICONS[item.key] && (
          <img 
            src={ICONS[item.key]} 
            alt={item.key} 
            className="w-6 h-6 mx-1 translate-y-[-1px]" 
          />
        )}
        <span>{item.key}</span>
        {i < items.length - 1 && <span className="ml-6 text-muted-foreground/40">•</span>}
      </span>
    ))
  }

  return (
    <div className="w-full h-full flex items-center overflow-hidden whitespace-nowrap">
      <div className="inline-flex items-center animate-marquee text-sm font-mono font-medium pr-6">
        <div className="flex items-center shrink-0">
          {renderContent()}
          {/* Separator between the two duplicated sets */}
          {data?.xand && <span className="mx-6 text-muted-foreground/40">•</span>}
        </div>
        <div className="flex items-center shrink-0">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}
