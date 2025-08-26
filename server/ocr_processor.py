import sys
import json
import pytesseract
from pdf2image import convert_from_path
from docx import Document
import os
import tempfile

def pdf_to_word_ocr(pdf_path, output_path):
    try:
        # Convert PDF to images
        images = convert_from_path(pdf_path, dpi=300)
        
        # Create Word document
        doc = Document()
        
        # Process each page
        for i, image in enumerate(images):
            # Save image temporarily
            with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as temp_img:
                image.save(temp_img.name, 'PNG')
                
                # Extract text using OCR
                text = pytesseract.image_to_string(temp_img.name, lang='eng')
                
                # Add to Word document
                if i > 0:
                    doc.add_page_break()
                doc.add_paragraph(text)
                
                # Clean up temp file
                os.unlink(temp_img.name)
        
        # Save Word document
        doc.save(output_path)
        return {"success": True, "message": "PDF converted to Word successfully"}
        
    except Exception as e:
        return {"success": False, "error": str(e)}

def pdf_to_text_ocr(pdf_path, output_path):
    try:
        # Convert PDF to images
        images = convert_from_path(pdf_path, dpi=300)
        
        extracted_text = ""
        
        # Process each page
        for image in images:
            # Save image temporarily
            with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as temp_img:
                image.save(temp_img.name, 'PNG')
                
                # Extract text using OCR
                text = pytesseract.image_to_string(temp_img.name, lang='eng')
                extracted_text += text + "\n\n"
                
                # Clean up temp file
                os.unlink(temp_img.name)
        
        # Save text file
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(extracted_text)
            
        return {"success": True, "message": "PDF converted to text successfully"}
        
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print(json.dumps({"success": False, "error": "Insufficient arguments"}))
        sys.exit(1)
    
    operation = sys.argv[1]
    input_path = sys.argv[2]
    output_path = sys.argv[3]
    
    if operation == "pdf_to_word":
        result = pdf_to_word_ocr(input_path, output_path)
    elif operation == "pdf_to_text":
        result = pdf_to_text_ocr(input_path, output_path)
    else:
        result = {"success": False, "error": "Unknown operation"}
    
    print(json.dumps(result))