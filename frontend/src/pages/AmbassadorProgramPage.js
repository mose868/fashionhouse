import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaStar, 
  FaInstagram, 
  FaTiktok, 
  FaCheck,
  FaMoneyBillWave,
  FaGift,
  FaUsers,
  FaShare
} from 'react-icons/fa';
import { 
  GiftIcon, 
  CurrencyDollarIcon, 
  UserGroupIcon,
  SparklesIcon,
  TrophyIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';

const AmbassadorProgramPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    location: {
      city: '',
      country: 'Kenya'
    },
    socialMedia: {
      instagram: { handle: '', followers: '', url: '' },
      twitter: { handle: '', followers: '', url: '' },
      facebook: { handle: '', followers: '', url: '' },
      tiktok: { handle: '', followers: '', url: '' }
    },
    interests: [],
    experience: '',
    why: '',
    collaborationTypes: {
      photoshoots: false,
      socialMediaPosts: false,
      events: false,
      runway: false,
      campaigns: false,
      productReviews: false,
      brandRepresentation: false,
      referralMarketing: false
    },
    motivation: '',
    consentToPhotography: false,
    consentToDataUse: false,
    consentToMarketing: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState('program');

  const tabs = [
    { id: 'program', name: 'Program Overview', icon: SparklesIcon },
    { id: 'earnings', name: 'Refer & Earn', icon: CurrencyDollarIcon },
    { id: 'apply', name: 'Apply Now', icon: RocketLaunchIcon }
  ];

  const benefits = [
    {
      icon: <GiftIcon className="h-8 w-8" />,
      title: "Exclusive Products",
      description: "Access to new collections before public release and special ambassador-only pieces",
      color: "text-purple-500"
    },
    {
      icon: <CurrencyDollarIcon className="h-8 w-8" />,
      title: "Refer & Earn",
      description: "Earn 15% commission on every sale from your referral code + bonuses for high performers",
      color: "text-green-500"
    },
    {
      icon: "📸",
      title: "Professional Photoshoots",
      description: "Participate in professional photo and video shoots for marketing campaigns",
      color: "text-blue-500"
    },
    {
      icon: <TrophyIcon className="h-8 w-8" />,
      title: "Recognition & Rewards",
      description: "Monthly performance bonuses, annual ambassador awards, and exclusive experiences",
      color: "text-yellow-500"
    },
    {
      icon: "🎓",
      title: "Training & Development",
      description: "Fashion styling workshops, social media training, and personal brand development sessions",
      color: "text-indigo-500"
    },
    {
      icon: <UserGroupIcon className="h-8 w-8" />,
      title: "Community Network",
      description: "Connect with other ambassadors, designers, and fashion industry professionals worldwide",
      color: "text-pink-500"
    }
  ];

  const earningTiers = [
    {
      tier: "Bronze Ambassador",
      sales: "1-10 sales/month",
      commission: "15%",
      bonus: "KES 2,000",
      perks: ["Monthly product gift", "Early access to sales"]
    },
    {
      tier: "Silver Ambassador", 
      sales: "11-25 sales/month",
      commission: "18%",
      bonus: "KES 5,000",
      perks: ["Quarterly styling session", "Exclusive events invitation", "Higher product discounts"]
    },
    {
      tier: "Gold Ambassador",
      sales: "26-50 sales/month", 
      commission: "22%",
      bonus: "KES 10,000",
      perks: ["Personal wardrobe curation", "VIP event access", "Featured in campaigns"]
    },
    {
      tier: "Diamond Ambassador",
      sales: "50+ sales/month",
      commission: "25%",
      bonus: "KES 20,000",
      perks: ["Design collaboration opportunity", "Annual fashion trip", "Personal brand partnership"]
    }
  ];

  const requirements = [
    "Active social media presence with engaged followers (500+ followers minimum)",
    "Passion for African fashion and cultural heritage",
    "Professional attitude and reliability",
    "Availability for events and content creation",
    "Strong communication skills",
    "Alignment with our brand values",
    "Commitment to promoting authentic African fashion"
  ];



  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child, subchild] = name.split('.');
      if (subchild) {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: {
              ...prev[parent][child],
              [subchild]: value
            }
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: type === 'checkbox' ? checked : value
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key === 'photos') {
          formData.photos.forEach((file, index) => {
            formDataToSend.append('photos', file);
          });
        } else if (typeof formData[key] === 'object') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await fetch('/api/ambassadors/apply', {
        method: 'POST',
        body: formDataToSend
      });

      const result = await response.json();

      if (result.success) {
        setSubmitted(true);
      } else {
        console.error('Application submission failed:', result);
        alert('Error submitting application: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      if (error.message.includes('fetch')) {
        alert('Cannot connect to server. Please ensure the backend is running on port 5010.');
      } else {
        alert('Error submitting application: ' + error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg shadow-xl p-8 max-w-md mx-4 text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheck className="text-green-600 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for applying to be a Higi Fashion House ambassador. We'll review your application and get back to you within 5-7 business days.
          </p>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-purple-800 mb-2">
              <strong>What happens next?</strong>
            </p>
            <div className="space-y-2 text-sm text-purple-700">
              <p>✅ We'll review your application within 5-7 business days</p>
              <p>📧 You'll receive approval notification via email</p>
              <p>🔗 Your unique referral link will be sent once approved</p>
              <p>💰 Start earning commissions immediately after approval!</p>
            </div>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Return to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-gradient-to-r from-purple-900 via-purple-800 to-pink-900 text-white py-20 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-6"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <SparklesIcon className="h-6 w-6 text-yellow-300" />
              <span className="text-yellow-300 font-medium tracking-wider uppercase text-sm">
                Join Our Elite Team
              </span>
              <SparklesIcon className="h-6 w-6 text-yellow-300" />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Ambassador Program
            </h1>
            <p className="text-xl md:text-2xl text-purple-100 mb-8 max-w-3xl mx-auto">
              Become a fashion influencer, earn generous commissions, and represent authentic African luxury worldwide
            </p>
          </motion.div>

          {/* Key Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold text-yellow-300 mb-2">25%</div>
              <div className="text-purple-100">Max Commission Rate</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold text-yellow-300 mb-2">500+</div>
              <div className="text-purple-100">Active Ambassadors</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold text-yellow-300 mb-2">KES 50K+</div>
              <div className="text-purple-100">Avg Monthly Earnings</div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4 py-6">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.name}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Program Overview Tab */}
        {activeTab === 'program' && (
            <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-16"
          >
            {/* Benefits Grid */}
            <div>
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                Ambassador Benefits & Perks
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className={`${benefit.color} mb-4`}>
                      {typeof benefit.icon === 'string' ? (
                        <span className="text-4xl">{benefit.icon}</span>
                      ) : (
                        benefit.icon
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-3">{benefit.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Requirements</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {requirements.map((requirement, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="flex items-start space-x-3"
                  >
                    <FaStar className="text-yellow-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{requirement}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Refer & Earn Tab */}
        {activeTab === 'earnings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            {/* How It Works */}
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                How Refer & Earn Works
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Share your unique referral code, earn commissions on every sale, and unlock higher tiers with amazing bonuses!
              </p>
            </div>

            {/* Process Steps */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                {
                  step: "1",
                  title: "Get Your Code",
                  description: "Receive your unique referral code upon approval",
                  icon: <FaShare className="h-8 w-8" />
                },
                {
                  step: "2", 
                  title: "Share & Promote",
                  description: "Share on social media, with friends, or through content",
                  icon: <FaUsers className="h-8 w-8" />
                },
                {
                  step: "3",
                  title: "Customer Purchases",
                  description: "Someone buys using your code",
                  icon: <FaGift className="h-8 w-8" />
                },
                {
                  step: "4",
                  title: "Earn Commission",
                  description: "Get paid 15-25% commission + bonuses",
                  icon: <FaMoneyBillWave className="h-8 w-8" />
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.5 }}
                  className="text-center"
                >
                  <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="text-purple-600">{item.icon}</div>
                  </div>
                  <div className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-bold">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
            </motion.div>
              ))}
            </div>

            {/* Earning Tiers */}
            <div>
              <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
                Ambassador Tiers & Earnings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {earningTiers.map((tier, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className={`relative bg-white rounded-xl shadow-lg p-6 border-2 ${
                      index === 3 ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50' :
                      index === 2 ? 'border-yellow-300' :
                      index === 1 ? 'border-gray-300' :
                      'border-orange-300'
                    }`}
                  >
                    {index === 3 && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                          HIGHEST TIER
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center">
                      <h4 className="font-bold text-lg text-gray-900 mb-2">{tier.tier}</h4>
                      <div className="text-sm text-gray-600 mb-4">{tier.sales}</div>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Commission:</span>
                          <span className="font-bold text-green-600">{tier.commission}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Monthly Bonus:</span>
                          <span className="font-bold text-purple-600">{tier.bonus}</span>
                        </div>
          </div>

                      <div className="space-y-2">
                        <div className="text-xs font-medium text-gray-900 mb-2">Perks:</div>
                        {tier.perks.map((perk, perkIndex) => (
                          <div key={perkIndex} className="text-xs text-gray-600 flex items-center">
                            <FaCheck className="text-green-500 mr-2" />
                            {perk}
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Earnings Calculator */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-xl p-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">Earnings Calculator</h3>
                <p className="text-purple-100 mb-8">See your potential monthly earnings</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <div className="bg-white/10 rounded-lg p-6">
                    <div className="text-3xl font-bold mb-2">KES 15,000</div>
                    <div className="text-sm text-purple-100">5 sales × KES 10,000 avg order</div>
                    <div className="text-sm text-purple-100">@ 15% commission</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-6">
                    <div className="text-3xl font-bold mb-2">KES 54,000</div>
                    <div className="text-sm text-purple-100">15 sales × KES 20,000 avg order</div>
                    <div className="text-sm text-purple-100">@ 18% commission</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-6">
                    <div className="text-3xl font-bold mb-2">KES 130,000</div>
                    <div className="text-sm text-purple-100">30 sales × KES 20,000 avg order</div>
                    <div className="text-sm text-purple-100">@ 22% commission</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Apply Tab */}
        {activeTab === 'apply' && (
            <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Apply to be an Ambassador</h2>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Referral Code Information */}
                    <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Referral Program</h3>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaShare className="text-purple-600 text-2xl" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Your Unique Referral Link</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        After your application is approved, you'll receive your unique referral link via email. 
                        You can then share this link to start earning commissions on every sale!
                      </p>
                      <div className="bg-white border border-purple-200 rounded-lg p-4">
                        <p className="text-xs text-purple-600 font-medium">💰 Earn 15-25% commission on every referral</p>
                        <p className="text-xs text-purple-600">🎁 Plus monthly bonuses based on performance</p>
                        </div>
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media Presence</h3>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4 items-center">
                      <div className="flex items-center space-x-2">
                        <FaInstagram className="text-pink-500" />
                        <span className="font-medium">Instagram *</span>
                      </div>
                      <input
                        type="text"
                        name="socialMedia.instagram.handle"
                        value={formData.socialMedia.instagram.handle}
                        onChange={handleInputChange}
                        placeholder="@username"
                        required
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <input
                        type="number"
                        name="socialMedia.instagram.followers"
                        value={formData.socialMedia.instagram.followers}
                        onChange={handleInputChange}
                        placeholder="Followers (min 500)"
                        required
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 items-center">
                      <div className="flex items-center space-x-2">
                        <FaTiktok className="text-black" />
                        <span className="font-medium">TikTok</span>
                      </div>
                      <input
                        type="text"
                        name="socialMedia.tiktok.handle"
                        value={formData.socialMedia.tiktok.handle}
                        onChange={handleInputChange}
                        placeholder="@username"
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <input
                        type="number"
                        name="socialMedia.tiktok.followers"
                        value={formData.socialMedia.tiktok.followers}
                        onChange={handleInputChange}
                        placeholder="Followers"
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Collaboration Types */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Collaboration Interests</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { key: 'photoshoots', label: 'Photoshoots' },
                      { key: 'socialMediaPosts', label: 'Social Media Posts' },
                      { key: 'events', label: 'Events' },
                      { key: 'runway', label: 'Runway Shows' },
                      { key: 'campaigns', label: 'Marketing Campaigns' },
                      { key: 'productReviews', label: 'Product Reviews' },
                      { key: 'brandRepresentation', label: 'Brand Representation' },
                      { key: 'referralMarketing', label: 'Referral Marketing' }
                    ].map((type) => (
                      <label key={type.key} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name={`collaborationTypes.${type.key}`}
                          checked={formData.collaborationTypes[type.key]}
                          onChange={handleInputChange}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Motivation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Why do you want to become a Higi Fashion House ambassador? *
                  </label>
                  <textarea
                    name="motivation"
                    value={formData.motivation}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Tell us about your passion for African fashion and how you plan to promote our brand..."
                  />
                </div>

                {/* Consent Checkboxes */}
                <div className="space-y-4">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="consentToPhotography"
                      checked={formData.consentToPhotography}
                      onChange={handleInputChange}
                      required
                      className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">
                      I consent to being photographed and filmed for marketing purposes *
                    </span>
                  </label>

                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="consentToDataUse"
                      checked={formData.consentToDataUse}
                      onChange={handleInputChange}
                      required
                      className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">
                      I consent to the use of my personal data for ambassador program purposes *
                    </span>
                  </label>

                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="consentToMarketing"
                      checked={formData.consentToMarketing}
                      onChange={handleInputChange}
                      className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">
                      I would like to receive marketing communications and ambassador updates
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="text-center pt-6">
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-12 py-4 rounded-full font-semibold text-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Submitting Application...
                      </div>
                    ) : (
                      'Submit Ambassador Application'
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
            </motion.div>
        )}
      </div>
    </div>
  );
};

export default AmbassadorProgramPage; 