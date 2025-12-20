"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DashboardLayout } from "@/components/dashboard-layout"
import {
  Activity,
  BarChart3,
  Globe,
  Brain,
  Bell,
  Share2,
  Palette,
  Zap,
  Shield,
  Trophy,
  Database,
  Users,
  AlertTriangle,
  Settings,
  ExternalLink,
  Code,
  Eye,
  MousePointer,
  Smartphone
} from "lucide-react"

export default function FeaturesPage() {
  const features = [
    {
      category: "Core Dashboard",
      icon: Activity,
      items: [
        {
          title: "Real-Time Network Stats",
          description: "Live monitoring of total nodes, active/inactive counts, network health percentage, and total rewards earned.",
          icon: Activity,
          details: ["30-second auto-refresh", "KPI cards with trend indicators", "Color-coded status badges"]
        },
        {
          title: "Interactive Charts",
          description: "Comprehensive data visualization with line charts, bar charts, and area charts for network health trends.",
          icon: BarChart3,
          details: ["Recharts integration", "Responsive design", "Custom tooltips and legends"]
        },
        {
          title: "Customizable Widgets",
          description: "Drag-and-drop dashboard widgets that users can reorder and toggle visibility with persistent settings.",
          icon: Settings,
          details: ["LocalStorage persistence", "Drag & drop interface", "Show/hide controls"]
        }
      ]
    },
    {
      category: "pNode Management",
      icon: Database,
      items: [
        {
          title: "Advanced Directory",
          description: "Paginated table with comprehensive pNode information including search, status filters, and region filtering.",
          icon: Database,
          details: ["10 items per page", "Multi-column sorting", "Export to CSV/PDF"]
        },
        {
          title: "Detailed Analytics Pages",
          description: "Individual pNode pages with historical data, uptime charts, storage trends, and reward history.",
          icon: BarChart3,
          details: ["24h/7d/30d time ranges", "Multiple chart types", "Performance metrics"]
        },
        {
          title: "Peer Network View",
          description: "Visualize connected peers with latency information and connection status.",
          icon: Users,
          details: ["Real-time peer data", "Latency monitoring", "Connection health"]
        },
        {
          title: "Alert System",
          description: "Comprehensive alerting for downtime, performance issues, and system notifications.",
          icon: AlertTriangle,
          details: ["Severity levels", "Timestamp tracking", "Categorized alerts"]
        }
      ]
    },
    {
      category: "Advanced Analytics",
      icon: Brain,
      items: [
        {
          title: "AI-Powered Insights",
          description: "Google Gemini AI analysis providing risk scores, performance predictions, and actionable recommendations.",
          icon: Brain,
          details: ["Risk assessment", "Natural language summaries", "Predictive analytics"]
        },
        {
          title: "3D Data Visualization",
          description: "Interactive Three.js 3D bar charts for storage usage visualization with orbital controls.",
          icon: Eye,
          details: ["3D rendering", "Mouse controls", "Data layer exploration"]
        },
        {
          title: "Gamification System",
          description: "Leaderboards, performance badges, and weekly/monthly challenges with progress tracking.",
          icon: Trophy,
          details: ["Achievement badges", "Progress bars", "Reward challenges"]
        },
        {
          title: "Global Heatmap",
          description: "Interactive world map showing pNode density with color-coded performance clusters.",
          icon: Globe,
          details: ["Leaflet integration", "Geographic clustering", "Hover tooltips"]
        }
      ]
    },
    {
      category: "Social & Sharing",
      icon: Share2,
      items: [
        {
          title: "Bookmark System",
          description: "Save favorite pNodes locally with persistent bookmark management.",
          icon: Settings,
          details: ["LocalStorage", "Quick access", "Bookmark counter"]
        },
        {
          title: "Native Sharing",
          description: "Web Share API integration for easy sharing of pNode details and links.",
          icon: Share2,
          details: ["Mobile optimized", "Fallback clipboard", "Social platforms"]
        },
        {
          title: "Embeddable Widgets",
          description: "Three iframe widgets for external websites: Network Status, Top Nodes, and Reward Charts.",
          icon: Code,
          details: ["Copy embed code", "Live data", "Responsive design"]
        }
      ]
    },
    {
      category: "User Experience",
      icon: Palette,
      items: [
        {
          title: "Browser Notifications",
          description: "Push notifications for pNode status changes with customizable alert preferences.",
          icon: Bell,
          details: ["Permission management", "Alert types", "Test notifications"]
        },
        {
          title: "Dark/Light Themes",
          description: "Automatic theme switching with custom XDOrb colors (#f9961e, #116b61) and system preference detection.",
          icon: Palette,
          details: ["System detection", "Manual toggle", "Persistent settings"]
        },
        {
          title: "Accessibility Features",
          description: "Full ARIA support, keyboard navigation, and screen reader compatibility.",
          icon: Shield,
          details: ["WCAG compliance", "Keyboard shortcuts", "Screen reader labels"]
        },
        {
          title: "Responsive Design",
          description: "Mobile-first design that works seamlessly across all device sizes.",
          icon: Smartphone,
          details: ["Breakpoint optimization", "Touch interactions", "Mobile navigation"]
        }
      ]
    }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <img
            src="/Logo.png"
            alt="XDOrb Logo"
            className="h-20 w-auto mx-auto mb-6"
          />
          <h1 className="text-4xl font-bold text-foreground">XDOrb Features</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive analytics platform for Xandeum pNodes with real-time monitoring,
            AI insights, and advanced visualization tools.
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <Badge variant="secondary" className="px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />
              Real-Time Data
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              <Brain className="w-4 h-4 mr-2" />
              AI-Powered
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              <Globe className="w-4 h-4 mr-2" />
              Global Scale
            </Badge>
          </div>
        </div>

        {features.map((category, categoryIndex) => (
          <div key={category.category} className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <category.icon className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">{category.category}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {category.items.map((feature, featureIndex) => (
                <Card key={feature.title} className="border-border bg-card hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-secondary/10 rounded-lg">
                        <feature.icon className="w-5 h-5 text-secondary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {feature.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {feature.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold text-foreground">Ready to Explore?</h3>
              <p className="text-muted-foreground">
                Experience XDOrb's full capabilities with live data and interactive features.
              </p>
              <div className="flex justify-center gap-4">
                <a
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <MousePointer className="w-4 h-4" />
                  View Dashboard
                </a>
                <a
                  href="https://xdorb.appwrite.network"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Live Demo
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}