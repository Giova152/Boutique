import { Facebook, Twitter, Linkedin, Mail, Link2 } from 'lucide-react';

export default function ShareButtons({ url, title, description }) {
  const encodedUrl = encodeURIComponent(url || window.location.href);
  const encodedTitle = encodeURIComponent(title || 'VEGEDERM - Cosmétiques Naturels');
  const encodedDesc = encodeURIComponent(description || 'Découvrez les produits cosmétiques naturels de VEGEDERM!');

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDesc}%0A%0A${encodedUrl}`
  };

  const copyLink = () => {
    navigator.clipboard.writeText(url || window.location.href);
    alert('Lien copié!');
  };

  const openShare = (platform) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400');
  };

  return (
    <div className="share-buttons">
      <span className="share-label">Partager:</span>
      <button 
        className="share-btn facebook"
        onClick={() => openShare('facebook')}
        title="Partager sur Facebook"
      >
        <Facebook size={18} />
      </button>
      <button 
        className="share-btn twitter"
        onClick={() => openShare('twitter')}
        title="Partager sur Twitter"
      >
        <Twitter size={18} />
      </button>
      <button 
        className="share-btn linkedin"
        onClick={() => openShare('linkedin')}
        title="Partager sur LinkedIn"
      >
        <Linkedin size={18} />
      </button>
      <button 
        className="share-btn email"
        onClick={() => openShare('email')}
        title="Partager par email"
      >
        <Mail size={18} />
      </button>
      <button 
        className="share-btn copy"
        onClick={copyLink}
        title="Copier le lien"
      >
        <Link2 size={18} />
      </button>

      <style>{`
        .share-buttons {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .share-label {
          font-size: 14px;
          color: var(--text-secondary);
          font-weight: 600;
        }
        
        .share-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        
        .share-btn:hover {
          transform: translateY(-3px);
        }
        
        .share-btn.facebook {
          background: #1877f2;
          color: white;
        }
        
        .share-btn.twitter {
          background: #1da1f2;
          color: white;
        }
        
        .share-btn.linkedin {
          background: #0a66c2;
          color: white;
        }
        
        .share-btn.email {
          background: #333;
          color: white;
        }
        
        .share-btn.copy {
          background: var(--secondary);
          color: var(--primary);
          border: 1px solid #ddd;
        }
        
        .share-btn.copy:hover {
          background: var(--primary);
          color: white;
        }
      `}</style>
    </div>
  );
}
