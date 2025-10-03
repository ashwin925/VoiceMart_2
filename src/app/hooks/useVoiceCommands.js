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
      // Exact match or starts with for selection commands
      if (commandList === commands.selection) {
        return command.startsWith(cmd + ' ');
      }
      // Contains for other commands
      return command.includes(cmd);
    });
  };

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
        processCommand(finalText);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      
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
      if (isListening && permissionGranted) {
        setTimeout(() => {
          try {
            recognition.start();
          } catch (error) {
            console.error('Error restarting recognition:', error);
          }
        }, 100);
      } else {
        setStatus('inactive');
      }
    };

    return recognition;
  }, [isListening, permissionGranted]);

  // Process voice commands - FIXED ACTIVATION LOGIC
  const processCommand = useCallback((command) => {
    setStatus('processing');
    commandsHistoryRef.current.push(command);

    console.log('Processing command:', command);
    console.log('System active:', isActive);

    // Check for activation commands (always process these)
    if (matchesCommand(command, commands.activation)) {
      console.log('Activation command detected');
      if (!isActive) {
        setIsActive(true);
        speakFeedback('Voice commands activated! I am now listening to your commands. Try saying "scroll down" or "select headphones".');
        console.log('System activated');
      } else {
        speakFeedback('Voice commands are already active.');
      }
      return;
    }

    // Only process other commands if system is active
    if (!isActive) {
      console.log('System not active, ignoring command:', command);
      return;
    }

    // Deactivation commands
    if (matchesCommand(command, commands.deactivation)) {
      setIsActive(false);
      speakFeedback('Voice commands deactivated. Say "listen now" when you need me again.');
      return;
    }

    // Help commands
    if (matchesCommand(command, commands.help)) {
      speakFeedback('You can say: Scroll up, Scroll down, Select followed by product name, Add to cart, Buy now, or Stop listening.');
      return;
    }

    // Navigation commands
    if (matchesCommand(command, commands.navigation)) {
      if (command.includes('scroll up') || command.includes('go up')) {
        window.scrollBy({ top: -400, behavior: 'smooth' });
        speakFeedback('Scrolling up');
      } else if (command.includes('scroll down') || command.includes('go down')) {
        window.scrollBy({ top: 400, behavior: 'smooth' });
        speakFeedback('Scrolling down');
      } else if (command.includes('scroll to top')) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        speakFeedback('Scrolling to top');
      } else if (command.includes('scroll to bottom')) {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        speakFeedback('Scrolling to bottom');
      }
      return;
    }

    // Selection commands
    if (matchesCommand(command, commands.selection)) {
      const productName = command.replace(new RegExp(commands.selection.join('|') + '\\s+', 'i'), '');
      handleProductSelection(productName);
      return;
    }

    // Action commands
    if (matchesCommand(command, commands.actions)) {
      if (command.includes('add to cart')) {
        handleAddToCart();
      } else if (command.includes('buy now')) {
        handleBuyNow();
      } else if (command.includes('exit') || command.includes('close') || command.includes('go back') || command.includes('back')) {
        handleExit();
      }
      return;
    }

    // Unknown command
    console.log('Unknown command:', command);
    speakFeedback(`I heard "${command}". Say "help" to see available commands.`);

    // Clear transcript after processing
    setTimeout(() => {
      if (transcript === finalTranscriptRef.current) {
        setTranscript('');
      }
    }, 2000);
    
    setStatus('listening');
  }, [isActive, transcript]);

  // Text-to-speech feedback
  const speakFeedback = (text) => {
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
  };

  // Handle product selection
  const handleProductSelection = (productName) => {
    const event = new CustomEvent('voiceSelectProduct', { 
      detail: { productName: productName.trim() } 
    });
    window.dispatchEvent(event);
    speakFeedback(`Looking for ${productName}`);
  };

  // Handle add to cart
  const handleAddToCart = () => {
    const event = new CustomEvent('voiceAddToCart');
    window.dispatchEvent(event);
    speakFeedback('Adding item to cart');
  };

  // Handle buy now
  const handleBuyNow = () => {
    const event = new CustomEvent('voiceBuyNow');
    window.dispatchEvent(event);
    speakFeedback('Processing your purchase');
  };

  // Handle exit
  const handleExit = () => {
    const event = new CustomEvent('voiceExit');
    window.dispatchEvent(event);
    speakFeedback('Closing current view');
  };

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
      } catch (error) {
        console.error('Error starting recognition:', error);
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
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
  };

  // Toggle listening
  const toggleListening = async () => {
    if (isListening) {
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