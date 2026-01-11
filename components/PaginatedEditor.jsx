'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';

import { 
  Bold, Italic, List, Heading1, Heading2, Type, 
  Split, Copy, Eye, Edit3
} from 'lucide-react';

// Page dimensions in pixels (at 96 DPI)
const PAGE_WIDTH_INCHES = 8.5;
const PAGE_HEIGHT_INCHES = 11;
const MARGIN_INCHES = 1;
const DPI = 96;

const PAGE_WIDTH_PX = PAGE_WIDTH_INCHES * DPI;
const PAGE_HEIGHT_PX = PAGE_HEIGHT_INCHES * DPI;
const MARGIN_PX = MARGIN_INCHES * DPI;
const CONTENT_HEIGHT_PX = PAGE_HEIGHT_PX - (MARGIN_PX * 2);

const PaginatedEditor = () => {
  const [pages, setPages] = useState([]);
  const [activePane, setActivePane] = useState('both');
  const [wordCount, setWordCount] = useState(0);
  const editorRef = useRef(null);
  const previewContainerRef = useRef(null);

  // Define consistent legal document styles
  const legalStyles = {
    fontFamily: "'Times New Roman', Times, serif",
    fontSize: '12pt',
    lineHeight: '1.5',
    color: '#000000',
    h1: {
      fontSize: '18pt',
      fontWeight: 'bold',
      marginTop: '24pt',
      marginBottom: '16pt',
      lineHeight: '1.3',
      textAlign: 'center'
    },
    h2: {
      fontSize: '14pt',
      fontWeight: 'bold',
      marginTop: '20pt',
      marginBottom: '12pt',
      lineHeight: '1.3'
    },
    p: {
      marginTop: '0',
      marginBottom: '12pt',
      lineHeight: '2',
      textAlign: 'justify'
    },
    ul: {
      marginTop: '12pt',
      marginBottom: '12pt',
      paddingLeft: '36pt'
    },
    ol: {
      marginTop: '12pt',
      marginBottom: '12pt',
      paddingLeft: '36pt'
    },
    li: {
      marginTop: '6pt',
      marginBottom: '6pt',
      lineHeight: '2'
    },
    strong: {
      fontWeight: 'bold'
    }
  };

  // Function to strip inline styles from content
  const stripInlineStyles = (html) => {
    return html
      .replace(/ style="[^"]*"/g, '')
      .replace(/ style=""/g, '')
      .replace(/<br>/g, '<br/>')
      .replace(/ class="[^"]*"/g, '')
      .trim();
  };

  // Tiptap Editor Configuration with consistent styling
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
    ],

    editorProps: {
      attributes: {
        class: 'legal-editor-content',
      },

      handlePaste(view, event) {
        const items = event.clipboardData?.items;
        if (!items) return false;

        for (const item of items) {
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file && file.type.startsWith('image/')) {
              const reader = new FileReader();
              reader.onload = () => {
                view.dispatch(
                  view.state.tr.replaceSelectionWith(
                    view.state.schema.nodes.image.create({ src: reader.result })
                  )
                );
              };
              reader.readAsDataURL(file);
              return true;
            }
          }
        }

        return false;
      },

      handleDrop(view, event) {
        const files = event.dataTransfer?.files;
        if (!files || files.length === 0) return false;

        for (const file of files) {
          if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => {
              const { schema } = view.state;
              const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
              
              if (coordinates) {
                const node = schema.nodes.image.create({ src: reader.result });
                const transaction = view.state.tr.insert(coordinates.pos, node);
                view.dispatch(transaction);
              }
            };
            reader.readAsDataURL(file);
            return true;
          }
        }

        return false;
      },
    },

    content: `
      <h1>Legal Document Cover Letter</h1>
      <p>Paste or drag an image anywhere in this document.</p>
    `,
  });

  const calculatePagination = useCallback(() => {
    if (!editor || !previewContainerRef.current) return;

    const editorHTML = editor.getHTML();
    const cleanHTML = stripInlineStyles(editorHTML);

    const tempDiv = document.createElement('div');
    tempDiv.className = 'measurement-div';
    tempDiv.style.cssText = `
      position: absolute;
      left: -9999px;
      top: -9999px;
      width: ${PAGE_WIDTH_PX - (MARGIN_PX * 2)}px;
      padding: ${MARGIN_PX}px;
      font-family: ${legalStyles.fontFamily};
      font-size: ${legalStyles.fontSize};
      line-height: ${legalStyles.lineHeight};
      visibility: hidden;
      box-sizing: border-box;
    `;
    
    tempDiv.innerHTML = cleanHTML;
    
    const applyLegalStyles = (element) => {
      if (!element.style) return;
      
      const tag = element.tagName.toLowerCase();
      
      switch(tag) {
        case 'h1':
          element.style.cssText = `
            font-size: ${legalStyles.h1.fontSize};
            font-weight: ${legalStyles.h1.fontWeight};
            margin: ${legalStyles.h1.marginTop} 0 ${legalStyles.h1.marginBottom} 0;
            line-height: ${legalStyles.h1.lineHeight};
            text-align: ${legalStyles.h1.textAlign};
          `;
          break;
        case 'h2':
          element.style.cssText = `
            font-size: ${legalStyles.h2.fontSize};
            font-weight: ${legalStyles.h2.fontWeight};
            margin: ${legalStyles.h2.marginTop} 0 ${legalStyles.h2.marginBottom} 0;
            line-height: ${legalStyles.h2.lineHeight};
          `;
          break;
        case 'p':
          const text = element.textContent || '';
          const isEmpty = text.trim().length === 0;
          element.style.cssText = `
            margin: 0 0 ${isEmpty ? '0' : legalStyles.p.marginBottom} 0;
            line-height: ${legalStyles.p.lineHeight};
            text-align: ${legalStyles.p.textAlign};
          `;
          break;
        case 'ul':
          element.style.cssText = `
            margin: ${legalStyles.ul.marginTop} 0 ${legalStyles.ul.marginBottom} 0;
            padding-left: ${legalStyles.ul.paddingLeft};
          `;
          break;
        case 'ol':
          element.style.cssText = `
            margin: ${legalStyles.ol.marginTop} 0 ${legalStyles.ol.marginBottom} 0;
            padding-left: ${legalStyles.ol.paddingLeft};
          `;
          break;
        case 'li':
          element.style.cssText = `
            margin: ${legalStyles.li.marginTop} 0 ${legalStyles.li.marginBottom} 0;
            line-height: ${legalStyles.li.lineHeight};
          `;
          break;
        case 'strong':
        case 'b':
          element.style.cssText = `
            font-weight: ${legalStyles.strong.fontWeight};
          `;
          break;
        case 'img':
          element.style.cssText = `
            max-width: 100%;
            height: auto;
            display: block;
            margin: 12pt 0;
          `;
          break;
      }
      
      Array.from(element.children).forEach(child => applyLegalStyles(child));
    };
    
    Array.from(tempDiv.children).forEach(child => applyLegalStyles(child));
    
    document.body.appendChild(tempDiv);
    
    const blockElements = Array.from(tempDiv.children).filter(element => {
      if (element.tagName.toLowerCase() === 'img') return true;
      if (element.textContent && element.textContent.trim().length > 0) return true;
      
      if (element.children.length > 0) {
        const hasContent = Array.from(element.children).some(child => 
          child.tagName.toLowerCase() === 'img' || 
          (child.textContent && child.textContent.trim().length > 0)
        );
        return hasContent;
      }
      
      return false;
    });
    
    const newPages = [];
    let currentPage = [];
    let currentHeight = 0;
    
    const getElementHeight = (element) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      
      const height = rect.height;
      const marginTop = parseFloat(style.marginTop) || 0;
      const marginBottom = parseFloat(style.marginBottom) || 0;
      
      return height + marginTop + marginBottom;
    };
    
    for (let i = 0; i < blockElements.length; i++) {
      const element = blockElements[i];
      const elementHeight = getElementHeight(element);
      
      if (currentHeight + elementHeight > CONTENT_HEIGHT_PX && currentPage.length > 0) {
        const pageContainer = document.createElement('div');
        pageContainer.className = 'page-content';
        pageContainer.style.cssText = `
          font-family: ${legalStyles.fontFamily};
          font-size: ${legalStyles.fontSize};
          line-height: ${legalStyles.lineHeight};
          color: ${legalStyles.color};
        `;
        currentPage.forEach(el => pageContainer.appendChild(el.cloneNode(true)));
        newPages.push(pageContainer.innerHTML);
        
        currentPage = [element.cloneNode(true)];
        currentHeight = elementHeight;
      } else {
        currentPage.push(element.cloneNode(true));
        currentHeight += elementHeight;
      }
    }
    
    if (currentPage.length > 0) {
      const pageContainer = document.createElement('div');
      pageContainer.className = 'page-content';
      pageContainer.style.cssText = `
        font-family: ${legalStyles.fontFamily};
        font-size: ${legalStyles.fontSize};
        line-height: ${legalStyles.lineHeight};
        color: ${legalStyles.color};
      `;
      currentPage.forEach(el => pageContainer.appendChild(el.cloneNode(true)));
      newPages.push(pageContainer.innerHTML);
    }
    
    document.body.removeChild(tempDiv);
    
    if (newPages.length === 0) {
      newPages.push('<p>Start typing your document...</p>');
    }
    
    setPages(newPages);
  }, [editor]);

  // Update on editor changes
  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      // Update word count
      const text = editor.getText();
      const words = text.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
      
      // Update pagination
      calculatePagination();
    };

    // Initial calculation
    handleUpdate();

    // Listen for updates
    editor.on('update', handleUpdate);

    return () => {
      editor.off('update', handleUpdate);
    };
  }, [editor, calculatePagination]);

  const handleCopyContent = () => {
    if (editor) {
      navigator.clipboard.writeText(editor.getText());
      alert('Document content copied to clipboard!');
    }
  };

  const handleViewToggle = (view) => {
    setActivePane(view);
  };

  const applyFormatting = (command, style = {}) => {
    if (!editor) return;
    
    const { from, to } = editor.state.selection;
    command();
    
    setTimeout(() => {
      if (style.type === 'heading') {
        editor.commands.updateAttributes('heading', {
          level: style.level
        });
      }
    }, 10);
  };

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600 mb-2">Loading editor...</div>
          <div className="text-sm text-gray-400">Initializing Tiptap with pagination engine</div>
        </div>
      </div>
    );
  }

  const totalPages = pages.length;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={() => applyFormatting(() => editor.chain().focus().toggleBold().run())}
              className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                editor.isActive('bold') ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
              }`}
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-5 h-5" />
            </button>
            <button
              onClick={() => applyFormatting(() => editor.chain().focus().toggleItalic().run())}
              className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                editor.isActive('italic') ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
              }`}
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-5 h-5" />
            </button>
            <div className="w-px bg-gray-300 h-6 mx-2" />
            <button
              onClick={() => applyFormatting(() => editor.chain().focus().setParagraph().run())}
              className={`px-3 py-1.5 text-sm rounded-lg hover:bg-gray-100 transition-colors ${
                editor.isActive('paragraph') ? 'bg-gray-200 font-medium' : ''
              }`}
            >
              <Type className="w-4 h-4 inline mr-1" />
              Normal
            </button>
            <button
              onClick={() => applyFormatting(
                () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
                { type: 'heading', level: 1 }
              )}
              className={`px-3 py-1.5 text-sm rounded-lg hover:bg-gray-100 transition-colors ${
                editor.isActive('heading', { level: 1 }) ? 'bg-gray-200 font-medium' : ''
              }`}
            >
              <Heading1 className="w-4 h-4 inline mr-1" />
              Heading 1
            </button>
            <button
              onClick={() => applyFormatting(
                () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
                { type: 'heading', level: 2 }
              )}
              className={`px-3 py-1.5 text-sm rounded-lg hover:bg-gray-100 transition-colors ${
                editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 font-medium' : ''
              }`}
            >
              <Heading2 className="w-4 h-4 inline mr-1" />
              Heading 2
            </button>
            <div className="w-px bg-gray-300 h-6 mx-2" />
            <button
              onClick={() => applyFormatting(() => editor.chain().focus().toggleBulletList().run())}
              className={`px-3 py-1.5 text-sm rounded-lg hover:bg-gray-100 transition-colors ${
                editor.isActive('bulletList') ? 'bg-gray-200 font-medium' : ''
              }`}
            >
              <List className="w-4 h-4 inline mr-1" />
              List
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Edit3 className="w-4 h-4" />
                {wordCount} words
              </span>
              <span className="flex items-center gap-1">
                <Copy className="w-4 h-4" />
                {totalPages} {totalPages === 1 ? 'page' : 'pages'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleViewToggle('editor')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  activePane === 'editor' 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Edit3 className="w-4 h-4 inline mr-1" />
                Edit
              </button>
              <button
                onClick={() => handleViewToggle('both')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  activePane === 'both' 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Split className="w-4 h-4 inline mr-1" />
                Split
              </button>
              <button
                onClick={() => handleViewToggle('preview')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  activePane === 'preview' 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Eye className="w-4 h-4 inline mr-1" />
                Preview
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyContent}
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg hover:bg-gray-100 transition-colors text-gray-700 border border-gray-300"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Split Screen Container */}
      <div className="flex flex-1 overflow-hidden bg-gray-50">
        {/* Editor Pane (Left) */}
        {(activePane === 'editor' || activePane === 'both') && (
          <div 
            className={`editor-pane h-full overflow-auto bg-white border-r border-gray-200 ${
              activePane === 'both' ? 'w-1/2' : 'w-full'
            }`}
          >
            <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200 px-6 py-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Edit3 className="w-4 h-4" />
                  Editor (Matches Print Preview)
                </h2>
                <span className="text-xs text-gray-500">Live editing • US Letter formatting</span>
              </div>
            </div>
            <div className="p-8 flex justify-center">
              <div 
                ref={editorRef}
                className="bg-white shadow-sm border border-gray-200"
                style={{ 
                  width: `${PAGE_WIDTH_PX}px`,
                  minHeight: `${PAGE_HEIGHT_PX}px`,
                  boxSizing: 'border-box'
                }}
              >
                <div style={{ padding: `${MARGIN_PX}px` }}>
                  <EditorContent 
                    editor={editor} 
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview Pane (Right) */}
        {(activePane === 'preview' || activePane === 'both') && (
          <div 
            className={`preview-pane h-full overflow-auto bg-gray-100 ${
              activePane === 'both' ? 'w-1/2' : 'w-full'
            }`}
            ref={previewContainerRef}
          >
            <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200 px-6 py-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Print Preview (WYSIWYG)
                </h2>
                <span className="text-xs text-gray-500">{totalPages} {totalPages === 1 ? 'page' : 'pages'} • US Letter size</span>
              </div>
            </div>
            
            <div className="p-8 flex flex-col items-center">
              {pages.map((pageContent, pageIndex) => (
                <div
                  key={pageIndex}
                  className="bg-white shadow-lg mb-8 relative border border-gray-300"
                  style={{ 
                    width: `${PAGE_WIDTH_PX}px`,
                    height: `${PAGE_HEIGHT_PX}px`,
                    pageBreakAfter: 'always',
                    boxSizing: 'border-box'
                  }}
                >
                  <div className="absolute bottom-4 right-6 text-xs text-gray-400 font-mono pointer-events-none">
                    Page {pageIndex + 1}
                  </div>
                  
                  <div
                    className="page-content"
                    style={{
                      padding: `${MARGIN_PX}px`,
                      height: '100%',
                      fontFamily: legalStyles.fontFamily,
                      fontSize: legalStyles.fontSize,
                      lineHeight: legalStyles.lineHeight,
                      color: legalStyles.color,
                      overflow: 'hidden',
                      boxSizing: 'border-box'
                    }}
                    dangerouslySetInnerHTML={{ __html: pageContent }}
                  />
                  
                  {pageIndex < totalPages - 1 && (
                    <div className="absolute -bottom-4 left-0 right-0 text-center pointer-events-none">
                      <div className="inline-flex items-center gap-2 px-4 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        Page Break
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {pages.length === 0 && (
                <div className="text-center py-12">
                  <Eye className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Start typing in the editor to see the preview</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-gray-500 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <span>Document: Legal Cover Letter</span>
            <span>•</span>
            <span>Font: Times New Roman 12pt</span>
            <span>•</span>
            <span>Format: US Letter (8.5" × 11") • 1" Margins</span>
          </div>
          <div>
            <span>OpenSphere • WYSIWYG Legal Editor</span>
          </div>
        </div>
      </div>

      {/* Global Styles */}
      <style jsx global>{`
        @media print {
          /* Hide everything first */
          body * {
            visibility: hidden;
          }
          
          /* Show only the preview pane */
          .preview-pane,
          .preview-pane * {
            visibility: visible;
          }
          
          /* Position preview pane for printing */
          .preview-pane {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: visible;
            background: white;
          }
          
          /* Hide page numbers and page break indicators */
          .preview-pane .absolute {
            display: none !important;
          }
          
          /* Remove shadows and borders for cleaner print */
          .preview-pane > div > div {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            page-break-after: always;
          }
          
          /* Ensure pages print at correct size */
          @page {
            size: letter;
            margin: 0;
          }
        }
        
        .legal-editor-content,
        .page-content {
          font-family: ${legalStyles.fontFamily} !important;
          font-size: ${legalStyles.fontSize} !important;
          line-height: ${legalStyles.lineHeight} !important;
          color: ${legalStyles.color} !important;
        }
        
        .legal-editor-content h1,
        .page-content h1 {
          font-size: ${legalStyles.h1.fontSize} !important;
          font-weight: ${legalStyles.h1.fontWeight} !important;
          margin-top: ${legalStyles.h1.marginTop} !important;
          margin-bottom: ${legalStyles.h1.marginBottom} !important;
          line-height: ${legalStyles.h1.lineHeight} !important;
          text-align: ${legalStyles.h1.textAlign} !important;
        }
        
        .legal-editor-content h2,
        .page-content h2 {
          font-size: ${legalStyles.h2.fontSize} !important;
          font-weight: ${legalStyles.h2.fontWeight} !important;
          margin-top: ${legalStyles.h2.marginTop} !important;
          margin-bottom: ${legalStyles.h2.marginBottom} !important;
          line-height: ${legalStyles.h2.lineHeight} !important;
        }
        
        .legal-editor-content p,
        .page-content p {
          margin-top: ${legalStyles.p.marginTop} !important;
          margin-bottom: ${legalStyles.p.marginBottom} !important;
          line-height: ${legalStyles.p.lineHeight} !important;
          text-align: ${legalStyles.p.textAlign} !important;
        }
        
        .legal-editor-content p:last-child,
        .page-content p:last-child {
          margin-bottom: 0 !important;
        }
        
        .legal-editor-content ul,
        .page-content ul {
          margin-top: ${legalStyles.ul.marginTop} !important;
          margin-bottom: ${legalStyles.ul.marginBottom} !important;
          padding-left: ${legalStyles.ul.paddingLeft} !important;
        }
        
        .legal-editor-content ol,
        .page-content ol {
          margin-top: ${legalStyles.ol.marginTop} !important;
          margin-bottom: ${legalStyles.ol.marginBottom} !important;
          padding-left: ${legalStyles.ol.paddingLeft} !important;
        }
        
        .legal-editor-content li,
        .page-content li {
          margin-top: ${legalStyles.li.marginTop} !important;
          margin-bottom: ${legalStyles.li.marginBottom} !important;
          line-height: ${legalStyles.li.lineHeight} !important;
        }
        
        .legal-editor-content strong,
        .legal-editor-content b,
        .page-content strong,
        .page-content b {
          font-weight: ${legalStyles.strong.fontWeight} !important;
        }

        .legal-editor-content img,
        .page-content img {
          max-width: 100% !important;
          height: auto !important;
          display: block !important;
          margin: 12pt 0 !important;
        }
        
        .ProseMirror {
          outline: none !important;
          cursor: text;
          min-height: 400px;
        }
        
        .ProseMirror:focus {
          outline: none;
        }
        
        .ProseMirror[contenteditable="true"] {
          cursor: text;
        }
        
        .ProseMirror p.is-editor-empty:first-child::before {
          color: #9ca3af;
          content: 'Start typing your legal document here...';
          float: left;
          height: 0;
          pointer-events: none;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default PaginatedEditor;