import PaginatedEditor from '@/components/PaginatedEditor';

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">LB</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Legal Document Editor</h1>
              <p className="text-sm text-gray-500">US Letter Size (8.5" × 11") with 1" Margins</p>
            </div>
          </div>
          <div className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-lg border border-gray-300">
            OpenSphere Assignment • Pagination Implementation
          </div>
        </div>
      </div>
      <PaginatedEditor />
    </main>
  );
}