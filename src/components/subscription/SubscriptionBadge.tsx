import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SubscriptionBadgeProps {
  status: 'active' | 'trial' | 'expired' | 'upgrade';
  className?: string;
}

export function SubscriptionBadge({ status, className }: SubscriptionBadgeProps) {
  const getVariantAndText = (status: string) => {
    switch (status) {
      case 'active':
        return { variant: 'default' as const, text: 'Active', className: 'bg-green-100 text-green-700 border-green-200' };
      case 'trial':
        return { variant: 'secondary' as const, text: 'Trial', className: 'bg-blue-100 text-blue-700 border-blue-200' };
      case 'expired':
        return { variant: 'destructive' as const, text: 'Expired', className: 'bg-red-100 text-red-700 border-red-200' };
      case 'upgrade':
        return { variant: 'outline' as const, text: 'Free Plan', className: 'bg-orange-100 text-orange-700 border-orange-200' };
      default:
        return { variant: 'outline' as const, text: 'Unknown', className: 'bg-gray-100 text-gray-700 border-gray-200' };
    }
  };

  const { text, className: statusClassName } = getVariantAndText(status);

  return (
    <Badge 
      className={cn(statusClassName, className)}
    >
      {text}
    </Badge>
  );
}