'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, ShieldAlert, ArrowRight, Star, ExternalLink, Zap, AlertTriangle } from 'lucide-react';
import { recordInspection } from '../../../lib/store';

const PRODUCTS = [
  { id: 1, name: 'AeroPro Wireless Noise-Cancelling Headphones', category: 'Audio', price: 349.99, rating: 4.9, stock: 'In Stock' },
  { id: 2, name: 'CyberKey Apex Mechanical Keyboard (Hot-swap)', category: 'Keyboards', price: 179.00, rating: 4.8, stock: 'In Stock' },
  { id: 3, name: 'UltraView 34-inch Curved OLED Studio Monitor', category: 'Displays', price: 899.99, rating: 5.0, stock: 'Low Stock' },
  { id: 4, name: 'PulseTrack Pro Smart Fitness & Bio Watch', category: 'Wearables', price: 229.50, rating: 4.7, stock: 'In Stock' },
  { id: 5, name: 'NovaCharge 140W GaN Fast Charger Block', category: 'Accessories', price: 69.00, rating: 4.9, stock: 'In Stock' },
  { id: 6, name: 'StudioMic Pro Broadcast USB-C Condenser', category: 'Audio', price: 149.00, rating: 4.8, stock: 'In Stock' },
];

const SEARCH_PRESETS = [
  { label: 'Normal: "headphones"', query: 'headphones', isMalicious: false, desc: 'Benign catalog keyword query' },
  { label: 'UNION Exfil: \' UNION SELECT...', query: "' UNION SELECT username, password FROM users --", isMalicious: true, desc: 'Extracts user table data via UNION SELECT' },
  { label: 'Destructive: \'; DROP TABLE...', query: "'; DROP TABLE products; --", isMalicious: true, desc: 'Terminates query and drops products table' },
  { label: 'Boolean Probe: \' AND 1=1 --', query: "' AND 1=1 --", isMalicious: true, desc: 'Tests injection point response with boolean condition' },
];

export default function ShopSphereStore() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
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

  const filteredProducts = PRODUCTS.filter((p) => {
    if (selectedCategory !== 'ALL' && p.category !== selectedCategory) return false;
    if (query.trim() && !wafBlock) {
      return p.name.toLowerCase().includes(query.toLowerCase()) || p.category.toLowerCase().includes(query.toLowerCase());
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Banner */}
      <div className="bg-orange-600 px-4 py-1.5 text-center text-[11px] font-medium text-white tracking-wide">
        Summer Studio Hardware Sale • Free Worldwide Shipping On Orders Over $150
      </div>

      {/* Store Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/80 sticky top-0 z-40 backdrop-blur-md px-4 py-3 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-neutral-950 font-black text-sm">
                S
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-white">ShopSphere</span>
                <span className="ml-1 text-[10px] font-mono text-orange-400 font-semibold">RETAIL</span>
              </div>
            </div>

            <div className="flex sm:hidden items-center gap-2">
              <Link
                href="/"
                className="rounded bg-neutral-800 px-2 py-1 text-xs text-amber-400 font-mono"
              >
                SQLGuard
              </Link>
            </div>
          </div>

          {/* Search Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex-1 max-w-xl w-full flex items-center relative"
          >
            <Search className="absolute left-3.5 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search studio monitors, mechanical keyboards, headphones..."
              className="w-full rounded-full border border-neutral-700 bg-neutral-950/80 pl-10 pr-24 py-2 text-xs font-mono text-neutral-100 placeholder-neutral-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
            <button
              type="submit"
              className="absolute right-1.5 rounded-full bg-orange-500 hover:bg-orange-400 px-3.5 py-1 text-xs font-semibold text-neutral-950 transition-colors"
            >
              Search
            </button>
          </form>

          {/* Cart & WAF Link */}
          <div className="hidden sm:flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-amber-400 hover:bg-neutral-800 transition-colors"
            >
              Open SQLGuard Console <ExternalLink className="h-3 w-3" />
            </Link>

            <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-1.5 text-xs font-mono text-neutral-300">
              <ShoppingBag className="h-4 w-4 text-orange-400" />
              <span>Cart (2)</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Catalog View */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 space-y-8 flex-1">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'Audio', 'Keyboards', 'Displays', 'Wearables', 'Accessories'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-orange-500 text-neutral-950 font-semibold'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              {cat === 'ALL' ? 'All Products' : cat}
            </button>
          ))}
        </div>

        {/* WAF 403 Forbidden Intercept Banner (when SQLi is triggered) */}
        {wafBlock && (
          <div className="rounded-xl border border-red-500/40 bg-red-950/20 p-5 shadow-2xl space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/20 text-red-400">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-mono text-xs font-bold text-red-400 uppercase tracking-wide">
                    SQLGuard WAF Intercept • HTTP 403 Forbidden
                  </span>
                  <h3 className="text-sm font-semibold text-white">Malicious Search Parameter Blocked</h3>
                </div>
              </div>
              <Link
                href="/"
                className="inline-flex items-center gap-1 rounded bg-red-500 hover:bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition-colors"
              >
                Inspect Event in SQLGuard <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <p className="text-xs text-neutral-300">
              Your request was halted before execution on the catalog database. The input pattern matched signature{' '}
              <strong className="font-mono text-red-400">{wafBlock.mitigationRule}</strong> with risk score {wafBlock.riskScore}/100.
            </p>

            <div className="rounded bg-neutral-950 p-2.5 font-mono text-[11px] text-neutral-400 border border-neutral-800 flex flex-wrap gap-4">
              <span>Incident Ref: <strong className="text-neutral-200">{wafBlock.id}</strong></span>
              <span>Matched Pattern: <strong className="text-red-400">{wafBlock.matches[0]?.name || 'SQLi Vector'}</strong></span>
              <span>Timestamp: <strong className="text-neutral-300">{new Date(wafBlock.timestamp).toLocaleTimeString()}</strong></span>
            </div>
          </div>
        )}

        {/* Product Grid */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs text-neutral-400">
            <span>Showing {filteredProducts.length} items</span>
            {query && !wafBlock && <span className="font-mono text-orange-400">Filtered by: "{query}"</span>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 flex flex-col justify-between hover:border-neutral-700 transition-all group"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[11px] font-mono text-neutral-500 uppercase">{p.category}</span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-mono">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {p.rating}
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm text-neutral-100 group-hover:text-white leading-snug">
                    {p.name}
                  </h4>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-neutral-500 block">Price</span>
                    <span className="font-mono text-base font-bold text-white">${p.price.toFixed(2)}</span>
                  </div>
                  <button className="rounded-lg bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 text-xs font-semibold text-neutral-200 transition-colors">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Security Injection Testbench */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-orange-400" />
              SQL Injection Search Payloads (Testbench)
            </span>
            <span className="text-[10px] text-neutral-500 font-mono">Click to inject into store catalog API</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {SEARCH_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handleSearch(preset.query)}
                className={`text-left rounded-lg border p-2.5 transition-all text-xs ${
                  preset.isMalicious
                    ? 'border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-300'
                    : 'border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300'
                }`}
              >
                <div className="font-mono font-semibold truncate text-[11px]">{preset.label}</div>
                <div className="text-[10px] text-neutral-500 mt-1 line-clamp-1">{preset.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 py-4 text-center text-[11px] font-mono text-neutral-500">
        ShopSphere Retail Systems Inc. • Catalog Microservice v3.1 • In-Line WAF Inspection Active
      </footer>
    </div>
  );
}
