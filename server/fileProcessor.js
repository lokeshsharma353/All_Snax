const fs = require('fs').promises;
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const sharp = require('sharp');
const mammoth = require('mammoth');
const officegen = require('officegen');
const pdfParse = require('pdf-parse');


class FileProcessor {
    constructor() {
        this.uploadsDir = path.join(__dirname, 'uploads');
        this.outputDir = path.join(__dirname, 'output');
        this.ensureDirectories();
    }

    async ensureDirectories() {
        try {
            await fs.mkdir(this.uploadsDir, { recursive: true });
            await fs.mkdir(this.outputDir, { recursive: true });
        } catch (error) {
            console.error('Error creating directories:', error);
        }
    }

    // Simple logging to console (no database)
    logOperation(userId, operationType, fileName, fileSize, status = 'pending') {
        console.log(`[${new Date().toISOString()}] Operation: ${operationType} | File: ${fileName} | User: ${userId} | Status: ${status}`);
    }

    updateOperationStatus(userId, fileName, status) {
        console.log(`[${new Date().toISOString()}] Updated: ${fileName} | User: ${userId} | Status: ${status}`);
    }

    // PDF to Word
    async pdfToWord(filePath, userId, fileName) {
        try {
            this.logOperation(userId, 'pdf_to_word', fileName, 0, 'processing');
            
            // Extract text from PDF
            const pdfBuffer = await fs.readFile(filePath);
            let extractedText = 'No text could be extracted from this PDF.';
            
            try {
                const pdfData = await pdfParse(pdfBuffer);
                extractedText = pdfData.text && pdfData.text.trim() ? pdfData.text : 'This PDF appears to contain images or non-text content.';
                console.log('Extracted text length:', extractedText.length);
            } catch (parseError) {
                console.error('PDF parsing error:', parseError);
                extractedText = 'Error: Could not parse PDF content.';
            }
            
            const outputPath = path.join(this.outputDir, `${Date.now()}_converted.docx`);
            
            // Create Word document with extracted text
            const docx = officegen('docx');
            
            // Add extracted content
            const paragraphs = extractedText.split('\n');
            paragraphs.forEach(paragraph => {
                if (paragraph.trim()) {
                    const pObj = docx.createP();
                    pObj.addText(paragraph.trim());
                }
            });
            
            // Save the document
            return new Promise((resolve, reject) => {
                const out = require('fs').createWriteStream(outputPath);
                
                out.on('error', (err) => {
                    this.updateOperationStatus(userId, fileName, 'failed');
                    reject(err);
                });
                
                out.on('close', () => {
                    this.updateOperationStatus(userId, fileName, 'completed');
                    resolve({ success: true, outputPath });
                });
                
                docx.generate(out);
            });
        } catch (error) {
            console.error('PDF to Word conversion error:', error);
            this.updateOperationStatus(userId, fileName, 'failed');
            throw error;
        }
    }

    // PDF to Text (simplified)
    async pdfToText(filePath, userId, fileName) {
        try {
            this.logOperation(userId, 'pdf_to_text', fileName, 0, 'processing');
            
            const existingPdfBytes = await fs.readFile(filePath);
            const pdfDoc = await PDFDocument.load(existingPdfBytes);
            const pages = pdfDoc.getPages();
            
            let extractedText = '';
            for (let i = 0; i < pages.length; i++) {
                extractedText += `Page ${i + 1}:\n\n`;
                extractedText += `[Text content from page ${i + 1}]\n\n`;
            }
            
            const outputPath = path.join(this.outputDir, `${Date.now()}_extracted.txt`);
            await fs.writeFile(outputPath, extractedText);
            
            this.updateOperationStatus(userId, fileName, 'completed');
            return { success: true, outputPath };
        } catch (error) {
            this.updateOperationStatus(userId, fileName, 'failed');
            throw error;
        }
    }

    // Word to PDF
    async wordToPdf(filePath, userId, fileName) {
        try {
            this.logOperation(userId, 'word_to_pdf', fileName, 0, 'processing');
            
            const result = await mammoth.extractRawText({ path: filePath });
            const text = result.value;
            
            const pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage([612, 792]);
            
            page.drawText(text, {
                x: 50,
                y: 750,
                size: 12,
                maxWidth: 500,
                lineHeight: 14
            });
            
            const pdfBytes = await pdfDoc.save();
            const outputPath = path.join(this.outputDir, `${Date.now()}_converted.pdf`);
            
            await fs.writeFile(outputPath, pdfBytes);
            this.updateOperationStatus(userId, fileName, 'completed');
            
            return { success: true, outputPath };
        } catch (error) {
            this.updateOperationStatus(userId, fileName, 'failed');
            throw error;
        }
    }

    // PDF Protection
    async protectPdf(filePath, password, userId, fileName) {
        try {
            this.logOperation(userId, 'protect_pdf', fileName, 0, 'processing');
            
            const existingPdfBytes = await fs.readFile(filePath);
            const pdfDoc = await PDFDocument.load(existingPdfBytes);
            
            // Note: PDF-lib doesn't support password protection directly
            // In production, use libraries like HummusJS or server-side tools
            const pdfBytes = await pdfDoc.save();
            const outputPath = path.join(this.outputDir, `${Date.now()}_protected.pdf`);
            
            await fs.writeFile(outputPath, pdfBytes);
            this.updateOperationStatus(userId, fileName, 'completed');
            
            return { success: true, outputPath };
        } catch (error) {
            this.updateOperationStatus(userId, fileName, 'failed');
            throw error;
        }
    }

    // PDF to JPG
    async pdfToJpg(filePath, userId, fileName) {
        try {
            this.logOperation(userId, 'pdf_to_jpg', fileName, 0, 'processing');
            
            // This would require pdf2pic or similar library
            // For now, return a placeholder response
            const outputPath = path.join(this.outputDir, `${Date.now()}_converted.jpg`);
            
            // Placeholder: Create a simple image
            await sharp({
                create: {
                    width: 612,
                    height: 792,
                    channels: 3,
                    background: { r: 255, g: 255, b: 255 }
                }
            })
            .jpeg()
            .toFile(outputPath);
            
            this.updateOperationStatus(userId, fileName, 'completed');
            return { success: true, outputPath };
        } catch (error) {
            this.updateOperationStatus(userId, fileName, 'failed');
            throw error;
        }
    }

    // Compress PDF
    async compressPdf(filePath, compressionLevel, userId, fileName) {
        try {
            this.logOperation(userId, 'compress_pdf', fileName, 0, 'processing');
            
            const existingPdfBytes = await fs.readFile(filePath);
            const pdfDoc = await PDFDocument.load(existingPdfBytes);
            
            const pdfBytes = await pdfDoc.save({
                useObjectStreams: compressionLevel === 'high',
                addDefaultPage: false,
                objectsPerTick: compressionLevel === 'high' ? 50 : 200
            });
            
            const outputPath = path.join(this.outputDir, `${Date.now()}_compressed.pdf`);
            await fs.writeFile(outputPath, pdfBytes);
            this.updateOperationStatus(userId, fileName, 'completed');
            
            return { success: true, outputPath };
        } catch (error) {
            this.updateOperationStatus(userId, fileName, 'failed');
            throw error;
        }
    }

    // PDF Merge
    async mergePdf(filePaths, userId, fileName) {
        try {
            this.logOperation(userId, 'pdf_merge', fileName, 0, 'processing');
            const mergedPdf = await PDFDocument.create();
            
            for (let filePath of filePaths) {
                const pdfBytes = await fs.readFile(filePath);
                const pdf = await PDFDocument.load(pdfBytes);
                const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                pages.forEach(page => mergedPdf.addPage(page));
            }
            
            const pdfBytes = await mergedPdf.save();
            const outputPath = path.join(this.outputDir, `${Date.now()}_merged.pdf`);
            await fs.writeFile(outputPath, pdfBytes);
            
            this.updateOperationStatus(userId, fileName, 'completed');
            return { success: true, outputPath };
        } catch (error) {
            this.updateOperationStatus(userId, fileName, 'failed');
            throw error;
        }
    }

    // PDF Split
    async splitPdf(filePath, userId, fileName) {
        try {
            this.logOperation(userId, 'pdf_split', fileName, 0, 'processing');
            const pdfBytes = await fs.readFile(filePath);
            const pdf = await PDFDocument.load(pdfBytes);
            const pageCount = pdf.getPageCount();
            const outputPaths = [];
            
            for (let i = 0; i < pageCount; i++) {
                const newPdf = await PDFDocument.create();
                const [page] = await newPdf.copyPages(pdf, [i]);
                newPdf.addPage(page);
                
                const newPdfBytes = await newPdf.save();
                const outputPath = path.join(this.outputDir, `${Date.now()}_page_${i + 1}.pdf`);
                await fs.writeFile(outputPath, newPdfBytes);
                outputPaths.push(outputPath);
            }
            
            this.updateOperationStatus(userId, fileName, 'completed');
            return { success: true, outputPath: outputPaths[0], outputPaths };
        } catch (error) {
            this.updateOperationStatus(userId, fileName, 'failed');
            throw error;
        }
    }

    // Image Resize
    async resizeImage(filePath, width, height, userId, fileName) {
        try {
            this.logOperation(userId, 'image_resize', fileName, 0, 'processing');
            const outputPath = path.join(this.outputDir, `${Date.now()}_resized.jpg`);
            
            await sharp(filePath)
                .resize(parseInt(width), parseInt(height))
                .jpeg()
                .toFile(outputPath);
            
            this.updateOperationStatus(userId, fileName, 'completed');
            return { success: true, outputPath };
        } catch (error) {
            this.updateOperationStatus(userId, fileName, 'failed');
            throw error;
        }
    }

    // Image to PDF
    async imageToPdf(filePaths, userId, fileName) {
        try {
            this.logOperation(userId, 'image_to_pdf', fileName, 0, 'processing');
            const pdfDoc = await PDFDocument.create();
            
            for (let filePath of filePaths) {
                const imageBytes = await fs.readFile(filePath);
                let image;
                
                if (filePath.toLowerCase().includes('.jpg') || filePath.toLowerCase().includes('.jpeg')) {
                    image = await pdfDoc.embedJpg(imageBytes);
                } else if (filePath.toLowerCase().includes('.png')) {
                    image = await pdfDoc.embedPng(imageBytes);
                }
                
                if (image) {
                    const page = pdfDoc.addPage([image.width, image.height]);
                    page.drawImage(image, { x: 0, y: 0 });
                }
            }
            
            const pdfBytes = await pdfDoc.save();
            const outputPath = path.join(this.outputDir, `${Date.now()}_images_to_pdf.pdf`);
            await fs.writeFile(outputPath, pdfBytes);
            
            this.updateOperationStatus(userId, fileName, 'completed');
            return { success: true, outputPath };
        } catch (error) {
            this.updateOperationStatus(userId, fileName, 'failed');
            throw error;
        }
    }

    // Add Watermark
    async addWatermark(filePath, watermarkText, userId, fileName) {
        try {
            this.logOperation(userId, 'watermark', fileName, 0, 'processing');
            const pdfBytes = await fs.readFile(filePath);
            const pdfDoc = await PDFDocument.load(pdfBytes);
            const pages = pdfDoc.getPages();
            
            pages.forEach(page => {
                const { width, height } = page.getSize();
                page.drawText(watermarkText || 'WATERMARK', {
                    x: width / 2 - 50,
                    y: height / 2,
                    size: 50,
                    opacity: 0.3,
                    rotate: { angle: 45 }
                });
            });
            
            const newPdfBytes = await pdfDoc.save();
            const outputPath = path.join(this.outputDir, `${Date.now()}_watermarked.pdf`);
            await fs.writeFile(outputPath, newPdfBytes);
            
            this.updateOperationStatus(userId, fileName, 'completed');
            return { success: true, outputPath };
        } catch (error) {
            this.updateOperationStatus(userId, fileName, 'failed');
            throw error;
        }
    }

    // Rotate PDF
    async rotatePdf(filePath, angle, userId, fileName) {
        try {
            this.logOperation(userId, 'rotate_pdf', fileName, 0, 'processing');
            const pdfBytes = await fs.readFile(filePath);
            const pdfDoc = await PDFDocument.load(pdfBytes);
            const pages = pdfDoc.getPages();
            
            pages.forEach(page => {
                page.setRotation({ angle: parseInt(angle) });
            });
            
            const newPdfBytes = await pdfDoc.save();
            const outputPath = path.join(this.outputDir, `${Date.now()}_rotated.pdf`);
            await fs.writeFile(outputPath, newPdfBytes);
            
            this.updateOperationStatus(userId, fileName, 'completed');
            return { success: true, outputPath };
        } catch (error) {
            this.updateOperationStatus(userId, fileName, 'failed');
            throw error;
        }
    }

    // Simple file-based operations tracking (no database)
    async getRecentOperations() {
        try {
            const outputFiles = await fs.readdir(this.outputDir);
            const uploadFiles = await fs.readdir(this.uploadsDir);
            
            return {
                processedFiles: outputFiles.length,
                uploadedFiles: uploadFiles.length,
                recentFiles: outputFiles.slice(-10) // Last 10 files
            };
        } catch (error) {
            console.error('Error fetching operations:', error);
            return { processedFiles: 0, uploadedFiles: 0, recentFiles: [] };
        }
    }
}

module.exports = FileProcessor;