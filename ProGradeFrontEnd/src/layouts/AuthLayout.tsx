import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, Code, Cpu, MoreVertical, X, Sun, Moon, BarChart3 
} from 'lucide-react';
import logo from '../assets/logo.svg';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // 🌟 FIX: Initialize from localStorage just like the Dashboard!
  const [isDarkMode, setIsDarkMode] = useState(() => {
      const savedTheme = localStorage.getItem('theme');
      return savedTheme ? savedTheme === 'dark' : true;
  });

  // 🌟 FIX: Inject the 'dark' class into the global HTML root
  useEffect(() => {
      const root = document.documentElement;
      if (isDarkMode) {
          root.classList.add('dark');
          document.body.style.backgroundColor = '#0a0514'; 
          localStorage.setItem('theme', 'dark');
      } else {
          root.classList.remove('dark');
          document.body.style.backgroundColor = '#ffffff'; 
          localStorage.setItem('theme', 'light');
      }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/#about' },
    { name: 'Why Us', path: '/#why-us' },
    { name: 'Career', path: '/#career' },
    { name: 'Contact Us', path: '/#contact' }
  ];

  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      {/* 🌟 INJECTED CUSTOM ANIMATIONS FOR 3D FLOATING EFFECTS */}
      <style>{`
        @keyframes orbDrift {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(40px, -50px) scale(1.1); }
          66% { transform: translate(-30px, 40px) scale(0.9); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) translateZ(60px); }
          50% { transform: translateY(-10px) translateZ(60px); }
        }
        @keyframes floatMedium {
          0%, 100% { transform: translateY(0px) translateZ(90px); }
          50% { transform: translateY(-15px) translateZ(90px); }
        }
        @keyframes floatFast {
          0%, 100% { transform: translateY(0px) translateZ(120px); }
          50% { transform: translateY(-20px) translateZ(120px); }
        }
      `}</style>

      <div className="min-h-screen bg-white dark:bg-[#0a0514] font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300 flex flex-col">
        
        {/* ---------------- NAVBAR ---------------- */}
        <nav className="fixed w-full bg-[#0f0a1c] border-b border-purple-900/50 z-50 top-0 transition-all h-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex justify-between items-center">
            
            <a href="/" className="flex items-center gap-2 sm:gap-3 cursor-pointer group focus:outline-none">
              <img src={logo} alt="Pro Grade Logo" className="w-8 h-8 sm:w-10 sm:h-10 group-hover:scale-105 transition-transform" />
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-500">
                Pro Grade
              </span>
            </a>

            <div className="hidden lg:flex space-x-8">
              {navLinks.map((link) => (
                <a 
                  key={link.name}
                  href={link.path}
                  className="relative cursor-pointer text-gray-300 hover:text-white font-medium transition-colors group py-2 focus:outline-none"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-fuchsia-500 transition-all duration-300 ease-out group-hover:w-full"></span>
                </a>
              ))}
            </div>

            <div className="hidden lg:flex items-center space-x-6">
              <button onClick={toggleTheme} className="cursor-pointer text-gray-400 hover:text-fuchsia-400 transition-colors focus:outline-none">
                {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
              </button>
              <div className="w-px h-6 bg-purple-900/50"></div>
              <Link to="/login" className="cursor-pointer text-white font-semibold hover:text-purple-300 transition-colors">
                Login
              </Link>
              <Link to="/register" className="cursor-pointer px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-500 font-medium transition-all shadow-md active:scale-95">
                Register
              </Link>
            </div>

            <div className="lg:hidden flex items-center gap-4">
              <button onClick={toggleTheme} className="cursor-pointer text-gray-400 hover:text-fuchsia-400 focus:outline-none">
                {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
              </button>
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="cursor-pointer text-gray-300 hover:text-white focus:outline-none p-1">
                {isMobileMenuOpen ? <X className="w-7 h-7" /> : <MoreVertical className="w-7 h-7" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden absolute top-20 left-0 w-full bg-[#0f0a1c] border-b border-purple-900/50 shadow-2xl flex flex-col py-3 px-5 space-y-1 sm:space-y-2">
              {navLinks.map((link) => (
                <a 
                  key={link.name}
                  href={link.path}
                  className="cursor-pointer text-left text-gray-300 hover:text-white font-medium py-2 text-base sm:text-lg focus:outline-none transition-colors"
                >
                  {link.name}
                </a>
              ))}
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

        {/* ---------------- SPLIT SCREEN CONTENT ---------------- */}
        <div className="flex-1 flex flex-col lg:flex-row mt-20">
          
          {/* 🌟 UPGRADED LEFT SIDE: Live 3D Visual/Branding Environment */}
          <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-950 via-[#0a0514] to-black relative overflow-hidden flex-col justify-center items-center p-12 border-r border-purple-900/30 group">
            
            {/* 🌟 Ambient Glowing Orbs with Organic Drift Animation */}
            <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-purple-600/30 rounded-full blur-[120px] mix-blend-screen pointer-events-none" style={{ animation: 'orbDrift 15s ease-in-out infinite alternate' }}></div>
            <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-fuchsia-600/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" style={{ animation: 'orbDrift 20s ease-in-out infinite alternate-reverse' }}></div>

            {/* 🌟 3D Glassmorphism Master Container */}
            {/* Starts with an extreme tilt, flattens out beautifully when the user's mouse hovers over the left panel */}
            <div className="relative z-10 w-full max-w-xl bg-white/5 dark:bg-black/20 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 flex flex-col shadow-[0_30px_60px_rgba(0,0,0,0.6)] transition-transform duration-1000 ease-out group-hover:[transform:perspective(2000px)_rotateY(-5deg)_rotateX(2deg)] [transform:perspective(2000px)_rotateY(-20deg)_rotateX(10deg)] [transform-style:preserve-3d]">
              
              {/* Background Glow inside the card */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent rounded-[3rem] pointer-events-none"></div>

              {/* Master Text Content (Translates Z slightly for depth) */}
              <div className="[transform:translateZ(40px)] transition-transform duration-1000 ease-out mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-3xl mb-8 flex items-center justify-center shadow-[0_0_40px_rgba(217,70,239,0.4)] border border-white/20">
                  <Shield className="w-10 h-10 text-white drop-shadow-lg" />
                </div>
                <h1 className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-purple-200 mb-6 leading-[1.15] tracking-tight drop-shadow-sm">
                  {title}
                </h1>
                <p className="text-purple-200/90 text-lg leading-relaxed font-medium">
                  {subtitle}
                </p>
              </div>

              {/* 🌟 Floating Feature Cards (3D Z-Depth & Continuous Hover Animation) */}
              <div className="space-y-5 [transform-style:preserve-3d] w-full mt-auto relative">
                  
                  {/* Feature 1: Slow Float */}
                  <div className="flex items-center gap-5 bg-white/10 hover:bg-white/20 p-5 rounded-2xl border border-white/10 hover:border-purple-400/50 shadow-xl backdrop-blur-md transition-all duration-300 cursor-default" style={{ animation: 'floatSlow 6s ease-in-out infinite' }}>
                    <div className="w-14 h-14 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-400/40 shrink-0 shadow-inner">
                      <Code className="w-7 h-7 text-purple-300" />
                    </div>
                    <div>
                      <h4 className="text-white font-black tracking-wide text-sm mb-1">Secure Execution Engine</h4>
                      <p className="text-xs text-purple-200/80 font-medium">Isolated compile environments preventing plagiarism.</p>
                    </div>
                  </div>
                  
                  {/* Feature 2: Medium Float (Pops out more!) */}
                  <div className="flex items-center gap-5 bg-white/10 hover:bg-white/20 p-5 rounded-2xl border border-white/10 hover:border-fuchsia-400/50 shadow-2xl backdrop-blur-md transition-all duration-300 cursor-default" style={{ animation: 'floatMedium 7s ease-in-out infinite', animationDelay: '1s' }}>
                    <div className="w-14 h-14 rounded-full bg-fuchsia-500/20 flex items-center justify-center border border-fuchsia-400/40 shrink-0 shadow-inner">
                      <Cpu className="w-7 h-7 text-fuchsia-300" />
                    </div>
                    <div>
                      <h4 className="text-white font-black tracking-wide text-sm mb-1">AI-Powered Proctoring</h4>
                      <p className="text-xs text-purple-200/80 font-medium">Real-time behavioral analysis and tab-lock security.</p>
                    </div>
                  </div>

                  {/* Feature 3: Fast Float (Pops out the most!) */}
                  <div className="flex items-center gap-5 bg-white/10 hover:bg-white/20 p-5 rounded-2xl border border-white/10 hover:border-blue-400/50 shadow-2xl backdrop-blur-md transition-all duration-300 cursor-default" style={{ animation: 'floatFast 8s ease-in-out infinite', animationDelay: '2s' }}>
                    <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-400/40 shrink-0 shadow-inner">
                      <BarChart3 className="w-7 h-7 text-blue-300" />
                    </div>
                    <div>
                      <h4 className="text-white font-black tracking-wide text-sm mb-1">Comprehensive Analytics</h4>
                      <p className="text-xs text-purple-200/80 font-medium">Deep-dive AI insights on student code performance.</p>
                    </div>
                  </div>

              </div>
            </div>
          </div>

          {/* Right Side: The Form */}
          <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-32 bg-gray-50 dark:bg-[#0a0514] transition-colors duration-300">
            <div className="mx-auto w-full max-w-md">
              {children}
            </div>
          </div>
        </div>

        {/* ---------------- FOOTER ---------------- */}
        <footer className="bg-[#0f0a1c] text-gray-400 py-12 sm:py-16 border-t border-purple-900/50 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid sm:grid-cols-2 md:grid-cols-4 gap-10 sm:gap-12">
            
            <div className="sm:col-span-2 md:col-span-1">
              <a href="/" className="flex items-center gap-2 mb-4 sm:mb-6 cursor-pointer focus:outline-none">
                <img src={logo} alt="Logo" className="w-7 h-7 sm:w-8 sm:h-8 opacity-90" />
                <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">Pro Grade</span>
              </a>
              <p className="text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6">Setting the new standard for secure, reliable technical assessments and engineering evaluation.</p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4 sm:mb-6 text-base sm:text-lg">Platform</h4>
              <ul className="space-y-3 sm:space-y-4 text-xs sm:text-sm flex flex-col items-start">
                <li><a href="/" className="relative cursor-pointer text-gray-400 hover:text-white transition-colors group focus:outline-none">Features<span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-purple-500 transition-all duration-300 ease-out group-hover:w-full"></span></a></li>
                <li><a href="/" className="relative cursor-pointer text-gray-400 hover:text-white transition-colors group focus:outline-none">Enterprise Pricing<span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-purple-500 transition-all duration-300 ease-out group-hover:w-full"></span></a></li>
                <li><a href="/#about" className="relative cursor-pointer text-gray-400 hover:text-white transition-colors group focus:outline-none">About Us<span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-purple-500 transition-all duration-300 ease-out group-hover:w-full"></span></a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 sm:mb-6 text-base sm:text-lg">Legal</h4>
              <ul className="space-y-3 sm:space-y-4 text-xs sm:text-sm flex flex-col items-start">
                <li><a href="/" className="relative cursor-pointer text-gray-400 hover:text-white transition-colors group focus:outline-none">Privacy Policy<span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-purple-500 transition-all duration-300 ease-out group-hover:w-full"></span></a></li>
                <li><a href="/" className="relative cursor-pointer text-gray-400 hover:text-white transition-colors group focus:outline-none">Terms of Service<span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-purple-500 transition-all duration-300 ease-out group-hover:w-full"></span></a></li>
                <li><a href="/" className="relative cursor-pointer text-gray-400 hover:text-white transition-colors group focus:outline-none">Cookie Policy<span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-purple-500 transition-all duration-300 ease-out group-hover:w-full"></span></a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 sm:mb-6 text-base sm:text-lg">Connect</h4>
              <div className="flex gap-3 sm:gap-4">
                <a href="https://www.instagram.com/ajiitpanigrahy/" aria-label="Instagram" className="cursor-pointer w-8 h-8 sm:w-10 sm:h-10 bg-purple-900/40 rounded-full flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all border border-purple-800/50">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
                </a>
                <a href="https://github.com/ajiitpanigrahy" aria-label="GitHub" className="cursor-pointer w-8 h-8 sm:w-10 sm:h-10 bg-purple-900/40 rounded-full flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all border border-purple-800/50">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                </a>
                <a href="https://www.linkedin.com/in/ajitpanigrahy" aria-label="LinkedIn" className="cursor-pointer w-8 h-8 sm:w-10 sm:h-10 bg-purple-900/40 rounded-full flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all border border-purple-800/50">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" /></svg>
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