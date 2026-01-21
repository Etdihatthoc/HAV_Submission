/**
 * Transaction History Page
 * Displays credit transaction history
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCredits } from '../contexts/CreditsContext';
import Layout from '../components/Layout/Layout';
import creditsService from '../services/creditsService';
import { TrendingUp, TrendingDown, Coins, Calendar } from 'lucide-react';

const TransactionHistory = () => {
  const { user } = useAuth();
  const { credits, totalSpent } = useCredits();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;

  useEffect(() => {
    if (user?.id) {
      fetchTransactions();
    }
  }, [user, page]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await creditsService.getTransactions(
        user.id,
        limit,
        page * limit
      );

      setTransactions(response.transactions);
      setHasMore(response.transactions.length === limit);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type) => {
    if (type.startsWith('spend')) {
      return <TrendingDown className="text-red-500" size={20} />;
    }
    return <TrendingUp className="text-green-500" size={20} />;
  };

  const getTransactionColor = (amount) => {
    return amount > 0 ? 'text-green-600' : 'text-red-600';
  };

  const getTransactionTypeLabel = (type) => {
    const labels = {
      'initial_bonus': 'Thưởng khởi tạo',
      'spend_inquiry': 'Hỏi nhanh (Inquiry)',
      'spend_deep': 'Phân tích sâu',
      'spend_expert': 'Tư vấn chuyên gia',
      'spend_daily_logging': 'Daily Logging',
      'purchase': 'Mua xu',
    };
    return labels[type] || type;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Layout title="Lịch sử giao dịch">
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Số dư hiện tại</p>
                  <p className="text-3xl font-bold text-primary-600">{credits}</p>
                </div>
                <div className="bg-primary-100 p-4 rounded-xl">
                  <Coins className="text-primary-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Tổng đã tiêu</p>
                  <p className="text-3xl font-bold text-red-600">{totalSpent}</p>
                </div>
                <div className="bg-red-100 p-4 rounded-xl">
                  <TrendingDown className="text-red-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Giao dịch</p>
                  <p className="text-3xl font-bold text-gray-900">{transactions.length}</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-xl">
                  <Calendar className="text-gray-600" size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Transaction List */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 md:p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Lịch sử giao dịch</h2>
              <p className="text-sm text-gray-500 mt-1">
                Danh sách tất cả các giao dịch xu của bạn
              </p>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Đang tải...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-8 text-center">
                <Coins size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Chưa có giao dịch nào</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="p-4 md:p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="bg-gray-100 p-3 rounded-lg">
                          {getTransactionIcon(transaction.transaction_type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {getTransactionTypeLabel(transaction.transaction_type)}
                          </h3>
                          {transaction.description && (
                            <p className="text-sm text-gray-500 mt-1">
                              {transaction.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(transaction.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-xl font-bold ${getTransactionColor(
                            transaction.amount
                          )}`}
                        >
                          {transaction.amount > 0 ? '+' : ''}
                          {transaction.amount} xu
                        </p>
                        {transaction.case_id && (
                          <p className="text-xs text-gray-400 mt-1">
                            Case #{transaction.case_id}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && transactions.length > 0 && (
              <div className="p-4 border-t border-gray-200 flex justify-between items-center">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trang trước
                </button>
                <span className="text-sm text-gray-500">Trang {page + 1}</span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!hasMore}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trang sau
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TransactionHistory;
