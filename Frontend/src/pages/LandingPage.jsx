import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, MessageSquare, Users, Rocket, ExternalLink, Github, Linkedin } from 'lucide-react';
import heroImage from '../assets/sideGif.gif';
import LandingNavbar from '../components/LandingNavbar';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-[#60A5FA] selection:dark:text-white text-gray-900 dark:selection:text-black">
      {/* Navigation */}
      <LandingNavbar />

      {/* Hero Section */}
      <main className="flex-grow relative">
        {/* Background decoration - Desktop only specific blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none hidden lg:block">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#2563EB]/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[10%] right-[-5%] w-[600px] h-[600px] bg-[#1E3A8A]/40 dark:bg-[#1E3A8A]/40 bg-[#93C5FD]/20 rounded-full blur-[120px]"></div>
        </div>

        <section className="relative pt-20 pb-20 lg:pt-20 lg:pb-32 min-h-[90vh] lg:min-h-0 flex items-center lg:block">
          {/* Mobile Background Image */}
          <div className="absolute inset-0 lg:hidden overflow-hidden">
            <div className="absolute inset-0 dark:bg-black/60 bg-white/60 z-10"></div>
            <img
              src={heroImage}
              alt="Background"
              className="w-full h-full object-cover opacity-50"
            />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full">
            <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
              <div className="text-center md:max-w-3xl md:mx-auto lg:col-span-6 lg:text-left animate-fade-in-up">
                <div className="inline-flex items-center rounded-full border border-[#60A5FA]/30 px-4 py-1.5 text-sm font-semibold transition-colors dark:bg-[#1E3A8A]/50 bg-[#DBEAFE] text-[#60A5FA] dark:text-[#60A5FA] mb-6 backdrop-blur-sm shadow-[0_0_15px_rgba(96,165,250,0.2)]">
                  <span className="flex h-2 w-2 rounded-full bg-[#60A5FA] mr-2 animate-pulse"></span>
                  v1.0 Now Live
                </div>
                <h1 className="text-4xl xs:text-5xl tracking-tight font-extrabold dark:text-white text-gray-900 sm:text-6xl md:text-7xl mb-6 leading-tight drop-shadow-xl">
                  <span className="block">Collaborate locally,</span>
                  <span className="block bg-gradient-to-r from-[#60A5FA] via-[#3B82F6] to-[#2563EB] bg-clip-text text-transparent pb-2">Build globally.</span>
                </h1>
                <p className="mt-4 text-lg dark:text-gray-200 text-gray-700 sm:mt-5 sm:text-xl lg:text-xl leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  The ultimate platform for developers to find peers, create sprints, and build amazing software together in real-time. Experience the power of sync.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link
                    to="/auth/register"
                    className="inline-flex items-center justify-center rounded-full text-base font-bold bg-[#2563EB] text-white hover:bg-[#3B82F6] h-14 px-10 py-3 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto"
                  >
                    Start Building
                    <Rocket className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    to="/auth/login"
                    className="inline-flex items-center justify-center rounded-full text-base font-bold border-2 border-[#60A5FA]/50 dark:text-white text-gray-900 hover:bg-[#60A5FA]/10 hover:border-[#60A5FA] h-14 px-10 py-3 transition-all duration-300 w-full sm:w-auto backdrop-blur-sm"
                  >
                    View Demo
                  </Link>
                </div>
              </div>

              {/* Desktop Image Section - Hidden on Mobile */}
              <div className="hidden lg:block mt-16 sm:mt-24 lg:mt-0 lg:col-span-6 lg:flex lg:items-center relative animate-fade-in transform  hover:scale-110 transition-transform ease-in-out duration-700">
                {/* Glow effect behind image */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#2563EB] to-[#60A5FA] blur-[80px] opacity-30 dark:opacity-30 opacity-20 rounded-full transform scale-90"></div>
                <div className="relative mx-auto w-full rounded-3xl shadow-xl lg:max-w-md overflow-hidden border border-[#60A5FA]/20 dark:bg-[#111]/40 bg-white/40 backdrop-blur-sm p-2">
                  <div className="rounded-2xl overflow-hidden relative">
                    <img
                      src={heroImage}
                      alt="Developer Collaboration"
                      className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-transparent to-transparent opacity-60 dark:opacity-60 opacity-30"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Features Section */}
        <section id="features" className="py-24 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-3xl font-extrabold dark:text-white text-gray-900 sm:text-4xl lg:text-5xl mb-6">
                Everything you need to <span className="text-[#60A5FA]">ship faster</span>
              </h2>
              <p className="mt-4 text-xl dark:text-gray-400 text-gray-600">
                DevHub provides the essential tools to streamline your collaborative development process.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Users className="h-8 w-8 text-[#60A5FA]" />,
                  title: "Team Formation",
                  description: "Find the perfect teammates based on skills, timezone, and project interests."
                },
                {
                  icon: <MessageSquare className="h-8 w-8 text-[#60A5FA]" />,
                  title: "Real-time Chat",
                  description: "Seamless communication with integrated chat rooms for every sprint and team."
                },
                {
                  icon: <Rocket className="h-8 w-8 text-[#60A5FA]" />,
                  title: "Sprint Management",
                  description: "Organize your workflow with intuitive kanban boards and sprint tracking."
                }
              ].map((feature, index) => (
                <div key={index} className="group relative dark:bg-gradient-to-br dark:from-[#1a1a1a] dark:to-[#0d0d0d] bg-gradient-to-br from-white to-gray-50 border border-[#2563EB]/30 dark:border-[#2563EB]/30 border-[#93C5FD]/40 rounded-3xl p-8 hover:shadow-[0_0_30px_rgba(37,99,235,0.15)] dark:hover:shadow-[0_0_30px_rgba(37,99,235,0.15)] hover:shadow-[0_0_30px_rgba(37,99,235,0.1)] hover:border-[#60A5FA]/50 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/5 to-[#60A5FA]/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="h-16 w-16 rounded-2xl dark:bg-[#1E3A8A] bg-[#DBEAFE] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border dark:border-[#2563EB]/30 border-[#93C5FD]/50">
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl font-bold dark:text-white text-gray-900 mb-3 group-hover:text-[#60A5FA] transition-colors">{feature.title}</h3>
                    <p className="dark:text-gray-400 text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 dark:bg-gradient-to-r dark:from-[#1E3A8A] dark:via-[#111] dark:to-[#1E3A8A] bg-gradient-to-r from-[#DBEAFE] via-[#EFF6FF] to-[#DBEAFE] opacity-90"></div>
          {/* Decorative blurs */}
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#2563EB]/30 dark:bg-[#2563EB]/30 bg-[#2563EB]/15 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#60A5FA]/20 dark:bg-[#60A5FA]/20 bg-[#60A5FA]/10 rounded-full blur-[100px]"></div>

          <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
            <h2 className="text-4xl sm:text-5xl font-bold mb-8 dark:text-white text-gray-900">Ready to start your journey?</h2>
            <p className="text-xl dark:text-gray-300 text-gray-600 mb-10 max-w-2xl mx-auto">Join thousands of developers building the future together. Create your profile and find your sprint team today.</p>
            <Link
              to="/auth/register"
              className="inline-block bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:from-[#3B82F6] hover:to-[#2563EB] text-white px-10 py-4 rounded-full font-bold text-lg shadow-[0_0_20px_rgba(37,99,235,0.5)] hover:shadow-[0_0_40px_rgba(37,99,235,0.7)] hover:-translate-y-1 transition-all duration-300"
            >
              Join DevConnect Today
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="dark:bg-black bg-white border-t border-[#2563EB]/30 dark:border-[#2563EB]/30 border-[#93C5FD]/30 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl dark:text-white text-gray-900">DevConnect</span>
            </div>
            <p className="text-sm dark:text-gray-500 text-gray-500">© 2026 DevConnect Platform. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="https://github.com/OmkarPatil-10/DevConnect" className="dark:text-gray-500 text-gray-400 hover:text-[#60A5FA] transition-colors"><Github className="h-6 w-6" /></Link>
              <Link to="https://www.linkedin.com/in/omkar10patil/" className="dark:text-gray-500 text-gray-400 hover:text-[#60A5FA] transition-colors"><Linkedin className="h-6 w-6" /></Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
