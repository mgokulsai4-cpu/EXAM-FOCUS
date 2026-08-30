'use client';

import React, { ReactNode } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { StudyProvider, useStudy } from './StudyContext';
import { FocusProvider, useFocus } from './FocusContext';
import { RewardsProvider, useRewards } from './RewardsContext';
import { AIProvider, useAI } from './AIContext';
import { UIProvider, useUI } from './UIContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <StudyProvider>
        <FocusProvider>
          <RewardsProvider>
            <AIProvider>
              <UIProvider>
                {children}
              </UIProvider>
            </AIProvider>
          </RewardsProvider>
        </FocusProvider>
      </StudyProvider>
    </AuthProvider>
  );
}

export { useAuth } from './AuthContext';
export { useStudy } from './StudyContext';
export { useFocus } from './FocusContext';
export { useRewards } from './RewardsContext';
export { useAI } from './AIContext';
export { useUI } from './UIContext';