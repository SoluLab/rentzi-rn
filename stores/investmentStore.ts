import { create } from 'zustand';
import { Investment } from '@/types';
interface InvestmentState {
  investments: Investment[];
  isLoading: boolean;
  createInvestment: (investmentData: Omit<Investment, 'id' | 'currentValue'>) => Promise<void>;
  getUserInvestments: (userId: string) => Investment[];
  getTotalPortfolioValue: (userId: string) => number;
  getPortfolioROI: (userId: string) => number;
  claimPayout: (investmentId: string) => Promise<void>;
}
const mockInvestments: Investment[] = [
  {
    id: '1',
    propertyId: '1',
    userId: '1',
    amount: 25000,
    currency: 'USD',
    investmentDate: '2024-01-15',
    roiEstimate: 12.5,
    investmentStatus: 'active',
    shares: 25,
    currentValue: 28125,
    payoutDetails: {
      claimableAmount: 1250.75,
      lastClaimDate: '2024-01-01',
      payoutStatus: 'eligible',
    },
  },
  {
    id: '2',
    propertyId: '2',
    userId: '1',
    amount: 50000,
    currency: 'USD',
    investmentDate: '2024-01-20',
    roiEstimate: 15.2,
    investmentStatus: 'active',
    shares: 33,
    currentValue: 57600,
    payoutDetails: {
      claimableAmount: 0,
      lastClaimDate: '2024-02-15',
      payoutStatus: 'claimed',
    },
    claimHistory: [
      {
        date: '2024-02-15',
        amount: 2880.5,
        txHash: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef12',
        status: 'Completed',
        totalPassiveIncome: 5630.25,
      },
      {
        date: '2024-01-15',
        amount: 2750.0,
        txHash: '0x9876543210fedcba0987654321fedcba09876543',
        status: 'Completed',
        totalPassiveIncome: 2750.0,
      },
    ],
  },
];
export const useInvestmentStore = create<InvestmentState>((set, get) => ({
  investments: mockInvestments,
  isLoading: false,
  createInvestment: async (investmentData: Omit<Investment, 'id' | 'currentValue'>) => {
    set({ isLoading: true });
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const newInvestment: Investment = {
      ...investmentData,
      id: Date.now().toString(),
      currentValue: investmentData.amount, // Initial value equals investment amount
    };
    set((state) => ({
      investments: [...state.investments, newInvestment],
      isLoading: false,
    }));
  },
  getUserInvestments: (userId: string) => {
    const { investments } = get();
    return investments.filter((investment) => investment.userId === userId);
  },
  getTotalPortfolioValue: (userId: string) => {
    const { investments } = get();
    const userInvestments = investments.filter((investment) => investment.userId === userId);
    return userInvestments.reduce((total, investment) => total + investment.currentValue, 0);
  },
  getPortfolioROI: (userId: string) => {
    const { investments } = get();
    const userInvestments = investments.filter((investment) => investment.userId === userId);
    if (userInvestments.length === 0) return 0;
    const totalInvested = userInvestments.reduce(
      (total, investment) => total + investment.amount,
      0
    );
    const totalCurrent = userInvestments.reduce(
      (total, investment) => total + investment.currentValue,
      0
    );
    return ((totalCurrent - totalInvested) / totalInvested) * 100;
  },
  claimPayout: async (investmentId: string) => {
    set({ isLoading: true });
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    set((state) => ({
      investments: state.investments.map((investment) =>
        investment.id === investmentId && investment.payoutDetails
          ? {
              ...investment,
              payoutDetails: {
                ...investment.payoutDetails,
                claimableAmount: 0,
                lastClaimDate: new Date().toISOString(),
                payoutStatus: 'claimed' as const,
              },
            }
          : investment
      ),
      isLoading: false,
    }));
  },
}));