import { useState } from 'react';
import { sendCommunication } from '../lib/api';
import { X, Send } from 'lucide-react';

interface CommunicationModalProps {
  parentId: string;
  parentName: string;
  onClose: () => void;
}

export function CommunicationModal({ parentId, parentName, onClose }: CommunicationModalProps) {
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'whatsapp' | 'email'>('whatsapp');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendCommunication({ parentId, message, type });
      setSuccess(true);
      setTimeout(onClose, 2000);
    } catch (err) {
      console.error(err);
      alert('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 border-4 border-black rounded-3xl w-full max-w-md p-6 relative shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-black mb-1">Message Parent</h2>
        <p className="text-gray-500 mb-6 font-bold">To: {parentName}</p>

        {success ? (
          <div className="p-4 bg-green-100 text-green-800 border-2 border-green-800 rounded-xl font-bold text-center">
            Message sent successfully!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">Message Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 font-bold cursor-pointer">
                  <input
                    type="radio"
                    checked={type === 'whatsapp'}
                    onChange={() => setType('whatsapp')}
                    className="w-4 h-4 accent-black"
                  />
                  WhatsApp
                </label>
                <label className="flex items-center gap-2 font-bold cursor-pointer">
                  <input
                    type="radio"
                    checked={type === 'email'}
                    onChange={() => setType('email')}
                    className="w-4 h-4 accent-black"
                  />
                  Email
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Message Content</label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3 border-2 border-black rounded-xl"
                rows={4}
                placeholder="Type your message here..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#8d6be8] text-white font-black text-lg rounded-xl border-2 border-black hover:bg-[#734bd3] disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
