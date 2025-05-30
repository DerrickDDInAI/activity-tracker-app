import { useEffect, useState } from 'react';
import { useActivities } from '@/context/ActivityContext';

export function useFrameworkReady() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const context = useActivities();

  useEffect(() => {
    console.log('useFrameworkReady: Starting initialization...');
    const prepare = async () => {
      try {
        // Ensure context is initialized
        if (!context) {
          throw new Error('Activity context not initialized');
        }
        
        // Wait a moment to ensure all async operations complete
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('useFrameworkReady: Framework initialized successfully');
        setReady(true);
      } catch (e) {
        console.error('useFrameworkReady: Error during initialization:', e);
        setError(e instanceof Error ? e : new Error('Unknown error'));
      }
    };

    prepare();
  }, [context]);

  return { ready, error };
}
