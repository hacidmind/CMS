import React, { useState, useEffect, useRef } from 'react';
import { Card, Transaction } from '../types';
import { 
  Database, 
  RefreshCw, 
  Check, 
  Terminal, 
  Coins, 
  Zap, 
  ShoppingBag, 
  Utensils, 
  ChevronDown, 
  ChevronUp,
  AlertTriangle,
  Play,
  Code,
  Copy,
  Lock,
  Smartphone,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

interface SandboxControlsProps {
  cards: Card[];
  transactions: Transaction[];
  selectedCardId: string;
  onResetSandbox: () => void;
  onSimulateTransaction: (
    merchant: string, 
    category: 'shopping' | 'dining' | 'entertainment' | 'utilities' | 'transfer', 
    amount: number
  ) => void;
  onSimulateDeposit: (amount: number) => void;
}

interface ApiEndpointSpec {
  name: string;
  method: 'POST' | 'GET' | 'PATCH' | 'DELETE';
  url: string;
  description: string;
  requestBody?: any;
  responseBody: any;
}

interface ApiRequestLog {
  id: string;
  timestamp: string;
  method: 'POST' | 'GET' | 'PATCH' | 'DELETE';
  url: string;
  requestBody?: any;
  responseBody: any;
  status: number;
  statusText: string;
}

export const SandboxControls: React.FC<SandboxControlsProps> = ({
  cards,
  transactions,
  selectedCardId,
  onResetSandbox,
  onSimulateTransaction,
  onSimulateDeposit,
}) => {
  const [activeTab, setActiveTab] = useState<'triggers' | 'json' | 'api'>('triggers');
  const [showJson, setShowJson] = useState(true);
  const [depositAmount, setDepositAmount] = useState('15000');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('gateway_initiate');
  const [copiedReq, setCopiedReq] = useState(false);
  const [copiedRes, setCopiedRes] = useState(false);
  const [copiedLogId, setCopiedLogId] = useState<string | null>(null);

  // Expanded API log state to capture real-time simulations
  const [apiLogs, setApiLogs] = useState<ApiRequestLog[]>(() => {
    return [
      {
        id: 'log_init_1',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        method: 'POST',
        url: '/api/v1/auth/token',
        requestBody: { client_id: 'isw_sandbox_abiola', client_secret: 'sec_9841_isw_ngn_prod' },
        responseBody: { status: 'success', token: 'tok_isw_924a8fd3', expires_in: 3600, scope: 'virtual-cards balance payments' },
        status: 200,
        statusText: 'OK'
      }
    ];
  });

  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // WebPAY Gateway Simulator state machine
  const [checkoutStep, setCheckoutStep] = useState<'idle' | 'gateway_form' | 'gateway_otp' | 'gateway_success' | 'gateway_error'>('idle');
  const [checkoutMerchant, setCheckoutMerchant] = useState('Jumia Nigeria');
  const [checkoutAmount, setCheckoutAmount] = useState('12500');
  const [checkoutCategory, setCheckoutCategory] = useState<'shopping' | 'dining' | 'entertainment' | 'utilities' | 'transfer'>('shopping');
  const [inputPan, setInputPan] = useState('');
  const [inputExpiry, setInputExpiry] = useState('');
  const [inputCvv, setInputCvv] = useState('');
  const [inputOtp, setInputOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [checkoutErrorMsg, setCheckoutErrorMsg] = useState('');
  const [currentTxId, setCurrentTxId] = useState('');

  const selectedCard = cards.find(c => c.id === selectedCardId);

  // Reactively sync input card fields when card is selected
  useEffect(() => {
    if (selectedCard) {
      setInputPan(selectedCard.pan);
      setInputExpiry(selectedCard.expiryDate);
      setInputCvv(selectedCard.cvv);
    }
  }, [selectedCardId, selectedCard]);

  // Reactive REST API logging on card change
  const lastSelectedCardIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (selectedCard && lastSelectedCardIdRef.current !== selectedCardId) {
      const balanceLog: ApiRequestLog = {
        id: `log_bal_${Date.now()}`,
        timestamp: new Date().toISOString(),
        method: 'GET',
        url: `/api/v1/cards/${selectedCard.id}/balance`,
        responseBody: {
          status: 'success',
          data: {
            card_id: selectedCard.id,
            ledger_balance: selectedCard.balance,
            available_balance: selectedCard.balance,
            currency: 'NGN',
            card_status: selectedCard.status,
            last_queried: new Date().toISOString()
          }
        },
        status: 200,
        statusText: 'OK'
      };
      setApiLogs(prev => [balanceLog, ...prev].slice(0, 40));
      lastSelectedCardIdRef.current = selectedCardId;
    }
  }, [selectedCardId, selectedCard]);

  // Reactive logging when transaction log expands
  const lastTxLengthRef = useRef(transactions.length);
  useEffect(() => {
    if (transactions.length > lastTxLengthRef.current && selectedCard) {
      const txLog: ApiRequestLog = {
        id: `log_tx_${Date.now()}`,
        timestamp: new Date().toISOString(),
        method: 'GET',
        url: `/api/v1/cards/${selectedCard.id}/transactions`,
        responseBody: {
          status: 'success',
          metadata: {
            total_records: transactions.filter(t => t.cardId === selectedCard.id).length,
            limit: 10
          },
          data: transactions.filter(t => t.cardId === selectedCard.id).slice(0, 5).map(t => ({
            transaction_id: t.id,
            merchant_name: t.merchant,
            category: t.category,
            amount: t.amount,
            currency: 'NGN',
            status: t.status,
            timestamp: t.date
          }))
        },
        status: 200,
        statusText: 'OK'
      };
      setApiLogs(prev => [txLog, ...prev].slice(0, 40));
    }
    lastTxLengthRef.current = transactions.length;
  }, [transactions.length, selectedCardId, selectedCard]);

  // Quick transaction triggers list for Nigerian context
  const quickTriggers = [
    { merchant: 'Jumia Nigeria', category: 'shopping' as const, amount: 12500, icon: <ShoppingBag className="w-3.5 h-3.5 text-orange-400" /> },
    { merchant: 'Chicken Republic', category: 'dining' as const, amount: 4500, icon: <Utensils className="w-3.5 h-3.5 text-emerald-400" /> },
    { merchant: 'Netflix Nigeria', category: 'entertainment' as const, amount: 4400, icon: <Play className="w-3.5 h-3.5 text-red-500 animate-pulse" /> },
    { merchant: 'DSTV Subscription', category: 'entertainment' as const, amount: 19800, icon: <Play className="w-3.5 h-3.5 text-indigo-400" /> },
    { merchant: 'MTN Airtime NG', category: 'utilities' as const, amount: 5000, icon: <Zap className="w-3.5 h-3.5 text-yellow-400" /> },
    { merchant: 'IKEDC Power Prepaid', category: 'utilities' as const, amount: 15000, icon: <Zap className="w-3.5 h-3.5 text-sky-400" /> },
  ];

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (!isNaN(amt) && amt > 0) {
      // Log deposit action
      const depLog: ApiRequestLog = {
        id: `log_dep_${Date.now()}`,
        timestamp: new Date().toISOString(),
        method: 'POST',
        url: `/api/v1/cards/${selectedCardId || 'card_1'}/deposit`,
        requestBody: {
          amount: amt,
          currency: 'NGN',
          channel: 'GTBank Direct Pay'
        },
        responseBody: {
          status: 'success',
          message: 'Funds injected successfully into card account ledger balance.',
          data: {
            previous_balance: selectedCard ? selectedCard.balance : 0,
            new_balance: (selectedCard ? selectedCard.balance : 0) + amt,
            currency: 'NGN'
          }
        },
        status: 200,
        statusText: 'OK'
      };
      setApiLogs(prev => [depLog, ...prev]);
      onSimulateDeposit(amt);
    }
  };

  const handleInstantCharge = (merchant: string, category: 'shopping' | 'dining' | 'entertainment' | 'utilities' | 'transfer', amount: number) => {
    // Log instant charge API call
    const cardStatus = selectedCard ? selectedCard.status : 'inactive';
    const isApproved = selectedCard && cardStatus === 'active' && selectedCard.balance >= amount;
    const statusCode = isApproved ? 200 : 400;

    const chargeLog: ApiRequestLog = {
      id: `log_chg_${Date.now()}`,
      timestamp: new Date().toISOString(),
      method: 'POST',
      url: `/api/v1/cards/${selectedCardId || 'card_1'}/charge`,
      requestBody: {
        merchant,
        category,
        amount,
        currency: 'NGN'
      },
      responseBody: isApproved ? {
        status: 'success',
        transaction_id: `tx_sim_${Date.now()}`,
        authorized: true,
        ledger_update: {
          debited: amount,
          remaining_balance: Math.max(0, selectedCard!.balance - amount),
          currency: 'NGN'
        }
      } : {
        status: 'declined',
        authorized: false,
        reason: cardStatus === 'blocked' ? 'Card is blocked' : cardStatus === 'inactive' ? 'Card inactive (No PIN)' : 'Insufficient card balance'
      },
      status: statusCode,
      statusText: isApproved ? 'OK' : 'Bad Request'
    };
    setApiLogs(prev => [chargeLog, ...prev]);
    onSimulateTransaction(merchant, category, amount);
  };

  // WEB PAY SIMULATION ROUTINES
  const handleLaunchGateway = () => {
    if (!selectedCard) return;
    setCheckoutStep('gateway_form');
    setCheckoutErrorMsg('');
    setOtpError('');
    setInputPan(selectedCard.pan);
    setInputExpiry(selectedCard.expiryDate);
    setInputCvv(selectedCard.cvv);
  };

  const handleGatewayPaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard) return;
    const amountFloat = parseFloat(checkoutAmount) || 12500;

    // Simulate Initiate Gateway payment API request log
    const txId = `tx_gw_${Date.now().toString().slice(-6)}`;
    setCurrentTxId(txId);

    const initReq = {
      pan: inputPan,
      expiry_date: inputExpiry,
      cvv: inputCvv,
      amount: amountFloat,
      currency: 'NGN',
      merchant_name: checkoutMerchant
    };

    // Business checks
    let allowed = true;
    let reason = '';
    
    // Check card match
    const matchingCard = cards.find(c => c.pan.replace(/\s+/g, '') === inputPan.replace(/\s+/g, ''));
    
    if (!matchingCard) {
      allowed = false;
      reason = 'Card not found / Invalid PAN match in sandbox directory';
    } else if (matchingCard.status === 'blocked') {
      allowed = false;
      reason = 'Card is locked/blocked on Interswitch network';
    } else if (matchingCard.status === 'inactive') {
      allowed = false;
      reason = 'Card is inactive. Initial security PIN setup required first';
    } else if (matchingCard.balance < amountFloat) {
      allowed = false;
      reason = 'Insufficient funds available on virtual debit card linked ledger';
    }

    const initLog: ApiRequestLog = {
      id: `log_init_${Date.now()}`,
      timestamp: new Date().toISOString(),
      method: 'POST',
      url: '/api/v1/payments/gateway/initiate',
      requestBody: initReq,
      responseBody: allowed ? {
        status: 'success',
        transaction_id: txId,
        challenge_type: 'OTP',
        message: '3D-Secure challenge initiated. OTP routed to cardholder registered phone (080******12).'
      } : {
        status: 'declined',
        transaction_id: txId,
        error: reason,
        message: 'Payment initiation aborted due to network/card validations.'
      },
      status: allowed ? 200 : 400,
      statusText: allowed ? 'OK' : 'Bad Request'
    };

    setApiLogs(prev => [initLog, ...prev]);

    if (allowed) {
      setCheckoutStep('gateway_otp');
    } else {
      setCheckoutErrorMsg(reason);
      setCheckoutStep('gateway_error');
    }
  };

  const handleGatewayOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountFloat = parseFloat(checkoutAmount) || 12500;

    const otpReq = {
      transaction_id: currentTxId,
      otp: inputOtp
    };

    if (inputOtp !== '123456') {
      // Log wrong OTP api call
      const otpFailLog: ApiRequestLog = {
        id: `log_otp_fail_${Date.now()}`,
        timestamp: new Date().toISOString(),
        method: 'POST',
        url: '/api/v1/payments/gateway/validate-otp',
        requestBody: otpReq,
        responseBody: {
          status: 'failed',
          transaction_id: currentTxId,
          error: 'Authentication failed. Invalid safetoken passcode.'
        },
        status: 400,
        statusText: 'Bad Request'
      };
      setApiLogs(prev => [otpFailLog, ...prev]);
      setOtpError('Invalid OTP! Please enter "123456" for demo simulation success.');
      return;
    }

    // Success OTP validation API call
    const refId = `ISW-WPY-${Math.floor(Math.random() * 90000000 + 10000000)}`;
    const otpSuccessLog: ApiRequestLog = {
      id: `log_otp_success_${Date.now()}`,
      timestamp: new Date().toISOString(),
      method: 'POST',
      url: '/api/v1/payments/gateway/validate-otp',
      requestBody: otpReq,
      responseBody: {
        status: 'approved',
        transaction_id: currentTxId,
        reference: refId,
        amount: amountFloat,
        merchant_name: checkoutMerchant,
        auth_code: 'ISW-AUTH-88241',
        message: 'OTP validation successful. Payment debited from card ledger.'
      },
      status: 200,
      statusText: 'OK'
    };
    setApiLogs(prev => [otpSuccessLog, ...prev]);

    // Debit card
    onSimulateTransaction(checkoutMerchant, checkoutCategory, amountFloat);
    setCheckoutStep('gateway_success');
    setInputOtp('');
    setOtpError('');
  };

  // API SPECS
  const getApiSpecs = (): Record<string, ApiEndpointSpec> => {
    const cardId = selectedCard ? selectedCard.id : 'card_1';
    const pan = selectedCard ? selectedCard.pan : '5061008833445566';
    const status = selectedCard ? selectedCard.status : 'active';
    const balance = selectedCard ? selectedCard.balance : 150000.00;
    const label = selectedCard ? selectedCard.label : 'Primary Spending';
    const cvv = selectedCard ? selectedCard.cvv : '581';
    const expiry = selectedCard ? selectedCard.expiryDate : '11/30';
    const holderName = selectedCard ? selectedCard.holderName : 'Abiola Hafeez';

    return {
      create_card: {
        name: 'Create Virtual Card (POST)',
        method: 'POST',
        url: '/api/v1/cards',
        description: 'Issues a new virtual Naira debit card (Verve/Visa/Mastercard) starting with ₦150,000.00 default balance.',
        requestBody: {
          cardholder_name: holderName,
          type: 'debit',
          design: 'black',
          scheme: 'verve',
          label: 'My Online Spending',
          currency: 'NGN'
        },
        responseBody: {
          status: 'success',
          message: 'Virtual card generated in inactive status. PIN code setup required.',
          data: {
            card_id: 'card_new_881',
            cardholder_name: holderName,
            type: 'debit',
            design: 'black',
            scheme: 'verve',
            label: 'My Online Spending',
            pan: '5061001234567890',
            expiry_date: '07/31',
            cvv: '914',
            currency: 'NGN',
            balance: 150000.00,
            status: 'inactive',
            created_at: new Date().toISOString()
          }
        }
      },
      set_pin: {
        name: 'Set / Change Card PIN (PATCH)',
        method: 'PATCH',
        url: `/api/v1/cards/${cardId}/pin`,
        description: 'Sets or changes the 4-digit card PIN. Automatically sets status to active.',
        requestBody: {
          pin: '1234',
          confirm_pin: '1234'
        },
        responseBody: {
          status: 'success',
          message: 'Virtual card security PIN updated successfully. Status promoted to ACTIVE.',
          data: {
            card_id: cardId,
            status: 'active',
            updated_at: new Date().toISOString()
          }
        }
      },
      block_card: {
        name: 'Block Card (POST)',
        method: 'POST',
        url: `/api/v1/cards/${cardId}/block`,
        description: 'Temporarily freezes a card to reject subsequent transaction requests with DECLINED responses.',
        requestBody: {
          reason: 'user_requested_suspicious_activity',
          auth_token: 'auth_tok_isw_924'
        },
        responseBody: {
          status: 'success',
          message: 'Card status updated to BLOCKED. All authorization triggers will fail.',
          data: {
            card_id: cardId,
            status: 'blocked',
            updated_at: new Date().toISOString()
          }
        }
      },
      unblock_card: {
        name: 'Unblock Card (POST)',
        method: 'POST',
        url: `/api/v1/cards/${cardId}/unblock`,
        description: 'Restores a frozen card back to active status to resume payment capabilities.',
        requestBody: {
          auth_pin: '1234'
        },
        responseBody: {
          status: 'success',
          message: 'Card successfully unfrozen and active.',
          data: {
            card_id: cardId,
            status: 'active',
            updated_at: new Date().toISOString()
          }
        }
      },
      get_balance: {
        name: 'Query Card Balance (GET)',
        method: 'GET',
        url: `/api/v1/cards/${cardId}/balance`,
        description: 'Queries live available ledger balance in Nigerian Naira.',
        responseBody: {
          status: 'success',
          data: {
            card_id: cardId,
            ledger_balance: balance,
            available_balance: balance,
            currency: 'NGN',
            card_status: status,
            last_queried: new Date().toISOString()
          }
        }
      },
      get_transactions: {
        name: 'List Card Transactions (GET)',
        method: 'GET',
        url: `/api/v1/cards/${cardId}/transactions`,
        description: 'Fetches recent transaction events triggered for the targeted card in real-time.',
        responseBody: {
          status: 'success',
          metadata: {
            total_records: transactions.filter(t => t.cardId === cardId).length,
            limit: 20
          },
          data: transactions.filter(t => t.cardId === cardId).slice(0, 10).map(t => ({
            transaction_id: t.id,
            merchant_name: t.merchant,
            category: t.category,
            amount: t.amount,
            currency: 'NGN',
            status: t.status,
            timestamp: t.date
          }))
        }
      },
      gateway_initiate: {
        name: 'Gateway Pay Initiate (POST)',
        method: 'POST',
        url: '/api/v1/payments/gateway/initiate',
        description: 'Initiates a 3D-Secure credit/debit card payment request to trigger card verification and OTP routing.',
        requestBody: {
          pan: pan,
          expiry: expiry,
          cvv: cvv,
          amount: 12500.00,
          currency: 'NGN',
          merchant_name: 'Jumia Nigeria'
        },
        responseBody: {
          status: 'success',
          transaction_id: 'tx_gw_98412',
          challenge_type: 'OTP',
          message: 'One-time passcode successfully sent to cardholder phone (+234 803 **** 5566).'
        }
      },
      gateway_otp: {
        name: 'Gateway Validate OTP (POST)',
        method: 'POST',
        url: '/api/v1/payments/gateway/validate-otp',
        description: 'Validates standard 3D-Secure Interswitch safetoken passcode to complete payment debit.',
        requestBody: {
          transaction_id: 'tx_gw_98412',
          otp: '123456'
        },
        responseBody: {
          status: 'approved',
          transaction_id: 'tx_gw_98412',
          reference: 'ISW-WPY-98421048',
          amount: 12500.00,
          merchant_name: 'Jumia Nigeria',
          message: 'Payment authorized successfully by Interswitch WebPAY.'
        }
      }
    };
  };

  const specs = getApiSpecs();
  const activeSpec = specs[selectedEndpoint] || specs.gateway_initiate;

  const handleCopyText = (text: string, isReq: boolean) => {
    navigator.clipboard.writeText(text);
    if (isReq) {
      setCopiedReq(true);
      setTimeout(() => setCopiedReq(false), 2000);
    } else {
      setCopiedRes(true);
      setTimeout(() => setCopiedRes(false), 2000);
    }
  };

  const handleCopyLogText = (text: string, logId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLogId(logId);
    setTimeout(() => setCopiedLogId(null), 2000);
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-full">
      {/* Sandbox Header */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
          <Database className="w-4 h-4 text-indigo-400" />
          <h2 className="text-xs font-mono font-bold tracking-wider uppercase text-slate-200">
            ISW TEST Sandbox Developer Console
          </h2>
        </div>
        <button
          type="button"
          id="btn-reset-sandbox"
          onClick={() => {
            onResetSandbox();
            setApiLogs([
              {
                id: `log_init_${Date.now()}`,
                timestamp: new Date().toISOString(),
                method: 'POST',
                url: '/api/v1/auth/token',
                requestBody: { client_id: 'isw_sandbox_abiola', client_secret: 'sec_9841_isw_ngn_prod' },
                responseBody: { status: 'success', token: 'tok_isw_924a8fd3', expires_in: 3600 },
                status: 200,
                statusText: 'OK'
              }
            ]);
            setCheckoutStep('idle');
          }}
          className="text-[10px] bg-slate-800 hover:bg-red-950 hover:text-red-300 px-2.5 py-1 rounded border border-slate-700 hover:border-red-900 transition-all flex items-center space-x-1 font-mono cursor-pointer"
          title="Reset sandbox database"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset Db</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-950/50 border-b border-slate-800 text-xs">
        <button
          type="button"
          id="tab-sandbox-triggers"
          onClick={() => setActiveTab('triggers')}
          className={`flex-1 py-2 text-center font-mono font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'triggers'
              ? 'border-indigo-500 text-indigo-400 bg-slate-900/30'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          ⚡ Simulation Triggers
        </button>
        <button
          type="button"
          id="tab-sandbox-api"
          onClick={() => setActiveTab('api')}
          className={`flex-1 py-2 text-center font-mono font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'api'
              ? 'border-indigo-500 text-indigo-400 bg-slate-900/30'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          🔌 REST JSON API Sandbox
        </button>
        <button
          type="button"
          id="tab-sandbox-ledger"
          onClick={() => setActiveTab('json')}
          className={`flex-1 py-2 text-center font-mono font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'json'
              ? 'border-indigo-500 text-indigo-400 bg-slate-900/30'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          📁 Live Database State
        </button>
      </div>

      {/* Body content */}
      <div className="flex-1 p-4 overflow-y-auto max-h-[580px] scrollbar-thin">
        {activeTab === 'triggers' ? (
          <div className="space-y-4">
            {/* Status Panel */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono">
              <span className="text-slate-400 text-[10px] block mb-1">Target Card Status (NGN Network)</span>
              {selectedCard ? (
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Selected Card:</span>
                    <span className="text-slate-300 font-semibold">{selectedCard.label} ({selectedCard.pan.slice(-4)})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Scheme / Type:</span>
                    <span className="text-teal-400 font-semibold uppercase">{selectedCard.scheme} Debit</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Balance:</span>
                    <span className="text-indigo-400 font-bold">₦{selectedCard.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Status:</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                      selectedCard.status === 'active' 
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                        : selectedCard.status === 'blocked'
                          ? 'bg-red-950 text-red-400 border border-red-900'
                          : 'bg-amber-950 text-amber-400 border border-amber-900'
                    }`}>
                      {selectedCard.status}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-amber-400 text-xs italic">Please select or create a card in the mobile app to enable simulation controls.</p>
              )}
            </div>

            {selectedCard && checkoutStep === 'idle' && (
              <>
                {/* Simulated Payment Section */}
                <div>
                  <h3 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-2 flex items-center space-x-1">
                    <span>1. Simulating Instant Charges (Direct Merchant API)</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 mb-2 font-sans leading-relaxed">
                    Click a quick purchase below to trigger a merchant charging event on this card. If blocked or unactivated, it will immediately record as <strong className="text-red-400 font-semibold uppercase">DECLINED</strong> in the database.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {quickTriggers.map((trig, idx) => (
                      <button
                        key={idx}
                        id={`btn-trigger-charge-${idx}`}
                        type="button"
                        onClick={() => handleInstantCharge(trig.merchant, trig.category, trig.amount)}
                        className="px-2 py-1.5 bg-slate-800 hover:bg-slate-750 text-[11px] font-mono text-slate-300 hover:text-white rounded border border-slate-700/60 hover:border-slate-500 transition-all flex items-center justify-between text-left cursor-pointer"
                      >
                        <div className="flex items-center space-x-1.5 min-w-0">
                          {trig.icon}
                          <span className="truncate max-w-[95px]">{trig.merchant}</span>
                        </div>
                        <span className="font-bold text-indigo-300 flex-shrink-0">-₦{trig.amount.toLocaleString()}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gateway with OTP payment section */}
                <div className="p-3 bg-gradient-to-br from-indigo-950/40 to-slate-900 rounded-lg border border-indigo-900/60">
                  <h3 className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 font-bold mb-1.5 flex items-center space-x-1">
                    <Smartphone className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                    <span>2. Interswitch WebPAY Gateway (High-Fidelity OTP)</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 mb-3 font-sans leading-relaxed">
                    Simulate a premium 3D Secure checkout experience. Prefills card numbers automatically to route SMS OTP passcodes.
                  </p>

                  <div className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-mono text-slate-500 block">SELECT MERCHANT</label>
                        <select
                          value={checkoutMerchant}
                          onChange={(e) => {
                            setCheckoutMerchant(e.target.value);
                            // sync category
                            const triggerMatch = quickTriggers.find(q => q.merchant === e.target.value);
                            if (triggerMatch) {
                              setCheckoutCategory(triggerMatch.category);
                            }
                          }}
                          className="w-full px-2 py-1 text-[11px] font-mono bg-slate-950 border border-slate-700 rounded text-slate-200"
                        >
                          <option value="Jumia Nigeria">Jumia Nigeria (Shopping)</option>
                          <option value="Chicken Republic">Chicken Republic (Dining)</option>
                          <option value="Netflix Nigeria">Netflix Nigeria (Entertainment)</option>
                          <option value="DSTV Subscription">DSTV Subscription (Utilities)</option>
                          <option value="IKEDC Power Prepaid">IKEDC Power (Utilities)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] font-mono text-slate-500 block">AMOUNT (₦)</label>
                        <input
                          type="number"
                          value={checkoutAmount}
                          onChange={(e) => setCheckoutAmount(e.target.value)}
                          className="w-full px-2 py-1 text-[11px] font-mono bg-slate-950 border border-slate-700 rounded text-slate-200"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      id="btn-launch-webpay"
                      onClick={handleLaunchGateway}
                      className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs rounded flex items-center justify-center space-x-1.5 shadow transition-all cursor-pointer"
                    >
                      <span>Launch WebPAY Gateway Checkout</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Simulated Funding Section */}
                <div>
                  <h3 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-2">
                    <span>3. Simulating Card Funding (Deposits)</span>
                  </h3>
                  <form onSubmit={handleDepositSubmit} className="flex space-x-2">
                    <div className="relative flex-1">
                      <span className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-[11px] font-mono text-slate-500 font-bold">₦</span>
                      <input
                        type="number"
                        id="input-deposit-amount"
                        min="100"
                        max="10000000"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="Amount"
                        className="w-full pl-6 pr-2 py-1.5 text-xs font-mono bg-slate-950 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <button
                      type="submit"
                      id="btn-submit-deposit"
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-mono font-bold rounded text-white flex items-center space-x-1 transition-all cursor-pointer"
                    >
                      <Coins className="w-3.5 h-3.5 text-slate-100" />
                      <span>Fund Card</span>
                    </button>
                  </form>
                  <p className="text-[9px] text-slate-500 mt-1 font-sans">
                    Inject mock money into the selected card's balance. Deposits are recorded as positive transaction entries in Nigerian Naira.
                  </p>
                </div>

                {/* Interactive Business Flow Warning */}
                {selectedCard.status === 'inactive' && (
                  <div className="p-2.5 bg-amber-950/40 border border-amber-900 rounded-lg flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] text-amber-300 font-bold font-mono">FLOW CONSTRAINT ACTIVE</p>
                      <p className="text-[10px] text-amber-400/90 mt-0.5 leading-relaxed font-sans">
                        This card was newly created and is currently locked. To activate it and enable transactional simulations, use the <strong>PIN Change</strong> option inside the mobile app simulator's card control sheet.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* HIGH FIDELITY WEBPAY GATEWAY MODAL SIMULATOR OVERLAY */}
            {selectedCard && checkoutStep !== 'idle' && (
              <div className="bg-slate-950 rounded-xl border border-indigo-900/60 overflow-hidden shadow-2xl animate-fade-in">
                {/* Gateway Header */}
                <div className="bg-slate-900 px-3 py-2 border-b border-indigo-900/40 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Lock className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-[10px] font-mono tracking-wider font-extrabold text-slate-300 uppercase">
                      Interswitch WebPAY Secure Checkout
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('idle')}
                    className="text-[10px] text-slate-500 hover:text-slate-300"
                  >
                    ✕ Cancel
                  </button>
                </div>

                {/* Checkout Content panels */}
                <div className="p-4">
                  {checkoutStep === 'gateway_form' && (
                    <form onSubmit={handleGatewayPaySubmit} className="space-y-3.5">
                      {/* Merchant detail bar */}
                      <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex justify-between items-center text-xs font-mono">
                        <div>
                          <span className="text-[8px] text-slate-500 uppercase block">MERCHANT</span>
                          <span className="text-slate-300 font-bold">{checkoutMerchant}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[8px] text-slate-500 uppercase block">AMOUNT TO PAY</span>
                          <span className="text-indigo-400 font-bold">₦{parseFloat(checkoutAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      </div>

                      {/* Card fields */}
                      <div className="space-y-2">
                        <div>
                          <label className="text-[9px] font-mono text-slate-400 block mb-0.5">CARD NUMBER (PAN)</label>
                          <input
                            type="text"
                            required
                            value={inputPan}
                            onChange={(e) => setInputPan(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs font-mono bg-slate-900 border border-slate-700 rounded text-slate-200"
                            placeholder="Enter 16-Digit PAN"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] font-mono text-slate-400 block mb-0.5">EXP DATE</label>
                            <input
                              type="text"
                              required
                              value={inputExpiry}
                              onChange={(e) => setInputExpiry(e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs font-mono bg-slate-900 border border-slate-700 rounded text-slate-200"
                              placeholder="MM/YY"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-mono text-slate-400 block mb-0.5">CVV CODE</label>
                            <input
                              type="text"
                              required
                              value={inputCvv}
                              onChange={(e) => setInputCvv(e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs font-mono bg-slate-900 border border-slate-700 rounded text-slate-200"
                              placeholder="123"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Submit */}
                      <div className="pt-2 flex space-x-2">
                        <button
                          type="button"
                          onClick={() => setCheckoutStep('idle')}
                          className="flex-1 py-1.5 border border-slate-700 hover:bg-slate-900 text-xs text-slate-400 rounded font-mono"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded font-mono font-bold flex items-center justify-center space-x-1"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Pay ₦{parseFloat(checkoutAmount).toLocaleString()}</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {checkoutStep === 'gateway_otp' && (
                    <form onSubmit={handleGatewayOtpSubmit} className="space-y-3.5 text-center">
                      <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500 flex items-center justify-center mx-auto mb-2">
                        <Smartphone className="w-5 h-5 text-indigo-400 animate-pulse" />
                      </div>
                      
                      <div className="font-mono">
                        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">3D Secure Validation</h4>
                        <p className="text-[10px] text-slate-400 max-w-[280px] mx-auto mt-1 leading-normal font-sans">
                          A secure OTP passcode has been generated for transaction reference <strong className="text-indigo-400 font-mono">{currentTxId}</strong>.
                        </p>
                      </div>

                      <div className="py-2.5 bg-slate-900 rounded border border-indigo-950 text-center">
                        <span className="text-[8px] text-slate-500 font-mono block uppercase">SIMULATED SAFETOKEN (OTP)</span>
                        <span className="text-teal-400 text-md font-mono font-bold tracking-widest select-all">123456</span>
                        <span className="text-[8px] text-slate-400 block font-sans mt-0.5">Use this verification passcode to approve checkout.</span>
                      </div>

                      {otpError && (
                        <p className="text-[10px] font-mono text-red-400 font-bold">{otpError}</p>
                      )}

                      <div className="space-y-2">
                        <input
                          type="text"
                          required
                          value={inputOtp}
                          onChange={(e) => setInputOtp(e.target.value)}
                          placeholder="Enter 6-Digit OTP"
                          className="w-full px-3 py-1.5 text-center font-mono text-xs tracking-widest bg-slate-900 border border-slate-700 rounded text-slate-100"
                        />
                        
                        <div className="flex space-x-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setCheckoutStep('idle')}
                            className="flex-1 py-1.5 border border-slate-700 text-slate-400 text-xs rounded font-mono"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="flex-1 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded font-mono flex items-center justify-center space-x-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Validate & Pay</span>
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  {checkoutStep === 'gateway_success' && (
                    <div className="space-y-3.5 text-center py-2">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500 flex items-center justify-center mx-auto mb-2 animate-bounce">
                        <CheckCircle className="w-7 h-7 text-emerald-400" />
                      </div>

                      <div className="font-mono">
                        <h4 className="text-xs font-extrabold text-emerald-400 uppercase tracking-wide">PAYMENT SUCCESSFUL</h4>
                        <p className="text-[10px] text-slate-400 mt-1 font-sans">
                          Naira transaction authorized successfully on Interswitch payment gateway ledger.
                        </p>
                      </div>

                      <div className="p-3 bg-slate-900 rounded border border-slate-800 text-left space-y-1 font-mono text-[10px]">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Merchant:</span>
                          <span className="text-slate-200 font-bold">{checkoutMerchant}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Amount Paid:</span>
                          <span className="text-emerald-400 font-bold">₦{parseFloat(checkoutAmount).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Reference ID:</span>
                          <span className="text-indigo-400 select-all">ISW-WPY-{Math.floor(Math.random() * 900000 + 100000)}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setCheckoutStep('idle')}
                        className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded font-mono font-bold"
                      >
                        Return to Merchant Terminal
                      </button>
                    </div>
                  )}

                  {checkoutStep === 'gateway_error' && (
                    <div className="space-y-3.5 text-center py-2">
                      <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500 flex items-center justify-center mx-auto mb-2">
                        <XCircle className="w-7 h-7 text-red-400 animate-pulse" />
                      </div>

                      <div className="font-mono">
                        <h4 className="text-xs font-extrabold text-red-400 uppercase tracking-wide">TRANSACTION DECLINED</h4>
                        <p className="text-[10px] text-red-300 mt-1 max-w-[280px] mx-auto leading-relaxed font-sans">
                          {checkoutErrorMsg || 'Payment failed due to internal sandbox card restrictions.'}
                        </p>
                      </div>

                      <div className="pt-2 flex space-x-2">
                        <button
                          type="button"
                          onClick={() => setCheckoutStep('gateway_form')}
                          className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs rounded font-mono"
                        >
                          Modify Card Info
                        </button>
                        <button
                          type="button"
                          onClick={() => setCheckoutStep('idle')}
                          className="flex-1 py-1.5 border border-slate-700 text-slate-400 text-xs rounded font-mono"
                        >
                          Close Checkout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'api' ? (
          <div className="space-y-4">
            {/* Dropdown to select endpoint */}
            <div>
              <label className="text-[10px] font-mono font-bold text-slate-400 block mb-1">SELECT ISW TEST API ENDPOINT</label>
              <select
                id="select-api-endpoint"
                value={selectedEndpoint}
                onChange={(e) => setSelectedEndpoint(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <optgroup label="Core Card Solution APIs">
                  <option value="get_balance">GET /api/v1/cards/{"{card_id}"}/balance (Retrieve Balance)</option>
                  <option value="get_transactions">GET /api/v1/cards/{"{card_id}"}/transactions (List Transactions)</option>
                </optgroup>
                <optgroup label="Card Lifecycle & Sandbox APIs">
                  <option value="create_card">POST /api/v1/cards (Create Virtual Card)</option>
                  <option value="set_pin">PATCH /api/v1/cards/{"{card_id}"}/pin (Set/Change PIN)</option>
                  <option value="block_card">POST /api/v1/cards/{"{card_id}"}/block (Block Card)</option>
                  <option value="unblock_card">POST /api/v1/cards/{"{card_id}"}/unblock (Unblock Card)</option>
                </optgroup>
                <optgroup label="Interswitch WebPAY Gateway APIs">
                  <option value="gateway_initiate">POST /api/v1/payments/gateway/initiate (Initiate Gateway Pay)</option>
                  <option value="gateway_otp">POST /api/v1/payments/gateway/validate-otp (Validate Safetoken OTP)</option>
                </optgroup>
              </select>
            </div>

            {/* Endpoint details */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs">
              <div className="flex items-center space-x-2 mb-1.5">
                <span className={`px-2 py-0.5 rounded font-mono font-extrabold text-[10px] ${
                  activeSpec.method === 'POST' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/50' :
                  activeSpec.method === 'PATCH' ? 'bg-amber-950 text-amber-400 border border-amber-900/50' :
                  'bg-blue-950 text-blue-400 border border-blue-900/50'
                }`}>
                  {activeSpec.method}
                </span>
                <span className="font-mono text-slate-300 select-all font-bold">{activeSpec.url}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">{activeSpec.description}</p>
            </div>

            {/* JSON Request & Response Simulation */}
            <div className="space-y-3">
              {/* Request Panel */}
              {activeSpec.requestBody && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">JSON REQUEST PAYLOAD</span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(JSON.stringify(activeSpec.requestBody, null, 2), true)}
                      className="text-[9px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 cursor-pointer"
                    >
                      <Copy className="w-2.5 h-2.5" />
                      <span>{copiedReq ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 max-h-[160px] overflow-auto scrollbar-thin">
                    <pre className="text-[9px] font-mono text-slate-300 leading-normal select-all">
                      {JSON.stringify(activeSpec.requestBody, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Response Panel */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">MOCK API RESPONSE (HTTP 200 OK)</span>
                  <button
                    type="button"
                    onClick={() => handleCopyText(JSON.stringify(activeSpec.responseBody, null, 2), false)}
                    className="text-[9px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 cursor-pointer"
                  >
                    <Copy className="w-2.5 h-2.5" />
                    <span>{copiedRes ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 max-h-[220px] overflow-auto scrollbar-thin">
                  <pre className="text-[9px] font-mono text-teal-400 leading-normal select-all">
                    {JSON.stringify(activeSpec.responseBody, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            {/* REAL-TIME SIMULATION REQUEST LOGGER */}
            <div className="mt-4 border-t border-slate-800 pt-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-1">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                  <h4 className="text-[10px] font-mono font-extrabold uppercase tracking-wide text-slate-300">
                    📜 Live Rest API Request History Log ({apiLogs.length})
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setApiLogs([])}
                  className="text-[9px] font-mono text-red-400 hover:text-red-300"
                >
                  Clear Logs
                </button>
              </div>
              <p className="text-[9px] text-slate-500 font-sans mb-3 leading-relaxed">
                Interceptors trace card interactions, block/unblock states, and WebPAY gateway payments to output exact JSON requests/responses.
              </p>

              {apiLogs.length === 0 ? (
                <div className="text-center py-4 bg-slate-950/30 rounded border border-slate-800 border-dashed text-[10px] text-slate-500 font-mono">
                  No api calls made in session yet. Interact with the mobile sandbox or trigger transaction events to trace logs!
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[260px] overflow-y-auto scrollbar-thin">
                  {apiLogs.map((log) => {
                    const isExpanded = expandedLogId === log.id;
                    const logTime = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                    return (
                      <div key={log.id} className="bg-slate-950 rounded border border-slate-850 overflow-hidden text-[10px] font-mono">
                        {/* Header bar */}
                        <div 
                          onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                          className="px-2.5 py-1.5 flex items-center justify-between hover:bg-slate-900 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center space-x-2 min-w-0">
                            <span className="text-slate-500 font-normal text-[9px]">{logTime}</span>
                            <span className={`px-1.5 py-0.2 rounded text-[8px] font-extrabold ${
                              log.method === 'POST' ? 'bg-emerald-950/80 text-emerald-400' :
                              log.method === 'PATCH' ? 'bg-amber-950/80 text-amber-400' :
                              'bg-blue-950/80 text-blue-400'
                            }`}>
                              {log.method}
                            </span>
                            <span className="text-slate-300 font-bold truncate max-w-[120px] sm:max-w-[180px]">{log.url}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className={`text-[9px] font-bold ${log.status < 300 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {log.status} {log.statusText}
                            </span>
                            {isExpanded ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
                          </div>
                        </div>

                        {/* Expanded Payload view */}
                        {isExpanded && (
                          <div className="p-3 bg-slate-950 border-t border-slate-900 space-y-2 text-[9px] leading-relaxed">
                            {log.requestBody && (
                              <div>
                                <div className="flex justify-between items-center text-[8px] text-slate-500 mb-0.5">
                                  <span>REQUEST PAYLOAD:</span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyLogText(JSON.stringify(log.requestBody, null, 2), `${log.id}_req`)}
                                    className="text-indigo-400 hover:text-indigo-300"
                                  >
                                    {copiedLogId === `${log.id}_req` ? 'Copied' : 'Copy Request'}
                                  </button>
                                </div>
                                <pre className="p-1.5 bg-slate-900 rounded text-slate-300 overflow-x-auto">
                                  {JSON.stringify(log.requestBody, null, 2)}
                                </pre>
                              </div>
                            )}

                            <div>
                              <div className="flex justify-between items-center text-[8px] text-slate-500 mb-0.5">
                                <span>RESPONSE PAYLOAD:</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyLogText(JSON.stringify(log.responseBody, null, 2), `${log.id}_res`)}
                                  className="text-indigo-400 hover:text-indigo-300"
                                >
                                  {copiedLogId === `${log.id}_res` ? 'Copied' : 'Copy Response'}
                                </button>
                              </div>
                              <pre className="p-1.5 bg-slate-900 rounded text-teal-400 overflow-x-auto">
                                {JSON.stringify(log.responseBody, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-indigo-400">STATE SCHEMA (CLIENT LOCALSTORAGE DB)</span>
              <button
                type="button"
                id="btn-toggle-json-view"
                onClick={() => setShowJson(!showJson)}
                className="text-[10px] text-slate-400 hover:text-slate-200 underline font-mono cursor-pointer"
              >
                {showJson ? 'Collapse' : 'Expand'}
              </button>
            </div>

            {showJson && (
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 max-h-[350px] overflow-auto scrollbar-thin">
                <pre className="text-[9px] font-mono text-slate-300 leading-normal select-all">
                  {JSON.stringify({
                    fintech: 'ISW Test',
                    currency: 'NGN',
                    currentUser: { id: 'usr_1', email: 'abiolahafeez@gmail.com', name: 'Abiola Hafeez' },
                    cardsList: cards.map(c => ({
                      id: c.id,
                      label: c.label,
                      scheme: c.scheme,
                      pan: `•••• •••• •••• ${c.pan.slice(-4)}`,
                      cvv: '***',
                      pin: c.pin ? '✓ CONFIGURED' : '✗ EMPTY (INACTIVE)',
                      balance: c.balance,
                      status: c.status
                    })),
                    transactionsCount: transactions.length,
                    activeCardId: selectedCardId
                  }, null, 2)}
                </pre>
              </div>
            )}
            
            <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
              All client state changes (creating cards, modifying status to blocked/unblocked, altering PINs, and processing transactions) are bound reactively in the virtual sandbox ledger above.
            </p>
          </div>
        )}
      </div>
      
      {/* Footer Info */}
      <div className="bg-slate-950 px-4 py-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500">
        <span className="flex items-center space-x-1">
          <Terminal className="w-3 h-3" />
          <span>ISW API Console v1.5.0</span>
        </span>
        <span>Secure LocalStorage Sync</span>
      </div>
    </div>
  );
};
