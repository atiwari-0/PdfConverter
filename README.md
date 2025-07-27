# 🧾 PdfConverter

**Convert multiple images (.jpg/.jpeg/.png) and text files (.txt) into a single PDF — right from your browser.**

Built with **Next.js + NestJS**, this is a fun little full-stack utility for combining files into a PDF. Supports drag-and-drop, multi-upload, live progress, and instant download.



### 🚀 Features
- 🗂 Upload multiple `.jpg`, `.jpeg`, `.png`, or `.txt` files
- 🧠 Converts & merges them into a single paginated PDF
- 🖼 Drag and drop UI with live progress bar
- ⚡ Instant download after conversion
- 📦 NestJS backend using `pdfkit`, `multer`, and `uuid`


### 🛠 Stack
- **Frontend:** Next.js (App Router), React, TailwindCSS, react-dropzone
- **Backend:** NestJS, Multer, PDFKit, UUID
- **Other:** Express static file serving, CORS, Disk storage


### 🧪 Try it Locally

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
npm install
npm run start
```

✨ Why I built this
Just a spontaneous weekend tool to mess around with file uploads, PDF generation, and end-to-end delivery. Also a good excuse to play with pdfkit and multi-part file handling with NestJS.

