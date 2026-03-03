/**
 * PdfViewer — Renders uploaded PDF/DOCX using react-pdf.
 * Multi-page navigation, zoom, smooth page transitions.
 */
import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PdfViewer({ fileUrl, singlePageNavigation = false }) {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [loadError, setLoadError] = useState(null);
    const [containerWidth, setContainerWidth] = useState(null);
    const containerRef = React.useRef(null);

    React.useEffect(() => {
        const observer = new ResizeObserver((entries) => {
            if (entries[0]) {
                // Subtract some padding to ensure it fits comfortably
                setContainerWidth(entries[0].contentRect.width - 32);
            }
        });
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }
        return () => observer.disconnect();
    }, []);

    const onDocumentLoadSuccess = ({ numPages: total }) => {
        setNumPages(total);
        setPageNumber((current) => Math.min(Math.max(current, 1), total || 1));
        setLoadError(null);
    };

    const onDocumentLoadError = (error) => {
        setLoadError('Failed to load PDF. Please try re-uploading.');
        console.error('PDF load error:', error);
    };

    const [fileSrc, setFileSrc] = React.useState(null);

    React.useEffect(() => {
        if (!fileUrl) {
            setFileSrc(null);
            return;
        }
        if (typeof fileUrl === 'string') {
            setFileSrc(fileUrl);
            setPageNumber(1);
            return;
        }
        // File object — create a fresh object URL on every mount
        const url = URL.createObjectURL(fileUrl);
        setFileSrc(url);
        setPageNumber(1);
        return () => URL.revokeObjectURL(url);
    }, [fileUrl]);

    if (!fileUrl) {
        return (
            <div className="pdf-empty">
                <span className="material-icons-round" style={{ fontSize: '3rem', color: 'var(--text-muted)' }}>picture_as_pdf</span>
                <p>Upload a resume to preview it here</p>
            </div>
        );
    }

    return (
        <div className="pdf-viewer">
            {/* Controls Bar */}
            <div className="pdf-controls">
                <div className="pdf-nav">
                    {singlePageNavigation ? (
                        <>
                            <button
                                className="pdf-nav-btn"
                                onClick={() => setPageNumber((p) => Math.max(p - 1, 1))}
                                disabled={!numPages || pageNumber <= 1}
                                title="Previous page"
                            >
                                &lt;
                            </button>
                            <span className="pdf-page-info">
                                {numPages ? `${pageNumber}/${numPages}` : 'Loading...'}
                            </span>
                            <button
                                className="pdf-nav-btn"
                                onClick={() => setPageNumber((p) => Math.min(p + 1, numPages || 1))}
                                disabled={!numPages || pageNumber >= (numPages || 1)}
                                title="Next page"
                            >
                                &gt;
                            </button>
                        </>
                    ) : (
                        <span className="pdf-page-info">
                            {numPages ? `${numPages} Pages` : 'Loading...'}
                        </span>
                    )}
                </div>
                <div className="pdf-zoom">
                    <button
                        className="pdf-nav-btn"
                        onClick={() => setScale((s) => Math.max(s - 0.1, 0.5))}
                        title="Zoom out"
                    >
                        <span className="material-icons-round">remove</span>
                    </button>
                    <span className="pdf-zoom-level">{Math.round(scale * 100)}%</span>
                    <button
                        className="pdf-nav-btn"
                        onClick={() => setScale((s) => Math.min(s + 0.1, 2.5))}
                        title="Zoom in"
                    >
                        <span className="material-icons-round">add</span>
                    </button>
                </div>
            </div>

            {/* PDF Content */}
            <div className="pdf-document-container" ref={containerRef}>
                {loadError ? (
                    <div className="pdf-error">
                        <span className="material-icons-round" style={{ fontSize: '2rem' }}>error_outline</span>
                        <p>{loadError}</p>
                    </div>
                ) : (
                    <Document
                        file={fileSrc}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={onDocumentLoadError}
                        loading={
                            <div className="pdf-loading">
                                <div className="spinner" />
                                <p>Loading document...</p>
                            </div>
                        }
                    >
                        {singlePageNavigation ? (
                            <div className="pdf-pages-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <Page
                                    key={`page_${pageNumber}`}
                                    pageNumber={pageNumber}
                                    scale={scale}
                                    width={containerWidth || undefined}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                    className="pdf-page"
                                />
                            </div>
                        ) : (
                            <div className="pdf-pages-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {Array.from({ length: numPages || 0 }, (_, index) => (
                                    <Page
                                        key={`page_${index + 1}`}
                                        pageNumber={index + 1}
                                        scale={scale}
                                        width={containerWidth || undefined}
                                        renderTextLayer={false}
                                        renderAnnotationLayer={false}
                                        className="pdf-page"
                                    />
                                ))}
                            </div>
                        )}
                    </Document>
                )}
            </div>
        </div>
    );
}
