export default function Loading() {
  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="text-center mb-12 animate-pulse">
          <div className="h-16 bg-[#d1d1d1] rounded-3xl w-3/4 mx-auto mb-4"></div>
          <div className="h-6 bg-[#d1d1d1] rounded-2xl w-1/2 mx-auto"></div>
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="neuro-flat rounded-3xl p-6 animate-pulse">
              <div className="neuro-pressed rounded-2xl h-48 mb-4 bg-[#d1d1d1]"></div>
              <div className="space-y-3">
                <div className="h-6 bg-[#d1d1d1] rounded-xl w-3/4"></div>
                <div className="h-4 bg-[#d1d1d1] rounded-xl w-full"></div>
                <div className="h-4 bg-[#d1d1d1] rounded-xl w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
