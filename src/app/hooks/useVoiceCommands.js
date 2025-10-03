'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

export const useVoiceCommands = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState('inactive'); // inactive, listening, processing, error
  const [error, setError] = useState('');
  
  const recognitionRef = useRef(null);
  const commandsHistoryRef = useRef([]);

  // Voice commands configuration
  const commands = {
    activation: ['listen now', 'start listening', 'wake up', 'hey voicemart'],
    deactivation: ['stop listening', 'sleep', 'go to sleep', 'stop'],
    navigation: ['scroll up', 'scroll down', 'scroll to top', 'scroll to bottom'],
    actions: ['add to cart', 'buy now', 'exit', 'close', 'go back'],
    selection: ['select', 'choose', 'focus on'],
  };

  // Initialize speech recognition
  const initializeRecognition = useCallback(() => {
    if (typeof window === 'undefined') return null;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser.');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setStatus('listening');
      setError('');
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setTranscript(finalTranscript.toLowerCase().trim());
        processCommand(finalTranscript.toLowerCase().trim());
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone permissions.');
      } else if (event.error === 'network') {
        setError('Network error occurred. Please check your connection.');
      } else {
        setError(`Speech recognition error: ${event.error}`);
      }
      setStatus('error');
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isListening) {
        // Restart recognition if still listening
        try {
          recognition.start();
        } catch (error) {
          console.error('Error restarting recognition:', error);
        }
      } else {
        setStatus('inactive');
      }
    };

    return recognition;
  }, [isListening]);

  // Process voice commands
  const processCommand = useCallback((command) => {
    setStatus('processing');
    commandsHistoryRef.current.push(command);

    // Activation commands
    if (commands.activation.some(cmd => command.includes(cmd))) {
      if (!isListening) {
        setIsListening(true);
        speakFeedback('Voice commands activated. I am listening...');
      }
      return;
    }

    // Only process other commands if listening is active
    if (!isListening) return;

    // Deactivation commands
    if (commands.deactivation.some(cmd => command.includes(cmd))) {
      setIsListening(false);
      speakFeedback('Voice commands deactivated. Say "listen now" to activate again.');
      return;
    }

    // Navigation commands
    if (command.includes('scroll up')) {
      window.scrollBy({ top: -300, behavior: 'smooth' });
      speakFeedback('Scrolling up');
    } else if (command.includes('scroll down')) {
      window.scrollBy({ top: 300, behavior: 'smooth' });
      speakFeedback('Scrolling down');
    } else if (command.includes('scroll to top')) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      speakFeedback('Scrolling to top');
    } else if (command.includes('scroll to bottom')) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      speakFeedback('Scrolling to bottom');
    }

    // Selection commands
    else if (command.startsWith('select ') || command.startsWith('choose ') || command.startsWith('focus on ')) {
      const productName = command.replace(/(select|choose|focus on)\s+/, '');
      handleProductSelection(productName);
    }

    // Action commands
    else if (command.includes('add to cart')) {
      handleAddToCart();
    } else if (command.includes('buy now')) {
      handleBuyNow();
    } else if (command.includes('exit') || command.includes('close') || command.includes('go back')) {
      handleExit();
    }

    // Unknown command
    else {
      console.log('Unknown command:', command);
    }

    // Clear transcript after processing
    setTimeout(() => setTranscript(''), 1000);
    setStatus('listening');
  }, [isListening]);

  // Text-to-speech feedback
  const speakFeedback = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  // Handle product selection
  const handleProductSelection = (productName) => {
    // Find product element - this will be implemented in the UI component
    const event = new CustomEvent('voiceSelectProduct', { 
      detail: { productName } 
    });
    window.dispatchEvent(event);
    speakFeedback(`Selecting ${productName}`);
  };

  // Handle add to cart
  const handleAddToCart = () => {
    const event = new CustomEvent('voiceAddToCart');
    window.dispatchEvent(event);
    speakFeedback('Adding to cart');
  };

  // Handle buy now
  const handleBuyNow = () => {
    const event = new CustomEvent('voiceBuyNow');
    window.dispatchEvent(event);
    speakFeedback('Buying now');
  };

  // Handle exit
  const handleExit = () => {
    const event = new CustomEvent('voiceExit');
    window.dispatchEvent(event);
    speakFeedback('Closing');
  };

  // Start listening
  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting recognition:', error);
        setError('Failed to start voice recognition');
      }
    }
  };

  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
        setStatus('inactive');
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
  };

  // Toggle listening
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Initialize on component mount
  useEffect(() => {
    recognitionRef.current = initializeRecognition();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [initializeRecognition]);

  return {
    isListening,
    transcript,
    status,
    error,
    startListening,
    stopListening,
    toggleListening,
    commandsHistory: commandsHistoryRef.current,
  };
};