import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { PdfNodeView } from '../components/PdfNodeView';

export const PdfExtension = Node.create({
  name: 'pdfBlock',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      url: { default: null },
      filename: { default: null },
      size: { default: null },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="pdf-block"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    // Standard HTML fallback so it renders correctly outside the React editor
    return [
      'div', 
      mergeAttributes(HTMLAttributes, { 'data-type': 'pdf-block', 'class': 'pdf-attachment' }), 
      ['a', { href: HTMLAttributes.url, download: HTMLAttributes.filename, target: '_blank', rel: 'noopener noreferrer' }, `Download PDF: ${HTMLAttributes.filename}`]
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(PdfNodeView);
  },
});
