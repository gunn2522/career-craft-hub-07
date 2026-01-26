import React from 'react';
import { Button } from '@/components/ui/button';
import { type FallbackProps } from 'react-error-boundary';

const ChunkLoadErrorFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  const isChunkLoadError = /Loading( CSS)? chunk .* failed/i.test(error.message);

  const handleRetry = () => {
    if (isChunkLoadError) {
      window.location.reload();
    } else {
      resetErrorBoundary();
    }
  };

  return (
    <div 
      role="alert" 
      className="flex flex-col items-center justify-center min-h-screen text-center p-4 bg-background text-foreground"
    >
      <div className="max-w-md">
        <h2 className="text-2xl font-bold mb-2">
          {isChunkLoadError ? 'Application Update Required' : 'Oops! Something went wrong.'}
        </h2>
        <p className="text-muted-foreground mb-6">
          {isChunkLoadError
            ? 'We had trouble loading the application, likely due to a new version being available. Please reload the page to get the latest updates.'
            : 'An unexpected error occurred. Please try again.'}
        </p>
        <Button onClick={handleRetry}>
          {isChunkLoadError ? 'Reload Page' : 'Try Again'}
        </Button>
        <details className="mt-4 text-left text-xs text-muted-foreground/70">
          <summary>Error Details</summary>
          <pre className="mt-2 p-2 bg-muted rounded-md text-xs overflow-auto whitespace-pre-wrap">
            {error.message}
          </pre>
        </details>
      </div>
    </div>
  );
};

export default ChunkLoadErrorFallback;
