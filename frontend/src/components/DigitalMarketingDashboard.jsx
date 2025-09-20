import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from '../hooks/use-toast';
import {
  TrendingUp,
  TrendingDown,
  Users,
  MousePointer,
  Eye,
  Share2,
  Target,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Settings,
  Plus,
  PlayCircle,
  PauseCircle,
  Edit,
  Trash2,
  ExternalLink,
  RefreshCw,
  Download,
  Upload,
  MessageSquare,
  Heart,
  Globe,
  Search,
  Filter,
  Star
} from 'lucide-react';

const DigitalMarketingDashboard = ({ isVisible }) => {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [socialMetrics, setSocialMetrics] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    platform: '',
    budget: '',
    duration: '',
    objective: '',
    target_audience: '',
    ad_creative: '',
    landing_page: ''
  });

  // Mock data - In real implementation, fetch from backend
  useEffect(() => {
    if (isVisible) {
      loadDashboardData();
    }
  }, [isVisible, selectedTimeframe]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Simulate API calls (faster for demo)
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Mock campaign data
      setCampaigns([
        {
          id: '1',
          name: 'Spring Garden Launch',
          platform: 'Google Ads',
          status: 'active',
          budget: 25000,
          spent: 18500,
          impressions: 125000,
          clicks: 3250,
          conversions: 89,
          ctr: 2.6,
          cpc: 5.69,
          conversion_rate: 2.74,
          roas: 4.2,
          start_date: '2024-03-01',
          end_date: '2024-03-31'
        },
        {
          id: '2',
          name: 'Terrace Garden Promotion',
          platform: 'Facebook',
          status: 'active',
          budget: 15000,
          spent: 12800,
          impressions: 89000,
          clicks: 2100,
          conversions: 45,
          ctr: 2.36,
          cpc: 6.10,
          conversion_rate: 2.14,
          roas: 3.8,
          start_date: '2024-03-10',
          end_date: '2024-04-10'
        },
        {
          id: '3',
          name: 'Indoor Plants Collection',
          platform: 'Instagram',
          status: 'paused',
          budget: 10000,
          spent: 8200,
          impressions: 65000,
          clicks: 1850,
          conversions: 32,
          ctr: 2.85,
          cpc: 4.43,
          conversion_rate: 1.73,
          roas: 3.2,
          start_date: '2024-02-15',
          end_date: '2024-03-15'
        }
      ]);

      // Mock analytics data
      setAnalytics({
        total_spend: 39500,
        total_impressions: 279000,
        total_clicks: 7200,
        total_conversions: 166,
        average_ctr: 2.58,
        average_cpc: 5.49,
        average_conversion_rate: 2.31,
        average_roas: 3.73,
        leads_generated: 166,
        cost_per_lead: 238.0,
        revenue_generated: 147000,
        roi: 272.0
      });

      // Mock social media metrics
      setSocialMetrics({
        facebook: {
          followers: 15200,
          growth: 8.5,
          engagement_rate: 4.2,
          reach: 45000,
          posts_this_month: 24
        },
        instagram: {
          followers: 22800,
          growth: 12.3,
          engagement_rate: 6.8,
          reach: 68000,
          posts_this_month: 32
        },
        linkedin: {
          followers: 5400,
          growth: 15.7,
          engagement_rate: 3.9,
          reach: 18000,
          posts_this_month: 16
        },
        youtube: {
          subscribers: 3200,
          growth: 25.4,
          watch_time: 1250,
          views: 8500,
          videos_this_month: 8
        }
      });

    } catch (error) {
      toast({
        title: "Error Loading Data",
        description: "Failed to load marketing dashboard data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async (e) => {
    e.preventDefault();
    try {
      // Simulate campaign creation
      const campaign = {
        id: Date.now().toString(),
        ...newCampaign,
        status: 'draft',
        budget: parseFloat(newCampaign.budget),
        spent: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        ctr: 0,
        cpc: 0,
        conversion_rate: 0,
        roas: 0,
        start_date: new Date().toISOString().split('T')[0]
      };

      setCampaigns(prev => [...prev, campaign]);
      setNewCampaign({
        name: '',
        platform: '',
        budget: '',
        duration: '',
        objective: '',
        target_audience: '',
        ad_creative: '',
        landing_page: ''
      });

      toast({
        title: "Campaign Created",
        description: `Campaign "${campaign.name}" has been created successfully.`,
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create campaign.",
        variant: "destructive",
      });
    }
  };

  const toggleCampaignStatus = (campaignId) => {
    setCampaigns(prev => prev.map(campaign => {
      if (campaign.id === campaignId) {
        const newStatus = campaign.status === 'active' ? 'paused' : 'active';
        toast({
          title: "Campaign Updated",
          description: `Campaign ${newStatus === 'active' ? 'activated' : 'paused'}.`,
        });
        return { ...campaign, status: newStatus };
      }
      return campaign;
    }));
  };

  const getCampaignStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) return '0';
    const numValue = Number(num);
    if (numValue >= 1000000) return (numValue / 1000000).toFixed(1) + 'M';
    if (numValue >= 1000) return (numValue / 1000).toFixed(1) + 'K';
    return numValue.toString();
  };

  if (!isVisible) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="h-8 w-8 mr-3 text-blue-600" />
            Digital Marketing Manager
          </h2>
          <p className="text-gray-600">Campaign management, analytics, and social media insights</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            onClick={loadDashboardData}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Campaign</DialogTitle>
                <DialogDescription>Set up a new digital marketing campaign</DialogDescription>
              </DialogHeader>
              <form onSubmit={createCampaign} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="campaign-name">Campaign Name *</Label>
                    <Input
                      id="campaign-name"
                      value={newCampaign.name}
                      onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="platform">Platform *</Label>
                    <Select value={newCampaign.platform} onValueChange={(value) => setNewCampaign({...newCampaign, platform: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Google Ads">Google Ads</SelectItem>
                        <SelectItem value="Facebook">Facebook Ads</SelectItem>
                        <SelectItem value="Instagram">Instagram Ads</SelectItem>
                        <SelectItem value="LinkedIn">LinkedIn Ads</SelectItem>
                        <SelectItem value="YouTube">YouTube Ads</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budget">Budget (₹) *</Label>
                    <Input
                      id="budget"
                      type="number"
                      value={newCampaign.budget}
                      onChange={(e) => setNewCampaign({...newCampaign, budget: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (days)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={newCampaign.duration}
                      onChange={(e) => setNewCampaign({...newCampaign, duration: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="objective">Campaign Objective</Label>
                  <Select value={newCampaign.objective} onValueChange={(value) => setNewCampaign({...newCampaign, objective: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brand_awareness">Brand Awareness</SelectItem>
                      <SelectItem value="lead_generation">Lead Generation</SelectItem>
                      <SelectItem value="conversions">Conversions</SelectItem>
                      <SelectItem value="traffic">Website Traffic</SelectItem>
                      <SelectItem value="engagement">Engagement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="target-audience">Target Audience</Label>
                  <Input
                    id="target-audience"
                    value={newCampaign.target_audience}
                    onChange={(e) => setNewCampaign({...newCampaign, target_audience: e.target.value})}
                    placeholder="e.g., Homeowners aged 25-45 in urban areas"
                  />
                </div>
                
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  Create Campaign
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Spend</p>
                    <p className="text-2xl font-bold text-blue-900">{formatCurrency(analytics.total_spend || 0)}</p>
                    <p className="text-xs text-blue-700">This period</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Leads Generated</p>
                    <p className="text-2xl font-bold text-green-900">{analytics.leads_generated || 0}</p>
                    <p className="text-xs text-green-700">Cost per lead: {formatCurrency(analytics.cost_per_lead || 0)}</p>
                  </div>
                  <Users className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">ROAS</p>
                    <p className="text-2xl font-bold text-purple-900">{analytics.average_roas || 0}x</p>
                    <p className="text-xs text-purple-700">Return on Ad Spend</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Impressions</p>
                    <p className="text-2xl font-bold text-orange-900">{formatNumber(analytics.total_impressions || 0)}</p>
                    <p className="text-xs text-orange-700">CTR: {analytics.average_ctr || 0}%</p>
                  </div>
                  <Eye className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
                <CardDescription>Active campaigns overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns.filter(c => c.status === 'active').map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{campaign.name}</p>
                        <p className="text-sm text-gray-600">{campaign.platform}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(campaign.spent)}</p>
                        <p className="text-sm text-gray-600">{campaign.conversions} conversions</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Social Media Growth</CardTitle>
                <CardDescription>Follower growth across platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(socialMetrics || {}).map(([platform, metrics]) => (
                    <div key={platform} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium capitalize">{platform}</p>
                        <p className="text-sm text-gray-600">{formatNumber(metrics?.followers || 0)} followers</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center">
                          <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                          <span className="text-green-600 font-medium">+{metrics?.growth || 0}%</span>
                        </div>
                        <p className="text-sm text-gray-600">{metrics.engagement_rate}% engagement</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <div className="grid gap-6">
            {(campaigns || []).map((campaign) => (
              <Card key={campaign.id} className="bg-white shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        {campaign.name}
                        <Badge className={`ml-2 ${getCampaignStatusColor(campaign.status)}`}>
                          {campaign.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{campaign.platform} • Budget: {formatCurrency(campaign.budget)}</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleCampaignStatus(campaign.id)}
                      >
                        {campaign.status === 'active' ? 
                          <><PauseCircle className="h-4 w-4 mr-1" /> Pause</> :
                          <><PlayCircle className="h-4 w-4 mr-1" /> Activate</>
                        }
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Budget Progress */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Budget Used</span>
                        <span>{formatCurrency(campaign.spent)} / {formatCurrency(campaign.budget)}</span>
                      </div>
                      <Progress value={(campaign.spent / campaign.budget) * 100} className="h-2" />
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{formatNumber(campaign.impressions)}</p>
                        <p className="text-sm text-gray-600">Impressions</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{formatNumber(campaign.clicks)}</p>
                        <p className="text-sm text-gray-600">Clicks</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{campaign.conversions}</p>
                        <p className="text-sm text-gray-600">Conversions</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{campaign.roas}x</p>
                        <p className="text-sm text-gray-600">ROAS</p>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-gray-600">CTR</p>
                        <p className="font-medium">{campaign.ctr}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">CPC</p>
                        <p className="font-medium">{formatCurrency(campaign.cpc)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Conv. Rate</p>
                        <p className="font-medium">{campaign.conversion_rate}%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Social Media Tab */}
        <TabsContent value="social" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(socialMetrics || {}).map(([platform, metrics]) => (
              <Card key={platform} className="bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="capitalize flex items-center">
                    <Globe className="h-5 w-5 mr-2 text-blue-600" />
                    {platform}
                  </CardTitle>
                  <CardDescription>Social media performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics.followers)}</p>
                        <p className="text-sm text-gray-600">Followers</p>
                        <div className="flex items-center mt-1">
                          <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                          <span className="text-green-600 text-sm">+{metrics.growth}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics.reach)}</p>
                        <p className="text-sm text-gray-600">Monthly Reach</p>
                        <p className="text-sm text-blue-600 mt-1">{metrics?.engagement_rate || 0}% engagement</p>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Posts This Month</span>
                        <span className="font-medium">{metrics.posts_this_month}</span>
                      </div>
                      {platform === 'youtube' && (
                        <>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-sm text-gray-600">Watch Time (hrs)</span>
                            <span className="font-medium">{metrics.watch_time}</span>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-sm text-gray-600">Total Views</span>
                            <span className="font-medium">{formatNumber(metrics.views)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Campaign performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center text-gray-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                    <p>Chart visualization would go here</p>
                    <p className="text-sm">Integration with charting library needed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Keywords</CardTitle>
                <CardDescription>Best converting search terms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { keyword: 'terrace garden design', conversions: 23, cpc: 4.50 },
                    { keyword: 'balcony plants', conversions: 18, cpc: 3.80 },
                    { keyword: 'indoor gardening', conversions: 15, cpc: 5.20 },
                    { keyword: 'rooftop garden', conversions: 12, cpc: 6.10 },
                    { keyword: 'vertical garden', conversions: 9, cpc: 7.30 }
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-sm">{item.keyword}</p>
                        <p className="text-xs text-gray-600">{item.conversions} conversions</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatCurrency(item.cpc)}</p>
                        <p className="text-xs text-gray-600">CPC</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ROI Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Revenue Generated</span>
                    <span className="font-medium">{formatCurrency(analytics.revenue_generated)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Investment</span>
                    <span className="font-medium">{formatCurrency(analytics.total_spend)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-gray-900 font-medium">ROI</span>
                    <span className="font-bold text-green-600">{analytics.roi}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Conversion Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Impressions</span>
                    <span className="font-medium">{formatNumber(analytics.total_impressions)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Clicks</span>
                    <span className="font-medium">{formatNumber(analytics.total_clicks)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Leads</span>
                    <span className="font-medium">{analytics.leads_generated}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-gray-900 font-medium">Conversion Rate</span>
                    <span className="font-bold text-blue-600">{analytics.average_conversion_rate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cost Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg. CPC</span>
                    <span className="font-medium">{formatCurrency(analytics.average_cpc)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cost per Lead</span>
                    <span className="font-medium">{formatCurrency(analytics.cost_per_lead)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg. CTR</span>
                    <span className="font-medium">{analytics.average_ctr}%</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-gray-900 font-medium">Quality Score</span>
                    <span className="font-bold text-purple-600">8.2/10</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DigitalMarketingDashboard;