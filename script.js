class AllSnax {
    constructor() {
        this.currentTool = null;
        this.files = [];
        this.processedFiles = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupNavbar();
        this.setupSidebar();
        this.showWelcomeMessage();
        this.setupAnimations();
        this.loadExistingReviews();
    }

    showWelcomeMessage() {
        // Welcome message is now handled in the navbar status
        console.log('All Snax initialized - No login required!');
    }

    setupSidebar() {
        // Sidebar functionality removed - using mobile menu instead
        this.updateFilesProcessedCounter();
    }
    
    updateFilesProcessedCounter() {
        const counter = document.getElementById('filesProcessed');
        if (counter) {
            const currentCount = parseInt(localStorage.getItem('filesProcessed') || '0');
            counter.textContent = currentCount;
        }
    }
    
    incrementFilesProcessed() {
        const currentCount = parseInt(localStorage.getItem('filesProcessed') || '0');
        const newCount = currentCount + 1;
        localStorage.setItem('filesProcessed', newCount.toString());
        this.updateFilesProcessedCounter();
        this.addRecentActivity();
    }
    
    addRecentActivity() {
        const activityList = document.getElementById('recentActivity');
        if (activityList && this.currentTool) {
            const toolIcons = {
                'pdf-to-word': '📄',
                'pdf-merge': '🔗',
                'pdf-compress': '🗜️',
                'image-resize': '🖼️',
                'watermark': '💧',
                'rotate': '🔄'
            };
            
            const icon = toolIcons[this.currentTool] || '📁';
            const toolName = this.getToolTitle(this.currentTool);
            
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.innerHTML = `
                <span class="activity-icon">${icon}</span>
                <span class="activity-text">${toolName}</span>
                <span class="activity-time">now</span>
            `;
            
            activityList.insertBefore(activityItem, activityList.firstChild);
            
            // Keep only last 3 activities
            while (activityList.children.length > 3) {
                activityList.removeChild(activityList.lastChild);
            }
        }
    }

    setupNavbar() {
        // Mobile menu toggle
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const mobileMenu = document.getElementById('mobileMenu');
        
        if (mobileMenuToggle && mobileMenu) {
            mobileMenuToggle.addEventListener('click', () => {
                mobileMenuToggle.classList.toggle('active');
                mobileMenu.classList.toggle('active');
                document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
            });
        }
        
        // Desktop tools dropdown
        const toolsDropdownBtn = document.querySelector('.tools-dropdown-btn');
        const toolsDropdownMenu = document.querySelector('.tools-dropdown-menu');
        
        if (toolsDropdownBtn && toolsDropdownMenu) {
            toolsDropdownBtn.addEventListener('click', (e) => {
                e.preventDefault();
                toolsDropdownMenu.classList.toggle('active');
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!toolsDropdownBtn.contains(e.target) && !toolsDropdownMenu.contains(e.target)) {
                    toolsDropdownMenu.classList.remove('active');
                }
            });
        }
        
        // Smooth scrolling for all nav links
        document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    const targetId = href.substring(1);
                    const targetSection = document.getElementById(targetId);
                    
                    if (targetSection) {
                        const offsetTop = targetSection.offsetTop - 70;
                        window.scrollTo({
                            top: offsetTop,
                            behavior: 'smooth'
                        });
                    }
                    
                    // Close mobile menu
                    if (mobileMenuToggle && mobileMenu) {
                        mobileMenuToggle.classList.remove('active');
                        mobileMenu.classList.remove('active');
                        document.body.style.overflow = '';
                    }
                }
            });
        });
        
        // Tool selection from dropdown and mobile menu
        document.querySelectorAll('[data-tool]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const toolName = link.getAttribute('data-tool');
                this.openTool(toolName);
                
                // Close mobile menu
                if (mobileMenuToggle && mobileMenu) {
                    mobileMenuToggle.classList.remove('active');
                    mobileMenu.classList.remove('active');
                    document.body.style.overflow = '';
                }
                
                // Close desktop dropdown
                if (toolsDropdownMenu) {
                    toolsDropdownMenu.classList.remove('active');
                }
                
                // Scroll to tools section
                document.getElementById('tools').scrollIntoView({ behavior: 'smooth' });
            });
        });
        
        // Active nav link highlighting
        window.addEventListener('scroll', () => {
            const sections = document.querySelectorAll('section');
            const navLinks = document.querySelectorAll('.nav-link');
            
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 100;
                if (window.pageYOffset >= sectionTop) {
                    current = section.getAttribute('id');
                }
            });
            
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') && link.getAttribute('href').substring(1) === current) {
                    link.classList.add('active');
                }
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (mobileMenu && mobileMenu.classList.contains('active') && 
                !mobileMenu.contains(e.target) && 
                !mobileMenuToggle.contains(e.target)) {
                mobileMenuToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && mobileMenu && mobileMenu.classList.contains('active')) {
                mobileMenuToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    setupEventListeners() {
        // Tool card clicks
        document.querySelectorAll('.tool-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.currentTarget.dataset.disabled === 'true') {
                    this.showMessage('This feature is coming soon!');
                    return;
                }
                this.openTool(e.currentTarget.dataset.tool);
            });
        });

        // Workspace controls
        document.getElementById('close-workspace').addEventListener('click', () => {
            this.closeWorkspace();
        });

        // File input
        const fileInput = document.getElementById('fileInput');
        const dropZone = document.getElementById('dropZone');
        
        // Browse link will be attached in openTool method

        fileInput.addEventListener('change', (e) => {
            this.handleFiles(Array.from(e.target.files));
        });

        // Drag and drop
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            this.handleFiles(Array.from(e.dataTransfer.files));
        });

        // Process button
        document.getElementById('processBtn').addEventListener('click', () => {
            this.processFiles();
        });
    }

    openTool(toolName) {
        this.currentTool = toolName;
        this.files = [];
        this.processedFiles = [];
        
        document.getElementById('workspace-title').textContent = this.getToolTitle(toolName);
        document.getElementById('tool-workspace').classList.remove('hidden');
        document.getElementById('toolOptions').innerHTML = this.getToolOptions(toolName);
        
        // Set file input to multiple for merge operations
        const fileInput = document.getElementById('fileInput');
        const dropZone = document.getElementById('dropZone');
        const dropContent = dropZone.querySelector('p');
        
        if (toolName === 'pdf-merge' || toolName === 'image-to-pdf') {
            fileInput.setAttribute('multiple', 'multiple');
            dropContent.innerHTML = 'Drag & drop multiple files here or <span class="browse-link">browse</span>';
        } else {
            fileInput.removeAttribute('multiple');
            dropContent.innerHTML = 'Drag & drop files here or <span class="browse-link">browse</span>';
        }
        
        // Re-attach browse link event listener
        const browseLink = dropContent.querySelector('.browse-link');
        if (browseLink) {
            browseLink.addEventListener('click', () => {
                fileInput.click();
            });
        }
        
        this.updateFileList();
        this.updateProcessButton();
    }

    closeWorkspace() {
        document.getElementById('tool-workspace').classList.add('hidden');
        this.currentTool = null;
        this.files = [];
        document.getElementById('fileInput').value = '';
    }

    getToolTitle(toolName) {
        const titles = {
            'pdf-edit': 'PDF Editor',
            'pdf-to-word': 'PDF to Word Converter',
            'word-to-pdf': 'Word to PDF Converter',
            'pdf-merge': 'PDF Merger',
            'word-merge': 'Word Document Merger',
            'pdf-sign': 'PDF Digital Signature',
            'image-resize': 'Image Resizer',
            'pdf-resize': 'PDF Page Resizer',
            'pdf-split': 'PDF Splitter',
            'image-to-pdf': 'Image to PDF Converter',
            'pdf-compress': 'PDF Compressor',
            'watermark': 'Watermark Tool',
            'organize': 'Organize PDF',
            'create-forms': 'Create Forms',
            'delete-pages': 'Delete Pages',
            'pdf-to-excel': 'PDF to Excel',
            'pdf-to-jpg': 'PDF to JPG',
            'pdf-to-text': 'PDF to Text',
            'html-to-pdf': 'HTML to PDF',
            'split-by-pages': 'Split by Pages',
            'split-in-half': 'Split in Half',
            'protect': 'Protect PDF',
            'unlock': 'Unlock PDF',
            'rotate': 'Rotate PDF',
            'crop': 'Crop PDF',
            'page-numbers': 'Add Page Numbers'
        };
        return titles[toolName] || 'File Tool';
    }

    getToolOptions(toolName) {
        switch(toolName) {
            case 'image-resize':
                return `
                    <div class="option-group">
                        <label>Width (px):</label>
                        <input type="number" id="width" placeholder="800">
                    </div>
                    <div class="option-group">
                        <label>Height (px):</label>
                        <input type="number" id="height" placeholder="600">
                    </div>
                    <div class="option-group">
                        <label>Maintain Aspect Ratio:</label>
                        <input type="checkbox" id="aspectRatio" checked>
                    </div>
                `;
            case 'pdf-sign':
                return `
                    <div class="option-group">
                        <label>Signature Text:</label>
                        <input type="text" id="signatureText" placeholder="Your Name">
                    </div>
                    <div class="option-group">
                        <label>Position:</label>
                        <select id="signPosition">
                            <option value="bottom-right">Bottom Right</option>
                            <option value="bottom-left">Bottom Left</option>
                            <option value="top-right">Top Right</option>
                            <option value="top-left">Top Left</option>
                        </select>
                    </div>
                `;
            case 'watermark':
                return `
                    <div class="option-group">
                        <label>Watermark Text:</label>
                        <input type="text" id="watermarkText" placeholder="CONFIDENTIAL">
                    </div>
                    <div class="option-group">
                        <label>Opacity:</label>
                        <input type="range" id="opacity" min="0.1" max="1" step="0.1" value="0.3">
                    </div>
                `;
            case 'pdf-compress':
                return `
                    <div class="option-group">
                        <label>Compression Level:</label>
                        <select id="compressionLevel">
                            <option value="low">Low (Better Quality)</option>
                            <option value="medium" selected>Medium</option>
                            <option value="high">High (Smaller Size)</option>
                        </select>
                    </div>
                `;
            case 'split-by-pages':
                return `
                    <div class="option-group">
                        <label>Pages per file:</label>
                        <input type="number" id="pagesPerFile" value="1" min="1">
                    </div>
                `;
            case 'delete-pages':
                return `
                    <div class="option-group">
                        <label>Pages to delete (e.g., 1,3,5-7):</label>
                        <input type="text" id="pagesToDelete" placeholder="1,3,5-7">
                    </div>
                `;
            case 'rotate':
                return `
                    <div class="option-group">
                        <label>Rotation:</label>
                        <select id="rotationAngle">
                            <option value="90">90° Clockwise</option>
                            <option value="180">180°</option>
                            <option value="270">90° Counter-clockwise</option>
                        </select>
                    </div>
                `;
            case 'protect':
                return `
                    <div class="option-group">
                        <label>Password:</label>
                        <input type="password" id="pdfPassword" placeholder="Enter password">
                    </div>
                    <div class="option-group">
                        <label>Permissions:</label>
                        <select id="permissions">
                            <option value="no-print">No Printing</option>
                            <option value="no-copy">No Copying</option>
                            <option value="no-modify">No Modifications</option>
                            <option value="all">All Restrictions</option>
                        </select>
                    </div>
                `;
            case 'page-numbers':
                return `
                    <div class="option-group">
                        <label>Position:</label>
                        <select id="numberPosition">
                            <option value="bottom-center">Bottom Center</option>
                            <option value="bottom-right">Bottom Right</option>
                            <option value="top-center">Top Center</option>
                            <option value="top-right">Top Right</option>
                        </select>
                    </div>
                    <div class="option-group">
                        <label>Start from:</label>
                        <input type="number" id="startNumber" value="1" min="1">
                    </div>
                `;
            case 'pdf-resize':
                return `
                    <div class="option-group">
                        <label>Page Size:</label>
                        <select id="pageSize">
                            <option value="A4">A4</option>
                            <option value="A3">A3</option>
                            <option value="A5">A5</option>
                            <option value="Letter">Letter</option>
                            <option value="Legal">Legal</option>
                        </select>
                    </div>
                `;
            default:
                return '';
        }
    }

    handleFiles(fileList) {
        fileList.forEach(file => {
            if (this.isValidFile(file)) {
                this.files.push(file);
            }
        });
        this.updateFileList();
        this.updateProcessButton();
    }

    isValidFile(file) {
        const validTypes = {
            'pdf-edit': ['application/pdf'],
            'pdf-to-word': ['application/pdf'],
            'word-to-pdf': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            'pdf-merge': ['application/pdf'],
            'word-merge': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            'pdf-sign': ['application/pdf'],
            'image-resize': ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            'pdf-resize': ['application/pdf'],
            'pdf-split': ['application/pdf'],
            'image-to-pdf': ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            'pdf-compress': ['application/pdf'],
            'watermark': ['application/pdf', 'image/jpeg', 'image/png']
        };

        return validTypes[this.currentTool]?.includes(file.type) || true;
    }

    updateFileList() {
        const fileList = document.getElementById('fileList');
        fileList.innerHTML = '';

        this.files.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <div class="file-info">
                    <span class="file-icon">${this.getFileIcon(file.type)}</span>
                    <span>${file.name} (${this.formatFileSize(file.size)})</span>
                </div>
                <button class="remove-file" onclick="app.removeFile(${index})">Remove</button>
            `;
            fileList.appendChild(fileItem);
        });
    }

    removeFile(index) {
        this.files.splice(index, 1);
        this.updateFileList();
        this.updateProcessButton();
    }

    updateProcessButton() {
        const processBtn = document.getElementById('processBtn');
        if (this.currentTool === 'pdf-merge' || this.currentTool === 'image-to-pdf') {
            processBtn.disabled = this.files.length < 2;
        } else {
            processBtn.disabled = this.files.length === 0;
        }
    }

    getFileIcon(type) {
        if (type.includes('pdf')) return '📄';
        if (type.includes('word') || type.includes('document')) return '📝';
        if (type.includes('image')) return '🖼️';
        return '📁';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async processFiles() {
        document.getElementById('loading').classList.remove('hidden');
        
        try {
            switch(this.currentTool) {
                case 'image-resize':
                    await this.resizeImages();
                    break;
                case 'pdf-merge':
                    await this.mergePDFs();
                    break;
                case 'pdf-split':
                    await this.splitPDF();
                    break;
                case 'image-to-pdf':
                    await this.imagesToPDF();
                    break;
                case 'pdf-sign':
                    await this.signPDF();
                    break;
                case 'watermark':
                    await this.addWatermark();
                    break;
                case 'pdf-compress':
                    await this.compressPDF();
                    break;
                case 'split-by-pages':
                    await this.splitByPages();
                    break;
                case 'split-in-half':
                    await this.splitInHalf();
                    break;
                case 'delete-pages':
                    await this.deletePages();
                    break;
                case 'rotate':
                    await this.rotatePDF();
                    break;
                case 'protect':
                    await this.protectPDF();
                    break;
                case 'unlock':
                    await this.unlockPDF();
                    break;
                case 'page-numbers':
                    await this.addPageNumbers();
                    break;
                case 'pdf-resize':
                    await this.resizePDF();
                    break;
                case 'pdf-to-word':
                    await this.pdfToWord();
                    break;
                case 'word-to-pdf':
                    await this.wordToPDF();
                    break;
                case 'pdf-to-jpg':
                    await this.pdfToJPG();
                    break;
                case 'pdf-to-text':
                    await this.pdfToText();
                    break;
                case 'word-merge':
                    this.showMessage('Word Merge - Coming Soon!');
                    break;
                case 'pdf-edit':
                    this.showMessage('Edit PDF - Coming Soon!');
                    break;
                case 'create-forms':
                    this.showMessage('Create Forms - Coming Soon!');
                    break;
                case 'pdf-to-excel':
                    this.showMessage('PDF to Excel - Coming Soon!');
                    break;
                case 'html-to-pdf':
                    this.showMessage('HTML to PDF - Coming Soon!');
                    break;
                case 'unlock':
                    this.showMessage('Unlock PDF - Coming Soon!');
                    break;
                case 'crop':
                    this.showMessage('Crop PDF - Coming Soon!');
                    break;
                case 'organize':
                    await this.organizePDF();
                    break;
                default:
                    this.showMessage('Coming Soon!');
            }
        } catch (error) {
            this.showMessage('Error processing files: ' + error.message);
        }
        
        document.getElementById('loading').classList.add('hidden');
        
        // Increment processed files counter if processing was successful
        if (this.processedFiles.length > 0) {
            this.incrementFilesProcessed();
        }
    }

    async resizeImages() {
        await this.processServerSide('image-resize');
    }

    async resizeImage(file, width, height, maintainAspect) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                if (maintainAspect) {
                    const ratio = Math.min(width / img.width, height / img.height);
                    canvas.width = img.width * ratio;
                    canvas.height = img.height * ratio;
                } else {
                    canvas.width = width;
                    canvas.height = height;
                }
                
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                canvas.toBlob(resolve, file.type);
            };
            
            img.src = URL.createObjectURL(file);
        });
    }

    async mergePDFs() {
        await this.processServerSide('pdf-merge');
    }

    async splitPDF() {
        await this.processServerSide('pdf-split');
    }

    async imagesToPDF() {
        await this.processServerSide('image-to-pdf');
    }

    async signPDF() {
        const file = this.files[0];
        const signatureText = document.getElementById('signatureText').value || 'Digital Signature';
        const position = document.getElementById('signPosition').value;
        
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        const { width, height } = firstPage.getSize();
        
        let x, y;
        switch(position) {
            case 'bottom-right':
                x = width - 150;
                y = 50;
                break;
            case 'bottom-left':
                x = 50;
                y = 50;
                break;
            case 'top-right':
                x = width - 150;
                y = height - 50;
                break;
            case 'top-left':
                x = 50;
                y = height - 50;
                break;
        }
        
        firstPage.drawText(signatureText, {
            x: x,
            y: y,
            size: 12,
            color: PDFLib.rgb(0, 0, 1)
        });
        
        const pdfBytes = await pdfDoc.save();
        this.processedFiles.push({
            name: `signed_${file.name}`,
            blob: new Blob([pdfBytes], { type: 'application/pdf' })
        });
        
        this.showDownloadButton();
    }

    async addWatermark() {
        await this.processServerSide('watermark');
    }

    showDownloadButton() {
        document.getElementById('downloadBtn').classList.remove('hidden');
        document.getElementById('downloadBtn').onclick = () => this.downloadFiles();
    }

    downloadFiles() {
        this.processedFiles.forEach(file => {
            const url = URL.createObjectURL(file.blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name;
            a.click();
            URL.revokeObjectURL(url);
        });
    }

    async splitByPages() {
        const pagesPerFile = parseInt(document.getElementById('pagesPerFile').value) || 1;
        const file = this.files[0];
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
        const totalPages = pdf.getPageCount();
        
        let fileIndex = 1;
        for (let i = 0; i < totalPages; i += pagesPerFile) {
            const newPdf = await PDFLib.PDFDocument.create();
            const endPage = Math.min(i + pagesPerFile, totalPages);
            const pageIndices = Array.from({length: endPage - i}, (_, idx) => i + idx);
            const pages = await newPdf.copyPages(pdf, pageIndices);
            pages.forEach(page => newPdf.addPage(page));
            
            const pdfBytes = await newPdf.save();
            this.processedFiles.push({
                name: `split_${fileIndex++}.pdf`,
                blob: new Blob([pdfBytes], { type: 'application/pdf' })
            });
        }
        this.showDownloadButton();
    }

    async splitInHalf() {
        const file = this.files[0];
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
        const totalPages = pdf.getPageCount();
        const midPoint = Math.ceil(totalPages / 2);
        
        // First half
        const firstHalf = await PDFLib.PDFDocument.create();
        const firstPages = await firstHalf.copyPages(pdf, Array.from({length: midPoint}, (_, i) => i));
        firstPages.forEach(page => firstHalf.addPage(page));
        
        // Second half
        const secondHalf = await PDFLib.PDFDocument.create();
        const secondPages = await secondHalf.copyPages(pdf, Array.from({length: totalPages - midPoint}, (_, i) => i + midPoint));
        secondPages.forEach(page => secondHalf.addPage(page));
        
        const firstBytes = await firstHalf.save();
        const secondBytes = await secondHalf.save();
        
        this.processedFiles.push(
            { name: 'first_half.pdf', blob: new Blob([firstBytes], { type: 'application/pdf' }) },
            { name: 'second_half.pdf', blob: new Blob([secondBytes], { type: 'application/pdf' }) }
        );
        this.showDownloadButton();
    }

    async deletePages() {
        const pagesToDelete = document.getElementById('pagesToDelete').value;
        const file = this.files[0];
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
        const totalPages = pdf.getPageCount();
        
        const deleteIndices = this.parsePageRange(pagesToDelete, totalPages);
        const keepIndices = Array.from({length: totalPages}, (_, i) => i).filter(i => !deleteIndices.includes(i));
        
        const newPdf = await PDFLib.PDFDocument.create();
        const pages = await newPdf.copyPages(pdf, keepIndices);
        pages.forEach(page => newPdf.addPage(page));
        
        const pdfBytes = await newPdf.save();
        this.processedFiles.push({
            name: `pages_deleted_${file.name}`,
            blob: new Blob([pdfBytes], { type: 'application/pdf' })
        });
        this.showDownloadButton();
    }

    async rotatePDF() {
        await this.processServerSide('rotate');
    }

    async addPageNumbers() {
        const position = document.getElementById('numberPosition').value;
        const startNumber = parseInt(document.getElementById('startNumber').value) || 1;
        const file = this.files[0];
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
        const pages = pdfDoc.getPages();
        
        pages.forEach((page, index) => {
            const { width, height } = page.getSize();
            let x, y;
            
            switch(position) {
                case 'bottom-center':
                    x = width / 2 - 10;
                    y = 30;
                    break;
                case 'bottom-right':
                    x = width - 50;
                    y = 30;
                    break;
                case 'top-center':
                    x = width / 2 - 10;
                    y = height - 50;
                    break;
                case 'top-right':
                    x = width - 50;
                    y = height - 50;
                    break;
            }
            
            page.drawText((startNumber + index).toString(), {
                x: x,
                y: y,
                size: 12,
                color: PDFLib.rgb(0, 0, 0)
            });
        });
        
        const pdfBytes = await pdfDoc.save();
        this.processedFiles.push({
            name: `numbered_${file.name}`,
            blob: new Blob([pdfBytes], { type: 'application/pdf' })
        });
        this.showDownloadButton();
    }

    async resizePDF() {
        const pageSize = document.getElementById('pageSize').value;
        const file = this.files[0];
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
        
        const sizes = {
            'A4': [595, 842],
            'A3': [842, 1191],
            'A5': [420, 595],
            'Letter': [612, 792],
            'Legal': [612, 1008]
        };
        
        const [newWidth, newHeight] = sizes[pageSize];
        const pages = pdfDoc.getPages();
        
        pages.forEach(page => {
            page.setSize(newWidth, newHeight);
        });
        
        const pdfBytes = await pdfDoc.save();
        this.processedFiles.push({
            name: `resized_${pageSize}_${file.name}`,
            blob: new Blob([pdfBytes], { type: 'application/pdf' })
        });
        this.showDownloadButton();
    }

    async compressPDF() {
        await this.processServerSide('pdf-compress');
    }

    async protectPDF() {
        await this.processServerSide('protect');
    }

    async unlockPDF() {
        this.showMessage('PDF Unlock: This feature requires server-side processing for security.');
    }

    async pdfToWord() {
        await this.processServerSide('pdf-to-word');
    }

    async wordToPDF() {
        await this.processServerSide('word-to-pdf');
    }

    async pdfToJPG() {
        await this.processServerSide('pdf-to-jpg');
    }

    async pdfToText() {
        await this.processServerSide('pdf-to-text');
    }

    async processServerSide(operation) {
        const formData = new FormData();
        
        // Handle multiple files for merge and image-to-pdf operations
        if (operation === 'pdf-merge' || operation === 'image-to-pdf') {
            this.files.forEach(file => {
                formData.append('files', file);
            });
        } else {
            formData.append('file', this.files[0]);
        }
        
        // Add operation-specific parameters
        if (operation === 'protect-pdf') {
            const password = document.getElementById('pdfPassword')?.value;
            if (password) formData.append('password', password);
        }
        
        if (operation === 'pdf-compress') {
            const level = document.getElementById('compressionLevel')?.value;
            if (level) formData.append('compressionLevel', level);
        }
        
        if (operation === 'image-resize') {
            const width = document.getElementById('width')?.value || '800';
            const height = document.getElementById('height')?.value || '600';
            formData.append('width', width);
            formData.append('height', height);
        }
        
        if (operation === 'watermark') {
            const watermarkText = document.getElementById('watermarkText')?.value || 'WATERMARK';
            formData.append('watermarkText', watermarkText);
        }
        
        if (operation === 'rotate') {
            const rotationAngle = document.getElementById('rotationAngle')?.value || '90';
            formData.append('rotationAngle', rotationAngle);
        }

        try {
            const response = await fetch(`/api/process/${operation}`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const text = await response.text();
            if (!text) {
                throw new Error('Empty response from server');
            }

            const result = JSON.parse(text);
            
            if (result.success) {
                const filename = result.outputPath.split(/[\\/]/).pop();
                this.downloadServerFile(filename);
            } else {
                this.showMessage(result.message || 'Processing failed');
            }
        } catch (error) {
            console.error('Processing error:', error);
            this.showMessage('Processing error: ' + error.message);
        }
    }

    async downloadServerFile(filename) {
        try {
            const response = await fetch(`/api/download/${filename}`);
            
            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                a.click();
                URL.revokeObjectURL(url);
            } else {
                this.showMessage('Download failed');
            }
        } catch (error) {
            this.showMessage('Download error: ' + error.message);
        }
    }

    async mergeWord() {
        this.showMessage('Word Merge: This feature requires server-side processing with document libraries.');
    }

    async organizePDF() {
        // Simple page reordering - in real implementation would have drag-drop interface
        const file = this.files[0];
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
        const pageCount = pdf.getPageCount();
        
        // Reverse page order as example
        const newPdf = await PDFLib.PDFDocument.create();
        const pageIndices = Array.from({length: pageCount}, (_, i) => pageCount - 1 - i);
        const pages = await newPdf.copyPages(pdf, pageIndices);
        pages.forEach(page => newPdf.addPage(page));
        
        const pdfBytes = await newPdf.save();
        this.processedFiles.push({
            name: `organized_${file.name}`,
            blob: new Blob([pdfBytes], { type: 'application/pdf' })
        });
        this.showDownloadButton();
    }

    parsePageRange(rangeStr, totalPages) {
        const indices = [];
        const parts = rangeStr.split(',');
        
        parts.forEach(part => {
            part = part.trim();
            if (part.includes('-')) {
                const [start, end] = part.split('-').map(n => parseInt(n.trim()) - 1);
                for (let i = start; i <= end && i < totalPages; i++) {
                    if (i >= 0) indices.push(i);
                }
            } else {
                const pageNum = parseInt(part) - 1;
                if (pageNum >= 0 && pageNum < totalPages) {
                    indices.push(pageNum);
                }
            }
        });
        
        return [...new Set(indices)];
    }

    showMessage(message) {
        alert(message);
    }

    setupAnimations() {
        // Add scroll effects to navbar
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });

        // Enhanced intersection observer for various animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Different animations for different elements
                    if (entry.target.classList.contains('tools-section')) {
                        entry.target.classList.add('fade-in');
                    }
                    if (entry.target.classList.contains('feature-item')) {
                        entry.target.classList.add('slide-up');
                    }
                    if (entry.target.classList.contains('stat-card')) {
                        entry.target.classList.add('bounce-in');
                        this.animateCounter(entry.target);
                    }
                    if (entry.target.classList.contains('reveal-section')) {
                        entry.target.classList.add('revealed');
                    }
                }
            });
        }, observerOptions);

        // Observe different elements
        document.querySelectorAll('.tools-section, .feature-item, .stat-card, .reveal-section').forEach(element => {
            observer.observe(element);
        });

        // Add floating animation to header logo
        const headerLogo = document.querySelector('.header-logo');
        if (headerLogo) {
            headerLogo.classList.add('float');
        }

        // Add stagger animation to tool cards
        document.querySelectorAll('.tool-card').forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
        });

        // Trigger hero stats animation on load
        setTimeout(() => {
            document.querySelectorAll('.stat-item').forEach(item => {
                item.classList.add('roll-in');
            });
        }, 1000);

        // Newsletter subscription functionality
        this.setupNewsletterSubscription();
        
        // Review form functionality
        this.setupReviewForm();

        // Add parallax effect to floating shapes
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const shapes = document.querySelectorAll('.floating-shape');
            shapes.forEach((shape, index) => {
                const speed = 0.5 + (index * 0.2);
                shape.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });
    }

    animateCounter(statCard) {
        const valueElement = statCard.querySelector('.stat-value');
        const target = parseFloat(valueElement.getAttribute('data-target'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                valueElement.textContent = Math.floor(current * 10) / 10;
                requestAnimationFrame(updateCounter);
            } else {
                valueElement.textContent = target;
            }
        };

        updateCounter();
    }

    setupNewsletterSubscription() {
        const subscribeBtn = document.getElementById('subscribeBtn');
        const emailInput = document.getElementById('newsletterEmail');
        const btnText = document.getElementById('btnText');
        const subscribeMessage = document.getElementById('subscribeMessage');

        if (subscribeBtn && emailInput) {
            subscribeBtn.addEventListener('click', async () => {
                const email = emailInput.value.trim();
                
                if (!email) {
                    this.showMessage('Please enter your email address');
                    return;
                }

                if (!this.isValidEmail(email)) {
                    this.showMessage('Please enter a valid email address');
                    return;
                }

                // Disable button and show loading
                subscribeBtn.disabled = true;
                btnText.textContent = 'Subscribing...';

                try {
                    // Submit subscription to database
                    const response = await fetch('/api/subscribe', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ email: email })
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        // Show success state
                        btnText.textContent = 'Subscribed!';
                        subscribeBtn.classList.add('subscribed');
                        subscribeMessage.classList.remove('hidden');
                        subscribeMessage.classList.add('show');
                        subscribeMessage.textContent = result.message;
                        emailInput.value = '';
                    } else {
                        throw new Error(result.message);
                    }
                    
                    // Keep success state
                    setTimeout(() => {
                        btnText.textContent = 'Subscribe';
                        subscribeBtn.classList.remove('subscribed');
                        subscribeBtn.disabled = false;
                        subscribeMessage.classList.add('hidden');
                        subscribeMessage.classList.remove('show');
                    }, 3000);
                    
                } catch (error) {
                    console.error('Subscription error:', error);
                    btnText.textContent = 'Subscribe';
                    subscribeBtn.disabled = false;
                    this.showMessage('Subscription failed. Please try again.');
                }
            });

            // Allow Enter key to submit
            emailInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    subscribeBtn.click();
                }
            });
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async sendSubscriptionEmail(email) {
        // Simple email notification using mailto (opens user's email client)
        const subject = 'New Newsletter Subscription - All Snax';
        const body = `New subscriber: ${email}\n\nSubscribed at: ${new Date().toLocaleString()}`;
        const mailtoLink = `mailto:lokeshsharma353.india@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        // For demonstration, we'll just log it and show success
        console.log('New subscription:', email);
        
        // In a real application, you would send this to your backend
        // For now, we'll simulate a successful subscription
        return new Promise((resolve) => {
            setTimeout(resolve, 1000);
        });
    }
    
    setupReviewForm() {
        const reviewForm = document.getElementById('reviewForm');
        const starRating = document.getElementById('starRating');
        const stars = starRating?.querySelectorAll('.star');
        let selectedRating = 0;
        
        // Star rating functionality
        if (stars) {
            stars.forEach((star, index) => {
                star.addEventListener('click', () => {
                    selectedRating = index + 1;
                    this.updateStarRating(stars, selectedRating);
                });
                
                star.addEventListener('mouseover', () => {
                    this.updateStarRating(stars, index + 1);
                });
            });
            
            starRating.addEventListener('mouseleave', () => {
                this.updateStarRating(stars, selectedRating);
            });
        }
        
        // Form submission
        if (reviewForm) {
            reviewForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const name = document.getElementById('reviewerName').value;
                const reviewText = document.getElementById('reviewText').value;
                
                if (selectedRating === 0) {
                    this.showMessage('Please select a rating');
                    return;
                }
                
                // Simulate review submission
                const submitBtn = reviewForm.querySelector('.submit-review-btn');
                const originalText = submitBtn.querySelector('span').textContent;
                
                submitBtn.disabled = true;
                submitBtn.querySelector('span').textContent = 'Submitting...';
                
                try {
                    // Submit review to database
                    const response = await fetch('/api/reviews', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            name: name,
                            rating: selectedRating,
                            reviewText: reviewText
                        })
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        // Add review to testimonials section
                        this.addReviewToTestimonials(name, reviewText, selectedRating);
                        
                        this.showMessage('Thank you for your review! Your review has been added.');
                        reviewForm.reset();
                        selectedRating = 0;
                        this.updateStarRating(stars, 0);
                    } else {
                        throw new Error(result.message);
                    }
                    
                } catch (error) {
                    this.showMessage('Failed to submit review. Please try again.');
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.querySelector('span').textContent = originalText;
                }
            });
        }
    }
    
    updateStarRating(stars, rating) {
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }
    
    addReviewToTestimonials(name, reviewText, rating) {
        const testimonialsGrid = document.querySelector('.testimonials-grid');
        if (!testimonialsGrid) return;
        
        // Create star display
        const starsDisplay = '⭐'.repeat(rating);
        
        // Get initials for avatar
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        
        // Create new testimonial card
        const testimonialCard = document.createElement('div');
        testimonialCard.className = 'testimonial-card';
        testimonialCard.innerHTML = `
            <div class="testimonial-content">
                <div class="stars">${starsDisplay}</div>
                <p>"${reviewText}"</p>
            </div>
            <div class="testimonial-author">
                <div class="author-avatar">${initials}</div>
                <div class="author-info">
                    <h4>${name}</h4>
                    <span>Verified User</span>
                </div>
            </div>
        `;
        
        // Add animation class
        testimonialCard.style.opacity = '0';
        testimonialCard.style.transform = 'translateY(20px)';
        
        // Insert at the beginning of testimonials
        testimonialsGrid.insertBefore(testimonialCard, testimonialsGrid.firstChild);
        
        // Animate in
        setTimeout(() => {
            testimonialCard.style.transition = 'all 0.5s ease';
            testimonialCard.style.opacity = '1';
            testimonialCard.style.transform = 'translateY(0)';
        }, 100);
        
        // Scroll to testimonials section
        setTimeout(() => {
            document.getElementById('testimonials').scrollIntoView({ behavior: 'smooth' });
        }, 1000);
    }
    
    async loadExistingReviews() {
        try {
            const response = await fetch('/api/reviews');
            const result = await response.json();
            
            if (result.success && result.reviews.length > 0) {
                const testimonialsGrid = document.querySelector('.testimonials-grid');
                if (!testimonialsGrid) return;
                
                // Clear existing testimonials (keep the default ones or replace)
                // testimonialsGrid.innerHTML = '';
                
                result.reviews.forEach(review => {
                    const starsDisplay = '⭐'.repeat(review.rating);
                    const initials = review.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
                    
                    const testimonialCard = document.createElement('div');
                    testimonialCard.className = 'testimonial-card';
                    testimonialCard.innerHTML = `
                        <div class="testimonial-content">
                            <div class="stars">${starsDisplay}</div>
                            <p>"${review.review_text}"</p>
                        </div>
                        <div class="testimonial-author">
                            <div class="author-avatar">${initials}</div>
                            <div class="author-info">
                                <h4>${review.name}</h4>
                                <span>Verified User</span>
                            </div>
                        </div>
                    `;
                    
                    testimonialsGrid.appendChild(testimonialCard);
                });
            }
        } catch (error) {
            console.log('Could not load existing reviews:', error);
        }
    }
}

// Initialize the app
const app = new AllSnax();

// Add smooth reveal animations for sections
document.addEventListener('DOMContentLoaded', () => {
    // Create particles dynamically
    const particlesContainer = document.querySelector('.particles');
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: rgba(102, 126, 234, 0.6);
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: particleMove ${5 + Math.random() * 10}s linear infinite;
        `;
        particlesContainer.appendChild(particle);
    }

    // Add CSS for particle animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes particleMove {
            0% { transform: translateY(0) translateX(0); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(-100vh) translateX(50px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
});