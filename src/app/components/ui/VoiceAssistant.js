'use client';
import { useState, useEffect } from 'react';
import { useVoiceCommands } from '../../hooks/useVoiceCommands';

export default function VoiceAssistant() {
  const {
    isListening,
    isActive,
    transcript,
    status,
    error,
    permissionGranted,
    toggleListening,
    requestMicrophonePermission,
  } = useVoiceCommands();

  const [showCommands, setShowCommands] = useState(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setPulse(prev => !prev);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isActive]);

  // Listen for global voice-driven UI events like opening the cart
  useEffect(() => {
    const onOpenCart = () => {
      try {
        window.location.href = '/cart';
      } catch (e) {
        console.warn('Failed to navigate to cart via voice:', e);
      }
    };

    window.addEventListener('voiceOpenCart', onOpenCart);
    return () => window.removeEventListener('voiceOpenCart', onOpenCart);
  }, []);

  const statusConfig = {
    inactive: {
      color: 'bg-gray-600',
      icon: '🎤',
      message: 'Click to start voice control',
      pulse: false,
    },
    waiting: {
      color: 'bg-yellow-500',
      icon: '⏳',
      message: 'Requesting microphone access...',
      pulse: true,
    },
    listening: {
      color: isActive ? 'bg-green-500' : 'bg-blue-500',
      icon: isActive ? '🎯' : '👂',
      message: isActive ? 'Voice commands active!' : 'Listening for activation...',
      pulse: true,
    },
    processing: {
      color: 'bg-purple-500',
      icon: '⚡',
      message: 'Processing command...',
      pulse: true,
    },
    error: {
      color: 'bg-red-500',
      icon: '❌',
      message: 'Error occurred',
      pulse: false,
    },
  };

  const currentStatus = statusConfig[status];

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-lg">
        
        {showCommands && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl modal-padding shadow-2xl backdrop-blur-sm max-w-sm animate-scaleIn">
            <div className="flex items-center justify-between margin-bottom">
              <h3 className="text-white font-bold text-lg">Voice Commands Guide</h3>
              <button
                onClick={() => setShowCommands(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-lg text-sm">
              <div className="space-y-sm">
                <div className="text-blue-400 font-semibold">🎯 Activation</div>
                <p className="text-gray-300">&quot;listen now&quot;, &quot;start listening&quot;</p>
              </div>
              
              <div className="space-y-sm">
                <div className="text-green-400 font-semibold">🔄 Navigation</div>
                <p className="text-gray-300">&quot;scroll up&quot;, &quot;scroll down&quot;</p>
              </div>
              
              <div className="space-y-sm">
                <div className="text-purple-400 font-semibold">🎯 Selection</div>
                <p className="text-gray-300">&quot;select headphones&quot;</p>
              </div>
              
              <div className="space-y-sm">
                <div className="text-yellow-400 font-semibold">🛒 Actions</div>
                <p className="text-gray-300">&quot;add to cart&quot;, &quot;buy now&quot;</p>
              </div>
              
              <div className="space-y-sm">
                <div className="text-red-400 font-semibold">⏹️ Deactivation</div>
                <p className="text-gray-300">&quot;stop listening&quot;</p>
              </div>
            </div>
          </div>
        )}

        {(isListening || transcript) && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl card-padding shadow-2xl backdrop-blur-sm max-w-sm animate-slideUp">
            <div className="flex items-center space-x margin-bottom-sm">
              <div className={`w-3 h-3 rounded-full ${currentStatus.color} ${currentStatus.pulse ? 'animate-pulse' : ''}`}></div>
              <div className="flex-1">
                <div className="text-white text-sm font-medium">{currentStatus.message}</div>
                {isActive && (
                  <div className="text-green-400 text-xs font-semibold animate-pulse">ACTIVE</div>
                )}
              </div>
            </div>

            {transcript && (
              <div className="margin-top-sm card-padding bg-gray-700/50 rounded-lg border border-gray-600">
                <div className="text-blue-400 text-xs font-semibold margin-bottom-sm">You said:</div>
                <div className="text-white text-sm animate-pulse">{transcript}</div>
              </div>
            )}

            {error && (
              <div className="margin-top-sm card-padding bg-red-500/10 border border-red-500 rounded-lg">
                <div className="text-red-400 text-sm">{error}</div>
                {!permissionGranted && (
                  <button
                    onClick={requestMicrophonePermission}
                    className="margin-top-sm text-red-400 hover:text-red-300 text-sm underline"
                  >
                    Grant Permission
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex space-x">
          <button
            onClick={() => setShowCommands(!showCommands)}
            className="group bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white p-4 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-110 hover:shadow-2xl border border-gray-600 backdrop-blur-sm"
            title="Voice commands help"
          >
            <div className="relative">
              <svg className="w-6 h-6 transform group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </button>

          <button
            onClick={toggleListening}
            disabled={status === 'waiting'}
            className={`
              group relative p-5 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-110
              backdrop-blur-sm border-2
              ${isListening 
                ? isActive
                  ? 'bg-gradient-to-br from-green-500 to-green-600 border-green-400 hover:from-green-600 hover:to-green-700' 
                  : 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-400 hover:from-blue-600 hover:to-blue-700'
                : 'bg-gradient-to-br from-purple-500 to-purple-600 border-purple-400 hover:from-purple-600 hover:to-purple-700'
              }
              ${status === 'waiting' ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-2xl'}
            `}
            title={isListening ? 'Stop listening' : 'Start voice control'}
          >
            {isListening && (
              <>
                <div className="absolute inset-0 rounded-2xl bg-current opacity-20 animate-ping"></div>
                <div className="absolute inset-0 rounded-2xl bg-current opacity-40 animate-pulse"></div>
                {pulse && isActive && (
                  <div className="absolute inset-0 rounded-2xl bg-green-400 opacity-30 animate-pulse"></div>
                )}
              </>
            )}
            
            <div className="relative">
              <svg 
                className={`w-8 h-8 text-white transform transition-all duration-300 ${
                  isListening ? 'animate-bounce' : 'group-hover:scale-110'
                }`} 
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
            </div>

            <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full border-2 border-gray-900 flex items-center justify-center text-xs font-bold ${
              isActive ? 'bg-green-500 text-white animate-bounce' : 'bg-blue-500 text-white'
            }`}>
              {isActive ? '!' : '?'}
            </div>
          </button>
        </div>
      </div>

      {/* Microphone permission overlay removed to avoid forced prompts & flicker.
          Users can grant permission via the Voice button or browser site settings. */}
    </>
  );
}