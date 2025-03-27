import { Skeleton } from "@/components/ui/skeleton";

export default function EventCardSkeleton() {
  return (
    <div className="group relative overflow-hidden rounded-lg border bg-background">
      {/* Thumbnail skeleton */}
      <Skeleton className="aspect-[16/9] w-full" />
      
      {/* Content */}
      <div className="p-6">
        {/* Title skeleton */}
        <Skeleton className="h-6 w-3/4 mb-2" />
        
        {/* Description skeleton */}
        <div className="space-y-2 mb-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        
        {/* Event details skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  );
} 