import { Link } from 'react-router-dom';

export default function HomePage() {
  // Landing page for selecting the demo login method.
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-white">TaskOn Embed Demo</h1>
          <p className="text-gray-300 mt-1">White label integration examples</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Choose Your Login Method</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Explore different integration approaches for the TaskOn Embed SDK
          </p>
        </div>

        {/* Demo Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* EVM Wallet Demo */}
          <Link to="/evm" className="group">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">EVM Wallet Demo</h3>
                <p className="text-gray-300 mb-6">
                  Connect with MetaMask and other EVM-compatible wallets using RainbowKit integration
                </p>
                <div className="inline-flex items-center text-blue-400 font-medium group-hover:text-blue-300 transition-colors">
                  Try EVM Login
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* Email Demo */}
          <Link to="/email" className="group">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Email Demo</h3>
                <p className="text-gray-300 mb-6">
                  Simple email-based authentication with cryptographic signatures for secure login
                </p>
                <div className="inline-flex items-center text-blue-400 font-medium group-hover:text-blue-300 transition-colors">
                  Try Email Login
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Features */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-white mb-8">Features</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h4 className="text-lg font-semibold text-white mb-2">Secure Authentication</h4>
              <p className="text-gray-300 text-sm">
                RSA-PKCS1v15 signatures with SHA-256 for tamper-proof authentication
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h4 className="text-lg font-semibold text-white mb-2">Multiple Login Methods</h4>
              <p className="text-gray-300 text-sm">Support for wallet connections and email-based authentication</p>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h4 className="text-lg font-semibold text-white mb-2">Easy Integration</h4>
              <p className="text-gray-300 text-sm">Simple SDK integration with customizable UI components</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
