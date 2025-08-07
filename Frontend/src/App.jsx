import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Clock, Briefcase, Zap, Check, ArrowRight, Star } from 'lucide-react';

const App = () => {
  const [email, setEmail] = useState('');
  const [time, setTime] = useState('9:00');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Add these state variables to store submitted values
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [submittedTime, setSubmittedTime] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          time
        })
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('Success:', data);
        // Store submitted values before resetting
        setSubmittedEmail(email);
        setSubmittedTime(time);
        setIsSubmitted(true);
        setEmail('');
        setTime('09:00');
        
        setTimeout(() => {
          setIsSubmitted(false);
        }, 3000);
      } else {
        console.error('Subscription failed:', data.error);
        // You can add error state handling here if needed
      }
    } catch (error) {
      console.error('Error:', error);
      // You can add error state handling here if needed
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  const floatingAnimation = {
    y: [-10, 10, -10],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full"
            style={{
              width: Math.random() * 300 + 50,
              height: Math.random() * 300 + 50,
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>

      <motion.div
        className="relative z-10 container mx-auto px-6 py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-8 mx-auto"
            animate={floatingAnimation}
          >
            <Briefcase size={40} className="text-white" />
          </motion.div>
          
          <motion.h1 
            className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          >
            InboxHire
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            Never miss your dream job again. Get fresh MERN stack opportunities delivered to your inbox daily.
          </motion.p>
          
          <motion.p 
            className="text-lg text-gray-400 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            Set your preferred time, enter your email, and let our AI-powered scraper find the latest React, Node.js, 
            and full-stack positions from top job boards.
          </motion.p>
        </motion.div>

        {/* Features */}
        <motion.div 
          className="grid md:grid-cols-3 gap-8 mb-16"
          variants={containerVariants}
        >
          {[
            { icon: Zap, title: "Lightning Fast", desc: "Real-time job scraping from multiple sources" },
            { icon: Mail, title: "Daily Delivery", desc: "Fresh opportunities in your inbox every morning" },
            { icon: Star, title: "MERN Focus", desc: "Specialized in React, Node.js & full-stack roles" }
          ].map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50"
            >
              <motion.div
                className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4"
                animate={floatingAnimation}
                transition={{ ...floatingAnimation.transition, delay: index * 0.5 }}
              >
                <feature.icon size={24} className="text-white" />
              </motion.div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Form */}
        <motion.div
          variants={itemVariants}
          className="max-w-2xl mx-auto"
        >
          <motion.div
            className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-gray-700/30 shadow-2xl"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Start Your Job Hunt</h2>
                    <p className="text-gray-400">Get personalized job alerts delivered daily</p>
                  </div>

                  {/* Email Input */}
                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                      <Mail size={16} className="text-blue-400" />
                      Email Address
                    </label>
                    <motion.input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="your@email.com"
                      whileFocus={{ scale: 1.02 }}
                    />
                  </motion.div>

                  {/* Time Input */}
                  <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                      <Clock size={16} className="text-purple-400" />
                      Delivery Time (24h format)
                    </label>
                    <motion.input
                      type="time"
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-4 py-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      whileFocus={{ scale: 1.02 }}
                    />
                  </motion.div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isLoading ? (
                      <motion.div
                        className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    ) : (
                      <>
                        Start Receiving Jobs
                        <ArrowRight size={20} />
                      </>
                    )}
                  </motion.button>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="text-center py-8"
                >
                  <motion.div
                    className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  >
                    <Check size={40} className="text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-4">You're All Set! 🎉</h3>
                  <p className="text-gray-300 mb-2">
                    We'll send fresh MERN stack jobs to <span className="text-blue-400 font-semibold">{submittedEmail}</span>
                  </p>
                  <p className="text-gray-400">
                    Daily at <span className="text-purple-400 font-semibold">{submittedTime}</span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.div
          variants={itemVariants}
          className="text-center mt-16 text-gray-500"
        >
          <p className="mb-2">Powered by advanced web scraping technology</p>
          <p className="text-sm">No spam, no bs - just quality job opportunities</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default App;