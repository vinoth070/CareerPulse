import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  FolderArchive,
  Upload,
  FileText,
  FileCheck,
  Trash2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  Award,
  Layers
} from 'lucide-react';

interface UploadedDoc {
  id: string;
  name: string;
  size: string;
  category: 'certificate' | 'resume' | 'project_spec' | 'other';
  uploadedAt: string;
  url?: string;
}

export const StudentPortfolioPage: React.FC = () => {
  const { userProfile, updateStudentProfile } = useAuth();

  const [documents, setDocuments] = useState<UploadedDoc[]>([
    {
      id: 'doc-1',
      name: 'AWS_Certified_Cloud_Practitioner.pdf',
      size: '1.2 MB',
      category: 'certificate',
      uploadedAt: '2026-10-15',
      url: '#'
    },
    {
      id: 'doc-2',
      name: 'FullStack_Engineering_Resume_v2.pdf',
      size: '420 KB',
      category: 'resume',
      uploadedAt: '2026-10-22',
      url: '#'
    }
  ]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docCategory, setDocCategory] = useState<'certificate' | 'resume' | 'project_spec' | 'other'>('certificate');
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'application/zip'];
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB limit

    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.pdf')) {
      setErrorMsg('Invalid file type. Only PDF certificates, PNG/JPEG screenshots, and ZIP project archives are supported.');
      return;
    }

    if (file.size > maxSizeBytes) {
      setErrorMsg('File exceeds maximum 10MB size limit.');
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // Simulate authenticated file upload with validation
      await new Promise((r) => setTimeout(r, 800));

      const sizeFormatted = `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`;
      const newDoc: UploadedDoc = {
        id: `doc-${Date.now()}`,
        name: selectedFile.name,
        size: sizeFormatted,
        category: docCategory,
        uploadedAt: new Date().toISOString().split('T')[0]
      };

      setDocuments([newDoc, ...documents]);
      setSelectedFile(null);
      setSuccessMsg(`Document "${selectedFile.name}" verified and uploaded to authenticated storage.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDoc = (id: string) => {
    setDocuments(documents.filter((d) => d.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200">
              <FolderArchive className="w-3.5 h-3.5" />
              <span>Evidence &amp; Artifact Storage</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Portfolio &amp; Verified Document Repository
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              Upload authenticated PDF certificates, project portfolios, and resume versions. Documents are protected and shared with enterprise recruiters only under your consent.
            </p>
          </div>
        </div>

        {/* Upload Form Box */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Upload className="w-4 h-4 text-blue-600" />
            Upload Verified Document or Certificate
          </h3>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document Classification
                </label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value as any)}
                  className="w-full py-2.5 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="certificate">Verified Certificate (PDF)</option>
                  <option value="resume">Targeted Resume Version (PDF)</option>
                  <option value="project_spec">Project Architecture / Spec Document</option>
                  <option value="other">Other Supported Credential</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select File (Max 10MB &bull; PDF, PNG, ZIP)
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.png,.jpg,.jpeg,.zip"
                  className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={!selectedFile || uploading}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-40 flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{uploading ? 'Validating & Uploading...' : 'Upload Document'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Uploaded Documents List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Repository Documents ({documents.length})
            </h3>
            <span className="text-[11px] text-slate-400">Authenticated Storage</span>
          </div>

          <div className="divide-y divide-slate-100">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{doc.name}</h4>
                    <p className="text-[11px] text-slate-500">
                      {doc.size} &bull; Uploaded on {doc.uploadedAt} &bull;{' '}
                      <span className="font-semibold uppercase text-blue-700">
                        {doc.category.replace('_', ' ')}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Validated
                  </span>
                  <button
                    onClick={() => handleDeleteDoc(doc.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
