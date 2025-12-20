"use client"

import { useEffect, useState } from "react"
import { Bell, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { apiClient } from "@/lib/api"
import { toast } from "sonner"

interface NotificationSettings {
  enabled: boolean
  nodeOffline: boolean
  nodeOnline: boolean
  highRisk: boolean
  lowRewards: boolean
}

export function NotificationManager() {
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('notification-settings')
      return saved ? JSON.parse(saved) : {
        enabled: false,
        nodeOffline: true,
        nodeOnline: false,
        highRisk: true,
        lowRewards: false,
      }
    }
    return {
      enabled: false,
      nodeOffline: true,
      nodeOnline: false,
      highRisk: true,
      lowRewards: false,
    }
  })

  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('notification-settings', JSON.stringify(settings))
  }, [settings])

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission()
      setPermission(result)
      if (result === 'granted') {
        setSettings(prev => ({ ...prev, enabled: true }))
        toast.success('Notifications enabled!')
      }
    }
  }

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const sendTestNotification = () => {
    if (permission === 'granted' && settings.enabled) {
      new Notification('Xandeum Dashboard', {
        body: 'This is a test notification from your pNode dashboard.',
        icon: '/icon.svg',
        badge: '/icon.svg',
      })
      toast.success('Test notification sent!')
    } else {
      toast.error('Notifications not enabled')
    }
  }

  // Mock function to check for status changes (would be called by polling)
  const checkForAlerts = async () => {
    if (!settings.enabled || permission !== 'granted') return

    try {
      const result = await apiClient.getPNodes()
      if (result.error) return

      const nodes = result.data
      const alerts: string[] = []

      nodes.forEach((node: any) => {
        if (settings.nodeOffline && node.status === 'inactive') {
          alerts.push(`${node.name} went offline`)
        }
        if (settings.highRisk && node.riskScore > 70) {
          alerts.push(`${node.name} has high risk score (${node.riskScore}%)`)
        }
        if (settings.lowRewards && node.rewards < 100) {
          alerts.push(`${node.name} has low rewards (${node.rewards} POL)`)
        }
      })

      alerts.forEach(alert => {
        new Notification('Xandeum Alert', {
          body: alert,
          icon: '/icon.svg',
          badge: '/icon.svg',
        })
      })
    } catch (error) {
      console.error('Failed to check for alerts:', error)
    }
  }

  useEffect(() => {
    if (settings.enabled && permission === 'granted') {
      const interval = setInterval(checkForAlerts, 60000) // Check every minute
      return () => clearInterval(interval)
    }
  }, [settings, permission])

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notifications
        </CardTitle>
        <CardDescription>Manage browser notifications for pNode status changes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {permission === 'default' && (
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
            <p className="text-sm mb-2">Enable browser notifications to stay updated on pNode status changes.</p>
            <Button onClick={requestPermission} size="sm">
              Enable Notifications
            </Button>
          </div>
        )}

        {permission === 'denied' && (
          <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30">
            <p className="text-sm">Notifications are blocked. Please enable them in your browser settings.</p>
          </div>
        )}

        {permission === 'granted' && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Enable Notifications</p>
                <p className="text-sm text-muted-foreground">Receive alerts for pNode status changes</p>
              </div>
              <Switch
                checked={settings.enabled}
                onCheckedChange={(checked) => updateSetting('enabled', checked)}
              />
            </div>

            {settings.enabled && (
              <div className="space-y-3 pl-4 border-l-2 border-muted">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Node goes offline</span>
                  <Switch
                    checked={settings.nodeOffline}
                    onCheckedChange={(checked) => updateSetting('nodeOffline', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Node comes online</span>
                  <Switch
                    checked={settings.nodeOnline}
                    onCheckedChange={(checked) => updateSetting('nodeOnline', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">High risk alerts</span>
                  <Switch
                    checked={settings.highRisk}
                    onCheckedChange={(checked) => updateSetting('highRisk', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Low reward alerts</span>
                  <Switch
                    checked={settings.lowRewards}
                    onCheckedChange={(checked) => updateSetting('lowRewards', checked)}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={sendTestNotification} variant="outline" size="sm" disabled={!settings.enabled}>
                Test Notification
              </Button>
              <Badge variant="outline" className="ml-auto">
                {permission === 'granted' ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}