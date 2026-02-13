
import React, { useState } from 'react';
import { editAirportImage } from '../services/geminiService';

interface ImageEditModalProps {
  imageUrl: string;
  onClose: () => void;
  onSave: (newUrl: string) => void;
}

const ImageEditModal: React.FC<ImageEditModalProps> = ({ imageUrl, onClose, onSave }) => {
  const [prompt, setPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(imageUrl);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = async () => {
    if (!prompt.trim()) return;
    setIsEditing(true);
    setError(null);
    try {
      const result = await editAirportImage(previewUrl, prompt);
      setPreviewUrl(result);
      setPrompt('');
    } catch (err: any) {
      setError(err.message || 'Error processing image edit');
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-lg">AI Image Studio</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="p-6 flex-grow overflow-y-auto">
          <div className="relative group mb-6 rounded-lg overflow-hidden border border-slate-200 bg-slate-900 aspect-video flex items-center justify-center">
            {isEditing ? (
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white z-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                <p className="animate-pulse">Gemini is reimagining your image...</p>
              </div>
            ) : null}
            <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                What would you like to change?
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., 'Add a retro sunset filter' or 'Make it snow'"
                  className="flex-grow border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
                />
                <button
                  onClick={handleEdit}
                  disabled={isEditing || !prompt.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                >
                  <i className="fas fa-magic"></i>
                  <span>Edit</span>
                </button>
              </div>
              {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {['Vintage look', 'Night time', 'Golden hour', 'Summer vibe'].map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => setPrompt(suggestion)}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1 rounded-full border border-slate-200 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(previewUrl)}
            className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageEditModal;
