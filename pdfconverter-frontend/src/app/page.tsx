'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
    setDownloadUrl(null);
    setError(null);
    setStatus('idle');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: true,
  });

  const handleUpload = async () => {
    if (!files.length) return;

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    setStatus('uploading');
    setError(null);
    setProgress(0);

    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'http://localhost:3000/convert/upload-multiple', true);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      const promise = new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(xhr.statusText));
          }
        };
        xhr.onerror = () => reject(new Error('Network error'));
      });

      xhr.send(formData);

      const data = await promise as { downloadUrl: string };
      setDownloadUrl(data.downloadUrl);
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to convert files. Please try again.');
      setStatus('error');
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    setFiles([]);
    setDownloadUrl(null);
    setError(null);
    setStatus('idle');
  };
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">Multi-File PDF Converter</h1>
          <p className="text-gray-500 mt-2">Combine multiple images and text files into one PDF</p>
        </div>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          {files.length > 0 ? (
            <p className="text-gray-600">{files.length} files selected</p>
          ) : isDragActive ? (
            <p className="text-blue-600">Drop your files here...</p>
          ) : (
            <div>
              <p className="text-gray-600">Drag & drop files here, or click to select</p>
              <p className="text-xs text-gray-400 mt-2">
                Supported formats: TXT, PNG, JPG (Max 10MB each)
              </p>
            </div>
          )}
        </div>

        {files.length > 0 && (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <p className="text-sm font-medium text-gray-700">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {status === 'uploading' && (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Uploading... {progress}%
            </p>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={handleUpload}
            disabled={status === 'uploading' || files.length === 0}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              status === 'uploading'
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } ${files.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {status === 'uploading' ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Converting
              </span>
            ) : (
              'Convert to PDF'
            )}
          </button>
          
          {(files.length > 0 || downloadUrl) && (
            <button
              onClick={handleReset}
              className="py-3 px-4 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
          )}
        </div>

        {status === 'success' && downloadUrl && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-700 font-medium">Conversion successful!</span>
              </div>
              <a
                href={downloadUrl}
                download
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                Download PDF
              </a>
            </div>
          </div>
        )}

        {status === 'error' && error && (
          <div className="p-4 bg-red-50 rounded-lg border border-red-100">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}