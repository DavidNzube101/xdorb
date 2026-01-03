"use client"

import React, { useState, useMemo, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Zap, Calculator, ChevronRight, ChevronLeft, Download, FileText, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"
import * as htmlToImage from 'html-to-image'
import jsPDF from 'jspdf'
import { motion, AnimatePresence } from "framer-motion"

interface STOINCCalculatorProps {
  isOpen: boolean
  onClose: () => void
}

const ERA_BOOSTS = [
  { label: "Standard (1x)", value: 1.0 },
  { label: "North Era (1.25x)", value: 1.25 },
  { label: "Central Era (2x)", value: 2.0 },
  { label: "Coal Era (3.5x)", value: 3.5 },
  { label: "Main Era (7x)", value: 7.0 },
  { label: "South Era (10x)", value: 10.0 },
  { label: "DeepSouth Era (16x)", value: 16.0 },
]

const NFT_BOOSTS = [
  { label: "None (1x)", value: 1.0 },
  { label: "Common (1.05x)", value: 1.05 },
  { label: "Rare (1.1x)", value: 1.1 },
  { label: "Epic (1.25x)", value: 1.25 },
  { label: "Legendary (1.5x)", value: 1.5 },
]

export function STOINCCalculator({ isOpen, onClose }: STOINCCalculatorProps) {
  const [step, setStep] = useState(1)
  const [pnodes, setPnodes] = useState(1)
  const [storageGb, setStorageGb] = useState(100)
  const [performance, setPerformance] = useState(0.9)
  const [xandStaked, setXandStaked] = useState(0)
  const [nftBoost, setNftBoost] = useState(1.0)
  const [eraBoost, setEraBoost] = useState(1.0)
  const [totalNetworkFees, setTotalNetworkFees] = useState(50000)
  const [networkCredits, setNetworkCredits] = useState(100000)
  
  const resultRef = useRef<HTMLDivElement>(null)

  const projection = useMemo(() => {
    const storageCredits = pnodes * storageGb * performance
    const totalGeoboost = nftBoost * eraBoost
    const boostedWeight = storageCredits * totalGeoboost
    const estStoincEpoch = (boostedWeight / Math.max(networkCredits, 1)) * totalNetworkFees * 0.94
    
    const monthlyFoundationReward = pnodes * 10000
    const monthlyStakeYield = (xandStaked * 0.05) / 12
    const totalEstMonthly = monthlyFoundationReward + monthlyStakeYield

    return {
      storageCredits,
      totalGeoboost,
      boostedWeight,
      estStoincEpoch,
      monthlyFoundationReward,
      monthlyStakeYield,
      totalEstMonthly
    }
  }, [pnodes, storageGb, performance, xandStaked, nftBoost, eraBoost, totalNetworkFees, networkCredits])

    const exportAsPDF = () => {

      if (!resultRef.current) return

      const doc = new jsPDF('p', 'mm', 'a4')

      const pageWidth = doc.internal.pageSize.getWidth()

      const pageHeight = doc.internal.pageSize.getHeight()

  

      // Add Logo placeholder/text

      doc.setFontSize(22)

      doc.setTextColor(59, 130, 246) // Primary color

      doc.setFont("helvetica", "bold")

      doc.text("XDOrb", 20, 25)

      

      doc.setFontSize(10)

      doc.setTextColor(100, 116, 139)

      doc.setFont("helvetica", "normal")

      doc.text("Xandeum Network Analytics", 20, 32)

  

      // Header Line

      doc.setDrawColor(226, 232, 240)

      doc.line(20, 40, pageWidth - 20, 40)

  

      // Title

      doc.setFontSize(18)

      doc.setTextColor(15, 23, 42)

      doc.text("STOINC Revenue Projection", 20, 55)

  

      // Content Grid

      doc.setFontSize(12)

      doc.setTextColor(71, 85, 105)

      

      const data = [

        ["Nodes Configured", `${pnodes}`],

        ["Storage Capacity", `${storageGb} GB`],

        ["Performance Efficiency", `${(performance * 100).toFixed(0)}%`],

        ["XAND Staked", `${xandStaked.toLocaleString()} XAND`],

        ["NFT Boost", `${nftBoost.toFixed(2)}x`],

        ["Era Boost", `${eraBoost.toFixed(2)}x`],

        ["Total Network Fees", `${totalNetworkFees.toLocaleString()} XAND`],

        ["Total Network Credits", `${networkCredits.toLocaleString()}`]

      ]

  

      let yPos = 70

      data.forEach(([label, value]) => {

        doc.setFont("helvetica", "bold")

        doc.text(label, 20, yPos)

        doc.setFont("helvetica", "normal")

        doc.text(value, 100, yPos)

        yPos += 10

      })

  

      // Results Box

      doc.setFillColor(248, 250, 252)

      doc.rect(20, yPos + 5, pageWidth - 40, 40, "F")

      doc.setDrawColor(59, 130, 246)

      doc.setLineWidth(0.5)

      doc.rect(20, yPos + 5, pageWidth - 40, 40, "S")

  

      doc.setFontSize(14)

      doc.setTextColor(59, 130, 246)

      doc.text("ESTIMATED STOINC PER EPOCH", 30, yPos + 20)

      doc.setFontSize(24)

      doc.text(`${projection.estStoincEpoch.toLocaleString(undefined, { maximumFractionDigits: 2 })} XAND`, 30, yPos + 35)

  

      // Footer

      doc.setFontSize(10)

      doc.setTextColor(148, 163, 184)

      doc.text("xdorb.vercel.app", pageWidth / 2, pageHeight - 15, { align: "center" })

      doc.text("© 2026 XDOrb • Proprietary Calculation Engine", pageWidth / 2, pageHeight - 10, { align: "center" })

  

      doc.save(`stoinc-projection-${new Date().getTime()}.pdf`)

    }

  

    const nextStep = () => setStep(s => Math.min(s + 1, 4))

    const prevStep = () => setStep(s => Math.max(s - 1, 1))

  

      return (

  

        <Dialog open={isOpen} onOpenChange={onClose}>

  

          <DialogContent className="max-w-2xl bg-background border-border rounded-none p-0 overflow-hidden">

  

            <div className="sr-only">

  

              <DialogTitle>STOINC Calculator</DialogTitle>

  

              <DialogDescription>

  

                Interactive carousel to calculate and project Xandeum STOINC earnings.

  

              </DialogDescription>

  

            </div>

  

            <div className="flex h-[500px]">

            {/* Left Sidebar Info */}

            <div className="hidden md:flex w-1/3 bg-muted/30 border-r border-border p-6 flex-col justify-between">

              <div>

                <div className="flex items-center gap-2 mb-6">

                  <div className="p-2 bg-primary/10 rounded-none">

                    <Calculator className="w-5 h-5 text-primary" />

                  </div>

                  <span className="font-bold tracking-tighter text-lg uppercase">STOINC</span>

                </div>

                <div className="space-y-4">

                  {[

                    { s: 1, t: "Node Configuration" },

                    { s: 2, t: "Boosts & Staking" },

                    { s: 3, t: "Network Params" },

                    { s: 4, t: "Final Projection" }

                  ].map((item) => (

                    <div key={item.s} className="flex items-center gap-3">

                      <div className={cn(

                        "w-6 h-6 flex items-center justify-center text-[10px] font-bold border",

                        step === item.s ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30 text-muted-foreground"

                      )}>

                        {item.s}

                      </div>

                      <span className={cn(

                        "text-xs font-bold uppercase tracking-wider",

                        step === item.s ? "text-foreground" : "text-muted-foreground"

                      )}>

                        {item.t}

                      </span>

                    </div>

                  ))}

                </div>

              </div>

              <div className="text-[10px] text-muted-foreground leading-relaxed italic">

                * Calculations are based on real-time network parameters and observed efficiency factors.

              </div>

            </div>

  

            {/* Main Carousel Area */}

            <div className="flex-1 flex flex-col">

              <div className="flex-1 p-8 overflow-y-auto">

                <AnimatePresence mode="wait">

                  {step === 1 && (

                    <motion.div 

                      key="step1"

                      initial={{ opacity: 0, x: 20 }}

                      animate={{ opacity: 1, x: 0 }}

                      exit={{ opacity: 0, x: -20 }}

                      className="space-y-6"

                    >

                      <div className="space-y-2">

                        <h3 className="text-xl font-bold uppercase">Basic Setup</h3>

                        <p className="text-sm text-muted-foreground">Configure your node fleet and storage capacity.</p>

                      </div>

                      <div className="space-y-4">

                        <div className="space-y-2">

                          <Label className="text-xs uppercase font-bold text-muted-foreground">Number of pNodes</Label>

                          <Input type="number" value={pnodes} onChange={(e) => setPnodes(Number(e.target.value))} className="rounded-none h-12 text-lg font-mono" />

                        </div>

                        <div className="space-y-2">

                          <Label className="text-xs uppercase font-bold text-muted-foreground">Storage (GB)</Label>

                          <Input type="number" value={storageGb} onChange={(e) => setStorageGb(Number(e.target.value))} className="rounded-none h-12 text-lg font-mono" />

                        </div>

                        <div className="space-y-2">

                          <Label className="text-xs uppercase font-bold text-muted-foreground">Performance Efficiency (0.0 - 1.0)</Label>

                          <Input type="number" step="0.1" value={performance} onChange={(e) => setPerformance(Number(e.target.value))} className="rounded-none h-12 text-lg font-mono" />

                        </div>

                      </div>

                    </motion.div>

                  )}

  

                  {step === 2 && (

                    <motion.div 

                      key="step2"

                      initial={{ opacity: 0, x: 20 }}

                      animate={{ opacity: 1, x: 0 }}

                      exit={{ opacity: 0, x: -20 }}

                      className="space-y-6"

                    >

                      <div className="space-y-2">

                        <h3 className="text-xl font-bold uppercase">Boosts & Staking</h3>

                        <p className="text-sm text-muted-foreground">Maximize your weight with XAND staking and NFT boosts.</p>

                      </div>

                      <div className="space-y-4">

                        <div className="space-y-2">

                          <Label className="text-xs uppercase font-bold text-primary">XAND Staked</Label>

                          <Input type="number" value={xandStaked} onChange={(e) => setXandStaked(Number(e.target.value))} className="rounded-none h-12 text-lg font-mono border-primary/30" />

                        </div>

                        <div className="space-y-2">

                          <Label className="text-xs uppercase font-bold text-muted-foreground">NFT Multiplier</Label>

                          <Select value={nftBoost.toString()} onValueChange={(v) => setNftBoost(Number(v))}>

                            <SelectTrigger className="rounded-none h-12 border-border"><SelectValue /></SelectTrigger>

                            <SelectContent className="rounded-none">

                              {NFT_BOOSTS.map(b => <SelectItem key={b.label} value={b.value.toString()}>{b.label}</SelectItem>)}

                            </SelectContent>

                          </Select>

                        </div>

                        <div className="space-y-2">

                          <Label className="text-xs uppercase font-bold text-muted-foreground">Era Boost</Label>

                          <Select value={eraBoost.toString()} onValueChange={(v) => setEraBoost(Number(v))}>

                            <SelectTrigger className="rounded-none h-12 border-border"><SelectValue /></SelectTrigger>

                            <SelectContent className="rounded-none">

                              {ERA_BOOSTS.map(b => <SelectItem key={b.label} value={b.value.toString()}>{b.label}</SelectItem>)}

                            </SelectContent>

                          </Select>

                        </div>

                      </div>

                    </motion.div>

                  )}

  

                  {step === 3 && (

                    <motion.div 

                      key="step3"

                      initial={{ opacity: 0, x: 20 }}

                      animate={{ opacity: 1, x: 0 }}

                      exit={{ opacity: 0, x: -20 }}

                      className="space-y-6"

                    >

                      <div className="space-y-2">

                        <h3 className="text-xl font-bold uppercase">Network Context</h3>

                        <p className="text-sm text-muted-foreground">Global parameters affecting distribution share.</p>

                      </div>

                      <div className="space-y-4">

                        <div className="space-y-2">

                          <Label className="text-xs uppercase font-bold text-muted-foreground">Total Network Fees (XAND)</Label>

                          <Input type="number" value={totalNetworkFees} onChange={(e) => setTotalNetworkFees(Number(e.target.value))} className="rounded-none h-12 text-lg font-mono" />

                        </div>

                        <div className="space-y-2">

                          <Label className="text-xs uppercase font-bold text-muted-foreground">Global Network Credits</Label>

                          <Input type="number" value={networkCredits} onChange={(e) => setNetworkCredits(Number(e.target.value))} className="rounded-none h-12 text-lg font-mono" />

                        </div>

                      </div>

                    </motion.div>

                  )}

  

                  {step === 4 && (

                    <motion.div 

                      key="step4"

                      initial={{ opacity: 0, scale: 0.95 }}

                      animate={{ opacity: 1, scale: 1 }}

                      className="space-y-6"

                    >

                      <div ref={resultRef} className="p-6 bg-primary/5 border border-primary/20 space-y-6 relative">

                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">

                          <Zap size={100} />

                        </div>

                        <div className="text-center">

                          <p className="text-[10px] font-bold uppercase text-primary tracking-widest mb-1">Estimated STOINC Income</p>

                          <h4 className="text-5xl font-black font-mono text-primary">

                            {projection.estStoincEpoch.toLocaleString(undefined, { maximumFractionDigits: 1 })}

                          </h4>

                          <p className="text-xs text-muted-foreground mt-1">XAND per Epoch</p>

                        </div>

  

                        <div className="grid grid-cols-2 gap-4">

                          <div className="p-3 border border-border bg-background/50">

                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Boosted Weight</p>

                            <p className="text-lg font-bold font-mono">{projection.boostedWeight.toLocaleString()}</p>

                          </div>

                          <div className="p-3 border border-border bg-background/50">

                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Monthly Total</p>

                            <p className="text-lg font-bold font-mono">{projection.totalEstMonthly.toLocaleString()} XAND</p>

                          </div>

                        </div>

                      </div>

  

                                          <div className="flex gap-2">

  

                                            <Button onClick={exportAsPDF} variant="outline" className="w-full rounded-none gap-2">

  

                                              <FileText className="w-4 h-4" /> Export as PDF

  

                                            </Button>

  

                                          </div>

                    </motion.div>

                  )}

                </AnimatePresence>

              </div>

  

              <div className="p-6 border-t border-border flex justify-between bg-muted/10">

                <Button 

                  variant="ghost" 

                  onClick={prevStep} 

                  disabled={step === 1}

                  className="rounded-none gap-2 uppercase font-bold text-xs"

                >

                  <ChevronLeft className="w-4 h-4" /> Back

                </Button>

                {step < 4 ? (

                  <Button 

                    onClick={nextStep}

                    className="rounded-none gap-2 uppercase font-bold text-xs px-8"

                  >

                    Continue <ChevronRight className="w-4 h-4" />

                  </Button>

                ) : (

                  <Button 

                    onClick={onClose}

                    className="rounded-none uppercase font-bold text-xs px-8"

                  >

                    Close

                  </Button>

                )}

              </div>

            </div>

          </div>

        </DialogContent>

      </Dialog>

    )

  }

  