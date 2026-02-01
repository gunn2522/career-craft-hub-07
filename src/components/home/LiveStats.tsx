import { useSiteMetrics, useLiveMetricCounts } from '@/hooks/useHomepageContent';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-5 bg-card/60 backdrop-blur-sm border-border/40 rounded-xl">
            <Skeleton className="h-7 w-16 mb-1.5" />
            <Skeleton className="h-4 w-20" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {metrics?.map((metric) => (
        <Card key={metric.id} className="p-5 bg-card/60 backdrop-blur-sm border-border/40 rounded-xl text-left">
          <div className="font-display text-[22px] md:text-[26px] font-bold gradient-text leading-none">
            {getMetricValue(metric.metric_key)}
          </div>
          <div className="text-[13px] md:text-sm text-muted-foreground mt-1.5">
            {metric.display_label}
          </div>
        </Card>
      ))}
    </div>
  );
};
