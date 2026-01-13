'use client'

interface WizardHelpModalProps {
  onClose: () => void
}

export function WizardHelpModal({ onClose }: WizardHelpModalProps) {
  return (
    <div 
      className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" 
      onClick={onClose}
      style={{ margin: 0, padding: 0 }}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 m-4" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">How Story Point Estimation Works</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="text-gray-700 dark:text-gray-300">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">How It Works</h3>
            <p className="text-sm">
              The calculator asks you 6 questions about your task. Each answer contributes points based on complexity, 
              and these points are combined to suggest a story point estimate. The system also considers special cases 
              like very large tasks or tasks that touch many areas.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Scoring System</h3>
            <p className="text-sm mb-2">Each answer you select adds points to your total score:</p>
            <ul className="list-disc list-inside text-sm space-y-1 ml-2">
              <li><strong>Simple answers</strong> (e.g., "Single file", "No dependencies") add 0-1 points</li>
              <li><strong>Moderate answers</strong> (e.g., "Multiple files", "Some investigation") add 2-4 points</li>
              <li><strong>Complex answers</strong> (e.g., "Core system", "Design likely to change") add 5-6 points</li>
            </ul>
            <p className="text-sm mt-2">
              All your answers are added together to get a total score.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Story Point Mapping</h3>
            <p className="text-sm mb-2">Your total score maps to a story point value:</p>
            <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 text-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-300 dark:border-gray-600">
                    <th className="text-left py-1">Total Score</th>
                    <th className="text-left py-1">Suggested Story Points</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="py-1">0-2</td><td className="py-1">1</td></tr>
                  <tr><td className="py-1">3-5</td><td className="py-1">2</td></tr>
                  <tr><td className="py-1">6-9</td><td className="py-1">3</td></tr>
                  <tr><td className="py-1">10-14</td><td className="py-1">5</td></tr>
                  <tr><td className="py-1">15-20</td><td className="py-1">8</td></tr>
                  <tr><td className="py-1">21 or more</td><td className="py-1">Too large - needs breakdown</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Special Rules</h3>
            
            <div className="mb-4">
              <p className="text-sm font-medium mb-1">Minimum Requirements</p>
              <p className="text-sm">
                Some complex options (like "Core system" or "Cross-team dependency") have minimum story point requirements. 
                If your calculated score suggests a lower value, it will be increased to meet the minimum.
              </p>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium mb-1">Broad Tasks</p>
              <p className="text-sm">
                If your task touches 5 or more different areas but results in a low estimate (1-3 story points) 
                with mostly simple answers, it's automatically adjusted to 5 points. 
                This prevents underestimating tasks that span many areas even if each individual area seems simple.
              </p>
            </div>

            <div>
              <p className="text-sm font-medium mb-1">Very Large Tasks</p>
              <p className="text-sm mb-2">
                If your total score is 21 or higher, the task is considered too large to estimate as a single story. 
                You'll be prompted to break it down into smaller pieces first.
              </p>
              <p className="text-sm text-orange-600 dark:text-orange-400">
                <strong>Note:</strong> When a task needs decomposition, you cannot select a story point value until it's broken down.
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Confidence Level</h3>
            <p className="text-sm mb-2">
              The confidence percentage (shown as 20-95%) tells you how reliable the estimate is:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 ml-2">
              <li><strong>Higher confidence</strong> when your score is safely in the middle of a range</li>
              <li><strong>Lower confidence</strong> when your score is near the edge of a range (small changes could change the estimate)</li>
              <li><strong>Lower confidence</strong> when your task touches many different areas</li>
              <li><strong>Lower confidence</strong> when there's high uncertainty or missing information</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Example</h3>
            <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded p-4 text-sm border border-indigo-200 dark:border-indigo-800">
              <p className="font-semibold mb-2">Task: Add authentication to API endpoint</p>
              <p className="mb-2">Selected answers:</p>
              <ul className="space-y-1 mb-3">
                <li>Scope: Multiple layers (API + service + DB)</li>
                <li>Complexity: Stateful or multi-step logic</li>
                <li>Uncertainty: Some investigation needed</li>
                <li>Data Impact: Schema change only</li>
                <li>Dependencies: Needs review</li>
                <li>Testing: Integration tests</li>
              </ul>
              <div className="pt-3 border-t border-indigo-200 dark:border-indigo-700">
                <p className="mb-1"><strong>Result:</strong></p>
                <p>Total score: 14 points</p>
                <p>Suggested story points: <strong>5</strong></p>
                <p>Confidence: Medium (score is in the middle of the 5-point range)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
