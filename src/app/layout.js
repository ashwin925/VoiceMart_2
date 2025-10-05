import './globals.css';
import { Inter } from 'next/font/google';
import VoiceAssistant from './components/ui/VoiceAssistant';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'VoiceMart - Accessible E-commerce',
  description: 'An e-commerce platform controlled by voice commands for enhanced accessibility',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900 text-white min-h-screen`}>
        {children}
        <VoiceAssistant />
      </body>
    </html>
  );
}