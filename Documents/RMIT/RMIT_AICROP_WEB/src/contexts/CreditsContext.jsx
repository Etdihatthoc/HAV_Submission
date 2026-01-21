/**
 * Credits Context
 * Manages credit balance globally across the application
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import creditsService from '../services/creditsService';

const CreditsContext = createContext(null);

export const CreditsProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [credits, setCredits] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [membershipTier, setMembershipTier] = useState('free');
  const [loading, setLoading] = useState(true);

  // Fetch credits when user logs in
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchCredits();
    } else {
      // Reset when logged out
      setCredits(0);
      setTotalSpent(0);
      setMembershipTier('free');
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  /**
   * Fetch current credit balance from API
   */
  const fetchCredits = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await creditsService.getBalance(user.id);
      setCredits(response.credits);
      setTotalSpent(response.total_credits_spent);
      setMembershipTier(response.membership_tier);
    } catch (error) {
      console.error('Failed to fetch credits:', error);
      // If user object has credits info, use it as fallback
      if (user.credits !== undefined) {
        setCredits(user.credits);
        setTotalSpent(user.total_credits_spent || 0);
        setMembershipTier(user.membership_tier || 'free');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Deduct credits locally (optimistic update)
   * @param {number} amount - Amount to deduct
   */
  const deductCredits = (amount) => {
    setCredits((prev) => Math.max(0, prev - amount));
    setTotalSpent((prev) => prev + amount);
  };

  /**
   * Add credits locally (optimistic update)
   * @param {number} amount - Amount to add
   */
  const addCredits = (amount) => {
    setCredits((prev) => prev + amount);
  };

  /**
   * Refresh credits from server
   */
  const refreshCredits = async () => {
    await fetchCredits();
  };

  /**
   * Check if user has sufficient credits
   * @param {number} amount - Required amount
   * @returns {boolean}
   */
  const hasSufficientCredits = (amount) => {
    return credits >= amount;
  };

  const value = {
    credits,
    totalSpent,
    membershipTier,
    loading,
    fetchCredits,
    deductCredits,
    addCredits,
    refreshCredits,
    hasSufficientCredits,
  };

  return (
    <CreditsContext.Provider value={value}>
      {children}
    </CreditsContext.Provider>
  );
};

export const useCredits = () => {
  const context = useContext(CreditsContext);
  if (!context) {
    throw new Error('useCredits must be used within a CreditsProvider');
  }
  return context;
};

export default CreditsContext;
