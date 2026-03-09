'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Image, ExternalLink, Download, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { KnowledgeItem } from '@/types';

interface DocumentViewerProps {
  item: KnowledgeItem;
}

export default function DocumentViewer({ item }: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const renderContent = () => {
    switch (item.type) {
      case 'pdf':
        return (
          <div className="space-y-4">
            {/* PDF Controls */}
            <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-white/60" />
                <span className="text-white/80 text-sm">PDF Document</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                  title="Zoom out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-white/60 text-sm min-w-[3rem] text-center">{zoom}%</span>
                <button
                  onClick={handleZoomIn}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                  title="Zoom in"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                {item.file_path && (
                  <a
                    href={item.file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* PDF Embed */}
            {item.file_path ? (
              <div className="bg-white/[0.02] border border-white/5 rounded-lg overflow-hidden">
                <iframe
                  src={`${item.file_path}#zoom=${zoom}`}
                  className="w-full h-96 border-0"
                  title={item.title}
                />
              </div>
            ) : (
              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-8 text-center">
                <FileText className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/40">PDF file not available for preview</p>
                <p className="text-white/30 text-sm mt-1">Content has been extracted and is searchable</p>
              </div>
            )}
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4">
            {/* Image Controls */}
            <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-lg">
              <div className="flex items-center gap-2">
                <Image className="w-4 h-4 text-white/60" />
                <span className="text-white/80 text-sm">Image</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                  title="Zoom out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-white/60 text-sm min-w-[3rem] text-center">{zoom}%</span>
                <button
                  onClick={handleZoomIn}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                  title="Zoom in"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={handleRotate}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                  title="Rotate"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                {item.file_path && (
                  <a
                    href={item.file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Image Display */}
            {item.file_path ? (
              <div className="bg-white/[0.02] border border-white/5 rounded-lg overflow-hidden p-4">
                <div className="flex justify-center">
                  <img
                    src={item.file_path}
                    alt={item.title}
                    className="max-w-full h-auto rounded-lg shadow-lg"
                    style={{
                      transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                      transformOrigin: 'center',
                      transition: 'transform 0.3s ease'
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-8 text-center">
                <Image className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/40">Image file not available for preview</p>
              </div>
            )}
          </div>
        );

      case 'url':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-lg">
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-white/60" />
                <span className="text-white/80 text-sm">Web Page</span>
              </div>
              {item.source_url && (
                <a
                  href={item.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 bg-violet-600/20 hover:bg-violet-600/30 text-violet-400 rounded-lg text-sm transition-all"
                >
                  <ExternalLink className="w-3 h-3" />
                  Visit Page
                </a>
              )}
            </div>

            {/* URL Preview */}
            {item.source_url && (
              <div className="bg-white/[0.02] border border-white/5 rounded-lg overflow-hidden">
                <iframe
                  src={item.source_url}
                  className="w-full h-96 border-0"
                  title={item.title}
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            )}
          </div>
        );

      case 'github':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-lg">🐙</span>
                <span className="text-white/80 text-sm">GitHub Repository</span>
              </div>
              {item.source_url && (
                <a
                  href={item.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-lg text-sm transition-all"
                >
                  <ExternalLink className="w-3 h-3" />
                  View on GitHub
                </a>
              )}
            </div>

            {/* Repository Info */}
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
              <div className="space-y-3">
                <div>
                  <h4 className="text-white/80 text-sm font-medium mb-1">Repository</h4>
                  <p className="text-white/60 text-sm">{item.source_url?.replace('https://github.com/', '') || 'Unknown'}</p>
                </div>
                {item.summary && (
                  <div>
                    <h4 className="text-white/80 text-sm font-medium mb-1">Description</h4>
                    <p className="text-white/60 text-sm">{item.summary}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'note':
      default:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-white/[0.02] border border-white/5 rounded-lg">
              <FileText className="w-4 h-4 text-white/60" />
              <span className="text-white/80 text-sm">Text Note</span>
            </div>
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {renderContent()}
    </motion.div>
  );
}
