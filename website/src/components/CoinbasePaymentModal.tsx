import React from 'react';
import Image from 'next/image';
import { X, Check, CreditCard, Wallet } from 'lucide-react';

interface CoinbasePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onSuccess: () => void;
}

const CoinbasePaymentModal: React.FC<CoinbasePaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  onSuccess
}) => {
  const [step, setStep] = React.useState(1);
  const [loading, setLoading] = React.useState(false);

  if (!isOpen) return null;

  const handlePayment = async () => {
    setLoading(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setStep(2);
    setLoading(false);
    // Simulate success after showing confirmation
    setTimeout(() => {
      onSuccess();
      onClose();
      setStep(1); // Reset for next time
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Image
              src="/assets/coinbase.png"
              alt="Coinbase"
              width={24}
              height={24}
              className="rounded-full"
            />
            <span className="font-bold text-lg">Coinbase Pay</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {step === 1 ? (
          <>
            {/* Payment Details */}
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Amount to Pay</div>
                <div className="flex items-center gap-2 text-2xl font-bold">
                  <Image
                    src="/assets/flow.png"
                    alt="FLOW"
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                  {amount} FLOW
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                <div className="font-medium">Select Payment Method</div>
                <button
                  onClick={handlePayment}
                  className="w-full flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-6 h-6" />
                    <div>
                      <div className="font-medium">Credit / Debit Card</div>
                      <div className="text-sm text-gray-500">Instant payment with card</div>
                    </div>
                  </div>
                  <div className="text-blue-600">Select</div>
                </button>

                <button
                  onClick={handlePayment}
                  className="w-full flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <Wallet className="w-6 h-6" />
                    <div>
                      <div className="font-medium">Coinbase Account</div>
                      <div className="text-sm text-gray-500">Pay with your balance</div>
                    </div>
                  </div>
                  <div className="text-blue-600">Select</div>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center text-sm text-gray-500">
              Secured by Coinbase Pay (Demo)
            </div>
          </>
        ) : (
          // Success State
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Payment Successful!</h3>
            <p className="text-gray-600">
              Your FLOW tokens will be transferred shortly
            </p>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-2xl">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <div className="text-sm font-medium">Processing payment...</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoinbasePaymentModal; 