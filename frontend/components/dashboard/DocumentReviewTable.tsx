'use client';

import React, { useState } from 'react';
import { ExternalLink, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { reviewDocument, DocumentVaultEntry } from '@/lib/api-client';

const BRAND_COLOR = '#04164a';

const DOC_TYPE_LABELS: Record<string, string> = {
  title_deed: 'Title Deed',
  certificate_of_occupancy: 'Certificate of Occupancy',
  proof_of_ownership: 'Proof of Ownership',
  government_id: 'Government-issued ID',
  land_receipt: 'Land Receipt / Agreement',
  other: 'Other',
};

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  rejected: 'bg-rose-100 text-rose-800 border-rose-200',
};

interface DocumentReviewTableProps {
  documents: DocumentVaultEntry[];
  onReload: () => Promise<void>;
}

export const DocumentReviewTable: React.FC<DocumentReviewTableProps> = ({ documents, onReload }) => {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const handleReview = async (id: string, review_status: 'approved' | 'rejected') => {
    setBusyId(id);
    setError(null);
    try {
      await reviewDocument(id, review_status, notes[id] ?? '');
      await onReload();
    } catch (e: any) {
      setError(e?.message ?? 'Failed to update document.');
    } finally {
      setBusyId(null);
    }
  };

  if (documents.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-purple-100 shadow-sm p-10 text-center">
        <p className="text-sm text-[#4a607a] font-body">No documents uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-purple-100 shadow-sm">
      {error && (
        <div className="m-4 flex items-start gap-2 p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-purple-100 bg-purple-50/50 text-xs uppercase tracking-wider text-[#4a607a] font-heading font-semibold">
              <th className="p-4">Landlord</th>
              <th className="p-4">Document</th>
              <th className="p-4">Listing</th>
              <th className="p-4">Status</th>
              <th className="p-4">Note</th>
              <th className="p-4">Uploaded</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="font-body text-[#22376e]">
            {documents.map((doc) => (
              <tr key={doc.id} className="border-b border-purple-100/70 last:border-0 hover:bg-purple-50/30 transition-colors">
                <td className="p-4">
                  <p className="font-semibold" style={{ color: BRAND_COLOR }}>{doc.landlord_name}</p>
                  <p className="text-xs text-[#4a607a]">{doc.landlord_phone}</p>
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1 font-semibold" style={{ color: BRAND_COLOR }}>
                    {DOC_TYPE_LABELS[doc.doc_type] ?? doc.doc_type}
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-[#4a607a] hover:text-[#04164a]" aria-label="Open document">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </span>
                </td>
                <td className="p-4">{doc.intake_title ?? '—'}</td>
                <td className="p-4">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${STATUS_STYLES[doc.review_status] ?? 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                    {doc.review_status}
                  </span>
                </td>
                <td className="p-4">
                  {doc.review_status === 'pending' ? (
                    <input
                      type="text"
                      value={notes[doc.id] ?? ''}
                      onChange={(e) => setNotes((prev) => ({ ...prev, [doc.id]: e.target.value }))}
                      placeholder="Add a note…"
                      className="w-full max-w-[160px] h-9 px-2.5 rounded-lg border border-purple-200 bg-white text-xs font-body focus:outline-none focus:ring-[#04164a]/20 text-[#22376e]"
                    />
                  ) : (
                    <span className="text-xs text-[#4a607a]">{doc.review_notes || '—'}</span>
                  )}
                </td>
                <td className="p-4 whitespace-nowrap">{new Date(doc.uploaded_at).toLocaleDateString('en-NG')}</td>
                <td className="p-4">
                  {doc.review_status === 'pending' ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReview(doc.id, 'approved')}
                        disabled={busyId === doc.id}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReview(doc.id, 'rejected')}
                        disabled={busyId === doc.id}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200 hover:bg-rose-200 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-3 h-3" />
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-[#4a607a]">{doc.reviewed_at ? new Date(doc.reviewed_at).toLocaleDateString('en-NG') : '—'}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
