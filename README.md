# Tiptap Document Editor with Pagination

A WYSIWYG legal document editor built with Next.js and Tiptap, featuring real-time pagination for US Letter-sized documents.

## 🚀 Live Demo
[Add your deployed link here - Vercel/Netlify]

## ✨ Features Implemented
- Real-time pagination with visual page breaks
- US Letter size (8.5" × 11") with 1" margins
- WYSIWYG split view (Editor + Preview)
- Rich text formatting (Bold, Italic, Headings, Lists)
- Image support (paste & drag-drop with base64 encoding)
- Live word count and page count
- Three view modes: Edit, Split, Preview
- Copy to clipboard functionality

## 🛠️ Technology Stack
- **Frontend**: Next.js 14 + React
- **Editor**: Tiptap (ProseMirror-based)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## 📦 Installation

\`\`\`bash
# Clone the repository
git clone [your-repo-url]

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
\`\`\`

## 🎯 Approach to Pagination

### Challenge
The main challenge was calculating when content should break across pages while maintaining WYSIWYG accuracy between the editor and print output.

### Solution
1. **Measurement System**: Created a hidden DOM element that replicates page dimensions (816px × 1056px at 96 DPI)
2. **Content Analysis**: Parse editor HTML and measure each block element's actual rendered height
3. **Page Distribution**: Distribute content across pages based on available height (864px after 1" margins)
4. **Real-time Updates**: Recalculate on every editor change using Tiptap's `update` event

### Key Implementation Details
- Used `getBoundingClientRect()` for accurate element height measurement
- Applied identical CSS styles to both editor and preview for consistency
- Handled images, headings, paragraphs, and lists with different line heights
- Times New Roman 12pt font with proper legal document spacing

## ⚖️ Trade-offs & Limitations

### Current Limitations
1. **No paragraph splitting**: Long paragraphs that exceed page height move entirely to the next page rather than splitting mid-paragraph
2. **Performance**: Pagination recalculates on every keystroke (acceptable for documents <50 pages)
3. **Table support**: Not implemented yet
4. **Print function**: Removed due to complexity with CSS print media queries

### Trade-offs Made
- **Simplicity over perfection**: Chose block-level pagination over complex text reflow for reliability
- **Client-side only**: No backend required, easier deployment and maintenance
- **Base64 images**: Embedded images instead of file uploads for simplicity

## 🔮 Future Improvements

Given more time, I would add:
1. **Smart paragraph splitting**: Break long paragraphs across pages at sentence boundaries
2. **Performance optimization**: Debounce pagination calculations
3. **Table support**: Proper page break handling for tables
4. **PDF export**: Server-side rendering for accurate PDF generation
5. **Headers/Footers**: Document-wide headers and page numbers
6. **Undo/Redo**: Enhanced history management
7. **Document templates**: Pre-built legal document formats


## 👤 Author
Adithya