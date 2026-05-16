package com.athvexa.service;

import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;

@Service
public class OCRService {

    private static final String TESSERACT_PATH = "C:/Program Files/Tesseract-OCR/tessdata";

    public String extractTextFromImage(MultipartFile imageFile) throws IOException, TesseractException {
        // Create a temporary file
        File tempFile = File.createTempFile("upload", imageFile.getOriginalFilename());
        imageFile.transferTo(tempFile);

        try {
            Tesseract tesseract = new Tesseract();
            tesseract.setDatapath(TESSERACT_PATH);
            tesseract.setLanguage("eng");
            
            String extractedText = tesseract.doOCR(tempFile);
            return extractedText;
        } finally {
            // Clean up temporary file
            if (tempFile.exists()) {
                tempFile.delete();
            }
        }
    }

    public String normalizeText(String text) {
        if (text == null) return "";
        
        // Convert to lowercase
        text = text.toLowerCase();
        
        // Remove special characters and extra spaces
        text = text.replaceAll("[^a-zA-Z0-9\\s]", " ");
        text = text.replaceAll("\\s+", " ").trim();
        
        return text;
    }
}
