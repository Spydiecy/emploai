import { XCircle, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast = ({ message, type, onClose }: ToastProps) => {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-20 right-4 z-50"
      >
        <div className={`
          flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg
          ${type === 'success' ? 'bg-green-50' : 'bg-red-50'}
          border ${type === 'success' ? 'border-green-200' : 'border-red-200'}
        `}>
          {icons[type]}
          <p className={`
            text-sm font-medium
            ${type === 'success' ? 'text-green-800' : 'text-red-800'}
          `}>
            {message}
          </p>
          <button
            onClick={onClose}
            className="ml-4 text-black/40 hover:text-black/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Toast; 