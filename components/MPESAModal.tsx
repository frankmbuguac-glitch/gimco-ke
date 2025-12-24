import React, { useState } from 'react';

interface MPESAModalProps {
  amount: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type PaymentState = 'IDLE' | 'PROCESSING' | 'SUCCESS' | 'FAILED';

export const MPESAModal: React.FC<MPESAModalProps> = ({ amount, isOpen, onClose, onSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [status, setStatus] = useState<PaymentState>('IDLE');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handlePayment = async () => {
    if (!phoneNumber.match(/^(?:254|\+254|0)?(7(?:(?:[129][0-9])|(?:0[0-8])|(4[0-1]))[0-9]{6})$/)) {
        setErrorMsg("Please enter a valid Safaricom number (e.g., 0712345678)");
        return;
    }

    setStatus('PROCESSING');
    setErrorMsg('');

    // Simulate API Delay
    setTimeout(() => {
        // Randomly succeed or fail for demo purposes (mostly succeed)
        const isSuccess = Math.random() > 0.1; 
        
        if (isSuccess) {
            setStatus('SUCCESS');
            setTimeout(() => {
                onSuccess();
            }, 1500);
        } else {
            setStatus('FAILED');
            setErrorMsg("Transaction declined by user or insufficient funds.");
        }
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <i className="fas fa-times text-xl"></i>
        </button>

        <div className="bg-green-600 p-6 text-white text-center relative overflow-hidden">
            <div className="relative z-10">
                <i className="fas fa-mobile-alt text-4xl mb-2"></i>
                <h2 className="text-2xl font-bold">Lipa na M-PESA</h2>
                <p className="text-green-100 text-sm mt-1">Secure Mobile Payment</p>
            </div>
            {/* Decorative circles */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white opacity-10 rounded-full"></div>
            <div className="absolute top-5 -left-10 w-20 h-20 bg-white opacity-10 rounded-full"></div>
        </div>

        <div className="p-8">
            {status === 'IDLE' && (
                <>
                    <div className="mb-6 text-center">
                        <p className="text-gray-500 mb-1">Total to Pay</p>
                        <p className="text-3xl font-bold text-gray-900">KES {amount.toFixed(2)}</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">M-PESA Phone Number</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                                    <i className="fas fa-phone"></i>
                                </span>
                                <input 
                                    type="text" 
                                    placeholder="07XX XXX XXX"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition-colors"
                                />
                            </div>
                            {errorMsg && <p className="text-red-500 text-xs mt-1">{errorMsg}</p>}
                        </div>

                        <button 
                            onClick={handlePayment}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-md transition-transform transform active:scale-95"
                        >
                            Pay Now
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 text-center mt-4">
                        You will receive an STK push on your phone. Enter your PIN to complete the transaction.
                    </p>
                </>
            )}

            {status === 'PROCESSING' && (
                <div className="text-center py-8">
                    <div className="inline-block w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4"></div>
                    <h3 className="text-lg font-bold text-gray-900">Processing Payment...</h3>
                    <p className="text-gray-500 text-sm mt-2">Please check your phone for the STK prompt.</p>
                </div>
            )}

            {status === 'SUCCESS' && (
                <div className="text-center py-8 animate-fade-in">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-check text-2xl"></i>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Payment Successful!</h3>
                    <p className="text-gray-500 text-sm mt-2">Your order is being confirmed.</p>
                </div>
            )}

            {status === 'FAILED' && (
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-times text-2xl"></i>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Payment Failed</h3>
                    <p className="text-gray-500 text-sm mt-2 mb-4">{errorMsg}</p>
                    <button 
                        onClick={() => setStatus('IDLE')}
                        className="text-green-600 font-semibold hover:text-green-800"
                    >
                        Try Again
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};