'use client';
import { useState, useEffect } from 'react';
import { useVoiceCommands } from '../../hooks/useVoiceCommands';

export default function VoiceAssistant() {
  const {
    isListening,
    transcript,
    status,
    error,
    toggleListening,
    commandsHistory,
  } = useVoiceCommands();

  const [showCommands, setShowCommands] = useState(false);

  // Status colors
  const statusColors = {
    inactive: 'bg-gray-600',
    listening: 'bg-green-500 animate-pulse',
    processing: 'bg-blue-500',
    error: 'bg-red-500',
  };

  // Status messages
  const statusMessages = {
    inactive: 'Voice assistant inactive',
    listening: 'Listening...',
    processing: 'Processing command...',
    error: 'Error occurred',
  };

  return (
    <>
      {/* Voice Assistant Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-3">
        {/* Commands Help */}
        {showCommands && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-2xl max-w-xs">
            <h3 className="text-white font-semibold mb-3">Voice Commands</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-blue-400 font-medium">Activation:</span>
                <p className="text-gray-300">&quot;listen now&quot;, &quot;start listening&quot;</p>
              </div>
              <div>
                <span className="text-blue-400 font-medium">Navigation:</span>
                <p className="text-gray-300">&quot;scroll up&quot;, &quot;scroll down&quot;</p>
              </div>
              <div>
                <span className="text-blue-400 font-medium">Selection:</span>
                <p className="text-gray-300">&quot;select [product name]&quot;</p>
              </div>
              <div>
                <span className="text-blue-400 font-medium">Actions:</span>
                <p className="text-gray-300">&quot;add to cart&quot;, &quot;buy now&quot;, &quot;exit&quot;</p>
              </div>
              <div>
                <span className="text-blue-400 font-medium">Deactivation:</span>
                <p className="text-gray-300">&quot;stop listening&quot;</p>
              </div>
            </div>
          </div>
        )}

        {/* Status Indicator */}
        {isListening && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${statusColors[status]}`}></div>
              <div className="text-sm text-white">
                <div>{statusMessages[status]}</div>
                {transcript && (
                  <div className="text-gray-300 text-xs mt-1 max-w-xs truncate">
                    Heard: `{transcript}`
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 shadow-lg max-w-xs">
            <div className="text-red-400 text-sm">{error}</div>
          </div>
        )}

        {/* Main Voice Button */}
        <div className="flex space-x-2">
          {/* Help Button */}
          <button
            onClick={() => setShowCommands(!showCommands)}
            className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105"
            title="Voice commands help"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {/* Voice Control Button */}
          <button
            onClick={toggleListening}
            className={`
              relative p-4 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105
              ${isListening 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
              }
            `}
            title={isListening ? 'Stop listening' : 'Start voice control'}
          >
            {/* Animated rings when listening */}
            {isListening && (
              <>
                <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75"></div>
                <div className="absolute inset-0 rounded-full bg-green-500 animate-pulse"></div>
              </>
            )}
            
            <svg 
              className={`w-6 h-6 ${isListening ? 'animate-pulse' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              {isListening ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Voice Command History (Debug - remove in production) */}
      {process.env.NODE_ENV === 'development' && commandsHistory.length > 0 && (
        <div className="fixed top-20 right-6 bg-gray-800 border border-gray-700 rounded-lg p-3 max-w-xs max-h-48 overflow-y-auto">
          <h4 className="text-white text-sm font-semibold mb-2">Command History</h4>
          <div className="space-y-1 text-xs">
            {commandsHistory.slice(-5).map((cmd, index) => (
              <div key={index} className="text-gray-300 bg-gray-700 rounded px-2 py-1">
                {cmd}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}