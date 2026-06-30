import React, { useState } from 'react';
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
  Copy
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
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('get_balance');
  const [copiedReq, setCopiedReq] = useState(false);
  const [copiedRes, setCopiedRes] = useState(false);

  const selectedCard = cards.find(c => c.id === selectedCardId);

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
      onSimulateDeposit(amt);
    }
  };

  // Generate dynamic live API specs based on active state
  const getApiSpecs = (): Record<string, ApiEndpointSpec> => {
    const cardId = selectedCard ? selectedCard.id : 'card_1';
    const pan = selectedCard ? selectedCard.pan : '4111228833445566';
    const status = selectedCard ? selectedCard.status : 'active';
    const balance = selectedCard ? selectedCard.balance : 345500.00;
    const label = selectedCard ? selectedCard.label : 'Primary Spending';
    const cvv = selectedCard ? selectedCard.cvv : '581';
    const expiry = selectedCard ? selectedCard.expiryDate : '11/30';
    const holderName = selectedCard ? selectedCard.holderName : 'Abiola Hafeez';

    return {
      create_card: {
        name: 'Create Virtual Card (POST)',
        method: 'POST',
        url: '/api/v1/cards',
        description: 'Issues a new virtual Naira debit card for immediate PIN configuration and activation.',
        requestBody: {
          cardholder_name: holderName,
          type: 'debit',
          design: 'black',
          label: 'Online Shopping Card',
          currency: 'NGN',
          initial_fund: 15000.00
        },
        responseBody: {
          status: 'success',
          message: 'Virtual card generated successfully in inactive status. PIN configuration required.',
          data: {
            card_id: 'card_new_881',
            cardholder_name: holderName,
            type: 'debit',
            design: 'black',
            label: 'Online Shopping Card',
            pan: '4111225500112233',
            expiry_date: '06/31',
            cvv: '824',
            currency: 'NGN',
            balance: 15000.00,
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
      }
    };
  };

  const specs = getApiSpecs();
  const activeSpec = specs[selectedEndpoint] || specs.get_balance;

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
          onClick={onResetSandbox}
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
      <div className="flex-1 p-4 overflow-y-auto max-h-[520px] scrollbar-thin">
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

            {selectedCard && (
              <>
                {/* Simulated Payment Section */}
                <div>
                  <h3 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-2 flex items-center space-x-1">
                    <span>1. Simulating Charges (Naira Debit Purchases)</span>
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
                        onClick={() => onSimulateTransaction(trig.merchant, trig.category, trig.amount)}
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

                {/* Simulated Funding Section */}
                <div>
                  <h3 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-2">
                    <span>2. Simulating Card Funding (Deposits)</span>
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
                <option value="create_card">POST /api/v1/cards (Create Virtual Card)</option>
                <option value="set_pin">PATCH /api/v1/cards/{"{card_id}"}/pin (Set/Change PIN)</option>
                <option value="block_card">POST /api/v1/cards/{"{card_id}"}/block (Block Card)</option>
                <option value="unblock_card">POST /api/v1/cards/{"{card_id}"}/unblock (Unblock Card)</option>
                <option value="get_balance">GET /api/v1/cards/{"{card_id}"}/balance (Retrieve Balance)</option>
                <option value="get_transactions">GET /api/v1/cards/{"{card_id}"}/transactions (List Transactions)</option>
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
            
            <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
              💡 <strong>API Sync:</strong> The response above updates in real-time as you manipulate cards and run purchase simulation triggers inside the mobile UI sandbox.
            </p>
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
