const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

// Base URL untuk production/development
const BASE_URL = 'http://localhost:5173'; // Ganti dengan domain production nanti

// Table data sesuai dengan database backend
const tables = [
  { id: 1, qr_code: 'TBL-001', name: 'Table 1 - Window Side' },
  { id: 2, qr_code: 'TBL-002', name: 'Table 2 - Garden View' },
  { id: 3, qr_code: 'TBL-003', name: 'Table 3 - Private Booth' },
  { id: 4, qr_code: 'TBL-004', name: 'Table 4 - Bar Counter' },
  { id: 5, qr_code: 'TBL-005', name: 'Table 5 - Outdoor Terrace' },
  { id: 6, qr_code: 'TBL-006', name: 'Table 6 - Corner Spot' },
  { id: 7, qr_code: 'TBL-007', name: 'Table 7 - Center Hall' },
  { id: 8, qr_code: 'TBL-008', name: 'Table 8 - VIP Room' },
  { id: 9, qr_code: 'TBL-009', name: 'Table 9 - Balcony' },
  { id: 10, qr_code: 'TBL-010', name: 'Table 10 - Rooftop' },
  { id: 11, qr_code: 'TBL-011', name: 'Table 11 - Patio' },
  { id: 12, qr_code: 'TBL-012', name: 'Table 12 - Lounge' }
];

async function generateQRCodes() {
  // Create output directory
  const outputDir = './output';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  console.log('🎯 Generating QR Codes for TableTalk Restaurant...\n');

  let htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TableTalk - QR Codes for Tables</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f8f9fa;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .header h1 {
            color: #212529;
            margin-bottom: 10px;
        }
        .header p {
            color: #6c757d;
            margin: 0;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            max-width: 1200px;
            margin: 0 auto;
        }
        .qr-card {
            background: white;
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            transition: transform 0.2s;
        }
        .qr-card:hover {
            transform: translateY(-2px);
        }
        .qr-image {
            width: 200px;
            height: 200px;
            margin: 0 auto 20px;
            border: 1px solid #e9ecef;
            border-radius: 8px;
        }
        .table-name {
            font-size: 18px;
            font-weight: 600;
            color: #212529;
            margin-bottom: 8px;
        }
        .table-code {
            font-size: 14px;
            color: #6c757d;
            font-family: 'Courier New', monospace;
            background: #f8f9fa;
            padding: 4px 8px;
            border-radius: 4px;
            display: inline-block;
            margin-bottom: 12px;
        }
        .table-url {
            font-size: 12px;
            color: #6c757d;
            word-break: break-all;
            background: #f8f9fa;
            padding: 8px;
            border-radius: 4px;
            margin-top: 8px;
        }
        .instructions {
            background: white;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 30px;
            max-width: 800px;
            margin-left: auto;
            margin-right: auto;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .instructions h3 {
            color: #212529;
            margin-top: 0;
        }
        .usage-options {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-top: 15px;
        }
        .usage-option {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
        }
        .usage-option h4 {
            margin-top: 0;
            color: #495057;
        }
        @media print {
            .instructions { display: none; }
            .grid { grid-template-columns: repeat(2, 1fr); }
            .qr-card { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🍽️ TableTalk Restaurant</h1>
        <p>QR Codes untuk Semua Meja</p>
    </div>

    <div class="instructions">
        <h3>📱 Cara Penggunaan QR Code</h3>
        <div class="usage-options">
            <div class="usage-option">
                <h4>🔗 Scan Langsung dari Camera</h4>
                <p>Customer scan QR code dengan camera HP → langsung ke session table</p>
            </div>
            <div class="usage-option">
                <h4>📱 Scan dari Dalam App</h4>
                <p>Customer buka website → klik "Scan QR Code" → scan table code</p>
            </div>
        </div>
    </div>

    <div class="grid">
`;

  for (const table of tables) {
    try {
      // Generate URL yang langsung ke session dengan table code
      const tableUrl = `${BASE_URL}/session/${table.qr_code}`;
      
      // Generate QR code as Data URL
      const qrDataUrl = await QRCode.toDataURL(tableUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#212529',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });

      // Save individual PNG file
      const filename = `table_${table.id}_${table.qr_code}.png`;
      const buffer = await QRCode.toBuffer(tableUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#212529',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
      
      fs.writeFileSync(path.join(outputDir, filename), buffer);

      // Add to HTML
      htmlContent += `
        <div class="qr-card">
            <img src="${qrDataUrl}" alt="QR Code for ${table.name}" class="qr-image">
            <div class="table-name">${table.name}</div>
            <div class="table-code">${table.qr_code}</div>
            <div class="table-url">${tableUrl}</div>
        </div>
      `;

      console.log(`✅ Generated QR Code for ${table.name} (${table.qr_code})`);
    } catch (error) {
      console.error(`❌ Error generating QR for ${table.name}:`, error);
    }
  }

  htmlContent += `
    </div>
</body>
</html>`;

  // Save HTML file
  fs.writeFileSync(path.join(outputDir, 'qr-codes-preview.html'), htmlContent);

  console.log('\n🎉 QR Code generation completed!');
  console.log(`📁 Files saved in: ${path.resolve(outputDir)}`);
  console.log(`🌐 Preview: ${path.resolve(outputDir, 'qr-codes-preview.html')}`);
  console.log(`\n💡 Usage:`);
  console.log(`   1. Print QR codes dan tempatkan di meja`);
  console.log(`   2. Customer scan langsung → ke ${BASE_URL}/session/{table_code}`);
  console.log(`   3. Atau customer scan dari dalam app → deteksi table code`);
}

generateQRCodes().catch(console.error);
