import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-800 border-t border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <h2 className="text-2xl font-bold text-white mb-4">
              Voice<span className="text-blue-400">Mart</span>
            </h2>
            <p className="text-gray-400 text-sm">
              Making e-commerce accessible for everyone through voice technology.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-400 hover:text-white transition-colors text-sm">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <span className="text-gray-400 text-sm">Electronics</span>
              </li>
              <li>
                <span className="text-gray-400 text-sm">Clothing</span>
              </li>
              <li>
                <span className="text-gray-400 text-sm">Home & Garden</span>
              </li>
              <li>
                <span className="text-gray-400 text-sm">Sports</span>
              </li>
            </ul>
          </div>

          {/* Voice Commands Help */}
          <div>
            <h3 className="text-white font-semibold mb-4">Voice Commands</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Say &quot;listen now&quot; to start</li>
              <li>&quot;scroll up/down&quot; to navigate</li>
              <li>&quot;select [product]&quot; to choose</li>
              <li>&quot;add to cart&quot; to purchase</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 VoiceMart. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">
              Terms of Service
            </Link>
            <Link href="/accessibility" className="text-gray-400 hover:text-white transition-colors text-sm">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}