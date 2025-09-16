"use client";

import { StateData, BENEFITS_CATEGORIES } from '../../data/usStatesData';

interface StateDetailsPanelProps {
  stateData: StateData | null;
  onClose: () => void;
}

export const StateDetailsPanel = ({ stateData, onClose }: StateDetailsPanelProps) => {
  if (!stateData) return null;

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const calculatePercentage = (value: number, total: number) => {
    return ((value / total) * 100).toFixed(1);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto text-white shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{stateData.name}</h2>
            <p className="text-blue-200">State Code: {stateData.code}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-200 text-2xl font-bold w-8 h-8 flex items-center justify-center"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-800 bg-opacity-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Veteran Population</h3>
            <p className="text-2xl font-bold text-blue-200">{formatNumber(stateData.veteranPopulation)}</p>
          </div>
          <div className="bg-blue-800 bg-opacity-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Active Programs</h3>
            <p className="text-2xl font-bold text-green-300">{stateData.activeBenefitsPrograms}</p>
          </div>
          <div className="bg-blue-800 bg-opacity-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">VA Facilities</h3>
            <p className="text-2xl font-bold text-yellow-300">{stateData.majorVAFacilities.length}</p>
          </div>
        </div>

        {/* Benefits Statistics */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">Benefits Distribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(stateData.benefitsStats).map(([key, value]) => {
              const category = BENEFITS_CATEGORIES[key as keyof typeof BENEFITS_CATEGORIES];
              const percentage = calculatePercentage(value, stateData.veteranPopulation);
              
              return (
                <div key={key} className="bg-white bg-opacity-10 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">{category.icon}</span>
                    <h4 className="font-semibold">{category.name}</h4>
                  </div>
                  <p className="text-lg font-bold" style={{ color: category.color }}>
                    {formatNumber(value)}
                  </p>
                  <p className="text-sm text-blue-200">{percentage}% of veterans</p>
                  <div className="mt-2 bg-blue-900 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        backgroundColor: category.color,
                        width: `${Math.min(parseFloat(percentage), 100)}%`
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Major VA Facilities */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">Major VA Facilities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {stateData.majorVAFacilities.map((facility, index) => (
              <div key={index} className="bg-blue-800 bg-opacity-50 rounded-lg p-3">
                <p className="font-medium">🏥 {facility}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Special Programs */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">Special Programs</h3>
          <div className="flex flex-wrap gap-2">
            {stateData.specialPrograms.map((program, index) => (
              <span
                key={index}
                className="bg-green-600 bg-opacity-70 px-3 py-1 rounded-full text-sm font-medium"
              >
                ✨ {program}
              </span>
            ))}
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="bg-red-700 bg-opacity-50 rounded-lg p-4">
          <h3 className="text-xl font-semibold mb-3">🆘 Emergency Contacts</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="font-semibold mr-2">VA Crisis Line:</span>
              <span className="text-red-200 font-bold text-lg">{stateData.emergencyContacts.vaHotline}</span>
            </div>
            {stateData.emergencyContacts.localCrisisLine && (
              <div className="flex items-center">
                <span className="font-semibold mr-2">Local Crisis Line:</span>
                <span className="text-red-200">{stateData.emergencyContacts.localCrisisLine}</span>
              </div>
            )}
            <p className="text-sm text-red-200 mt-2">
              24/7 confidential support for veterans in crisis and their families
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mt-6">
          <button className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-lg font-semibold transition-colors">
            Find Local VA Office
          </button>
          <button className="bg-green-600 hover:bg-green-500 px-6 py-3 rounded-lg font-semibold transition-colors">
            Apply for Benefits
          </button>
          <button className="bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-lg font-semibold transition-colors">
            Schedule Appointment
          </button>
        </div>
      </div>
    </div>
  );
};