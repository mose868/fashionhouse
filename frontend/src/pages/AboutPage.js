import React from 'react';
import { motion } from 'framer-motion';
import { FaHeart, FaGlobeAfrica, FaUsers, FaStar, FaQuoteLeft } from 'react-icons/fa';

const AboutPage = () => {
  const tailors = [
    {
      name: "Mama Rose Njeri",
      title: "Master Tailor & Founder",
      bio: "With over 25 years of experience in traditional African tailoring, Mama Rose founded Higi Fashion House to preserve and modernize African fashion heritage. She learned her craft from her grandmother and has trained dozens of tailors across Kenya.",
      specialties: ["Kitenge", "Traditional Beadwork", "Wedding Gowns", "Cultural Ceremonial Wear"],
      experience: "25+ years",
      image: "https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=400",
      languages: ["English", "Swahili", "Kikuyu"],
      achievements: [
        "Featured in Kenyan Fashion Week 2020-2024",
        "Trained over 50 local tailors",
        "Preserved traditional Kikuyu beadwork techniques"
      ]
    },
    {
      name: "Samuel Ochieng",
      title: "Men's Wear Specialist",
      bio: "Samuel specializes in contemporary African menswear, blending traditional patterns with modern cuts. His expertise in ankara and kente styling has made him a sought-after designer for corporate and cultural events.",
      specialties: ["Ankara Suits", "Kente Accessories", "Corporate Wear", "Cultural Festival Outfits"],
      experience: "12 years",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      languages: ["English", "Swahili", "Luo"],
      achievements: [
        "Designed uniforms for 3 major cultural festivals",
        "Featured in Men's Fashion Magazine Kenya",
        "Corporate wear designer for 20+ companies"
      ]
    },
    {
      name: "Faith Wanjiku",
      title: "Contemporary Designer",
      bio: "Faith brings a fresh, youthful perspective to African fashion. Her innovative approach to mixing traditional fabrics with modern silhouettes has attracted a new generation of African fashion lovers.",
      specialties: ["Modern Silhouettes", "Youth Fashion", "Fusion Designs", "Casual African Wear"],
      experience: "8 years",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b098?w=400",
      languages: ["English", "Swahili"],
      achievements: [
        "Young Designer Award 2023",
        "Featured in African Fashion International",
        "Collaborated with 5 international fashion brands"
      ]
    }
  ];

  const values = [
    {
      icon: <FaHeart className="text-red-500 text-3xl" />,
      title: "Cultural Heritage",
      description: "We honor and preserve traditional African fashion techniques while embracing modern innovation."
    },
    {
      icon: <FaGlobeAfrica className="text-green-500 text-3xl" />,
      title: "African Pride",
      description: "Every piece we create celebrates the rich diversity and beauty of African culture and craftsmanship."
    },
    {
      icon: <FaUsers className="text-blue-500 text-3xl" />,
      title: "Community",
      description: "We support local artisans and contribute to the growth of the African fashion industry."
    },
    {
      icon: <FaStar className="text-yellow-500 text-3xl" />,
      title: "Excellence",
      description: "We are committed to delivering the highest quality garments with attention to every detail."
    }
  ];

  const stats = [
    { number: "25+", label: "Years of Experience" },
    { number: "5000+", label: "Happy Customers" },
    { number: "10000+", label: "Garments Created" },
    { number: "50+", label: "Trained Artisans" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-gradient-to-r from-orange-900 to-red-900 text-white py-20"
      >
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            About Higi Fashion House
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto"
          >
            Where Culture Meets Class — Celebrating African Heritage Through Fashion
          </motion.p>
        </div>
      </motion.section>

      {/* Our Story Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  At Higi Fashion House, we celebrate the timeless beauty, culture, and creativity of African wear. 
                  Based in the vibrant heart of Wangige Market, we tailor custom-made outfits that blend tradition 
                  with modern elegance. Every stitch tells a story.
                </p>
                <p>
                  Our mission is to make every client feel bold, beautiful, and empowered — through fabric, form, 
                  and culture. We believe that fashion is more than just clothing; it's a powerful expression of 
                  identity, heritage, and personal style.
                </p>
                <p>
                  Founded by Mama Rose Njeri, a master tailor with over 25 years of experience, Higi Fashion House 
                  has grown from a small tailoring shop to a renowned destination for authentic African fashion. 
                  We take pride in preserving traditional techniques while innovating for the modern world.
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=600"
                alt="African Fashion"
                className="rounded-lg shadow-xl w-full"
              />
              <div className="absolute -bottom-6 -left-6 bg-orange-600 text-white p-6 rounded-lg shadow-lg">
                <FaQuoteLeft className="text-2xl mb-2" />
                <p className="font-semibold">"Every garment tells a story of heritage and hope."</p>
                <p className="text-sm opacity-90">- Mama Rose Njeri, Founder</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These core values guide everything we do, from the fabrics we choose to the relationships we build.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="bg-white p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow"
              >
                <div className="mb-4 flex justify-center">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <h3 className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</h3>
                <p className="text-xl opacity-90">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet the Tailors Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Meet Our Master Tailors</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our skilled artisans bring decades of experience and passion to every garment they create.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {tailors.map((tailor, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.8 }}
                className="bg-gray-50 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="h-64 overflow-hidden">
                  <img
                    src={tailor.image}
                    alt={tailor.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{tailor.name}</h3>
                  <p className="text-orange-600 font-semibold mb-3">{tailor.title}</p>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">{tailor.bio}</p>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">Experience</h4>
                      <p className="text-sm text-gray-600">{tailor.experience}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">Specialties</h4>
                      <div className="flex flex-wrap gap-1">
                        {tailor.specialties.map((specialty, i) => (
                          <span
                            key={i}
                            className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">Languages</h4>
                      <p className="text-sm text-gray-600">{tailor.languages.join(', ')}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">Achievements</h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {tailor.achievements.map((achievement, i) => (
                          <li key={i} className="flex items-start space-x-1">
                            <span className="text-orange-500 mt-0.5">•</span>
                            <span>{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8">Our Mission</h2>
            <p className="text-xl md:text-2xl leading-relaxed text-gray-200 mb-8">
              "To preserve, celebrate, and modernize African fashion heritage while empowering our community 
              through exceptional craftsmanship and cultural pride. We strive to make every client feel 
              confident and beautiful in garments that honor their roots and express their unique style."
            </p>
            <div className="w-24 h-1 bg-orange-500 mx-auto"></div>
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-orange-50">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Ready to Experience African Fashion Excellence?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Visit our studio in Wangige Market or browse our collection online. Let us help you create 
              something truly special that celebrates your heritage and style.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/location'}
                className="bg-orange-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-orange-700 transition-colors"
              >
                Visit Our Studio
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/products'}
                className="bg-transparent border-2 border-orange-600 text-orange-600 px-8 py-4 rounded-lg font-bold hover:bg-orange-600 hover:text-white transition-colors"
              >
                Browse Collection
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage; 