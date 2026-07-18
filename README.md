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
├── index.html
├── README.md
└── .github/
    ├── agents/QRCodeMakerAgent.agent.md
    └── skills/hallmark/
```

## Copilot customization

Select `QRCodeMakerAgent` in GitHub Copilot to invoke the project's primary
agent. UI improvement, read-only audit, explicit redesign, and design study
requests are routed through the vendored Hallmark 1.1.0 skill while QR
correctness, local processing, accessibility, i18n, and repository rules remain
authoritative.

## Acknowledgments

- QR code generation is powered by [QRCode.js](https://github.com/soldair/node-qrcode).
- QR code decoding is powered by [jsQR](https://github.com/cozmo/jsQR).
- UI design workflows use [Hallmark](https://github.com/nutlope/hallmark),
  vendored under its MIT license.
