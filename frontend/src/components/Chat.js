import React, { useState } from 'react';
import { BiMessageSquare, BiSend } from 'react-icons/bi';
import { IoMdClose } from 'react-icons/io';

const Chat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <BiMessageSquare className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-gray-900 rounded-lg shadow-xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
            <h3 className="text-white font-medium">Boat Chat</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              <IoMdClose className="w-6 h-6" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            <div className="flex flex-col space-y-1">
              <div className="text-xs text-gray-400">Bot</div>
              <div className="bg-gray-800 text-white p-3 rounded-lg max-w-[80%]">
                Hello! How can I help you today?
              </div>
            </div>
            <div className="flex flex-col items-end space-y-1">
              <div className="text-xs text-gray-400">You</div>
              <div className="bg-blue-600 text-white p-3 rounded-lg max-w-[80%]">
                Hi! I have a question about trading.
              </div>
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                <BiSend className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chat;
