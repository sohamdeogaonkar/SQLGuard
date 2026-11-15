'use client';

import { useState } from 'react';
import {
  Search,
  ShoppingBag,
  Star,
  ShieldAlert,
  SlidersHorizontal,
  Check,
  Package,
  RotateCcw,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { recordInspection } from '../../../lib/store';
import FloatingAttackBench from '../../../components/FloatingAttackBench';

const PRODUCTS = [
  {
    id: 1,
    name: 'AeroPro Wireless Noise-Cancelling Headphones',
    category: 'Audio',
    price: 349.99,
    rating: 4.9,
    reviews: 214,
    stock: 'In Stock',
    specs: '40mm Beryllium Drivers • 45h Playtime • LDAC',
  },
  {
    id: 2,
    name: 'CyberKey Apex Mechanical Keyboard',
    category: 'Keyboards',
    price: 179.00,
    rating: 4.8,
    reviews: 189,
    stock: 'In Stock',
    specs: 'Hot-swappable Gateron Oil Kings • PBT Keycaps • CNC Aluminum',
  },
  {
    id: 3,
    name: 'UltraView 34-inch Curved OLED Studio Monitor',
    category: 'Displays',
    price: 899.99,
    rating: 5.0,
    reviews: 94,
    stock: 'Low Stock',
    specs: '175Hz 0.03ms • 99.3% DCI-P3 • USB-C 90W PD',
  },
  {
    id: 4,
    name: 'PulseTrack Pro Smart Fitness & Bio Watch',
    category: 'Wearables',
    price: 229.50,
    rating: 4.7,
    reviews: 342,
    stock: 'In Stock',
    specs: 'ECG • Blood Oxygen • Dual-Frequency GPS • 14-day Battery',
  },
  {
    id: 5,
    name: 'NovaCharge 140W GaN Fast Charger Block',
    category: 'Accessories',
    price: 69.00,
    rating: 4.9,
    reviews: 512,
    stock: 'In Stock',
    specs: '3x USB-C + 1x USB-A • PD 3.1 • Ultra-compact',
  },
  {
    id: 6,
    name: 'StudioMic Pro Broadcast USB-C Condenser',
    category: 'Audio',
    price: 149.00,
    rating: 4.8,
    reviews: 176,
    stock: 'In Stock',
    specs: '24-bit/192kHz • Integrated Shockmount & Pop Filter',
  },
];

const SEARCH_PRESETS = [
  { label: 'Normal: "headphones"', query: 'headphones', isMalicious: false, desc: 'Legitimate search for audio gear' },
  { label: 'UNION Exfiltration: \' UNION SELECT...', query: "' UNION SELECT username, password FROM users --", isMalicious: true, desc: 'Dumps user credentials via UNION injection' },
  { label: 'Destructive: \'; DROP TABLE products; --', query: "'; DROP TABLE products; --", isMalicious: true, desc: 'Attempts to delete products inventory table' },
  { label: 'Boolean Probe: \' AND 1=1 --', query: "' AND 1=1 --", isMalicious: true, desc: 'Tests injection vector response using boolean condition' },
];

export default function ShopSphereStore() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState('featured');
  const [wafBlock, setWafBlock] = useState(null);

  const handleSearch = (customTerm) => {
    const term = typeof customTerm === 'string' ? customTerm : query;
    setQuery(term);

    const event = recordInspection({
      targetApp: 'ShopSphere',
      targetHost: 'shop.sphere-retail.com',
      method: 'GET',
      endpoint: `/catalog/search?q=${encodeURIComponent(term)}`,
      clientIp: '203.0.113.19',
      field: 'q',
      payload: term,
    });

    if (event.verdict === 'BLOCKED') {
      setWafBlock(event);
    } else {
      setWafBlock(null);
    }
  };

  let filtered = PRODUCTS.filter((p) => {
    if (selectedCategory !== 'ALL' && p.category !== selectedCategory) return false;
    if (query.trim() && !wafBlock) {
      return (
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
      );
    }
    return true;
  });

  if (sortBy === 'price-low') {
    filtered = [...filtered].sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    filtered = [...filtered].sort((a, b) => b.price - a.price);
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Retail Notice */}
      <div className="bg-neutral-900 border-b border-neutral-800 text-neutral-400 px-4 py-1.5 text-center text-[11px] font-medium flex items-center justify-center gap-4">
        <span>⚡ Summer Hardware Drop • Free Express Shipping on orders over $150</span>
        <span className="text-neutral-600 hidden sm:inline">•</span>
        <span className="hidden sm:inline">30-Day Hassle-Free Returns</span>
      </div>

      {/* Main E-Commerce Header */}
      <header className="border-b border-neutral-800 bg-neutral-950/90 sticky top-0 z-40 backdrop-blur-md px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 text-neutral-950 font-black text-base shadow-lg shadow-orange-500/20">
              S
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white">ShopSphere</span>
              <span className="block text-[10px] text-neutral-400 font-mono tracking-wider">HARDWARE &amp; AUDIO</span>
            </div>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex-1 max-w-xl hidden md:flex items-center relative"
          >
            <Search className="absolute left-3.5 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search studio headphones, mechanical keyboards, monitors..."
              className="w-full rounded-full border border-neutral-700 bg-neutral-900/90 pl-10 pr-24 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
            <button
              type="submit"
              className="absolute right-1.5 rounded-full bg-orange-500 hover:bg-orange-400 px-3.5 py-1 text-xs font-semibold text-neutral-950 transition-colors"
            >
              Search
            </button>
          </form>

          {/* User & Cart Icons */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-400 font-medium cursor-pointer hover:text-white">
              <span>USD ($)</span>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900 px-3.5 py-1.5 text-xs font-medium text-neutral-200 cursor-pointer hover:border-neutral-700 transition-colors">
              <ShoppingBag className="h-4 w-4 text-orange-400" />
              <span>Bag</span>
              <span className="rounded-full bg-orange-500 text-neutral-950 font-bold px-1.5 py-0.2 text-[10px]">
                2
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Catalog View */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 space-y-7 flex-1">
        {/* Category & Sort Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800/80">
          <div className="flex flex-wrap items-center gap-2">
            {['ALL', 'Audio', 'Keyboards', 'Displays', 'Wearables', 'Accessories'].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setWafBlock(null);
                }}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-white text-neutral-950 font-semibold shadow-sm'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                {cat === 'ALL' ? 'All Hardware' : cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-200 focus:outline-none"
            >
              <option value="featured">Featured Picks</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* WAF 403 Forbidden Interstitial (Real Web Application Firewall Intercept) */}
        {wafBlock ? (
          <div className="rounded-2xl border border-rose-500/40 bg-neutral-900/95 p-8 shadow-2xl space-y-4 max-w-2xl mx-auto my-6 animate-in fade-in duration-200">
            <div className="flex items-center gap-3.5 pb-2 border-b border-neutral-800">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <span className="font-mono text-xs font-bold text-rose-400 uppercase tracking-wide">
                  HTTP 403 Forbidden • Request Terminated
                </span>
                <h3 className="text-base font-bold text-white">Access Denied by Security Firewall</h3>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Your search query was blocked because it contains suspicious patterns that violate our web security rules. The request was not processed by the product catalog server.
            </p>

            <div className="rounded-lg bg-neutral-950 p-4 font-mono text-xs text-neutral-400 border border-neutral-800 space-y-1.5">
              <div className="flex justify-between">
                <span>Incident Reference:</span>
                <span className="text-neutral-200">{wafBlock.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Client IP:</span>
                <span className="text-neutral-300">{wafBlock.clientIp}</span>
              </div>
              <div className="flex justify-between">
                <span>Timestamp:</span>
                <span className="text-neutral-300">{new Date(wafBlock.timestamp).toISOString()}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setWafBlock(null);
                  setQuery('');
                }}
                className="rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-4 py-2 text-xs font-semibold transition-colors"
              >
                ← Clear Search &amp; Return to Store
              </button>
            </div>
          </div>
        ) : (
          /* Product Grid */
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs text-neutral-400">
              <span>Showing {filtered.length} products</span>
              {query && <span className="font-mono text-orange-400">Query: "{query}"</span>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((p) => (
                <div
                  key={p.id}
                  className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 flex flex-col justify-between hover:border-neutral-700 transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full">
                        {p.category}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-amber-400 font-mono">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {p.rating}
                        <span className="text-neutral-500 text-[10px]">({p.reviews})</span>
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-white group-hover:text-orange-300 transition-colors leading-snug">
                      {p.name}
                    </h4>

                    <p className="text-xs text-neutral-400 leading-relaxed font-mono text-[11px]">
                      {p.specs}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-neutral-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-neutral-500 block">Unit Price</span>
                      <span className="font-mono text-base font-bold text-white">${p.price.toFixed(2)}</span>
                    </div>

                    <button className="rounded-lg bg-orange-500 hover:bg-orange-400 text-neutral-950 font-semibold px-4 py-2 text-xs transition-colors shadow-sm">
                      Add to Bag
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Floating Attack Bench (No Backlinks) */}
      <FloatingAttackBench
        themeColor="orange"
        title="ShopSphere Payload Lab"
        presets={SEARCH_PRESETS}
        onSelect={(preset) => handleSearch(preset.query)}
      />

      {/* Authentic E-Commerce Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950 px-4 sm:px-8 py-8 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <span className="text-neutral-300 font-semibold">ShopSphere Inc.</span>
            <span>Worldwide Shipping</span>
            <span>Privacy Policy</span>
            <span>Terms of Sale</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono text-neutral-600">
            <span>Encrypted 256-bit SSL Checkout</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
