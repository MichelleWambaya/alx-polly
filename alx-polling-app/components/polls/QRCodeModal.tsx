'use client'

import React, { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Copy, Download, Share2, QrCode } from "lucide-react"
import { toast } from "sonner"

interface QRCodeModalProps {
  pollId: string | number
  pollTitle: string
  trigger?: React.ReactNode
  className?: string
}

export function QRCodeModal({ pollId, pollTitle, trigger, className }: QRCodeModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pollUrl = `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/polls/${pollId}`
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(pollUrl)
      toast.success('Poll link copied to clipboard!')
    } catch (err) {
      toast.error('Failed to copy link')
    }
  }

  const handleDownloadQR = () => {
    const svg = document.getElementById('qr-code-svg')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      
      const pngFile = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.download = `poll-${pollId}-qr-code.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
    toast.success('QR code downloaded!')
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: pollTitle,
          text: `Check out this poll: ${pollTitle}`,
          url: pollUrl,
        })
      } catch (err) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed')
      }
    } else {
      // Fallback to copy link
      handleCopyLink()
    }
  }

  const defaultTrigger = (
    <Button variant="outline" size="sm" className={className}>
      <QrCode className="h-4 w-4 mr-2" />
      Share QR Code
    </Button>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Poll</DialogTitle>
          <DialogDescription>
            Share "{pollTitle}" with others using the QR code or link below.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* QR Code */}
          <div className="flex justify-center p-4 bg-white rounded-lg border">
            <QRCodeSVG
              id="qr-code-svg"
              value={pollUrl}
              size={200}
              level="M"
              includeMargin={true}
            />
          </div>

          {/* Poll URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Poll Link</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={pollUrl}
                readOnly
                className="flex-1 px-3 py-2 text-sm border rounded-md bg-muted"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handleDownloadQR}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Download QR
            </Button>
            <Button
              onClick={handleShare}
              className="flex-1"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Simple QR Code Component for inline display
interface QRCodeDisplayProps {
  pollId: string | number
  size?: number
  className?: string
}

export function QRCodeDisplay({ pollId, size = 150, className }: QRCodeDisplayProps) {
  const pollUrl = `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/polls/${pollId}`
  
  return (
    <div className={`flex justify-center p-4 bg-white rounded-lg border ${className}`}>
      <QRCodeSVG
        value={pollUrl}
        size={size}
        level="M"
        includeMargin={true}
      />
    </div>
  )
}

// QR Code Card Component for poll pages
interface QRCodeCardProps {
  pollId: string | number
  pollTitle: string
  className?: string
}

export function QRCodeCard({ pollId, pollTitle, className }: QRCodeCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Share Poll
        </CardTitle>
        <CardDescription>
          Scan the QR code to quickly access this poll
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <QRCodeDisplay pollId={pollId} />
        <QRCodeModal pollId={pollId} pollTitle={pollTitle} />
      </CardContent>
    </Card>
  )
}
