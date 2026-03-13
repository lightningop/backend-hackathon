const QRCode = require('qrcode');

const generateQR = async (caseId) => {
  const url = `${process.env.CLIENT_URL}/lookup/${caseId}`;
  try {
    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 256,
      margin: 2,
      color: { dark: '#021B2E', light: '#FFFFFF' }
    });
    return qrDataUrl;
  } catch (err) {
    console.error('QR generation error:', err);
    return '';
  }
};

module.exports = { generateQR };
