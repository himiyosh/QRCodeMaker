# QR Code Generator & Reader

This project is a web-based application for generating and decoding QR codes. Users can input text to generate QR codes or upload/drag-and-drop images to decode QR codes.

## Features

- **QR Code Generation**: Input text to generate a QR code.
- **QR Code Decoding**: Upload or drag-and-drop an image to decode a QR code.
- **Multi-language Support**: Supports both English and Japanese.
- **Responsive Design**: Optimized for mobile and desktop devices.

### QR Code Generation

1. Enter text in the input field.
2. Click the "Generate QR Code" button.
3. The generated QR code will appear in the canvas. You can drag it to the decoding area.

### QR Code Decoding

1. Drag and drop an image into the "Drag & drop an image here" area.
2. Alternatively, click the "Or select a file" button to upload an image.
3. The decoded result will be displayed below.

## Project Structure

```
QRCodeMaker/
├── Index.html
├── README.md
└── assets/ (if applicable, for images or additional resources)
```

## Acknowledgments

- QR code generation is powered by [QRCode.js](https://github.com/soldair/node-qrcode).
- QR code decoding is powered by [jsQR](https://github.com/cozmo/jsQR).