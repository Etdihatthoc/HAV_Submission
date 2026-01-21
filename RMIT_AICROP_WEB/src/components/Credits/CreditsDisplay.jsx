/**
 * CreditsDisplay Component
 * Displays user's current credit balance in the header
 */

import { useNavigate } from 'react-router-dom';
import { useCredits } from '../../contexts/CreditsContext';
import { Coins, TrendingDown } from 'lucide-react';

const CreditsDisplay = () => {
  const navigate = useNavigate();
  const { credits, loading } = useCredits();

  // Determine color based on credit amount
  const getCreditsColor = () => {
    if (credits >= 10) return 'text-green-600';
    if (credits >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBgColor = () => {
    if (credits >= 10) return 'bg-green-50 hover:bg-green-100';
    if (credits >= 5) return 'bg-yellow-50 hover:bg-yellow-100';
    return 'bg-red-50 hover:bg-red-100';
  };

  const handleClick = () => {
    navigate('/transactions');
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 animate-pulse">
        <Coins size={20} className="text-gray-400" />
        <span className="text-gray-400">...</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${getBgColor()}`}
      title="Click để xem lịch sử giao dịch"
    >
      <Coins size={20} className={getCreditsColor()} />
      <div className="flex flex-col items-start">
        <span className={`text-lg font-bold ${getCreditsColor()}`}>
          {credits} xu
        </span>
        {credits < 5 && (
          <span className="text-xs text-red-500 flex items-center gap-1">
            <TrendingDown size={12} />
            Sắp hết
          </span>
        )}
      </div>
    </button>
  );
};

export default CreditsDisplay;
