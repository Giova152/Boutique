import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const responses = {
  'bonjour': "Bonjour! 👋 Je suis l'assistant VEGEDERM. Comment puis-je vous aider aujourd'hui?",
  'produit': "Nos produits sont tous naturels et certifiés biologiques. Vous pouvez les retrouver dans notre boutique. Avez-vous une question sur un produit spécifique?",
  'livraison': "Nous offrons la livraison standard (5-7 jours) et express (2-3 jours). Les frais de livraison standard sont de 9,99$ et l'express 19,99$.",
  'retour': "Vous avez 30 jours pour retourner un produit non ouvert. Contactez-nous pour obtenir un numéro de retour.",
  'paiement': "Nous acceptons les cartes de crédit, PayPal et les transferts bancaires sécurisés.",
  'defaut': "Je ne suis pas sûr de comprendre votre question. Un de nos conseillers vous répondra sous 24h. Vous pouvez aussi nous contacter à zoumcosmo@gmail.com"
};

const faqs = [
  { q: 'Vos produits sont-ils testés dermatologiquement?', a: 'Oui, tous nos produits sont testés dermatologiquement et conviennent aux peaux sensibles.' },
  { q: 'Proposez-vous des échantillons gratuits?', a: 'Malheureusement, nous ne proposons pas d\'échantillons gratuits pour le moment.' },
  { q: 'Comment savoir si un produit me convient?', a: 'Chaque produit indique les types de peau et besoins pour lesquels il est recommandé.' },
  { q: 'Vos emballages sont-ils écologiques?', a: 'Oui! Nous utilisons des emballages recyclables et biodégradables.' }
];

export default function ChatSupport() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Bonjour! 👋 Je suis l\'assistant VEGEDERM. Comment puis-je vous aider?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [showFaq, setShowFaq] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage = { from: 'user', text: inputValue };
    setMessages(prev => [...prev, userMessage]);

    const input = inputValue.toLowerCase();
    let response = responses.defaut;

    if (input.includes('bonjour') || input.includes('salut') || input.includes('coucou')) {
      response = responses.bonjour;
    } else if (input.includes('produit') || input.includes('avis') || input.includes('recommander')) {
      response = responses.produit;
    } else if (input.includes('livraison') || input.includes('livrer') || input.includes('livrer')) {
      response = responses.livraison;
    } else if (input.includes('retour') || input.includes('rembourser')) {
      response = responses.retour;
    } else if (input.includes('paiement') || input.includes('payer') || input.includes('carte')) {
      response = responses.paiement;
    } else if (input.includes('faq') || input.includes('questions')) {
      setShowFaq(true);
      response = 'Voici quelques questions fréquentes:';
    }

    setTimeout(() => {
      setMessages(prev => [...prev, { from: 'bot', text: response }]);
    }, 500);

    setInputValue('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  const quickQuestions = [
    'Horaires d\'ouverture?',
    'Livraison internationale?',
    'Programme fidélité?',
    'Contact email?'
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chat-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
          >
            <div className="chat-header">
              <div className="chat-title">
                <Bot size={24} />
                <span>Support VEGEDERM</span>
              </div>
              <button className="chat-close" onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="chat-messages">
              {messages.map((msg, i) => (
                <div key={i} className={`message ${msg.from}`}>
                  {msg.from === 'bot' && <Bot size={18} />}
                  <div className="message-bubble">
                    <p>{msg.text}</p>
                  </div>
                  {msg.from === 'user' && <User size={18} />}
                </div>
              ))}
              
              {showFaq && (
                <div className="faq-section">
                  <h4>Questions fréquentes</h4>
                  {faqs.map((faq, i) => (
                    <button 
                      key={i} 
                      className="faq-item"
                      onClick={() => {
                        setMessages(prev => [...prev, { from: 'user', text: faq.q }]);
                        setTimeout(() => {
                          setMessages(prev => [...prev, { from: 'bot', text: faq.a }]);
                        }, 500);
                      }}
                    >
                      {faq.q}
                    </button>
                  ))}
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input">
              <input
                type="text"
                placeholder="Tapez votre message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button onClick={handleSend}>
                <Send size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <motion.button
          className="chat-toggle"
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <MessageCircle size={24} />
        </motion.button>
      )}

      <style>{`
        .chat-toggle {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: var(--primary);
          color: white;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(29, 78, 56, 0.4);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .chat-window {
          position: fixed;
          bottom: 100px;
          right: 24px;
          width: 360px;
          height: 500px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          z-index: 100;
        }
        
        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          background: var(--primary);
          color: white;
        }
        
        .chat-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
        }
        
        .chat-close {
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .message {
          display: flex;
          gap: 10px;
          max-width: 85%;
        }
        
        .message.bot {
          align-self: flex-start;
        }
        
        .message.user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }
        
        .message svg {
          flex-shrink: 0;
          margin-top: 4px;
        }
        
        .message.bot svg {
          color: var(--primary);
        }
        
        .message.user svg {
          color: var(--accent);
        }
        
        .message-bubble {
          padding: 12px 16px;
          border-radius: 16px;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .message.bot .message-bubble {
          background: #f0f0f0;
          border-bottom-left-radius: 4px;
        }
        
        .message.user .message-bubble {
          background: var(--primary);
          color: white;
          border-bottom-right-radius: 4px;
        }
        
        .faq-section {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #eee;
        }
        
        .faq-section h4 {
          font-size: 13px;
          color: var(--text-light);
          margin-bottom: 12px;
        }
        
        .faq-item {
          display: block;
          width: 100%;
          text-align: left;
          padding: 10px 12px;
          background: #f8f5f0;
          border: none;
          border-radius: 8px;
          margin-bottom: 8px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .faq-item:hover {
          background: var(--secondary);
        }
        
        .chat-input {
          display: flex;
          gap: 8px;
          padding: 16px;
          border-top: 1px solid #eee;
        }
        
        .chat-input input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid #ddd;
          border-radius: 24px;
          font-size: 14px;
        }
        
        .chat-input input:focus {
          border-color: var(--primary);
          outline: none;
        }
        
        .chat-input button {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--primary);
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </>
  );
}
