const fs = require('fs');
const path = require('path');

// Function to copy logo image
async function copyLogoImage() {
  try {
    // Define paths
    const assetsDir = path.join(__dirname, 'src', 'Assets');
    const logoPath = path.join(assetsDir, 'logo', 'logo.png');
    const newLogoPath = path.join(assetsDir, 'logo', 'logo2.png');
    
    // Check if source file exists
    if (!fs.existsSync(logoPath)) {
      throw new Error(`Source logo file not found at: ${logoPath}`);
    }
    
    // Read the original file
    const originalImageData = fs.readFileSync(logoPath);
    
    // Ensure destination directory exists
    const logoDir = path.dirname(newLogoPath);
    if (!fs.existsSync(logoDir)) {
      fs.mkdirSync(logoDir, { recursive: true });
    }
    
    // Write the copy
    fs.writeFileSync(newLogoPath, originalImageData);
    
    // Verify the copy was successful
    const stats = fs.statSync(newLogoPath);
    
    console.log('✅ Logo copied successfully!');
    console.log(`Original file: ${logoPath}`);
    console.log(`Copied file: ${newLogoPath}`);
    console.log(`File size: ${(stats.size / 1024).toFixed(2)} KB`);
    
    // Verify file integrity by comparing sizes
    const originalStats = fs.statSync(logoPath);
    if (originalStats.size === stats.size) {
      console.log('✅ File integrity verified - sizes match');
    } else {
      console.warn('⚠️ Warning: File sizes do not match');
    }
    
  } catch (error) {
    console.error('❌ Error copying logo:', error.message);
    
    // Handle specific error cases
    if (error.code === 'ENOENT') {
      console.error('📁 Directory or file not found');
    } else if (error.code === 'EACCES') {
      console.error('🔐 Permission denied - check file permissions');
    } else if (error instanceof TypeError) {
      console.error('📄 Invalid file path or format');
    }
    
    process.exit(1);
  }
}

// Execute the function
copyLogoImage();