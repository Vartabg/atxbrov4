"use client";

import { useState } from 'react';

export const TariffExplorerApp = () => {
  const [activeSection, setActiveSection] = useState('search');

  return (
    <div className="min-h-full bg-gradient-to-b from-green-900 to-green-600 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Tariff Explorer - Trade Insights & Data Analysis</h1>
        <p className="text-green-200 mb-6">Navigate global trade data and tariff information</p>

        <div className="flex space-x-4 mb-6">
          <button 
            onClick={() => setActiveSection('search')}
            className={`px-4 py-2 rounded transition-colors ${
              activeSection === 'search' ? 'bg-white text-green-900' : 'bg-green-700 hover:bg-green-600'
            }`}
          >
            Product Search
          </button>
          <button 
            onClick={() => setActiveSection('countries')}
            className={`px-4 py-2 rounded transition-colors ${
              activeSection === 'countries' ? 'bg-white text-green-900' : 'bg-green-700 hover:bg-green-600'
            }`}
          >
            Country Data
          </button>
          <button 
            onClick={() => setActiveSection('analytics')}
            className={`px-4 py-2 rounded transition-colors ${
              activeSection === 'analytics' ? 'bg-white text-green-900' : 'bg-green-700 hover:bg-green-600'
            }`}
          >
            Trade Analytics
          </button>
        </div>

        {activeSection === 'search' && (
          <div className="bg-white bg-opacity-10 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Product Tariff Search</h2>
            <div className="mb-4">
              <input 
                type="text" 
                placeholder="Search product (e.g., steel, electronics, textiles)"
                className="w-full p-3 rounded bg-white bg-opacity-20 placeholder-green-200 text-white"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-800 p-4 rounded">
                <h3 className="font-semibold">Automotive Parts</h3>
                <p className="text-sm text-green-200">Current tariff: 2.5% - 25%</p>
                <p className="text-xs text-green-300">Last updated: June 2025</p>
              </div>
              <div className="bg-green-800 p-4 rounded">
                <h3 className="font-semibold">Steel Products</h3>
                <p className="text-sm text-green-200">Current tariff: 7.5% - 15%</p>
                <p className="text-xs text-green-300">Last updated: June 2025</p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'countries' && (
          <div className="bg-white bg-opacity-10 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Country Trade Data</h2>
            <div className="space-y-4">
              <div className="bg-green-800 p-4 rounded">
                <h3 className="font-semibold">China</h3>
                <p className="text-sm text-green-200">Total trade volume: $690B annually</p>
                <p className="text-sm text-green-200">Average tariff rate: 12.3%</p>
              </div>
              <div className="bg-green-800 p-4 rounded">
                <h3 className="font-semibold">Mexico</h3>
                <p className="text-sm text-green-200">Total trade volume: $780B annually</p>
                <p className="text-sm text-green-200">Average tariff rate: 0.2% (USMCA)</p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'analytics' && (
          <div className="bg-white bg-opacity-10 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Trade Analytics Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-800 p-4 rounded text-center">
                <h3 className="text-2xl font-bold">$4.2T</h3>
                <p className="text-sm text-green-200">Annual US Trade Volume</p>
              </div>
              <div className="bg-green-800 p-4 rounded text-center">
                <h3 className="text-2xl font-bold">15.8%</h3>
                <p className="text-sm text-green-200">Avg Global Tariff Rate</p>
              </div>
              <div className="bg-green-800 p-4 rounded text-center">
                <h3 className="text-2xl font-bold">230+</h3>
                <p className="text-sm text-green-200">Trading Partners</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
