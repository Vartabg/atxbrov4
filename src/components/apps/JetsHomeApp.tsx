"use client";

import { useState } from 'react';

export const JetsHomeApp = () => {
  const [activeSection, setActiveSection] = useState('stats');

  return (
    <div className="min-h-full bg-gradient-to-b from-orange-900 to-orange-600 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">JetsHome - Sports Analytics & Statistics</h1>
        <p className="text-orange-200 mb-6">Advanced sports data analysis and team performance insights</p>

        <div className="flex space-x-4 mb-6">
          <button 
            onClick={() => setActiveSection('stats')}
            className={`px-4 py-2 rounded transition-colors ${
              activeSection === 'stats' ? 'bg-white text-orange-900' : 'bg-orange-700 hover:bg-orange-600'
            }`}
          >
            Live Stats
          </button>
          <button 
            onClick={() => setActiveSection('analytics')}
            className={`px-4 py-2 rounded transition-colors ${
              activeSection === 'analytics' ? 'bg-white text-orange-900' : 'bg-orange-700 hover:bg-orange-600'
            }`}
          >
            Team Analytics
          </button>
          <button 
            onClick={() => setActiveSection('predictions')}
            className={`px-4 py-2 rounded transition-colors ${
              activeSection === 'predictions' ? 'bg-white text-orange-900' : 'bg-orange-700 hover:bg-orange-600'
            }`}
          >
            Predictions
          </button>
        </div>

        {activeSection === 'stats' && (
          <div className="bg-white bg-opacity-10 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Live Game Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-orange-800 p-4 rounded">
                <h3 className="font-semibold text-lg">Jets vs Patriots</h3>
                <p className="text-2xl font-bold">21 - 14</p>
                <p className="text-sm text-orange-200">Q3 - 8:45 remaining</p>
              </div>
              <div className="bg-orange-800 p-4 rounded">
                <h3 className="font-semibold">Key Stats</h3>
                <p className="text-sm text-orange-200">Total Yards: 287 - 201</p>
                <p className="text-sm text-orange-200">Turnovers: 1 - 2</p>
                <p className="text-sm text-orange-200">Time of Possession: 18:32 - 14:03</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-orange-800 p-4 rounded text-center">
                <h3 className="text-xl font-bold">Aaron Rodgers</h3>
                <p className="text-sm text-orange-200">18/24, 245 yds, 2 TDs</p>
              </div>
              <div className="bg-orange-800 p-4 rounded text-center">
                <h3 className="text-xl font-bold">Breece Hall</h3>
                <p className="text-sm text-orange-200">98 rush yds, 1 TD</p>
              </div>
              <div className="bg-orange-800 p-4 rounded text-center">
                <h3 className="text-xl font-bold">Garrett Wilson</h3>
                <p className="text-sm text-orange-200">6 rec, 89 yds, 1 TD</p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'analytics' && (
          <div className="bg-white bg-opacity-10 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Team Performance Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Offensive Metrics</h3>
                <div className="bg-orange-800 p-4 rounded">
                  <p className="text-sm text-orange-200">Points per Game: 24.8 (12th in NFL)</p>
                  <p className="text-sm text-orange-200">Yards per Game: 361.2 (15th in NFL)</p>
                  <p className="text-sm text-orange-200">3rd Down %: 42.1% (8th in NFL)</p>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Defensive Metrics</h3>
                <div className="bg-orange-800 p-4 rounded">
                  <p className="text-sm text-orange-200">Points Allowed: 19.3 (5th in NFL)</p>
                  <p className="text-sm text-orange-200">Yards Allowed: 312.7 (9th in NFL)</p>
                  <p className="text-sm text-orange-200">Takeaways: 18 (11th in NFL)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'predictions' && (
          <div className="bg-white bg-opacity-10 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">AI-Powered Predictions</h2>
            <div className="space-y-4">
              <div className="bg-orange-800 p-4 rounded">
                <h3 className="font-semibold">Next Game Prediction</h3>
                <p className="text-lg">Jets vs Bills - 67% win probability</p>
                <p className="text-sm text-orange-200">Predicted score: Jets 23, Bills 20</p>
                <p className="text-xs text-orange-300">Based on current form, injuries, and historical matchups</p>
              </div>
              <div className="bg-orange-800 p-4 rounded">
                <h3 className="font-semibold">Season Outlook</h3>
                <p className="text-sm text-orange-200">Projected wins: 10.2</p>
                <p className="text-sm text-orange-200">Playoff probability: 78%</p>
                <p className="text-sm text-orange-200">Division title probability: 34%</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
