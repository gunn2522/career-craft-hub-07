import { useSiteMetrics, useLiveMetricCounts } from '@/hooks/useHomepageContent';
import { Skeleton } from '@/components/ui/skeleton';

const formatNumber = (num: number): string => {
  if (num >= 1000) {
    return (num / 1000).toFixed(num >= 10000 ? 0 : 1) + 'K+';
  }
  return num.toString() + '+';
};

export const LiveStats = () => {
  const { data: metrics, isLoading: metricsLoading } = useSiteMetrics();
  const { data: counts, isLoading: countsLoading } = useLiveMetricCounts();

  const isLoading = metricsLoading || countsLoading;

  const getMetricValue = (metricKey: string): string => {
    if (!counts) return '0+';
    
    switch (metricKey) {
      case 'total_students':
        return formatNumber(counts.total_students);
      case 'total_mentors':
        return formatNumber(counts.total_mentors);
      case 'total_partners':
        return formatNumber(counts.total_partners);
      case 'total_roadmaps':
        return formatNumber(counts.total_roadmaps);
      default:
        return '0+';
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="text-left">
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {metrics?.map((metric) => (
        <div key={metric.id} className="text-left">
          <div className="font-display text-2xl sm:text-3xl font-bold gradient-text">
            {getMetricValue(metric.metric_key)}
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground mt-1">
            {metric.display_label}
          </div>
        </div>
      ))}
    </div>
  );
};
