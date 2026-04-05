import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadKnowledgeBase } from '../services/knowledgeService';
import { SALES_KNOWLEDGE_BASE } from '../constants/knowledgeBase';

interface KnowledgeContextType {
  knowledgeBase: string;
  isLoading: boolean;
  isFromCloud: boolean;
  reload: () => Promise<void>;
}

const KnowledgeContext = createContext<KnowledgeContextType>({
  knowledgeBase: SALES_KNOWLEDGE_BASE,
  isLoading: true,
  isFromCloud: false,
  reload: async () => {},
});

export const useKnowledge = () => useContext(KnowledgeContext);

export function KnowledgeProvider({ children }: { children: React.ReactNode }) {
  const [knowledgeBase, setKnowledgeBase] = useState(SALES_KNOWLEDGE_BASE);
  const [isLoading, setIsLoading] = useState(true);
  const [isFromCloud, setIsFromCloud] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const cloud = await loadKnowledgeBase();
      setKnowledgeBase(cloud);
      setIsFromCloud(true);
      console.log('Using cloud knowledge base');
    } catch {
      console.log('Fallback to local knowledge base');
      setIsFromCloud(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <KnowledgeContext.Provider value={{ knowledgeBase, isLoading, isFromCloud, reload: load }}>
      {children}
    </KnowledgeContext.Provider>
  );
}
