'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { FolderOpen, UploadCloud, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import {
  uploadLandlordDocument,
  fetchLandlordDocuments,
  DocumentVaultEntry,
} from '@/lib/api-client';

const BRAND_COLOR = '#04164a';

const DOC_TYPES = [
  { value: 'title_deed', label: 'Title Deed' },
  { value: 'certificate_of_occupancy', label: 'Certificate of Occupancy' },
  { value: 'proof_of_ownership', label: 'Proof of Ownership' },
  { value: 'government_id', label: 'Government-issued ID' },
  { value: 'land_receipt', label: 'Land Receipt / Agreement' },
  { value: 'other', label: 'Other' },
];

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  rejected: 'bg-rose-100 text-rose-800 border-rose-200',
};

interface DocumentVaultPanelProps {
  landlordId: string;
}

export const DocumentVaultPanel: React.FC<DocumentVaultPanelProps> = ({ landlordId }) => {
  const [documents, setDocuments] = useState<DocumentVaultEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [docType, setDocType] = useState('title_deed');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLandlordDocuments(landlordId);
      setDocuments(data);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load documents.');
    } finally {
      setLoading(false);
    }
  }, [landlordId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      await uploadLandlordDocument({ landlord_id: landlordId, doc_type: docType, file });
      setFile(null);
      setDocType('title_deed');
      await load();
    } catch (e: any) {
      setError(e?.message ?? 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-purple-100 shadow-sm p-6">
      <h2 className="flex items-center gap-2 text-xl font-bold font-heading mb-2" style={{ color: BRAND_COLOR }}>
        <FolderOpen className="w-5 h-5" />
        Document Vault
      </h2>
      <p className="text-sm text-[#4a607a] font-body mb-6">
        Upload your title documents or proof of ownership to speed up verification. Your manager reviews each upload.
      </p>

      {error && (
        <div className="mb-4 flex items-start gap-2 p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleUpload} className="flex flex-col sm:flex-row gap-3 mb-6">
        <select
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
          className="h-11 rounded-xl border border-purple-200 bg-white px-3 text-sm font-body focus:outline-none focus:ring-[#04164a]/20 text-[#22376e]"
          aria-label="Document type"
        >
          {DOC_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="flex-1 h-11 rounded-xl border border-purple-200 bg-white px-3 text-sm font-body file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:text-white focus:outline-none text-[#22376e]"
          aria-label="Choose document"
        />
        <button
          type="submit"
          disabled={!file || uploading}
          className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl text-sm font-semibold font-heading text-white transition-colors disabled:opacity-50"
          style={{ backgroundColor: BRAND_COLOR }}
        >
          <UploadCloud className="w-4 h-4" />
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
      </form>

      {loading ? (
        <div className="flex items-center justify-center py-10 text-[#4a607a]">
          <RefreshCw className="w-5 h-5 animate-spin mr-3" />
          Loading documents…
        </div>
      ) : documents.length === 0 ? (
        <p className="text-sm text-[#4a607a] font-body py-6 text-center border border-dashed border-purple-200 rounded-xl">
          No documents uploaded yet. Upload a document above to get started.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-purple-100 bg-purple-50/50 text-xs uppercase tracking-wider text-[#4a607a] font-heading font-semibold">
                <th className="p-3">Document</th>
                <th className="p-3">Related listing</th>
                <th className="p-3">Status</th>
                <th className="p-3">Review note</th>
                <th className="p-3">Uploaded</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody className="font-body text-[#22376e]">
              {documents.map((doc) => (
                <tr key={doc.id} className="border-b border-purple-100/70 last:border-0 hover:bg-purple-50/30 transition-colors">
                  <td className="p-3">
                    <span className="font-semibold" style={{ color: BRAND_COLOR }}>
                      {DOC_TYPES.find((t) => t.value === doc.doc_type)?.label ?? doc.doc_type}
                    </span>
                  </td>
                  <td className="p-3">{doc.intake_title ?? '—'}</td>
                  <td className="p-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${STATUS_STYLES[doc.review_status] ?? 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                      {doc.review_status}
                    </span>
                  </td>
                  <td className="p-3 max-w-[180px] truncate">{doc.review_notes || '—'}</td>
                  <td className="p-3 whitespace-nowrap">{new Date(doc.uploaded_at).toLocaleDateString('en-NG')}</td>
                  <td className="p-3">
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold hover:underline"
                      style={{ color: BRAND_COLOR }}
                    >
                      <ExternalLink className="w-3 h-3" />
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
