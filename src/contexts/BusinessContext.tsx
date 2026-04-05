import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loadBusinessProfile, buildBusinessContext, BusinessProfile, EMPTY_PROFILE } from '../services/storageService';

interface BusinessContextType {
  profile: BusinessProfile;
  businessContext: string;
  reload: () => Promise<void>;
}

const BusinessCtx = createContext<BusinessContextType>({
  profile: EMPTY_PROFILE,
  businessContext: '',
  reload: async () => {},
});

export const useBusiness = () => useContext(BusinessCtx);

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<BusinessProfile>(EMPTY_PROFILE);
  const [businessContext, setBusinessContext] = useState('');

  const load = useCallback(async () => {
    const p = await loadBusinessProfile();
    setProfile(p);
    setBusinessContext(buildBusinessContext(p));
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <BusinessCtx.Provider value={{ profile, businessContext, reload: load }}>
      {children}
    </BusinessCtx.Provider>
  );
}
