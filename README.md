# QR Code Generator & Reader

This project is a web-based application for generating and decoding QR codes. Users can input text to generate QR codes or upload/drag-and-drop images to decode QR codes.

## Features

- **QR Code Generation**: Input text to generate a QR code.
- **QR Code Decoding**: Upload or drag-and-drop an image to decode a QR code.
- **Multi-language Support**: Supports both English and Japanese.
- **Responsive Design**: Optimized for mobile and desktop devices.

## Technologies Used

- HTML5
- CSS3
- JavaScript
- [QRCode.js](https://github.com/soldair/node-qrcode)
- [jsQR](https://github.com/cozmo/jsQR)

## How to Use

1. Clone this repository:

   ```bash
   git clone https://github.com/your-username/QRCodeMaker.git
   ```

2. Navigate to the project folder:

   ```bash
   cd QRCodeMaker
   ```

3. Open `Index.html` in your browser.

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

## License

This project is licensed under the [MIT License](LICENSE).

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## Acknowledgments

- QR code generation is powered by [QRCode.js](https://github.com/soldair/node-qrcode).
- QR code decoding is powered by [jsQR](https://github.com/cozmo/jsQR).