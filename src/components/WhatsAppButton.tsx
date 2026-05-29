import React from 'react';
import { MessageSquare } from 'lucide-react';
import { getAdminConfig } from '../lib/storage';

interface WhatsAppButtonProps {
  customMessage?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ customMessage }) => {
  const config = getAdminConfig();
  const phone = config.adminPhone.replace(/[^0-9]/g, ''); // strip non-numeric characters for link
  const message = encodeURIComponent(customMessage || "Hi Venky Digital Studio! I'm interested in ordering prints or frames.");
  const url = `https://wa.me/${phone}?text=${message}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] text-white px-5 py-3 rounded-full shadow-2xl hover:bg-[#20ba5a] transition-all transform hover:scale-105 duration-300 font-medium"
      title="Chat with us on WhatsApp"
    >
      <MessageSquare className="w-5 h-5 fill-white" />
      <span>Chat with Us</span>
    </a>
  );
};
