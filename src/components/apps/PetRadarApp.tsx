"use client";

import { useState } from 'react';

export const PetRadarApp = () => {
  const [activeSection, setActiveSection] = useState('lost');

  return (
    <div className="min-h-full bg-gradient-to-b from-purple-900 to-purple-600 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Pet Radar - Lost & Found Pets</h1>
        <p className="text-purple-200 mb-6">Reuniting pets with their families and connecting adoptable pets with loving homes</p>

        <div className="flex space-x-4 mb-6">
          <button 
            onClick={() => setActiveSection('lost')}
            className={`px-4 py-2 rounded transition-colors ${
              activeSection === 'lost' ? 'bg-white text-purple-900' : 'bg-purple-700 hover:bg-purple-600'
            }`}
          >
            Lost Pets
          </button>
          <button 
            onClick={() => setActiveSection('found')}
            className={`px-4 py-2 rounded transition-colors ${
              activeSection === 'found' ? 'bg-white text-purple-900' : 'bg-purple-700 hover:bg-purple-600'
            }`}
          >
            Found Pets
          </button>
          <button 
            onClick={() => setActiveSection('adoption')}
            className={`px-4 py-2 rounded transition-colors ${
              activeSection === 'adoption' ? 'bg-white text-purple-900' : 'bg-purple-700 hover:bg-purple-600'
            }`}
          >
            Adoption
          </button>
        </div>

        {activeSection === 'lost' && (
          <div className="bg-white bg-opacity-10 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Report Lost Pet</h2>
            <div className="mb-6">
              <button className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded font-semibold transition-colors">
                + Report Lost Pet
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-purple-800 p-4 rounded">
                <h3 className="font-semibold">Max - Golden Retriever</h3>
                <p className="text-sm text-purple-200">Missing since: June 8, 2025</p>
                <p className="text-sm text-purple-200">Location: Austin, TX</p>
                <p className="text-xs text-purple-300">Contact: (555) 123-4567</p>
              </div>
              <div className="bg-purple-800 p-4 rounded">
                <h3 className="font-semibold">Luna - Tabby Cat</h3>
                <p className="text-sm text-purple-200">Missing since: June 9, 2025</p>
                <p className="text-sm text-purple-200">Location: Cedar Park, TX</p>
                <p className="text-xs text-purple-300">Contact: (555) 987-6543</p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'found' && (
          <div className="bg-white bg-opacity-10 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Found Pets</h2>
            <div className="mb-6">
              <button className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded font-semibold transition-colors">
                + Report Found Pet
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-purple-800 p-4 rounded">
                <h3 className="font-semibold">Found: Small Black Dog</h3>
                <p className="text-sm text-purple-200">Found: June 10, 2025</p>
                <p className="text-sm text-purple-200">Location: South Austin</p>
                <p className="text-sm text-purple-200">Currently at: Austin Animal Center</p>
              </div>
              <div className="bg-purple-800 p-4 rounded">
                <h3 className="font-semibold">Found: Orange Cat</h3>
                <p className="text-sm text-purple-200">Found: June 9, 2025</p>
                <p className="text-sm text-purple-200">Location: Round Rock</p>
                <p className="text-sm text-purple-200">Contact finder: (555) 456-7890</p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'adoption' && (
          <div className="bg-white bg-opacity-10 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Pets Available for Adoption</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-purple-800 p-4 rounded">
                <h3 className="font-semibold">Bella - 3yr Female Lab Mix</h3>
                <p className="text-sm text-purple-200">Great with kids and other dogs</p>
                <p className="text-sm text-purple-200">Location: Austin Pets Alive!</p>
                <button className="mt-2 bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded text-sm">
                  View Profile
                </button>
              </div>
              <div className="bg-purple-800 p-4 rounded">
                <h3 className="font-semibold">Milo - 2yr Male Tuxedo Cat</h3>
                <p className="text-sm text-purple-200">Loves to cuddle and play</p>
                <p className="text-sm text-purple-200">Location: Austin Animal Center</p>
                <button className="mt-2 bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded text-sm">
                  View Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
