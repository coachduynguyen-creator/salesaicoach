import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadKnowledgeBase } from '../services/knowledgeService';
import { SALES_KNOWLEDGE_BASE } from '../constants/knowledgeBase';

interface KnowledgeContextType {
  knowledgeBase: string;
  isLoading: boolean;
  isFromCloud: boolean;
  isStaleCache: boolean;
  reload: () => Promise<void>;
}

const KnowledgeContext = createContext<KnowledgeContextType>({
  knowledgeBase: SALES_KNOWLEDGE_BASE,
  isLoading: true,
  isFromCloud: false,
  isStaleCache: false,
  reload: async () => {},
});

export const useKnowledge = () => useContext(KnowledgeContext);

export function KnowledgeProvider({ children }: { children: React.ReactNode }) {
  const [knowledgeBase, setKnowledgeBase] = useState(SALES_KNOWLEDGE_BASE);
  const [isLoading, setIsLoading] = useState(true);
  const [isFromCloud, setIsFromCloud] = useState(false);
  const [isStaleCache, setIsStaleCache] = useState(false);

  const load = async () => {
    setIsLoading(true);
    setIsStaleCache(false);
    try {
      const { content, source } = await loadKnowledgeBase();
      setKnowledgeBase(content);
      setIsFromCloud(source === 'cloud' || source === 'cache');
      setIsStaleCache(source === 'stale_cache');
    } catch {
      setIsFromCloud(false);
      setIsStaleCache(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <KnowledgeContext.Provider value={{ knowledgeBase, isLoading, isFromCloud, isStaleCache, reload: load }}>
      {children}
    </KnowledgeContext.Provider>
  );
}
