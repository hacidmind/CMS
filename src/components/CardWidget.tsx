import React, { useState } from 'react';
import { Card } from '../types';
import { ShieldAlert, ShieldX, Eye, EyeOff, Check, Copy } from 'lucide-react';

interface CardWidgetProps {
  card: Card;
  showSecureDetails: boolean;
  onToggleDetails?: () => void;
}

export const CardWidget: React.FC<CardWidgetProps> = ({
  card,
  showSecureDetails,
  onToggleDetails,
}) => {
  const [copied, setCopied] = useState(false);

  // Helper to format PAN into groups of 4 digits
  const formatPan = (panStr: string) => {
    return panStr.replace(/(.{4})/g, '$1 ').trim();
  };

  const getMaskedPan = (panStr: string) => {
    const lastFour = panStr.slice(-4);
    return `••••  ••••  ••••  ${lastFour}`;
  };

  const handleCopy = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Select background gradient based on card design
  const getDesignClasses = () => {
    switch (card.design) {
      case 'silver':
        return 'bg-gradient-to-br from-slate-100 via-slate-200 to-slate-400 text-slate-800 shadow-slate-300/40';
      case 'gold':
        return 'bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-600 text-amber-950 shadow-amber-500/20';
      case 'green':
        return 'bg-gradient-to-br from-emerald-400 via-teal-600 to-emerald-800 text-emerald-50 shadow-emerald-500/20';
      case 'black':
      default:
        return 'bg-gradient-to-br from-zinc-800 via-neutral-900 to-black text-slate-100 shadow-neutral-950/50 border border-neutral-800';
    }
  };

  return (
    <div className="relative w-full aspect-[1.586/1] rounded-2xl overflow-hidden shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Dynamic polymer card body */}
      <div className={`w-full h-full p-5 flex flex-col justify-between ${getDesignClasses()}`}>
        {/* Card Header: Product type and Visa Brand */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] tracking-widest uppercase font-semibold opacity-75">
              {card.type === 'debit' ? 'Debit Card' : 'Credit Card'}
            </p>
            <h3 className="font-bold text-sm tracking-tight truncate max-w-[150px] mt-0.5">
              {card.label}
            </h3>
          </div>
          
          {/* Card Logo Circle Combo (Simulating Premium Visa) */}
          <div className="flex items-center space-x-1">
            <div className="text-right mr-2">
              <span className="font-black italic text-md tracking-wider">VISA</span>
              <p className="text-[7px] leading-3 opacity-60 font-mono">SANDBOX</p>
            </div>
            <div className="w-6 h-6 rounded-full bg-red-500/80 -mr-2"></div>
            <div className="w-6 h-6 rounded-full bg-yellow-500/80"></div>
          </div>
        </div>

        {/* Holographic Chip and Contactless Antenna */}
        <div className="flex justify-between items-end mt-2">
          {/* Chip */}
          <div className="w-10 h-8 rounded-md bg-gradient-to-br from-amber-200 via-yellow-100 to-amber-300 relative overflow-hidden border border-amber-300 shadow-inner flex items-center justify-center">
            {/* Chip Grid Lines */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-0.5 opacity-20 pointer-events-none">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="border border-amber-800"></div>
              ))}
            </div>
            {/* Inner chip core */}
            <div className="w-4 h-4 rounded-sm bg-amber-400/50 border border-amber-500"></div>
          </div>

          {/* Contactless symbol */}
          <svg className="w-5 h-5 opacity-70 transform rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 8.5C6.5 10 6.5 14 5 15.5" strokeLinecap="round"/>
            <path d="M8 6C10.5 8 10.5 16 8 18" strokeLinecap="round"/>
            <path d="M11 3.5C14.5 6 14.5 18 11 20.5" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Card PAN (Masked or Unmasked) */}
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[15px] sm:text-[17px] tracking-wider select-all">
              {showSecureDetails ? formatPan(card.pan) : getMaskedPan(card.pan)}
            </p>
            {onToggleDetails && (
              <button
                type="button"
                id={`btn-toggle-peek-${card.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleDetails();
                }}
                className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                title={showSecureDetails ? "Hide Details" : "Reveal Details"}
              >
                {showSecureDetails ? <EyeOff className="w-4 h-4 opacity-80" /> : <Eye className="w-4 h-4 opacity-80" />}
              </button>
            )}
          </div>
        </div>

        {/* Card Footer: Holder Name, Expiry, CVV */}
        <div className="flex justify-between items-end mt-2">
          {/* Holder Name */}
          <div className="flex-1 mr-2">
            <p className="text-[7px] tracking-widest uppercase opacity-60 font-medium">Cardholder</p>
            <p className="font-mono text-xs uppercase font-semibold tracking-wide truncate">
              {card.holderName}
            </p>
          </div>

          {/* Expiry Date */}
          <div className="mr-4 text-center">
            <p className="text-[7px] tracking-widest uppercase opacity-60 font-medium">Expires</p>
            <p className="font-mono text-xs font-semibold">
              {showSecureDetails ? card.expiryDate : '••/••'}
            </p>
          </div>

          {/* CVV */}
          <div className="text-right">
            <p className="text-[7px] tracking-widest uppercase opacity-60 font-medium">CVV</p>
            <p className="font-mono text-xs font-semibold">
              {showSecureDetails ? card.cvv : '•••'}
            </p>
          </div>
        </div>
      </div>

      {/* Copy Shortcut Badge when unmasked */}
      {showSecureDetails && (
        <button
          type="button"
          id={`btn-copy-card-${card.id}`}
          onClick={(e) => handleCopy(card.pan, e)}
          className="absolute top-3 right-3 bg-white/20 hover:bg-white/30 backdrop-blur-md text-[9px] px-2 py-1 rounded-full flex items-center space-x-1 transition-all pointer-events-auto border border-white/20"
        >
          {copied ? (
            <>
              <Check className="w-2.5 h-2.5 text-green-300" />
              <span className="text-green-200">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-2.5 h-2.5" />
              <span>Copy PAN</span>
            </>
          )}
        </button>
      )}

      {/* BLOCKED OVERLAY */}
      {card.status === 'blocked' && (
        <div className="absolute inset-0 bg-slate-900/75 backdrop-blur-[3px] flex flex-col items-center justify-center text-white p-4 transition-all duration-300 animate-fade-in z-10">
          <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center mb-2 animate-pulse">
            <ShieldX className="w-6 h-6 text-red-500" />
          </div>
          <span className="text-xs font-mono tracking-widest uppercase font-bold text-red-400">Card Blocked</span>
          <p className="text-[10px] text-slate-300 text-center mt-1 max-w-[200px]">
            Unblock in card controls below to resume online payments and ATM transfers.
          </p>
        </div>
      )}

      {/* INACTIVE / AWAITING PIN ACTIVATION OVERLAY */}
      {card.status === 'inactive' && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] flex flex-col items-center justify-center text-white p-4 transition-all duration-300 z-10">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center mb-2">
            <ShieldAlert className="w-6 h-6 text-amber-500 animate-bounce" />
          </div>
          <span className="text-xs font-mono tracking-widest uppercase font-bold text-amber-400">Awaiting PIN Setup</span>
          <p className="text-[10px] text-slate-300 text-center mt-1 max-w-[200px]">
            Set a 4-digit PIN in the settings below to activate and unlock this card.
          </p>
        </div>
      )}
    </div>
  );
};
