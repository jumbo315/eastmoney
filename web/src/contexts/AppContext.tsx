import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

// 应用上下文类型
export interface AppContextType {
  // 当前页面
  currentPage: string;
  setCurrentPage: (page: string) => void;

  // 当前选中的股票
  currentStock: { code: string; name: string } | null;
  setCurrentStock: (stock: { code: string; name: string } | null) => void;

  // 当前选中的基金
  currentFund: { code: string; name: string } | null;
  setCurrentFund: (fund: { code: string; name: string } | null) => void;

  // 获取当前上下文摘要（用于 AI）
  getContextSummary: () => string;

  // 获取结构化上下文
  getStructuredContext: () => ContextData;
}

export interface ContextData {
  page: string;
  stock?: { code: string; name: string };
  fund?: { code: string; name: string };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppContextProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [currentStock, setCurrentStock] = useState<{ code: string; name: string } | null>(null);
  const [currentFund, setCurrentFund] = useState<{ code: string; name: string } | null>(null);

  const getContextSummary = useCallback(() => {
    const parts: string[] = [];

    // 页面上下文
    const pageNames: Record<string, string> = {
      dashboard: '仪表盘',
      stocks: '股票列表',
      funds: '基金列表',
      news: '资讯中心',
      recommendations: 'AI推荐',
      sentiment: '市场情绪',
      commodities: '商品',
      settings: '系统设置',
    };
    parts.push(`当前页面: ${pageNames[currentPage] || currentPage}`);

    // 股票上下文
    if (currentStock) {
      parts.push(`当前关注股票: ${currentStock.name} (${currentStock.code})`);
    }

    // 基金上下文
    if (currentFund) {
      parts.push(`当前关注基金: ${currentFund.name} (${currentFund.code})`);
    }

    return parts.join('\n');
  }, [currentPage, currentStock, currentFund]);

  const getStructuredContext = useCallback((): ContextData => {
    const context: ContextData = { page: currentPage };
    if (currentStock) context.stock = currentStock;
    if (currentFund) context.fund = currentFund;
    return context;
  }, [currentPage, currentStock, currentFund]);

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        currentStock,
        setCurrentStock,
        currentFund,
        setCurrentFund,
        getContextSummary,
        getStructuredContext,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
}
