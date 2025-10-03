'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

export const useVoiceCommands = () => {
  const [isListening, setIsListening] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState('inactive');
  const [error, setError] = useState('');
  const [permissionGranted, setPermissionGranted] = useState(false);
  
  const recognitionRef = useRef(null);
  const commandsHistoryRef = useRef([]);
  const finalTranscriptRef = useRef('');
  
  // Use refs for states that need to be accessed in callbacks
  const isActiveRef = useRef(isActive);
  const isListeningRef = useRef(isListening);

  // Sync refs with state
  useEffect(() => {
    isActiveRef.current = isActive;
    isListeningRef.current = isListening;
  }, [isActive, isListening]);

  // Enhanced voice commands configuration
  const commands = {
    activation: ['listen now', 'start listening', 'wake up', 'hey voicemart', 'activate', 'hello voicemart'],
    deactivation: ['stop listening', 'sleep', 'go to sleep', 'stop', 'deactivate', 'goodbye'],
    navigation: ['scroll up', 'scroll down', 'scroll to top', 'scroll to bottom', 'go up', 'go down'],
    actions: ['add to cart', 'buy now', 'exit', 'close', 'go back', 'back'],
    selection: ['select', 'choose', 'focus on', 'show me', 'open'],
    help: ['help', 'what can i say', 'commands', 'show commands'],
  };

  // Request microphone permission
  const requestMicrophonePermission = useCallback(async () => {
    try {
      setStatus('waiting');
      setError('');
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      
      setPermissionGranted(true);
      setStatus('inactive');
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setError('Microphone access is required for voice commands. Please allow microphone permissions and refresh the page.');
      setStatus('error');
      return false;
    }
  }, []);

  // Check if command matches any in the list
  const matchesCommand = (command, commandList) => {
    return commandList.some(cmd => {
      if (commandList === commands.selection) {
        return command.startsWith(cmd + ' ');
      }
      return command.includes(cmd);
    });
  };

  // Text-to-speech feedback
  const speakFeedback = useCallback((text) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;
      
      utterance.onend = () => {
        console.log('Finished speaking:', text);
      };
      
      speechSynthesis.speak(utterance);
    }
  }, []);

  // Handle product selection
  const handleProductSelection = useCallback((productName) => {
    const event = new CustomEvent('voiceSelectProduct', { 
      detail: { productName: productName.trim() } 
    });
    window.dispatchEvent(event);
    speakFeedback(`Looking for ${productName}`);
  }, [speakFeedback]);

  // Handle add to cart
  const handleAddToCart = useCallback(() => {
    const event = new CustomEvent('voiceAddToCart');
    window.dispatchEvent(event);
    speakFeedback('Adding item to cart');
  }, [speakFeedback]);

  // Handle buy now
  const handleBuyNow = useCallback(() => {
    const event = new CustomEvent('voiceBuyNow');
    window.dispatchEvent(event);
    speakFeedback('Processing your purchase');
  }, [speakFeedback]);

  // Handle exit
  const handleExit = useCallback(() => {
    const event = new CustomEvent('voiceExit');
    window.dispatchEvent(event);
    speakFeedback('Closing current view');
  }, [speakFeedback]);

  // Process voice commands - FIXED WITH REFS
  const processCommand = useCallback((command) => {
    setStatus('processing');
    commandsHistoryRef.current.push(command);

    console.log('🔄 Processing command:', command);
    console.log('🎯 System active (ref):', isActiveRef.current);
    console.log('👂 System listening (ref):', isListeningRef.current);

    // Check for activation commands (always process these)
    if (matchesCommand(command, commands.activation)) {
      console.log('✅ Activation command detected');
      if (!isActiveRef.current) {
        setIsActive(true);
        speakFeedback('Voice commands activated! I am now listening to your commands. Try saying "scroll down" or "select headphones".');
        console.log('🚀 System activated');
      } else {
        speakFeedback('Voice commands are already active.');
      }
      return;
    }

    // Only process other commands if system is active
    if (!isActiveRef.current) {
      console.log('❌ System not active, ignoring command:', command);
      return;
    }

    // Deactivation commands
    if (matchesCommand(command, commands.deactivation)) {
      console.log('🛑 Deactivation command detected');
      setIsActive(false);
      speakFeedback('Voice commands deactivated. Say "listen now" when you need me again.');
      return;
    }

    // Help commands
    if (matchesCommand(command, commands.help)) {
      console.log('❓ Help command detected');
      speakFeedback('You can say: Scroll up, Scroll down, Select followed by product name, Add to cart, Buy now, or Stop listening.');
      return;
    }

    // Navigation commands
    if (matchesCommand(command, commands.navigation)) {
      console.log('🧭 Navigation command detected:', command);
      if (command.includes('scroll up') || command.includes('go up')) {
        window.scrollBy({ top: -400, behavior: 'smooth' });
        speakFeedback('Scrolling up');
        console.log('⬆️ Scrolling up');
      } else if (command.includes('scroll down') || command.includes('go down')) {
        window.scrollBy({ top: 400, behavior: 'smooth' });
        speakFeedback('Scrolling down');
        console.log('⬇️ Scrolling down');
      } else if (command.includes('scroll to top')) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        speakFeedback('Scrolling to top');
        console.log('🔝 Scrolling to top');
      } else if (command.includes('scroll to bottom')) {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        speakFeedback('Scrolling to bottom');
        console.log('🔽 Scrolling to bottom');
      }
      return;
    }

    // Selection commands
    if (matchesCommand(command, commands.selection)) {
      console.log('🎯 Selection command detected:', command);
      const productName = command.replace(new RegExp(commands.selection.join('|') + '\\s+', 'i'), '');
      handleProductSelection(productName);
      return;
    }

    // Action commands
    if (matchesCommand(command, commands.actions)) {
      console.log('⚡ Action command detected:', command);
      if (command.includes('add to cart')) {
        handleAddToCart();
        console.log('🛒 Add to cart triggered');
      } else if (command.includes('buy now')) {
        handleBuyNow();
        console.log('💰 Buy now triggered');
      } else if (command.includes('exit') || command.includes('close') || command.includes('go back') || command.includes('back')) {
        handleExit();
        console.log('🚪 Exit triggered');
      }
      return;
    }

    // Unknown command
    console.log('❓ Unknown command:', command);
    speakFeedback(`I heard "${command}". Say "help" to see available commands.`);

    // Clear transcript after processing
    setTimeout(() => {
      if (transcript === finalTranscriptRef.current) {
        setTranscript('');
      }
    }, 2000);
    
    setStatus('listening');
  }, [speakFeedback, handleProductSelection, handleAddToCart, handleBuyNow, handleExit, transcript]);

  // Initialize speech recognition
  const initializeRecognition = useCallback(() => {
    if (typeof window === 'undefined') return null;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setStatus('listening');
      setError('');
      console.log('🎤 Speech recognition started');
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Display interim results for real-time feedback
      if (interimTranscript) {
        setTranscript(interimTranscript.toLowerCase().trim());
      }

      // Process final results
      if (finalTranscript) {
        const finalText = finalTranscript.toLowerCase().trim();
        finalTranscriptRef.current = finalText;
        setTranscript(finalText);
        console.log('🎯 Final transcript:', finalText);
        processCommand(finalText);
      }
    };

    recognition.onerror = (event) => {
      console.error('❌ Speech recognition error:', event.error);
      
      switch (event.error) {
        case 'not-allowed':
        case 'permission-denied':
          setError('Microphone permission denied. Please allow microphone access in your browser settings.');
          setPermissionGranted(false);
          break;
        case 'network':
          setError('Network error occurred. Please check your internet connection.');
          break;
        case 'no-speech':
          break;
        case 'audio-capture':
          setError('No microphone found. Please check your microphone connection.');
          break;
        default:
          setError(`Voice recognition error: ${event.error}. Please try again.`);
      }
      
      if (event.error !== 'no-speech') {
        setStatus('error');
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      console.log('🔚 Speech recognition ended');
      if (isListeningRef.current && permissionGranted) {
        setTimeout(() => {
          try {
            recognition.start();
            console.log('🔄 Restarting speech recognition');
          } catch (error) {
            console.error('❌ Error restarting recognition:', error);
          }
        }, 100);
      } else {
        setStatus('inactive');
      }
    };

    return recognition;
  }, [permissionGranted, processCommand]);

  // Start listening
  const startListening = async () => {
    if (!permissionGranted) {
      const granted = await requestMicrophonePermission();
      if (!granted) return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        console.log('🎤 Starting voice recognition');
      } catch (error) {
        console.error('❌ Error starting recognition:', error);
        setError('Failed to start voice recognition. Please refresh and try again.');
      }
    }
  };

  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
        setIsActive(false);
        setStatus('inactive');
        setTranscript('');
        console.log('🛑 Stopped voice recognition');
      } catch (error) {
        console.error('❌ Error stopping recognition:', error);
      }
    }
  };

  // Toggle listening
  const toggleListening = async () => {
    if (isListeningRef.current) {
      stopListening();
    } else {
      await startListening();
    }
  };

  // Initialize on component mount
  useEffect(() => {
    recognitionRef.current = initializeRecognition();

    if (typeof window !== 'undefined' && 'mediaDevices' in navigator) {
      requestMicrophonePermission();
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      speechSynthesis.cancel();
    };
  }, [initializeRecognition, requestMicrophonePermission]);

  return {
    isListening,
    isActive,
    transcript,
    status,
    error,
    permissionGranted,
    startListening,
    stopListening,
    toggleListening,
    requestMicrophonePermission,
    commandsHistory: commandsHistoryRef.current,
  };
};