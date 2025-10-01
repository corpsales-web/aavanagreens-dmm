import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { 
  Megaphone, TrendingUp, Eye, Users, Share2, Heart, MessageCircle,
  Facebook, Instagram, Twitter, Linkedin, Youtube, Mail, Smartphone,
  BarChart3, Target, Calendar, Clock, Zap, Star, Award, Plus, Edit,
  Play, Pause, RefreshCw, Download, Upload, Image, FileText
} from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const DigitalMarketingManager = ({ isOpen, onClose }) => {
  // State Management
  const [activeTab, setActiveTab] = useState('campaigns');
  const [campaigns, setCampaigns] = useState([]);
  const [socialPosts, setSocialPosts] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [contentLibrary, setContentLibrary] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal States
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Form States
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    type: 'social_media',
    objective: 'brand_awareness',
    target_audience: '',
    budget: '',
    start_date: '',
    end_date: '',
    platforms: [],
    content: '',
    status: 'draft'
  });

  const [contentForm, setContentForm] = useState({
    title: '',
    type: 'image',
    content: '',
    platforms: [],
    schedule_date: '',
    schedule_time: '',
    hashtags: '',
    target_audience: ''
  });

  // Initialize data
  useEffect(() => {
    if (isOpen) {
      initializeMarketingData();
    }
  }, [isOpen]);

  const initializeMarketingData = async () => {
    setLoading(true);
    try {
      // Initialize campaigns
      setCampaigns([
        {
          id: '1',
          name: 'Green Building Awareness Campaign',
          type: 'social_media',
          objective: 'brand_awareness',
          status: 'active',
          budget: 50000,
          spent: 32000,
          start_date: '2024-01-01',
          end_date: '2024-03-31',
          platforms: ['facebook', 'instagram', 'linkedin'],
          metrics: {
            impressions: 145000,
            clicks: 3200,
            ctr: 2.2,
            conversions: 45,
            cost_per_conversion: 711
          },
          content_items: 12,
          active_posts: 8
        },
        {
          id: '2',
          name: 'Balcony Garden Solutions',
          type: 'paid_ads',
          objective: 'lead_generation',
          status: 'active',
          budget: 75000,
          spent: 68000,
          start_date: '2024-01-15',
          end_date: '2024-04-15',
          platforms: ['google_ads', 'facebook', 'instagram'],
          metrics: {
            impressions: 89000,
            clicks: 4100,
            ctr: 4.6,
            conversions: 78,
            cost_per_conversion: 872
          },
          content_items: 18,
          active_posts: 15
        },
        {
          id: '3',
          name: 'Corporate Landscaping Services',
          type: 'email_marketing',
          objective: 'customer_retention',
          status: 'completed',
          budget: 25000,
          spent: 24500,
          start_date: '2023-12-01',
          end_date: '2024-01-31',
          platforms: ['email'],
          metrics: {
            impressions: 12000,
            clicks: 1800,
            ctr: 15.0,
            conversions: 22,
            cost_per_conversion: 1114
          },
          content_items: 6,
          active_posts: 0
        }
      ]);

      // Initialize social posts
      setSocialPosts([
        {
          id: '1',
          title: 'Transform Your Balcony into Green Paradise',
          type: 'image',
          platform: 'instagram',
          status: 'published',
          scheduled_date: '2024-01-20T10:00:00Z',
          published_date: '2024-01-20T10:00:00Z',
          content: 'Create a stunning green oasis in your urban space with our expert balcony garden solutions! 🌱✨ #BalconyGarden #UrbanGardening #GreenLiving',
          hashtags: ['#BalconyGarden', '#UrbanGardening', '#GreenLiving', '#AavanaGreens'],
          metrics: {
            likes: 234,
            comments: 18,
            shares: 12,
            reach: 4500,
            engagement_rate: 5.9
          },
          media_url: '/images/balcony-garden-1.jpg'
        },
        {
          id: '2',
          title: 'Sustainable Corporate Office Design',
          type: 'video',
          platform: 'linkedin',
          status: 'published',
          scheduled_date: '2024-01-22T14:00:00Z',
          published_date: '2024-01-22T14:00:00Z',
          content: 'Discover how green building solutions can transform your corporate workspace while reducing environmental impact. Our latest project showcases innovation in sustainable design. #GreenBuilding #CorporateDesign #Sustainability',
          hashtags: ['#GreenBuilding', '#CorporateDesign', '#Sustainability', '#EcoFriendly'],
          metrics: {
            likes: 156,
            comments: 24,
            shares: 31,
            reach: 8200,
            engagement_rate: 2.6
          },
          media_url: '/videos/corporate-office-design.mp4'
        },
        {
          id: '3',
          title: 'Weekend Garden Maintenance Tips',
          type: 'carousel',
          platform: 'facebook',
          status: 'scheduled',
          scheduled_date: '2024-01-25T16:00:00Z',
          content: 'Keep your green spaces thriving with these essential weekend maintenance tips! Swipe to learn more about proper plant care, watering schedules, and seasonal preparations. 🌿 #GardenMaintenance #PlantCare #WeekendGardening',
          hashtags: ['#GardenMaintenance', '#PlantCare', '#WeekendGardening', '#GreenSpaces'],
          metrics: {
            likes: 0,
            comments: 0,
            shares: 0,
            reach: 0,
            engagement_rate: 0
          },
          media_urls: ['/images/maintenance-tip-1.jpg', '/images/maintenance-tip-2.jpg', '/images/maintenance-tip-3.jpg']
        }
      ]);

      // Initialize analytics
      setAnalytics({
        total_reach: 247000,
        total_engagement: 15420,
        avg_engagement_rate: 4.2,
        total_conversions: 145,
        total_spend: 124500,
        roi: 3.8,
        top_performing_platform: 'Instagram',
        best_performing_content: 'image',
        growth_metrics: {
          followers_growth: 12.5,
          engagement_growth: 8.3,
          conversion_growth: 15.7
        }
      });

      // Initialize content library
      setContentLibrary([
        {
          id: '1',
          title: 'Green Building Benefits Infographic',
          type: 'image',
          category: 'educational',
          created_date: '2024-01-15',
          usage_count: 5,
          performance_score: 8.5,
          tags: ['green-building', 'benefits', 'infographic'],
          file_url: '/images/green-building-benefits.jpg'
        },
        {
          id: '2',
          title: 'Balcony Garden Transformation Video',
          type: 'video',
          category: 'showcase',
          created_date: '2024-01-12',
          usage_count: 8,
          performance_score: 9.2,
          tags: ['balcony-garden', 'transformation', 'before-after'],
          file_url: '/videos/balcony-transformation.mp4'
        },
        {
          id: '3',
          title: 'Client Testimonial Quote Card',
          type: 'image',
          category: 'testimonial',
          created_date: '2024-01-10',
          usage_count: 3,
          performance_score: 7.8,
          tags: ['testimonial', 'client-review', 'quote'],
          file_url: '/images/testimonial-card.jpg'
        }
      ]);

    } catch (error) {
      console.error('Marketing data initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Campaign Management Functions
  const createCampaign = async () => {
    setLoading(true);
    try {
      const newCampaign = {
        id: Date.now().toString(),
        ...campaignForm,
        spent: 0,
        metrics: {
          impressions: 0,
          clicks: 0,
          ctr: 0,
          conversions: 0,
          cost_per_conversion: 0
        },
        content_items: 0,
        active_posts: 0,
        created_date: new Date().toISOString()
      };

      setCampaigns(prev => [...prev, newCampaign]);
      setShowCampaignModal(false);
      resetCampaignForm();

    } catch (error) {
      console.error('Campaign creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createContent = async () => {
    setLoading(true);
    try {
      const newContent = {
        id: Date.now().toString(),
        ...contentForm,
        status: contentForm.schedule_date ? 'scheduled' : 'draft',
        scheduled_date: contentForm.schedule_date && contentForm.schedule_time 
          ? `${contentForm.schedule_date}T${contentForm.schedule_time}:00Z` 
          : null,
        metrics: {
          likes: 0,
          comments: 0,
          shares: 0,
          reach: 0,
          engagement_rate: 0
        },
        created_date: new Date().toISOString()
      };

      setSocialPosts(prev => [...prev, newContent]);
      setShowContentModal(false);
      resetContentForm();

    } catch (error) {
      console.error('Content creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIContent = async (prompt, contentType) => {
    try {
      const response = await axios.post(`${API}/api/ai/marketing-content`, {
        campaign_type: contentType,
        target_audience: 'urban_homeowners',
        service: 'green_building_landscaping',
        tone: 'professional_friendly',
        platform: 'multi_platform',
        prompt: prompt
      });

      return response.data.content || response.data;
    } catch (error) {
      console.error('AI content generation error:', error);
      return 'AI-generated content will appear here...';
    }
  };

  // Utility Functions
  const resetCampaignForm = () => {
    setCampaignForm({
      name: '',
      type: 'social_media',
      objective: 'brand_awareness',
      target_audience: '',
      budget: '',
      start_date: '',
      end_date: '',
      platforms: [],
      content: '',
      status: 'draft'
    });
  };

  const resetContentForm = () => {
    setContentForm({
      title: '',
      type: 'image',
      content: '',
      platforms: [],
      schedule_date: '',
      schedule_time: '',
      hashtags: '',
      target_audience: ''
    });
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'facebook': return <Facebook className="h-4 w-4" />;
      case 'instagram': return <Instagram className="h-4 w-4" />;
      case 'twitter': return <Twitter className="h-4 w-4" />;
      case 'linkedin': return <Linkedin className="h-4 w-4" />;
      case 'youtube': return <Youtube className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'google_ads': return <Smartphone className="h-4 w-4" />;
      default: return <Share2 className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-purple-100 text-purple-800';
      case 'published': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Render Functions
  const renderCampaigns = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Marketing Campaigns</h3>
          <p className="text-gray-600">Manage and track your marketing campaigns</p>
        </div>
        <Button onClick={() => setShowCampaignModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      <div className="grid gap-6">
        {campaigns.map((campaign) => (
          <Card key={campaign.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="text-lg font-semibold">{campaign.name}</h4>
                    <Badge className={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {campaign.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="flex space-x-1">
                      {campaign.platforms.map((platform) => (
                        <div key={platform} className="p-1 bg-gray-100 rounded">
                          {getPlatformIcon(platform)}
                        </div>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {new Date(campaign.start_date).toLocaleDateString()} - {new Date(campaign.end_date).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Budget Usage</p>
                      <div className="flex items-center space-x-2">
                        <Progress value={(campaign.spent / campaign.budget) * 100} className="flex-1" />
                        <span className="text-sm font-medium">
                          {Math.round((campaign.spent / campaign.budget) * 100)}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        ₹{(campaign.spent / 1000).toFixed(0)}K / ₹{(campaign.budget / 1000).toFixed(0)}K
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Impressions</p>
                      <p className="font-semibold">{(campaign.metrics.impressions / 1000).toFixed(0)}K</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Clicks</p>
                      <p className="font-semibold">{campaign.metrics.clicks.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">CTR</p>
                      <p className="font-semibold">{campaign.metrics.ctr}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Conversions</p>
                      <p className="font-semibold">{campaign.metrics.conversions}</p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  <Button size="sm" variant="outline" onClick={() => {
                    alert(`Viewing campaign: ${campaign.name}\n\nDetails:\n- Budget: ₹${campaign.budget.toLocaleString()}\n- Spent: ₹${campaign.spent.toLocaleString()}\n- CTR: ${campaign.metrics.ctr}%\n- Conversions: ${campaign.metrics.conversions}`);
                  }}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    setCampaignForm({
                      name: campaign.name,
                      type: campaign.type,
                      objective: campaign.objective,
                      target_audience: 'Urban homeowners and businesses',
                      budget: campaign.budget.toString(),
                      start_date: campaign.start_date,
                      end_date: campaign.end_date,
                      platforms: campaign.platforms,
                      content: '',
                      status: campaign.status
                    });
                    setShowCampaignModal(true);
                  }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
                    setCampaigns(prev => prev.map(c => 
                      c.id === campaign.id ? { ...c, status: newStatus } : c
                    ));
                    alert(`Campaign ${campaign.name} ${newStatus === 'active' ? 'resumed' : 'paused'}`);
                  }}>
                    {campaign.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSocialMedia = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Social Media Posts</h3>
          <p className="text-gray-600">Create and schedule social media content</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => {
            setContentForm({
              title: '',
              type: 'image',
              content: '',
              platforms: ['instagram'],
              schedule_date: new Date().toISOString().split('T')[0],
              schedule_time: '10:00',
              hashtags: '#AavanaGreens #GreenLiving #BalconyGarden',
              target_audience: 'Urban homeowners'
            });
            setShowContentModal(true);
          }}>
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </Button>
          <Button onClick={() => setShowContentModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {socialPosts.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold">{post.title}</h4>
                    <Badge className={getStatusColor(post.status)}>
                      {post.status}
                    </Badge>
                    <div className="flex items-center space-x-1">
                      {getPlatformIcon(post.platform)}
                      <span className="text-sm text-gray-600 capitalize">{post.platform}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3 line-clamp-2">{post.content}</p>
                  
                  {post.hashtags && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {post.hashtags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Likes</p>
                      <p className="font-semibold flex items-center">
                        <Heart className="h-3 w-3 mr-1 text-red-500" />
                        {post.metrics.likes}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Comments</p>
                      <p className="font-semibold flex items-center">
                        <MessageCircle className="h-3 w-3 mr-1 text-blue-500" />
                        {post.metrics.comments}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Shares</p>
                      <p className="font-semibold flex items-center">
                        <Share2 className="h-3 w-3 mr-1 text-green-500" />
                        {post.metrics.shares}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Reach</p>
                      <p className="font-semibold">{post.metrics.reach.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Engagement</p>
                      <p className="font-semibold">{post.metrics.engagement_rate}%</p>
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-gray-500">
                    {post.status === 'scheduled' && `Scheduled: ${new Date(post.scheduled_date).toLocaleString()}`}
                    {post.status === 'published' && `Published: ${new Date(post.published_date).toLocaleString()}`}
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  <Button size="sm" variant="outline" onClick={() => {
                    alert(`📊 Post Analytics: ${post.title}\n\n📈 Performance:\n• Likes: ${post.metrics.likes}\n• Comments: ${post.metrics.comments}\n• Shares: ${post.metrics.shares}\n• Reach: ${post.metrics.reach.toLocaleString()}\n• Engagement Rate: ${post.metrics.engagement_rate}%\n\n📱 Platform: ${post.platform}\n📅 Status: ${post.status}`);
                  }}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    setContentForm({
                      title: post.title,
                      type: post.type,
                      content: post.content,
                      platforms: [post.platform],
                      schedule_date: post.scheduled_date ? post.scheduled_date.split('T')[0] : '',
                      schedule_time: post.scheduled_date ? post.scheduled_date.split('T')[1].split(':').slice(0,2).join(':') : '',
                      hashtags: post.hashtags ? post.hashtags.join(' ') : '',
                      target_audience: 'Urban homeowners interested in green living'
                    });
                    setShowContentModal(true);
                  }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Marketing Analytics</h3>
        <p className="text-gray-600">Track performance and ROI of your marketing efforts</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Reach</p>
                <p className="text-3xl font-bold text-blue-700">
                  {(analytics.total_reach / 1000).toFixed(0)}K
                </p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Engagement</p>
                <p className="text-3xl font-bold text-green-700">
                  {(analytics.total_engagement / 1000).toFixed(1)}K
                </p>
              </div>
              <Heart className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">Conversions</p>
                <p className="text-3xl font-bold text-yellow-700">{analytics.total_conversions}</p>
              </div>
              <Target className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">ROI</p>
                <p className="text-3xl font-bold text-purple-700">{analytics.roi}x</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">{campaign.name}</div>
                    <div className="text-sm text-gray-600">{campaign.metrics.conversions} conversions</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">₹{(campaign.spent / 1000).toFixed(0)}K</div>
                    <div className="text-sm text-gray-600">{campaign.metrics.ctr}% CTR</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Growth Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Followers Growth</span>
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="font-semibold text-green-600">
                    +{analytics.growth_metrics?.followers_growth}%
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Engagement Growth</span>
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="font-semibold text-green-600">
                    +{analytics.growth_metrics?.engagement_growth}%
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Conversion Growth</span>
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="font-semibold text-green-600">
                    +{analytics.growth_metrics?.conversion_growth}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderContentLibrary = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Content Library</h3>
          <p className="text-gray-600">Manage your marketing assets and content</p>
        </div>
        <Button onClick={() => {
          const newContent = {
            id: Date.now().toString(),
            title: `New Content Item ${contentLibrary.length + 1}`,
            type: 'image',
            category: 'showcase',
            created_date: new Date().toISOString().split('T')[0],
            usage_count: 0,
            performance_score: 8.0,
            tags: ['new-upload', 'marketing-asset'],
            file_url: '/images/gallery/new-content.jpg'
          };
          setContentLibrary(prev => [...prev, newContent]);
          alert('📤 Content uploaded successfully! You can now use it in your campaigns.');
        }}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Content
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contentLibrary.map((content) => (
          <Card key={content.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                {content.type === 'image' ? <Image className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                <span className="text-sm font-medium capitalize">{content.type}</span>
                <Badge variant="outline" className="text-xs">
                  {content.category}
                </Badge>
              </div>
              
              <h4 className="font-semibold mb-2">{content.title}</h4>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Usage Count</span>
                  <span>{content.usage_count}</span>
                </div>
                <div className="flex justify-between">
                  <span>Performance</span>
                  <div className="flex items-center">
                    <Star className="h-3 w-3 text-yellow-500 mr-1" />
                    <span>{content.performance_score}/10</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span>Created</span>
                  <span>{new Date(content.created_date).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mt-3">
                {content.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex space-x-2 mt-4">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => {
                  alert(`📂 Content Details: ${content.title}\n\n📊 Performance Score: ${content.performance_score}/10\n📈 Usage Count: ${content.usage_count}\n📅 Created: ${new Date(content.created_date).toLocaleDateString()}\n🏷️ Tags: ${content.tags.join(', ')}\n📂 Category: ${content.category}`);
                }}>
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button size="sm" variant="outline" className="flex-1" onClick={() => {
                  setContentLibrary(prev => prev.map(item => 
                    item.id === content.id ? { ...item, usage_count: item.usage_count + 1 } : item
                  ));
                  alert(`✅ Content "${content.title}" added to your campaign! Usage count updated.`);
                }}>
                  <Download className="h-3 w-3 mr-1" />
                  Use
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Megaphone className="h-5 w-5" />
            <span>Digital Marketing Manager</span>
          </DialogTitle>
          <DialogDescription>
            Manage campaigns, create content, and track marketing performance
          </DialogDescription>
        </DialogHeader>

        <div className="flex h-[80vh]">
          {/* Sidebar Navigation */}
          <div className="w-56 border-r p-4">
            <div className="space-y-1">
              <Button
                variant={activeTab === 'campaigns' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('campaigns')}
              >
                <Target className="h-4 w-4 mr-2" />
                Campaigns
              </Button>
              <Button
                variant={activeTab === 'social' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('social')}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Social Media
              </Button>
              <Button
                variant={activeTab === 'analytics' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('analytics')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
              <Button
                variant={activeTab === 'content' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('content')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Content Library
              </Button>
            </div>

            <div className="mt-6 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-800 mb-1">AI Assistant</div>
              <div className="text-xs text-blue-600 mb-2">Generate content with AI</div>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  // Generate AI content suggestion
                  const suggestions = [
                    "Create Instagram post: '5 Benefits of Green Building for Your Business'",
                    "Generate LinkedIn article: 'Sustainable Architecture Trends 2024'", 
                    "Design Facebook campaign: 'Transform Your Space with Eco-Landscaping'",
                    "Write blog post: 'Cost Savings with Renewable Energy Systems'",
                    "Create video script: 'Before & After Green Building Transformation'"
                  ];
                  const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
                  
                  alert(`🤖 AI Marketing Assistant\n\n✨ Content Suggestion:\n${randomSuggestion}\n\n💡 This AI assistant can help with:\n• Social media content creation\n• Campaign optimization\n• Audience targeting\n• Performance analysis\n• Content scheduling\n\nClick OK to continue with this suggestion or try again for more ideas!`);
                }}
              >
                <Zap className="h-3 w-3 mr-1" />
                AI Generate
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Loading marketing data...</span>
              </div>
            )}

            {!loading && activeTab === 'campaigns' && renderCampaigns()}
            {!loading && activeTab === 'social' && renderSocialMedia()}
            {!loading && activeTab === 'analytics' && renderAnalytics()}
            {!loading && activeTab === 'content' && renderContentLibrary()}
          </div>
        </div>

        {/* Create Campaign Modal */}
        <Dialog open={showCampaignModal} onOpenChange={setShowCampaignModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
              <DialogDescription>Set up a new marketing campaign</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Campaign Name</Label>
                  <Input 
                    value={campaignForm.name}
                    onChange={(e) => setCampaignForm({...campaignForm, name: e.target.value})}
                    placeholder="Enter campaign name..."
                  />
                </div>
                <div>
                  <Label>Campaign Type</Label>
                  <Select value={campaignForm.type} onValueChange={(value) => setCampaignForm({...campaignForm, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="social_media">Social Media</SelectItem>
                      <SelectItem value="paid_ads">Paid Advertising</SelectItem>
                      <SelectItem value="email_marketing">Email Marketing</SelectItem>
                      <SelectItem value="content_marketing">Content Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Objective</Label>
                  <Select value={campaignForm.objective} onValueChange={(value) => setCampaignForm({...campaignForm, objective: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brand_awareness">Brand Awareness</SelectItem>
                      <SelectItem value="lead_generation">Lead Generation</SelectItem>
                      <SelectItem value="customer_retention">Customer Retention</SelectItem>
                      <SelectItem value="sales_conversion">Sales Conversion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Budget (₹)</Label>
                  <Input 
                    type="number"
                    value={campaignForm.budget}
                    onChange={(e) => setCampaignForm({...campaignForm, budget: e.target.value})}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input 
                    type="date"
                    value={campaignForm.start_date}
                    onChange={(e) => setCampaignForm({...campaignForm, start_date: e.target.value})}
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input 
                    type="date"
                    value={campaignForm.end_date}
                    onChange={(e) => setCampaignForm({...campaignForm, end_date: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label>Target Audience</Label>
                <Input 
                  value={campaignForm.target_audience}
                  onChange={(e) => setCampaignForm({...campaignForm, target_audience: e.target.value})}
                  placeholder="Describe your target audience..."
                />
              </div>

              <div className="flex space-x-2 pt-4">
                <Button onClick={createCampaign} disabled={loading || !campaignForm.name}>
                  {loading ? 'Creating...' : 'Create Campaign'}
                </Button>
                <Button variant="outline" onClick={() => setShowCampaignModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Content Modal */}
        <Dialog open={showContentModal} onOpenChange={setShowContentModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Social Media Post</DialogTitle>
              <DialogDescription>Create and schedule social media content</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Post Title</Label>
                  <Input 
                    value={contentForm.title}
                    onChange={(e) => setContentForm({...contentForm, title: e.target.value})}
                    placeholder="Enter post title..."
                  />
                </div>
                <div>
                  <Label>Content Type</Label>
                  <Select value={contentForm.type} onValueChange={(value) => setContentForm({...contentForm, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">Image Post</SelectItem>
                      <SelectItem value="video">Video Post</SelectItem>
                      <SelectItem value="carousel">Carousel Post</SelectItem>
                      <SelectItem value="text">Text Post</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Content</Label>
                <Textarea 
                  value={contentForm.content}
                  onChange={(e) => setContentForm({...contentForm, content: e.target.value})}
                  placeholder="Write your post content..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Schedule Date</Label>
                  <Input 
                    type="date"
                    value={contentForm.schedule_date}
                    onChange={(e) => setContentForm({...contentForm, schedule_date: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Schedule Time</Label>
                  <Input 
                    type="time"
                    value={contentForm.schedule_time}
                    onChange={(e) => setContentForm({...contentForm, schedule_time: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label>Hashtags</Label>
                <Input 
                  value={contentForm.hashtags}
                  onChange={(e) => setContentForm({...contentForm, hashtags: e.target.value})}
                  placeholder="#hashtag1 #hashtag2 #hashtag3"
                />
              </div>

              <div className="flex space-x-2 pt-4">
                <Button onClick={createContent} disabled={loading || !contentForm.title}>
                  {loading ? 'Creating...' : 'Create Post'}
                </Button>
                <Button variant="outline" onClick={() => setShowContentModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

export default DigitalMarketingManager;