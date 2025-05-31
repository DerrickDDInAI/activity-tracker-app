import { useEffect, useState } from 'react';
import { useActivities } from '../context/ActivityContext';

export function useFrameworkReady() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const context = useActivities();

  useEffect(() => {
    console.log('useFrameworkReady: Checking initialization status...', {
      contextExists: !!context,
      isLoading: context?.isLoading,
      hasActivities: !!context?.activities
    });

    if (!context) {
      setError(new Error('Activity context not initialized'));
      return;
    }

    if (context.isLoading) {
      setReady(false);
      return;
    }

    // Context is loaded and available
    setReady(true);
    setError(null);
  }, [context, context?.isLoading]);

  return { ready, error };
}
