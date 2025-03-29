import Link from "next/link";
import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white shadow-xl rounded-xl p-10 border border-gray-200">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100 mb-6">
            <svg
              className="h-16 w-16 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Oops! Something Went Wrong
          </h1>
          <p className="text-gray-600 mb-6">
            We encountered an unexpected error. Don&apos;t worry, our AI is
            working hard to fix it.
          </p>

          <div className="space-y-4">
            <button
              onClick={() => reset()}
              className="w-full py-3 px-4 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 transition duration-300 flex items-center justify-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Try Again
            </button>

            <Link
              href="/"
              className="w-full py-3 px-4 bg-gray-100 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-200 transition duration-300 flex items-center justify-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Return to Dashboard
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <details className="text-sm text-gray-500">
            <summary>View Error Details</summary>
            <pre className="bg-gray-100 p-4 rounded-lg mt-2 max-h-40 overflow-auto text-left">
              {error.toString()}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
}
