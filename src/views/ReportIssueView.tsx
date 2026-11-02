import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AlertTriangle, Send, CheckCircle, Clock, Image as ImageIcon, X, Eye } from 'lucide-react';

export const ReportIssueView: React.FC = () => {
  const { currentUser, reportIssue, issueReports } = useApp();
  const [featureName, setFeatureName] = useState('');
  const [category, setCategory] = useState('Create Report Wizard');
  const [issueDesc, setIssueDesc] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [previewModalImg, setPreviewModalImg] = useState<string | null>(null);

  if (!currentUser) return null;

  const userReports = issueReports.filter(r => r.user_id === currentUser.id || r.user_email === currentUser.email);

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setScreenshotName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          setScreenshotName('pasted_screenshot.png');
          const reader = new FileReader();
          reader.onloadend = () => {
            setScreenshot(reader.result as string);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!featureName.trim() || !issueDesc.trim()) return;

    reportIssue({
      feature_name: `[${category}] ${featureName.trim()}`,
      description: issueDesc.trim(),
      screenshot: screenshot || undefined,
      screenshot_name: screenshotName || undefined
    });

    setSubmittedSuccess(true);
    setFeatureName('');
    setIssueDesc('');
    setScreenshot(null);
    setScreenshotName(null);
    setTimeout(() => setSubmittedSuccess(false), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans">
      
      {submittedSuccess && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-3 shadow-xs" style={{ fontFamily: "'Poppins', sans-serif" }}>
          <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
          <div>
            <div className="font-bold text-slate-900">Issue report received!</div>
            <div className="text-xs text-emerald-700 font-normal">Thank you for your feedback. Administrators have been notified to inspect and resolve this issue.</div>
          </div>
        </div>
      )}

      {/* Report Form Card */}
      <form onSubmit={handleSubmit} onPaste={handlePaste} className="bg-white rounded-[20px] border border-slate-100 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4 flex items-center gap-2.5 text-amber-500">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="text-xl font-bold text-[#1E293B]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
            New Issue Report
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-[#1E293B] mb-1.5" style={{ fontFamily: "'Quicksand', sans-serif" }}>
              Affected Module / Category
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#6366F1] bg-white text-[#334155] cursor-pointer font-medium"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <option value="Create Report Wizard">Create Report Wizard</option>
              <option value="Blotter Incident Records">Blotter Incident Records</option>
              <option value="Evidence / File Upload">Evidence / File Upload</option>
              <option value="Hearing Schedule">Hearing Schedule</option>
              <option value="Dossier Print / Download">Dossier Print / Download</option>
              <option value="Account & Login">Account &amp; Login</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-[#1E293B] mb-1.5" style={{ fontFamily: "'Quicksand', sans-serif" }}>
              Feature Name or Action
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Save Draft button, PDF Download, Status Filter"
              value={featureName}
              onChange={e => setFeatureName(e.target.value)}
              className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#6366F1] bg-white text-[#334155]"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-[#1E293B] mb-1.5" style={{ fontFamily: "'Quicksand', sans-serif" }}>
            Issue Description &amp; Details
          </label>
          <textarea
            rows={4}
            required
            placeholder="Please specify what happened, the steps to reproduce it, or any error message displayed..."
            value={issueDesc}
            onChange={e => setIssueDesc(e.target.value)}
            className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#6366F1] bg-white text-[#334155] resize-y"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          />
        </div>

        {/* Screenshot Upload / Attachment Section */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-[#1E293B] mb-1.5" style={{ fontFamily: "'Quicksand', sans-serif" }}>
            Attach Screenshot (Optional)
          </label>
          <div className="border border-dashed border-slate-300 rounded-2xl p-4 bg-[#F8FAFC] hover:bg-slate-100/60 transition-colors">
            {!screenshot ? (
              <label className="flex flex-col items-center justify-center cursor-pointer text-center py-3 select-none">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotChange}
                  className="hidden"
                />
                <ImageIcon className="w-6 h-6 text-[#94A3B8] mb-1.5" />
                <span className="text-xs sm:text-sm font-semibold text-[#1E293B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Click to upload screenshot or drag and drop
                </span>
                <span className="text-xs text-[#94A3B8] mt-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  PNG, JPG, WebP supported • You can also paste directly from clipboard (Ctrl+V)
                </span>
              </label>
            ) : (
              <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200">
                <div className="flex items-center gap-3 overflow-hidden">
                  <img
                    src={screenshot}
                    alt="Screenshot preview"
                    className="w-16 h-12 object-cover rounded-lg border border-slate-200 shrink-0 cursor-pointer hover:opacity-90"
                    onClick={() => setPreviewModalImg(screenshot)}
                    title="Click to view full preview"
                  />
                  <div className="truncate">
                    <div className="text-xs sm:text-sm font-bold text-[#1E293B] truncate" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      {screenshotName || 'Screenshot attached'}
                    </div>
                    <div className="text-xs text-emerald-600 font-semibold" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      Ready to send with report
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setPreviewModalImg(screenshot)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Preview full image"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setScreenshot(null);
                      setScreenshotName(null);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Remove screenshot"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="submit"
            className="px-7 py-2.5 bg-[#3730A3] hover:bg-[#2e2882] text-white font-bold text-xs sm:text-sm rounded-full transition-all shadow-xs cursor-pointer inline-flex items-center gap-2"
            style={{ fontFamily: "'Quicksand', sans-serif" }}
          >
            <Send className="w-4 h-4" />
            <span>Submit Report</span>
          </button>
        </div>
      </form>

      {/* History of Submitted Reports */}
      {userReports.length > 0 && (
        <div className="bg-white rounded-[20px] border border-slate-100 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-[#3730A3]">
            <Clock className="w-5 h-5" />
            <h4 className="text-lg font-bold text-[#1E293B]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
              My Reported Issues ({userReports.length})
            </h4>
          </div>

          <div className="space-y-3">
            {userReports.map(rep => (
              <div key={rep.id} className="p-4 bg-[#F8FAFC] border border-slate-200/80 rounded-2xl text-xs sm:text-sm space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-[#1E293B]" style={{ fontFamily: "'Poppins', sans-serif" }}>{rep.feature_name}</span>
                  <span className="text-xs text-[#64748B] font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>{rep.created_at}</span>
                </div>
                <p className="text-xs text-[#475569] leading-relaxed" style={{ fontFamily: "'Poppins', sans-serif" }}>{rep.description}</p>
                {rep.screenshot && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setPreviewModalImg(rep.screenshot || null)}
                      className="inline-flex items-center gap-1.5 text-xs text-[#3730A3] font-semibold hover:underline"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Attached Screenshot</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewModalImg && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setPreviewModalImg(null)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full p-4 shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
              <span className="text-xs sm:text-sm font-bold text-[#1E293B]">Screenshot Preview</span>
              <button
                type="button"
                onClick={() => setPreviewModalImg(null)}
                className="p-1 text-slate-500 hover:text-black rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto rounded-xl border border-slate-200 flex items-center justify-center bg-slate-900">
              <img
                src={previewModalImg}
                alt="Enlarged screenshot"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ReportIssueView;
