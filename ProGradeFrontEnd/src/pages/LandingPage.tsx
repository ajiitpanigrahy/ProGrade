import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Zap, Award, UserPlus, LogIn, FileText, CheckCircle,
  Mail, MapPin, Phone, MoreVertical, X, Sun, Moon, Code, Cpu, Globe, Lock
} from 'lucide-react';
import logo from '../assets/logo.svg';

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Theme Toggle Handler
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Smooth Scroll Handler
  const scrollToSection = (sectionId: string) => {
    setIsMobileMenuOpen(false);

    if (sectionId === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const navLinks = [
    { name: 'Home', id: 'home' },
    { name: 'About Us', id: 'about' },
    { name: 'Why Us', id: 'why-us' },
    { name: 'Career', id: 'career' },
    { name: 'Contact Us', id: 'contact' }
  ];

  return (
    // The main wrapper controls the dark mode based on the state
    <div className={`${isDarkMode ? 'dark' : ''} scroll-smooth`}>
      <div className="min-h-screen bg-white dark:bg-[#0a0514] font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">

        {/* ---------------- NAVBAR ---------------- */}
        <nav className="fixed w-full bg-[#0f0a1c] border-b border-purple-900/50 z-50 top-0 transition-all">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">

              {/* Left: Brand */}
              <button onClick={() => scrollToSection('top')} className="flex items-center gap-2 sm:gap-3 cursor-pointer group focus:outline-none">
                <img src={logo} alt="Pro Grade Logo" className="w-8 h-8 sm:w-10 sm:h-10 group-hover:scale-105 transition-transform" />
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-500">
                  Pro Grade
                </span>
              </button>

              {/* Middle: Desktop Navigation */}
              <div className="hidden lg:flex space-x-8">
                {navLinks.map((link) => (
                  <button
                    key={link.name}
                    onClick={() => scrollToSection(link.id)}
                    className="relative cursor-pointer text-gray-300 hover:text-white font-medium transition-colors group py-2 focus:outline-none"
                  >
                    {link.name}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-fuchsia-500 transition-all duration-300 ease-out group-hover:w-full"></span>
                  </button>
                ))}
              </div>

              {/* Right: Desktop Auth & Theme Buttons */}
              <div className="hidden lg:flex items-center space-x-6">
                <button
                  onClick={toggleTheme}
                  className="cursor-pointer text-gray-400 hover:text-fuchsia-400 transition-colors focus:outline-none"
                  aria-label="Toggle Theme"
                >
                  {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                </button>
                <div className="w-px h-6 bg-purple-900/50"></div>
                <Link to="/login" className="cursor-pointer text-purple-300 font-semibold hover:text-white transition-colors">
                  Login
                </Link>
                <Link to="/register" className="cursor-pointer px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-500 font-medium transition-all shadow-md active:scale-95">
                  Register
                </Link>
              </div>

              {/* Mobile / Tablet Menu Toggle & Theme */}
              <div className="lg:hidden flex items-center gap-4">
                <button
                  onClick={toggleTheme}
                  className="cursor-pointer text-gray-400 hover:text-fuchsia-400 focus:outline-none"
                >
                  {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                </button>
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="cursor-pointer text-gray-300 hover:text-white focus:outline-none p-1"
                >
                  {isMobileMenuOpen ? <X className="w-7 h-7" /> : <MoreVertical className="w-7 h-7" />}
                </button>
              </div>

            </div>
          </div>

          {/* Mobile Dropdown Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden absolute top-20 left-0 w-full bg-[#0f0a1c] border-b border-purple-900/50 shadow-2xl flex flex-col py-3 px-5 space-y-1 sm:space-y-2">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => scrollToSection(link.id)}
                  className="cursor-pointer text-left text-gray-300 hover:text-white font-medium py-2 text-base sm:text-lg focus:outline-none transition-colors"
                >
                  {link.name}
                </button>
              ))}

              {/* Mobile Auth Buttons side-by-side */}
              <div className="border-t border-purple-900/50 my-2 pt-4 pb-2 flex flex-row items-center gap-4">
                <Link to="/login" className="cursor-pointer flex-1 text-center py-2.5 border border-purple-600 text-purple-300 rounded-lg hover:bg-purple-900/50 hover:text-white font-medium transition-all text-base sm:text-lg active:scale-95">
                  Login
                </Link>
                <Link to="/register" className="cursor-pointer flex-1 text-center py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-500 font-medium transition-all shadow-md text-base sm:text-lg active:scale-95">
                  Register
                </Link>
              </div>
            </div>
          )}
        </nav>

        {/* ---------------- HERO SECTION ---------------- */}
        <section id="home" className="pt-28 pb-16 sm:pt-36 sm:pb-24 bg-gradient-to-br from-purple-50 via-white to-fuchsia-50 dark:from-[#0a0514] dark:via-[#110822] dark:to-[#1a0a29] transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium text-xs sm:text-sm mb-6 sm:mb-8 border border-purple-200 dark:border-purple-800/50">
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
              The Future of Remote Evaluation
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4 sm:mb-6 leading-tight sm:leading-tight transition-colors duration-300">
              Assess Tech Talent with <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-fuchsia-600 dark:from-purple-400 dark:to-fuchsia-500 py-2 sm:py-4 inline-block">
                Absolute Certainty
              </span>
            </h1>

            <p className="mt-2 sm:mt-6 max-w-2xl text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 mx-auto mb-8 sm:mb-10 leading-relaxed px-2 transition-colors duration-300">
              Stop relying on unmonitored assignments. Pro Grade delivers a secure, AI-assisted proctoring environment designed specifically for complex coding challenges and technical evaluations.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4 sm:px-0">
              <Link to="/register" className="cursor-pointer px-6 sm:px-8 py-3 sm:py-4 bg-purple-600 text-white text-base sm:text-lg font-semibold rounded-lg shadow-lg hover:bg-purple-700 transition-all active:scale-95 flex items-center justify-center gap-2">
                Start Free Trial <Zap className="w-5 h-5" />
              </Link>
              <button onClick={() => scrollToSection('why-us')} className="cursor-pointer px-6 sm:px-8 py-3 sm:py-4 bg-white dark:bg-[#1a0a29] text-purple-700 dark:text-purple-400 text-base sm:text-lg font-semibold rounded-lg shadow-md border border-gray-200 dark:border-purple-900/50 hover:bg-gray-50 dark:hover:bg-[#230f38] transition-all flex items-center justify-center focus:outline-none">
                Explore Features
              </button>
            </div>
          </div>
        </section>

        {/* ---------------- ABOUT US (With 3D Box Effects) ---------------- */}
        <section id="about" className="py-16 sm:py-24 bg-white dark:bg-[#0a0514] transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white transition-colors">About Us</h2>
              <div className="mt-2 w-16 sm:w-24 h-1 bg-purple-600 mx-auto rounded-full"></div>
            </div>
            <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-purple-900 dark:text-purple-400 transition-colors">Empowering the Future of Tech Talent</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-4 sm:mb-6 transition-colors">
                  Pro Grade was built by developers, for developers. We recognized the need for an assessment platform that doesn't just test basic syntax, but genuinely evaluates a candidate's problem-solving skills in a secure, robust environment.
                </p>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed transition-colors">
                  Whether you are a university conducting massive scale exams or a tech company hiring elite talent, our automated grading and anti-cheat mechanisms ensure you get accurate, reliable results every time.
                </p>
              </div>

              {/* UPDATED: 3D Animated Icon Grid */}
              <div className="bg-purple-50 dark:bg-[#130a2a] rounded-3xl h-72 sm:h-80 flex items-center justify-center p-6 sm:p-8 relative overflow-hidden shadow-inner border border-purple-100 dark:border-purple-900/30">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10"></div>

                <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full h-full relative z-10 p-2">
                  {/* Top Left - 3D Box */}
                  <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl shadow-[4px_4px_15px_rgba(147,51,234,0.3),inset_-2px_-2px_6px_rgba(0,0,0,0.2),inset_2px_2px_6px_rgba(255,255,255,0.4)] flex items-center justify-center transform hover:-translate-y-2 hover:scale-105 transition-all duration-300 cursor-pointer">
                    <Code className="w-10 h-10 sm:w-12 sm:h-12 text-white drop-shadow-md" />
                  </div>
                  {/* Top Right - 3D Box (Offset Down) */}
                  <div className="bg-gradient-to-br from-fuchsia-400 to-fuchsia-600 rounded-2xl rounded-br-[3rem] sm:rounded-br-[4rem] shadow-[4px_4px_15px_rgba(217,70,239,0.3),inset_-2px_-2px_6px_rgba(0,0,0,0.2),inset_2px_2px_6px_rgba(255,255,255,0.4)] flex items-center justify-center transform translate-y-4 hover:translate-y-2 hover:scale-105 transition-all duration-300 cursor-pointer">
                    <Cpu className="w-10 h-10 sm:w-12 sm:h-12 text-white drop-shadow-md" />
                  </div>
                  {/* Bottom Left - 3D Box (Offset Up) */}
                  <div className="bg-gradient-to-br from-fuchsia-400 to-fuchsia-600 rounded-2xl rounded-tl-[3rem] sm:rounded-tl-[4rem] shadow-[4px_4px_15px_rgba(217,70,239,0.3),inset_-2px_-2px_6px_rgba(0,0,0,0.2),inset_2px_2px_6px_rgba(255,255,255,0.4)] flex items-center justify-center transform -translate-y-4 hover:-translate-y-6 hover:scale-105 transition-all duration-300 cursor-pointer">
                    <Globe className="w-10 h-10 sm:w-12 sm:h-12 text-white drop-shadow-md" />
                  </div>
                  {/* Bottom Right - 3D Box */}
                  <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl shadow-[4px_4px_15px_rgba(147,51,234,0.3),inset_-2px_-2px_6px_rgba(0,0,0,0.2),inset_2px_2px_6px_rgba(255,255,255,0.4)] flex items-center justify-center transform hover:-translate-y-2 hover:scale-105 transition-all duration-300 cursor-pointer">
                    <Lock className="w-10 h-10 sm:w-12 sm:h-12 text-white drop-shadow-md" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- WHY US ---------------- */}
        <section id="why-us" className="py-16 sm:py-24 bg-gray-50 dark:bg-[#130a2a] transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white transition-colors">Why Choose Pro Grade?</h2>
              <div className="mt-2 w-16 sm:w-24 h-1 bg-purple-600 mx-auto rounded-full"></div>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="bg-white dark:bg-[#1a0d36] p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30 hover:shadow-xl dark:hover:shadow-purple-900/20 transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
                  <Shield className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-900 dark:text-white">Secure & Proctored</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">Advanced tab-switch detection, copy-paste prevention, and automated behavior tracking ensure absolute academic integrity.</p>
              </div>
              <div className="bg-white dark:bg-[#1a0d36] p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30 hover:shadow-xl dark:hover:shadow-purple-900/20 transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
                  <Zap className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-900 dark:text-white">Real-time Analytics</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">Instant grading and comprehensive dashboards give admins deep insights into performance metrics the moment a test ends.</p>
              </div>
              <div className="bg-white dark:bg-[#1a0d36] p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30 hover:shadow-xl dark:hover:shadow-purple-900/20 transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
                  <Award className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-900 dark:text-white">Production-Grade</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">Built on modern architecture (React + Spring Boot) to handle thousands of concurrent students without breaking a sweat.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- STEPS TO JOIN ---------------- */}
        <section className="py-16 sm:py-24 bg-white dark:bg-[#0a0514] transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white transition-colors">How It Works</h2>
              <div className="mt-2 w-16 sm:w-24 h-1 bg-purple-600 mx-auto rounded-full"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative">

              <div className="relative z-10">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-purple-50 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-3 sm:mb-4 border-2 border-purple-200 dark:border-purple-700/50">
                  <UserPlus className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h4 className="font-bold text-base sm:text-lg mb-1 sm:mb-2 dark:text-white">1. Register</h4>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Create your account in seconds.</p>
                <div className="hidden md:block absolute top-10 left-[60%] w-[100%] h-[2px] bg-gradient-to-r from-purple-200 dark:from-purple-800 to-transparent -z-10"></div>
              </div>

              <div className="relative z-10">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-purple-50 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-3 sm:mb-4 border-2 border-purple-200 dark:border-purple-700/50">
                  <LogIn className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h4 className="font-bold text-base sm:text-lg mb-1 sm:mb-2 dark:text-white">2. Login</h4>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Access your secure dashboard.</p>
                <div className="hidden md:block absolute top-10 left-[60%] w-[100%] h-[2px] bg-gradient-to-r from-purple-200 dark:from-purple-800 to-transparent -z-10"></div>
              </div>

              <div className="relative z-10">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-purple-50 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-3 sm:mb-4 border-2 border-purple-200 dark:border-purple-700/50">
                  <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h4 className="font-bold text-base sm:text-lg mb-1 sm:mb-2 dark:text-white">3. Take Exam</h4>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Complete your technical assessment.</p>
                <div className="hidden md:block absolute top-10 left-[60%] w-[100%] h-[2px] bg-gradient-to-r from-purple-200 dark:from-purple-800 to-transparent -z-10"></div>
              </div>

              <div className="relative z-10">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-purple-600 rounded-full flex items-center justify-center mb-3 sm:mb-4 shadow-lg shadow-purple-300 dark:shadow-purple-900/50 ring-4 ring-purple-100 dark:ring-purple-900/30">
                  <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h4 className="font-bold text-base sm:text-lg mb-1 sm:mb-2 dark:text-white">4. Get Results</h4>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">View real-time grades and analytics.</p>
              </div>

            </div>
          </div>
        </section>

        {/* ---------------- CONTACT US (Stays dark regardless of theme) ---------------- */}
        <section id="contact" className="py-16 sm:py-24 bg-gradient-to-b from-gray-900 to-purple-950 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 sm:gap-16 items-center">

              {/* Contact Info Side */}
              <div>
                <div className="inline-block px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-purple-800/50 text-purple-200 text-xs sm:text-sm font-medium mb-4 sm:mb-6 border border-purple-700/50">
                  We're here to help
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 sm:mb-6 tracking-tight text-white">Let's level up your hiring process.</h2>
                <p className="text-gray-300 mb-8 sm:mb-10 text-base sm:text-lg leading-relaxed">
                  Have questions about enterprise pricing, custom LMS integrations, or technical support? Drop us a message and our engineering team will get back to you promptly.
                </p>

                <div className="space-y-6 sm:space-y-8">
                  <div className="flex items-start gap-4 sm:gap-5">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-800/50 flex items-center justify-center shrink-0 border border-purple-700/50">
                      <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-fuchsia-400" />
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-semibold text-white">Email Us</h4>
                      <p className="text-sm sm:text-base text-gray-400 mt-1">support@prograde.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 sm:gap-5">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-800/50 flex items-center justify-center shrink-0 border border-purple-700/50">
                      <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-fuchsia-400" />
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-semibold text-white">Call Us</h4>
                      <p className="text-sm sm:text-base text-gray-400 mt-1">+1 (555) 123-4567</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 sm:gap-5">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-800/50 flex items-center justify-center shrink-0 border border-purple-700/50">
                      <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-fuchsia-400" />
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-semibold text-white">Visit Us</h4>
                      <p className="text-sm sm:text-base text-gray-400 mt-1">Tech Park, Bhubaneswar, Odisha, India</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-white dark:bg-[#1a0d36] rounded-2xl p-6 sm:p-8 md:p-10 text-gray-900 dark:text-white shadow-2xl relative transition-colors duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 dark:from-purple-900/20 to-transparent rounded-2xl pointer-events-none"></div>

                <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2 relative z-10">Send a Message</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 sm:mb-8 relative z-10 text-xs sm:text-sm">Fill out the form below and we'll be in touch.</p>

                <form className="space-y-4 sm:space-y-5 relative z-10">
                  <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">First Name</label>
                      <input type="text" className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 dark:bg-[#0f0a1c] border border-gray-200 dark:border-purple-900/50 rounded-xl focus:bg-white dark:focus:bg-[#150a29] focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all text-sm" placeholder="Ajit" />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Last Name</label>
                      <input type="text" className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 dark:bg-[#0f0a1c] border border-gray-200 dark:border-purple-900/50 rounded-xl focus:bg-white dark:focus:bg-[#150a29] focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all text-sm" placeholder="Panigrahy" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Work Email</label>
                    <input type="email" className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 dark:bg-[#0f0a1c] border border-gray-200 dark:border-purple-900/50 rounded-xl focus:bg-white dark:focus:bg-[#150a29] focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all text-sm" placeholder="ajit@company.com" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">How can we help?</label>
                    <textarea rows={4} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 dark:bg-[#0f0a1c] border border-gray-200 dark:border-purple-900/50 rounded-xl focus:bg-white dark:focus:bg-[#150a29] focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all resize-none text-sm" placeholder="Tell us about your requirements..."></textarea>
                  </div>
                  <button type="button" className="cursor-pointer w-full py-3 sm:py-4 bg-purple-600 text-white rounded-xl font-bold text-base sm:text-lg hover:bg-purple-700 shadow-lg shadow-purple-200 dark:shadow-purple-900/50 transition-all active:scale-[0.98]">
                    Submit Request
                  </button>
                </form>
              </div>

            </div>
          </div>
        </section>

        {/* ---------------- FOOTER ---------------- */}
        <footer className="bg-[#0f0a1c] text-gray-400 py-12 sm:py-16 border-t border-purple-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid sm:grid-cols-2 md:grid-cols-4 gap-10 sm:gap-12">

            {/* Brand Col */}
            <div className="sm:col-span-2 md:col-span-1">
              <button onClick={() => scrollToSection('top')} className="flex items-center gap-2 mb-4 sm:mb-6 cursor-pointer focus:outline-none">
                <img src={logo} alt="Logo" className="w-7 h-7 sm:w-8 sm:h-8 opacity-90" />
                <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">Pro Grade</span>
              </button>
              <p className="text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6">Setting the new standard for secure, reliable technical assessments and engineering evaluation.</p>
            </div>

            {/* Links Col 1 */}
            <div>
              <h4 className="text-white font-semibold mb-4 sm:mb-6 text-base sm:text-lg">Platform</h4>
              <ul className="space-y-3 sm:space-y-4 text-xs sm:text-sm flex flex-col items-start">
                <li>
                  <button className="relative cursor-pointer text-gray-400 hover:text-white transition-colors group focus:outline-none">
                    Features
                    <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-purple-500 transition-all duration-300 ease-out group-hover:w-full"></span>
                  </button>
                </li>
                <li>
                  <button className="relative cursor-pointer text-gray-400 hover:text-white transition-colors group focus:outline-none">
                    Enterprise Pricing
                    <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-purple-500 transition-all duration-300 ease-out group-hover:w-full"></span>
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('about')} className="relative cursor-pointer text-gray-400 hover:text-white transition-colors group focus:outline-none">
                    About Us
                    <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-purple-500 transition-all duration-300 ease-out group-hover:w-full"></span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Links Col 2 */}
            <div>
              <h4 className="text-white font-semibold mb-4 sm:mb-6 text-base sm:text-lg">Legal</h4>
              <ul className="space-y-3 sm:space-y-4 text-xs sm:text-sm flex flex-col items-start">
                <li>
                  <Link to="/privacy" className="relative cursor-pointer text-gray-400 hover:text-white transition-colors group focus:outline-none">
                    Privacy Policy
                    <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-purple-500 transition-all duration-300 ease-out group-hover:w-full"></span>
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="relative cursor-pointer text-gray-400 hover:text-white transition-colors group focus:outline-none">
                    Terms of Service
                    <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-purple-500 transition-all duration-300 ease-out group-hover:w-full"></span>
                  </Link>
                </li>
                <li>
                  <Link to="/cookies" className="relative cursor-pointer text-gray-400 hover:text-white transition-colors group focus:outline-none">
                    Cookie Policy
                    <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-purple-500 transition-all duration-300 ease-out group-hover:w-full"></span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Socials Col */}
            <div>
              <h4 className="text-white font-semibold mb-4 sm:mb-6 text-base sm:text-lg">Connect</h4>
              <div className="flex gap-3 sm:gap-4">
                <a href="https://www.instagram.com/ajiitpanigrahy/" aria-label="Instagram" className="cursor-pointer w-8 h-8 sm:w-10 sm:h-10 bg-purple-900/40 rounded-full flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all border border-purple-800/50">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="https://github.com/ajiitpanigrahy" aria-label="GitHub" className="cursor-pointer w-8 h-8 sm:w-10 sm:h-10 bg-purple-900/40 rounded-full flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all border border-purple-800/50">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="https://www.linkedin.com/in/ajitpanigrahy" aria-label="LinkedIn" className="cursor-pointer w-8 h-8 sm:w-10 sm:h-10 bg-purple-900/40 rounded-full flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all border border-purple-800/50">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-purple-900/30 text-center text-xs sm:text-sm">
            <p>&copy; {new Date().getFullYear()} Pro Grade. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}