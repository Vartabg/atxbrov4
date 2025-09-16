"use client";

import { useState } from 'react';
import { VetNavMapCanvas } from '../3d/VetNavMapCanvas';
import { StateDetailsPanel } from '../vetnav/StateDetailsPanel';
import { StateData } from '../../data/usStatesData';

export const VetNavApp = () => {
  const [activeSection, setActiveSection] = useState('benefits');
  const [selectedState, setSelectedState] = useState<StateData | null>(null);

  return (
    <div className="min-h-full bg-gradient-to-b from-blue-900 to-blue-600 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">VetNav - Veterans Benefits Navigator</h1>
        <p className="text-blue-200 mb-6">Your guide to veterans benefits and resources</p>

        <div className="flex space-x-4 mb-6">
          <button 
            onClick={() => setActiveSection('benefits')}
            className={`px-4 py-2 rounded transition-colors ${
              activeSection === 'benefits' ? 'bg-white text-blue-900' : 'bg-blue-700 hover:bg-blue-600'
            }`}
          >
            Benefits Finder
          </button>
          <button 
            onClick={() => setActiveSection('crisis')}
            className={`px-4 py-2 rounded transition-colors ${
              activeSection === 'crisis' ? 'bg-white text-blue-900' : 'bg-blue-700 hover:bg-blue-600'
            }`}
          >
            Crisis Support
          </button>
          <button 
            onClick={() => setActiveSection('map')}
            className={`px-4 py-2 rounded transition-colors ${
              activeSection === 'map' ? 'bg-white text-blue-900' : 'bg-blue-700 hover:bg-blue-600'
            }`}
          >
            State Map
          </button>
        </div>

        {activeSection === 'benefits' && (
          <div className="bg-white bg-opacity-10 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Find Your Benefits</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-800 p-4 rounded">
                <h3 className="font-semibold">Disability Benefits</h3>
                <p className="text-sm text-blue-200">Compensation for service-connected disabilities</p>
              </div>
              <div className="bg-blue-800 p-4 rounded">
                <h3 className="font-semibold">Education Benefits</h3>
                <p className="text-sm text-blue-200">GI Bill and education assistance programs</p>
              </div>
              <div className="bg-blue-800 p-4 rounded">
                <h3 className="font-semibold">Healthcare</h3>
                <p className="text-sm text-blue-200">VA medical care and mental health services</p>
              </div>
              <div className="bg-blue-800 p-4 rounded">
                <h3 className="font-semibold">Home Loans</h3>
                <p className="text-sm text-blue-200">VA-backed home loans and housing assistance</p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'crisis' && (
          <div className="bg-white bg-opacity-10 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Crisis Support Resources</h2>
            <div className="space-y-4">
              <div className="bg-red-700 p-4 rounded">
                <h3 className="font-semibold">Veterans Crisis Line</h3>
                <p className="text-lg">Call: 988, Press 1</p>
                <p className="text-sm">24/7 confidential support for veterans in crisis</p>
              </div>
              <div className="bg-blue-800 p-4 rounded">
                <h3 className="font-semibold">Mental Health Support</h3>
                <p className="text-sm">Connect with VA mental health services and counseling</p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'map' && (
          <div className="space-y-4">
            <div className="bg-white bg-opacity-10 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Interactive State Map</h2>
              <p className="text-blue-200 mb-4">
                Explore veterans benefits data by state. Click on any state marker to view detailed information about benefits, 
                facilities, and programs available in that location.
              </p>
              
              {/* 3D Map Canvas */}
              <VetNavMapCanvas 
                onStateSelect={setSelectedState}
                selectedStateCode={selectedState?.code}
              />
              
              {/* Quick Stats */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-800 p-3 rounded text-center">
                  <div className="text-2xl font-bold text-blue-200">18.2M</div>
                  <div className="text-sm">Total US Veterans</div>
                </div>
                <div className="bg-blue-800 p-3 rounded text-center">
                  <div className="text-2xl font-bold text-green-300">50+</div>
                  <div className="text-sm">State Programs</div>
                </div>
                <div className="bg-blue-800 p-3 rounded text-center">
                  <div className="text-2xl font-bold text-yellow-300">1,200+</div>
                  <div className="text-sm">VA Facilities</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* State Details Panel */}
      <StateDetailsPanel 
        stateData={selectedState}
        onClose={() => setSelectedState(null)}
      />
    </div>
  );
};
