import React, { useState, useEffect } from 'react';
import { Card, Transaction, User, CardDesign, CardStatus } from './types';
import { CardWidget } from './components/CardWidget';
import { TransactionList } from './components/TransactionList';
import { SandboxControls } from './components/SandboxControls';
import { 
  INITIAL_CARDS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_USER, 
  generateCardDetails,
  MOCK_MERCHANTS
} from './mockData';
import { 
  Smartphone, 
  CreditCard, 
  Lock, 
  Unlock, 
  Key, 
  Plus, 
  LogOut, 
  CheckCircle, 
  AlertTriangle, 
  DollarSign, 
  Wallet,
  ShieldCheck, 
  Wifi, 
  Battery, 
  Signal, 
  Info, 
  Eye, 
  EyeOff, 
  RefreshCw,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function App() {
  // --- Persistent State Layer ---
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('apex_user');
    return stored ? JSON.parse(stored) : null;
  });

  const [cards, setCards] = useState<Card[]>(() => {
    const stored = localStorage.getItem('apex_cards');
    return stored ? JSON.parse(stored) : INITIAL_CARDS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const stored = localStorage.getItem('apex_transactions');
    return stored ? JSON.parse(stored) : INITIAL_TRANSACTIONS;
  });

  const [selectedCardId, setSelectedCardId] = useState<string>(() => {
    const stored = localStorage.getItem('apex_selected_card_id');
    if (stored) return stored;
    return INITIAL_CARDS[0]?.id || '';
  });

  // --- Auth Form State ---
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  // --- Mobile Screen Routing & Sheets ---
  const [activeSheet, setActiveSheet] = useState<'none' | 'create_card' | 'pin_change' | 'pin_reset' | 'reveal_details'>('none');
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  // --- Create Card Form State ---
  const [newCardLabel, setNewCardLabel] = useState('Daily Expenses');
  const [newCardDesign, setNewCardDesign] = useState<CardDesign>('black');
  const [newCardHolder, setNewCardHolder] = useState('');
  const [newCardFunding, setNewCardFunding] = useState('250');

  // --- PIN Actions Form State ---
  const [pinChangeNew, setPinChangeNew] = useState('');
  const [pinChangeConfirm, setPinChangeConfirm] = useState('');
  const [pinResetPassword, setPinResetPassword] = useState('');
  const [securityDetailsPin, setSecurityDetailsPin] = useState('');
  const [cardRevealedIds, setCardRevealedIds] = useState<Record<string, boolean>>({});

  // --- Clock Sync ---
  const [currentTime, setCurrentTime] = useState('');

  // Sync state to LocalStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('apex_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('apex_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('apex_cards', JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    localStorage.setItem('apex_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    if (selectedCardId) {
      localStorage.setItem('apex_selected_card_id', selectedCardId);
    }
  }, [selectedCardId]);

  // Handle active card bounds
  useEffect(() => {
    if (cards.length > 0 && !cards.find(c => c.id === selectedCardId)) {
      setSelectedCardId(cards[0].id);
    }
  }, [cards, selectedCardId]);

  // Keep phone status clock ticking
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      setCurrentTime(`${hours}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Helper to trigger mobile simulator alerts (toasts)
  const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setShowToast({ message, type });
    setTimeout(() => {
      setShowToast(null);
    }, 4500);
  };

  // --- Secure Auth Flow ---
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setLoginError('Please enter both email and password.');
      return;
    }
    
    // Simulate validation
    if (loginEmail === 'abiolahafeez@gmail.com' && loginPassword === 'password123') {
      const authenticatedUser: User = {
        id: 'usr_1',
        email: loginEmail,
        name: 'Abiola Hafeez',
        isLoggedIn: true,
      };
      setUser(authenticatedUser);
      setLoginError('');
      setLoginEmail('');
      setLoginPassword('');
      triggerToast('Welcome back, Abiola!', 'success');
    } else if (loginEmail.includes('@') && loginPassword.length >= 6) {
      // Allow custom credentials for demo ease
      const authenticatedUser: User = {
        id: `usr_${Date.now()}`,
        email: loginEmail,
        name: loginEmail.split('@')[0],
        isLoggedIn: true,
      };
      setUser(authenticatedUser);
      setLoginError('');
      setLoginEmail('');
      setLoginPassword('');
      triggerToast('Account logged in successfully!', 'success');
    } else {
      setLoginError('Invalid credentials. (Hint: Use abiolahafeez@gmail.com / password123)');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName || !registerEmail || !registerPassword) {
      setLoginError('All fields are required.');
      return;
    }
    if (registerPassword.length < 6) {
      setLoginError('Password must be at least 6 characters.');
      return;
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      email: registerEmail,
      name: registerName,
      isLoggedIn: true,
    };
    setUser(newUser);
    setNewCardHolder(registerName);
    setIsRegistering(false);
    setLoginError('');
    triggerToast(`Welcome, ${registerName}!`, 'success');
  };

  const handleLogout = () => {
    setUser(null);
    setCardRevealedIds({});
    setActiveSheet('none');
    triggerToast('Securely logged out of your session', 'info');
  };

  // Auto-fill test user helper
  const handleAutofill = () => {
    setLoginEmail('abiolahafeez@gmail.com');
    setLoginPassword('password123');
    setLoginError('');
  };

  // --- Card Lifecycle Flow ---
  const handleCreateCardRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const holder = newCardHolder.trim() || user.name;
    const fundingAmt = parseFloat(newCardFunding) || 0;

    // Generate credit/debit card metadata
    const generated = generateCardDetails(holder, newCardDesign);
    const newCardId = `card_${Date.now()}`;

    const newCard: Card = {
      id: newCardId,
      type: 'debit',
      design: newCardDesign,
      label: newCardLabel.trim() || 'Shopping Card',
      holderName: holder,
      pan: generated.pan,
      cvv: generated.cvv,
      expiryDate: generated.expiryDate,
      balance: fundingAmt,
      pin: null, // Critical: new cards start with NO PIN
      status: 'inactive', // Critical: brand new card is inactive until PIN setup
      createdAt: new Date().toISOString(),
    };

    // Update state
    setCards(prev => [...prev, newCard]);
    setSelectedCardId(newCardId);

    // Record initial funding transaction if positive
    if (fundingAmt > 0) {
      const fundingTx: Transaction = {
        id: `tx_fund_${Date.now()}`,
        cardId: newCardId,
        merchant: 'Initial Core Funding',
        category: 'funding',
        amount: fundingAmt,
        date: new Date().toISOString(),
        status: 'approved',
      };
      setTransactions(prev => [fundingTx, ...prev]);
    }

    // Reset Form
    setNewCardLabel('Daily Expenses');
    setNewCardFunding('250');
    setActiveSheet('none');

    triggerToast('💳 Card Issued! Set your PIN below to activate it.', 'success');
  };

  // --- Instant Blocking / Unblocking ---
  const handleToggleBlock = (cardId: string) => {
    setCards(prev => prev.map(c => {
      if (c.id === cardId) {
        const isCurrentlyBlocked = c.status === 'blocked';
        let nextStatus: CardStatus = 'active';
        
        if (isCurrentlyBlocked) {
          // If unblocking, check if it had a pin set. If not, it returns to inactive!
          nextStatus = c.pin ? 'active' : 'inactive';
          triggerToast(`🔓 Card unblocked instantly. Status: ${nextStatus.toUpperCase()}`, 'success');
        } else {
          nextStatus = 'blocked';
          triggerToast('🔒 Card locked instantly. No transactions allowed.', 'error');
        }

        return { ...c, status: nextStatus };
      }
      return c;
    }));
  };

  // --- PIN Setup & Change Flow ---
  // "the moment a card is created, a PIN change will activate the card for usage"
  const handlePinChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinChangeNew.length !== 4 || !/^\d+$/.test(pinChangeNew)) {
      triggerToast('PIN must be exactly 4 digits.', 'error');
      return;
    }
    if (pinChangeNew !== pinChangeConfirm) {
      triggerToast('PIN confirmation does not match.', 'error');
      return;
    }

    setCards(prev => prev.map(c => {
      if (c.id === selectedCardId) {
        const wasInactive = c.status === 'inactive';
        const updatedCard = {
          ...c,
          pin: pinChangeNew,
          status: 'active' as CardStatus, // Activates the card!
        };

        if (wasInactive) {
          // Add a system log transaction for card activation
          const activationTx: Transaction = {
            id: `tx_act_${Date.now()}`,
            cardId: c.id,
            merchant: 'PIN Activation Complete',
            category: 'funding', // Shows up green
            amount: 0.00,
            date: new Date().toISOString(),
            status: 'approved' as const,
          };
          setTransactions(prevTxs => [activationTx, ...prevTxs]);
          triggerToast('🎉 PIN changed successfully! Card is now ACTIVE and ready for use.', 'success');
        } else {
          triggerToast('🔐 PIN security code updated successfully.', 'success');
        }

        return updatedCard;
      }
      return c;
    }));

    setPinChangeNew('');
    setPinChangeConfirm('');
    setActiveSheet('none');
  };

  // --- PIN Reset Flow ---
  const handlePinResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinResetPassword) {
      triggerToast('Please confirm your master password to authenticate.', 'error');
      return;
    }

    // Simulate password validation (e.g. check standard account password)
    if (pinResetPassword === 'password123' || (user && pinResetPassword.length >= 6)) {
      setCards(prev => prev.map(c => {
        if (c.id === selectedCardId) {
          triggerToast('⚠️ PIN has been wiped. Setup a new PIN to activate.', 'info');
          return {
            ...c,
            pin: null,
            status: 'inactive' as CardStatus, // Returns to inactive
          };
        }
        return c;
      }));
      setPinResetPassword('');
      setActiveSheet('pin_change'); // Redirect directly to the PIN set page for easy flow!
    } else {
      triggerToast('Invalid account password. Authentication failed.', 'error');
    }
  };

  // --- Peek Secret Card details ---
  const handleRevealDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activeCard = cards.find(c => c.id === selectedCardId);
    if (!activeCard) return;

    if (!activeCard.pin) {
      triggerToast('Card is not activated. Setup a PIN first.', 'error');
      return;
    }

    if (securityDetailsPin === activeCard.pin) {
      setCardRevealedIds(prev => ({ ...prev, [selectedCardId]: true }));
      triggerToast('🔐 Security verified. Showing sensitive card details.', 'success');
      setSecurityDetailsPin('');
      setActiveSheet('none');
    } else {
      triggerToast('Incorrect 4-Digit Card PIN. Access Denied.', 'error');
    }
  };

  const handleHideDetails = (cardId: string) => {
    setCardRevealedIds(prev => ({ ...prev, [cardId]: false }));
  };

  // --- Sandbox Interactive Charging Simulations ---
  const simulateMerchantTransaction = (
    merchant: string,
    category: 'shopping' | 'dining' | 'entertainment' | 'utilities' | 'transfer',
    amount: number
  ) => {
    const activeCard = cards.find(c => c.id === selectedCardId);
    if (!activeCard) {
      triggerToast('No target card selected.', 'error');
      return;
    }

    const txId = `tx_sim_${Date.now()}`;
    let txStatus: 'approved' | 'pending' | 'declined' = 'approved';
    let errorMessage = '';

    // Card business logic validation rules:
    if (activeCard.status === 'blocked') {
      txStatus = 'declined';
      errorMessage = 'Card blocked instantly';
    } else if (activeCard.status === 'inactive') {
      txStatus = 'declined';
      errorMessage = 'Card inactive (Awaiting initial PIN setup)';
    } else if (activeCard.balance < amount) {
      txStatus = 'declined';
      errorMessage = 'Insufficient funds on debit card';
    }

    // Process Ledger Update
    const newTx: Transaction = {
      id: txId,
      cardId: activeCard.id,
      merchant,
      category,
      amount: -amount,
      date: new Date().toISOString(),
      status: txStatus,
    };

    setTransactions(prev => [newTx, ...prev]);

    if (txStatus === 'approved') {
      // Deduct balance
      setCards(prev => prev.map(c => {
        if (c.id === activeCard.id) {
          return { ...c, balance: Math.max(0, c.balance - amount) };
        }
        return c;
      }));
      triggerToast(`💸 Purchase of ₦${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} approved!`, 'success');
    } else {
      triggerToast(`❌ Transaction Declined: ${errorMessage}`, 'error');
    }
  };

  const simulateDeposit = (amount: number) => {
    const activeCard = cards.find(c => c.id === selectedCardId);
    if (!activeCard) {
      triggerToast('No card selected to fund.', 'error');
      return;
    }

    const newTx: Transaction = {
      id: `tx_dep_${Date.now()}`,
      cardId: activeCard.id,
      merchant: 'GTBank Direct Transfer',
      category: 'funding',
      amount,
      date: new Date().toISOString(),
      status: 'approved',
    };

    setTransactions(prev => [newTx, ...prev]);
    setCards(prev => prev.map(c => {
      if (c.id === activeCard.id) {
        return { ...c, balance: c.balance + amount };
      }
      return c;
    }));

    triggerToast(`💰 Loaded ₦${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} onto ${activeCard.label} successfully!`, 'success');
  };

  const handleResetSandbox = () => {
    if (window.confirm('Are you sure you want to restore the sandbox database to factory defaults?')) {
      localStorage.removeItem('apex_cards');
      localStorage.removeItem('apex_transactions');
      localStorage.removeItem('apex_selected_card_id');
      
      setCards(INITIAL_CARDS);
      setTransactions(INITIAL_TRANSACTIONS);
      setSelectedCardId(INITIAL_CARDS[0].id);
      setCardRevealedIds({});
      setActiveSheet('none');
      triggerToast('Database sandbox reinitialized!', 'info');
    }
  };

  const activeCard = cards.find(c => c.id === selectedCardId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {/* Outer Browser Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 z-10 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-md">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-slate-900 tracking-tight flex items-center space-x-2">
              <span>ISW Test Card Management</span>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                ISW Sandbox
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">Interactive physical mock embedded sandbox simulating mobile banking experiences.</p>
          </div>
        </div>

        {/* Global Stats bar */}
        <div className="flex items-center space-x-6 text-xs font-mono">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-semibold">User Profile</span>
            <span className="font-bold text-slate-700">{user ? user.name : 'Not Logged In'}</span>
          </div>
          <div className="h-8 w-px bg-slate-200"></div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-semibold">Simulated Cards</span>
            <span className="font-bold text-indigo-600">{cards.length} Loaded</span>
          </div>
          {user && (
            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 hover:border-slate-300 rounded-lg flex items-center space-x-1.5 font-sans font-semibold transition-all cursor-pointer text-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Responsive Grid Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Educational Flow & Sandbox Guide (Hidden on compact screens) */}
        <div className="lg:col-span-3 space-y-4 hidden lg:block">
          {/* Guide Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center space-x-1.5">
              <Info className="w-4 h-4 text-indigo-500" />
              <span>Activation Lifecycle</span>
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Explore how instant physical debit card issuance operates inside standard retail banking state flows:
            </p>

            <div className="space-y-3.5 relative pl-4 border-l border-indigo-100">
              {/* Step 1 */}
              <div className="relative">
                <div className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-indigo-50"></div>
                <h4 className="text-[11px] font-bold text-slate-800 uppercase">1. Instant Issuance</h4>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                  Log in, then request a new debit card design. The card generates instantly with masked PAN details but is initialized as <span className="text-amber-600 font-semibold uppercase">Inactive</span>.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-indigo-50"></div>
                <h4 className="text-[11px] font-bold text-slate-800 uppercase">2. PIN Setup Activation</h4>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                  Use the <strong>PIN Change</strong> control on the selected card inside the phone simulator. Providing a 4-digit PIN triggers the transition to <span className="text-emerald-600 font-semibold uppercase">Active</span> status!
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-slate-400 ring-4 ring-slate-100"></div>
                <h4 className="text-[11px] font-bold text-slate-800 uppercase">3. Charge Simulations</h4>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                  Use the Sandbox controller triggers (on the right) to run transactions. Verify that blocked or unactivated cards instantly decline charges!
                </p>
              </div>
            </div>

            {/* Hint Box */}
            <div className="mt-5 p-3 bg-indigo-50 border border-indigo-100/80 rounded-xl text-[10px] text-indigo-800">
              <span className="font-bold block uppercase tracking-wider mb-0.5">Quick Login Hint:</span>
              Use <strong className="font-mono">abiolahafeez@gmail.com</strong> / <strong className="font-mono">password123</strong> to jump straight into the dashboard with configured cards!
            </div>
          </div>

          {/* Quick Stats Panel */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs flex flex-col space-y-2">
            <span className="text-[10px] text-slate-400 font-mono font-bold tracking-wider uppercase">Sandbox Health Status</span>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Database Ledger:</span>
              <span className="text-emerald-600 font-mono flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>ONLINE</span>
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>State Persistence:</span>
              <span className="text-slate-500 font-mono">LocalStorage API</span>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: HIGH-FIDELITY MOBILE SMARTPHONE MOCK (iPhone shape) */}
        <div className="lg:col-span-5 flex justify-center py-2">
          
          {/* Main phone housing */}
          <div className="relative w-full max-w-[375px] aspect-[9/18.5] bg-slate-950 rounded-[48px] p-3.5 shadow-2xl border-4 border-slate-800/90 ring-12 ring-slate-900/40 select-none overflow-hidden">
            
            {/* Phone speaker ear-notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-slate-950 rounded-b-2xl z-40 flex items-center justify-center space-x-2">
              {/* Speaker pill */}
              <div className="w-10 h-1 bg-slate-800 rounded-full"></div>
              {/* Camera Circle */}
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800"></div>
            </div>

            {/* Left Phone Side buttons decoration (visual only) */}
            <div className="absolute -left-1 top-24 w-1 h-12 bg-slate-800 rounded-r-lg z-0"></div>
            <div className="absolute -left-1 top-40 w-1 h-10 bg-slate-800 rounded-r-lg z-0"></div>

            {/* Inner LCD screen viewport */}
            <div className="relative w-full h-full bg-white rounded-[38px] overflow-hidden flex flex-col select-text z-30 shadow-inner">
              
              {/* MOBILE APP STATUS BAR */}
              <div className="bg-white/80 backdrop-blur-md h-10 pt-4 px-6 flex justify-between items-center text-[11px] font-semibold text-slate-900 z-30 select-none">
                {/* Clock */}
                <span className="font-mono">{currentTime || '6:46 AM'}</span>
                
                {/* Icons */}
                <div className="flex items-center space-x-1.5">
                  <Signal className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-bold font-mono">5G</span>
                  <Wifi className="w-3.5 h-3.5" />
                  <div className="flex items-center space-x-0.5">
                    <Battery className="w-4 h-4 text-slate-800" />
                    <span className="text-[8px] font-mono font-bold">98%</span>
                  </div>
                </div>
              </div>

              {/* MOBILE APP CONTENT VIEWPORT */}
              <div className="flex-1 overflow-y-auto flex flex-col relative">
                
                {/* MOBILE TOAST NOTIFICATION CONTAINER */}
                {showToast && (
                  <div className="absolute top-2 left-3 right-3 z-50 animate-bounce">
                    <div className={`p-2.5 rounded-xl text-[11px] font-semibold shadow-lg border flex items-center space-x-1.5 ${
                      showToast.type === 'success' 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : showToast.type === 'error'
                          ? 'bg-red-50 border-red-200 text-red-800'
                          : 'bg-indigo-50 border-indigo-200 text-indigo-800'
                    }`}>
                      {showToast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                      {showToast.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />}
                      {showToast.type === 'info' && <Info className="w-4 h-4 text-indigo-600 flex-shrink-0" />}
                      <span className="leading-tight">{showToast.message}</span>
                    </div>
                  </div>
                )}

                {/* --- APP LEVEL ROUTING VIEWPORTS --- */}
                {!user ? (
                  /* ================= LOGIN & AUTHENTICATION SCREENS ================= */
                  <div className="flex-1 flex flex-col justify-between px-6 py-4 bg-slate-50">
                    
                    {/* Header */}
                    <div className="text-center pt-8">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-600 mx-auto flex items-center justify-center shadow-md mb-3">
                        <CreditCard className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-lg font-black tracking-tight text-slate-900">ISW TEST PAY</h2>
                      <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Mobile Banking Client</p>
                    </div>

                    {isRegistering ? (
                      /* Signup Form */
                      <form onSubmit={handleRegisterSubmit} className="space-y-3 my-auto">
                        <h3 className="text-sm font-bold text-slate-800 mb-1">Create Account</h3>
                        
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Full Name</label>
                          <input
                            type="text"
                            id="input-reg-name"
                            required
                            value={registerName}
                            onChange={(e) => setRegisterName(e.target.value)}
                            placeholder="Abiola Hafeez"
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Email Address</label>
                          <input
                            type="email"
                            id="input-reg-email"
                            required
                            value={registerEmail}
                            onChange={(e) => setRegisterEmail(e.target.value)}
                            placeholder="abiolahafeez@gmail.com"
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Security Password</label>
                          <input
                            type="password"
                            id="input-reg-pass"
                            required
                            value={registerPassword}
                            onChange={(e) => setRegisterPassword(e.target.value)}
                            placeholder="Min 6 characters"
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>

                        {loginError && (
                          <p className="text-[10px] font-bold text-red-600 leading-tight bg-red-50 p-2 rounded-lg border border-red-100">{loginError}</p>
                        )}

                        <button
                          type="submit"
                          id="btn-submit-register"
                          className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                        >
                          Register & Sign In
                        </button>
                      </form>
                    ) : (
                      /* Login Form */
                      <form onSubmit={handleLoginSubmit} className="space-y-3.5 my-auto">
                        <div className="text-center mb-1">
                          <p className="text-[11px] text-slate-600 font-medium">Please sign in to manage your premium debit cards.</p>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Client Email</label>
                          <input
                            type="email"
                            id="input-login-email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            placeholder="abiolahafeez@gmail.com"
                            className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 placeholder-slate-400 font-medium"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Password</label>
                          </div>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              id="input-login-password"
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 placeholder-slate-400 font-mono"
                            />
                            <button
                              type="button"
                              id="btn-toggle-login-pass"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {loginError && (
                          <p className="text-[10px] font-bold text-red-600 leading-tight bg-red-50 p-2 rounded-lg border border-red-100">{loginError}</p>
                        )}

                        <button
                          type="submit"
                          id="btn-submit-login"
                          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center space-x-1"
                        >
                          <span>Secure Login</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        {/* Autofill Demo Quick Trigger */}
                        <div className="border-t border-slate-200/60 pt-3 text-center">
                          <span className="text-[9px] text-slate-400 block mb-1.5 font-bold uppercase">Sandbox Test Bypass</span>
                          <button
                            type="button"
                            id="btn-quick-autofill"
                            onClick={handleAutofill}
                            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-mono text-[10px] font-bold rounded-md transition-all inline-flex items-center space-x-1 cursor-pointer border border-slate-300"
                          >
                            <RefreshCw className="w-3 h-3 animate-spin-slow" />
                            <span>Autofill Abiola Profile</span>
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Switcher */}
                    <div className="text-center pt-2 border-t border-slate-200/60">
                      <button
                        type="button"
                        id="btn-switch-auth-mode"
                        onClick={() => {
                          setIsRegistering(!isRegistering);
                          setLoginError('');
                        }}
                        className="text-[11px] text-indigo-600 hover:text-indigo-500 font-bold cursor-pointer"
                      >
                        {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Register"}
                      </button>
                    </div>

                    {/* Bottom Security Credit */}
                    <div className="text-center pt-2">
                      <p className="text-[9px] text-slate-400 font-mono flex items-center justify-center space-x-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span>AES-256 Encrypted Local Sandbox</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  /* ================= LOGGED IN BANKING INTERFACE ================= */
                  <div className="flex-1 flex flex-col bg-slate-50 pb-8">
                    
                    {/* APP HEADER */}
                    <div className="px-5 pt-3 pb-2 flex justify-between items-center bg-white border-b border-slate-100">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-xs font-bold text-indigo-600">
                          {user.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-3">Welcome</p>
                          <p className="text-xs font-bold text-slate-800 leading-3">{user.name}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        id="btn-mobile-request-card"
                        onClick={() => setActiveSheet('create_card')}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 hover:border-indigo-200 text-indigo-700 font-bold text-[11px] rounded-lg flex items-center space-x-1 transition-all cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Request Card</span>
                      </button>
                    </div>

                    {/* CARDS SCROLLER SECTION */}
                    <div className="p-4 bg-white border-b border-slate-100">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Your Debit Cards</h3>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {cards.findIndex(c => c.id === selectedCardId) + 1} of {cards.length}
                        </span>
                      </div>

                      {cards.length === 0 ? (
                        <div className="py-6 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center p-4">
                          <CreditCard className="w-8 h-8 text-slate-300 mb-1" />
                          <p className="text-xs font-bold text-slate-700">No active cards</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 mb-2.5">Generate a new Visa debit card to begin transacting.</p>
                          <button
                            type="button"
                            id="btn-empty-create-card"
                            onClick={() => setActiveSheet('create_card')}
                            className="px-3 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-lg cursor-pointer"
                          >
                            Create First Card
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* Selected Card View */}
                          {activeCard && (
                            <CardWidget
                              card={activeCard}
                              showSecureDetails={!!cardRevealedIds[activeCard.id]}
                              onToggleDetails={() => {
                                if (cardRevealedIds[activeCard.id]) {
                                  handleHideDetails(activeCard.id);
                                } else {
                                  // Prompt PIN code authentication to unlock
                                  setActiveSheet('reveal_details');
                                }
                              }}
                            />
                          )}

                          {/* Quick Carousel Selector Dot Bullets */}
                          <div className="flex justify-center space-x-1.5 pt-1.5">
                            {cards.map((c) => (
                              <button
                                key={c.id}
                                id={`dot-select-${c.id}`}
                                type="button"
                                onClick={() => {
                                  setSelectedCardId(c.id);
                                  // Reset reveal states when switching
                                  setCardRevealedIds({});
                                }}
                                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                                  c.id === selectedCardId ? 'w-4 bg-slate-900' : 'bg-slate-300 hover:bg-slate-400'
                                }`}
                                title={`Select ${c.label}`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {activeCard ? (
                      /* ================= CHOSEN CARD WORKSPACE ================= */
                      <div className="px-4 pt-3 flex-1 flex flex-col space-y-4">
                        
                        {/* BALANCE VIEW & LOCK QUICK VIEW */}
                        <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-xs flex justify-between items-center">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Available Balance</span>
                            <span className="font-mono text-lg font-black text-slate-900 animate-fade-in">
                              ₦{activeCard.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                          
                          {/* Quick Block Status Badge */}
                          <div className="text-right">
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Quick Switch</span>
                            <button
                              type="button"
                              id={`btn-toggle-block-switch-${activeCard.id}`}
                              onClick={() => handleToggleBlock(activeCard.id)}
                              className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all flex items-center space-x-1 cursor-pointer ${
                                activeCard.status === 'blocked'
                                  ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                                  : 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100'
                              }`}
                            >
                              {activeCard.status === 'blocked' ? (
                                <>
                                  <Lock className="w-3 h-3 text-red-600" />
                                  <span>Unblock</span>
                                </>
                              ) : (
                                <>
                                  <Unlock className="w-3 h-3 text-emerald-600" />
                                  <span>Block Card</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* HIGH PRIORITY MANAGEMENT BUTTON RAIL */}
                        <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-xs">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Card Security Operations</span>
                          
                          <div className="grid grid-cols-2 gap-2">
                            {/* PIN Setup/Change */}
                            <button
                              type="button"
                              id="btn-action-pin-change"
                              onClick={() => {
                                setPinChangeNew('');
                                setPinChangeConfirm('');
                                setActiveSheet('pin_change');
                              }}
                              className="px-2.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-lg flex flex-col items-center justify-center text-center transition-all cursor-pointer"
                            >
                              <Key className="w-4.5 h-4.5 text-indigo-600 mb-1" />
                              <span className="text-[10px] font-extrabold text-slate-700">Set / Change PIN</span>
                              <span className="text-[8px] text-slate-400 mt-0.5">
                                {activeCard.pin ? 'Update security' : 'Activate Debit Card'}
                              </span>
                            </button>

                            {/* PIN Reset */}
                            <button
                              type="button"
                              id="btn-action-pin-reset"
                              onClick={() => {
                                setPinResetPassword('');
                                setActiveSheet('pin_reset');
                              }}
                              className="px-2.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-lg flex flex-col items-center justify-center text-center transition-all cursor-pointer"
                            >
                              <RefreshCw className="w-4.5 h-4.5 text-indigo-600 mb-1" />
                              <span className="text-[10px] font-extrabold text-slate-700">PIN Reset</span>
                              <span className="text-[8px] text-slate-400 mt-0.5">Wipe & re-initialize</span>
                            </button>
                          </div>
                        </div>

                        {/* REAL-TIME TRANSACTION LOG FOR THIS CARD */}
                        <div className="flex-1 min-h-0">
                          <TransactionList 
                            transactions={transactions} 
                            cardId={activeCard.id} 
                          />
                        </div>

                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                        <CreditCard className="w-12 h-12 text-slate-300 mb-2" />
                        <p className="text-xs font-bold">No Card Selected</p>
                        <p className="text-[10px] text-slate-400 max-w-[200px] mt-0.5">
                          Click "Request Card" above to provision a mock debit card.
                        </p>
                      </div>
                    )}

                  </div>
                )}

                {/* ================= MODAL SLIDE UP SHEETS (EMBEDDED SIMULATION SHEETS) ================= */}
                {activeSheet !== 'none' && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] z-40 flex flex-col justify-end">
                    
                    {/* Sheet Backdrop Click Dismiss */}
                    <div className="flex-1" onClick={() => setActiveSheet('none')}></div>

                    {/* Sheet Panel Body */}
                    <div className="bg-white rounded-t-3xl p-5 shadow-2xl max-h-[85%] overflow-y-auto animate-slide-up border-t border-slate-200">
                      
                      {/* Pull grab-bar decoration */}
                      <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4"></div>

                      {/* SHEET ROUTER */}
                      {activeSheet === 'create_card' && (
                        /* CREATE CARD FORM */
                        <form onSubmit={handleCreateCardRequest} className="space-y-4">
                          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                            <h3 className="text-sm font-black text-slate-900">Request New Debit Card</h3>
                            <button
                              type="button"
                              onClick={() => setActiveSheet('none')}
                              className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>

                          <div>
                            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Card Nickname Label</label>
                            <input
                              type="text"
                              id="input-card-label"
                              required
                              value={newCardLabel}
                              onChange={(e) => setNewCardLabel(e.target.value)}
                              placeholder="e.g. Travel Expenses, Backup Debit"
                              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Primary Holder Name</label>
                            <input
                              type="text"
                              id="input-card-holder"
                              value={newCardHolder || (user ? user.name : '')}
                              onChange={(e) => setNewCardHolder(e.target.value)}
                              placeholder="Name printed on card"
                              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <span className="text-[9px] text-slate-400 block mt-0.5">Defaults to account profile owner.</span>
                          </div>

                          {/* Design Selection Grid */}
                          <div>
                            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5">Polymer Theme Design</label>
                            <div className="grid grid-cols-4 gap-2">
                              {[
                                { value: 'black', label: 'Matte Black', classes: 'bg-slate-900 border-slate-950 text-white' },
                                { value: 'silver', label: 'Metallic', classes: 'bg-slate-200 border-slate-300 text-slate-800' },
                                { value: 'gold', label: 'Royal Gold', classes: 'bg-amber-400 border-amber-500 text-amber-950' },
                                { value: 'green', label: 'Vibrant Green', classes: 'bg-emerald-600 border-emerald-700 text-emerald-50' }
                              ].map((theme) => (
                                <button
                                  key={theme.value}
                                  id={`btn-design-pick-${theme.value}`}
                                  type="button"
                                  onClick={() => setNewCardDesign(theme.value as CardDesign)}
                                  className={`p-2 text-[9px] font-bold rounded-lg border flex flex-col items-center justify-center text-center cursor-pointer transition-all ${theme.classes} ${
                                    newCardDesign === theme.value 
                                      ? 'ring-2 ring-indigo-500 ring-offset-1 scale-105 opacity-100' 
                                      : 'opacity-70 hover:opacity-100'
                                  }`}
                                >
                                  <span className="w-3.5 h-3.5 rounded-full bg-white/20 border border-white/25 mb-1"></span>
                                  <span className="truncate max-w-[50px]">{theme.label}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Initial Funding Loader */}
                          <div>
                            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Initial Funding Load (from checking)</label>
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-xs font-mono font-bold text-slate-400">₦</span>
                              <input
                                type="number"
                                id="input-card-initial-fund"
                                value={newCardFunding}
                                onChange={(e) => setNewCardFunding(e.target.value)}
                                min="0"
                                max="10000"
                                className="w-full pl-6 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                              />
                            </div>
                            <span className="text-[9px] text-slate-400 block mt-0.5">Fund card immediately to run purchase simulations.</span>
                          </div>

                          <button
                            type="submit"
                            id="btn-confirm-create-card"
                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                          >
                            Instantly Issue Debit Card
                          </button>
                        </form>
                      )}

                      {activeSheet === 'pin_change' && (
                        /* PIN SETUP & ALTERATION */
                        <form onSubmit={handlePinChangeSubmit} className="space-y-4">
                          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                            <div className="flex items-center space-x-1.5">
                              <Key className="w-4.5 h-4.5 text-indigo-600 animate-pulse" />
                              <h3 className="text-sm font-black text-slate-900">
                                {activeCard?.pin ? 'Update Security PIN' : 'Activate Debit Card PIN'}
                              </h3>
                            </div>
                            <button
                              type="button"
                              onClick={() => setActiveSheet('none')}
                              className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>

                          {!activeCard?.pin && (
                            <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-xl text-[10px] text-amber-800 leading-normal flex items-start space-x-1.5">
                              <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                              <p>
                                <strong>Activation Flow Requirement:</strong> Newly issued cards are locked. Setting your custom 4-digit PIN will immediately activate this physical ledger for online payments and transactions.
                              </p>
                            </div>
                          )}

                          <div className="space-y-3">
                            <div>
                              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">New 4-Digit PIN Code</label>
                              <input
                                type="password"
                                id="input-pin-new"
                                maxLength={4}
                                required
                                value={pinChangeNew}
                                onChange={(e) => setPinChangeNew(e.target.value.replace(/\D/g, ''))}
                                placeholder="e.g. 1234"
                                className="w-full text-center tracking-[1em] px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono font-bold"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Confirm 4-Digit PIN</label>
                              <input
                                type="password"
                                id="input-pin-confirm"
                                maxLength={4}
                                required
                                value={pinChangeConfirm}
                                onChange={(e) => setPinChangeConfirm(e.target.value.replace(/\D/g, ''))}
                                placeholder="e.g. 1234"
                                className="w-full text-center tracking-[1em] px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono font-bold"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            id="btn-confirm-pin"
                            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                          >
                            {activeCard?.pin ? 'Update Security PIN' : 'Activate Card with PIN'}
                          </button>
                        </form>
                      )}

                      {activeSheet === 'pin_reset' && (
                        /* PIN RESET CODE WIPER */
                        <form onSubmit={handlePinResetSubmit} className="space-y-4">
                          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                            <h3 className="text-sm font-black text-slate-900 text-red-600">PIN Reset Request</h3>
                            <button
                              type="button"
                              onClick={() => setActiveSheet('none')}
                              className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>

                          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-[10px] text-red-800 leading-normal">
                            ⚠️ This security operation will completely wipe the existing 4-digit PIN for <strong>{activeCard?.label}</strong>. The card will transition back to an <strong className="uppercase">Inactive (Awaiting PIN)</strong> state immediately.
                          </div>

                          <div>
                            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Confirm Account Password</label>
                            <input
                              type="password"
                              id="input-reset-password"
                              required
                              value={pinResetPassword}
                              onChange={(e) => setPinResetPassword(e.target.value)}
                              placeholder="Enter your master password (password123)"
                              className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                            />
                          </div>

                          <button
                            type="submit"
                            id="btn-confirm-pin-reset"
                            className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                          >
                            Authenticate & Wipe PIN
                          </button>
                        </form>
                      )}

                      {activeSheet === 'reveal_details' && (
                        /* SECURE DETAIL REVEAL PROMPT */
                        <form onSubmit={handleRevealDetailsSubmit} className="space-y-4">
                          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                            <h3 className="text-sm font-black text-slate-900">Verify Card Security PIN</h3>
                            <button
                              type="button"
                              onClick={() => setActiveSheet('none')}
                              className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>

                          <p className="text-[10px] text-slate-500">
                            To view sensitive card numbers, expiration dates, and the CVV safety code, please enter the active PIN for this card.
                          </p>

                          <div>
                            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">4-Digit PIN Code</label>
                            <input
                              type="password"
                              id="input-secure-reveal-pin"
                              maxLength={4}
                              required
                              value={securityDetailsPin}
                              onChange={(e) => setSecurityDetailsPin(e.target.value.replace(/\D/g, ''))}
                              placeholder="••••"
                              className="w-full text-center tracking-[1em] px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono font-bold"
                            />
                            <span className="text-[8px] text-slate-400 block mt-1 text-center">
                              Hint: Use the 4-digit PIN you configured for this card.
                            </span>
                          </div>

                          <button
                            type="submit"
                            id="btn-confirm-secure-reveal"
                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                          >
                            Verify & Show Details
                          </button>
                        </form>
                      )}

                    </div>
                  </div>
                )}

              </div>

              {/* PHONE HOME NAVIGATION PILL OVERLAY */}
              <div className="bg-white/80 backdrop-blur-md h-5 pb-1 flex justify-center items-center z-30 select-none">
                <div className="w-28 h-1 bg-slate-400 rounded-full"></div>
              </div>

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: DEVELOPER SANDBOX CONTROL LEDGER */}
        <div className="lg:col-span-4 space-y-4">
          <SandboxControls
            cards={cards}
            transactions={transactions}
            selectedCardId={selectedCardId}
            onResetSandbox={handleResetSandbox}
            onSimulateTransaction={simulateMerchantTransaction}
            onSimulateDeposit={simulateDeposit}
          />

          {/* Core Applet Settings Quick Manual */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm text-xs space-y-3">
            <h3 className="font-bold text-slate-800 tracking-tight flex items-center space-x-1.5">
              <span>🛠️ Sandbox Features Manual</span>
            </h3>
            
            <div className="space-y-2 text-slate-600 leading-relaxed text-[11px]">
              <div>
                <span className="font-bold text-slate-800 block">💳 Instant Issuance Rules:</span>
                Newly requested cards start as <strong className="text-amber-600">Awaiting PIN Activation</strong> with masked details. You cannot run simulated charges on them yet!
              </div>
              
              <div>
                <span className="font-bold text-slate-800 block">🔑 PIN Activation Switch:</span>
                Open the **Set / Change PIN** panel inside the phone. Set a 4-digit PIN. The card transitions to <strong className="text-emerald-600">Active</strong> immediately, activating the ledger.
              </div>

              <div>
                <span className="font-bold text-slate-800 block">⚡ Instant Lock/Unlock:</span>
                Toggling the **Block Card** switch immediately places the card into a frozen state. Online purchase triggers will fail with a <strong className="text-red-500 font-semibold uppercase">DECLINED</strong> status.
              </div>

              <div>
                <span className="font-bold text-slate-800 block">🔍 Multi-Layer Filters:</span>
                Filter transactions in real-time by category, search keywords, or execution status to audit account records.
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Footer Info bar */}
      <footer className="mt-auto bg-white border-t border-slate-200 px-6 py-4 text-center text-xs text-slate-400">
        <p>© 2026 ISW Test Sandbox Solutions. All rights reserved. Secure simulated environment.</p>
      </footer>
    </div>
  );
}
