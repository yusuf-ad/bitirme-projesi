# Camera Setup with React Native Vision Camera

This project uses [react-native-vision-camera](https://github.com/mrousavy/react-native-vision-camera) for camera functionality.

## Installation

The package has been installed and configured with:

```bash
npx expo install react-native-vision-camera
```

## Configuration

### Permissions

The following permissions have been added to `app.json`:

#### iOS

```json
"infoPlist": {
  "NSCameraUsageDescription": "This app needs access to your camera to scan food items for your pantry.",
  "NSMicrophoneUsageDescription": "This app needs access to your microphone for camera functionality."
}
```

#### Android

```json
"permissions": [
  "CAMERA"
]
```

### Plugin Configuration

The plugin is configured in `app.json`:

```json
[
  "react-native-vision-camera",
  {
    "cameraPermissionText": "This app needs access to your camera to scan food items for your pantry.",
    "enableMicrophonePermission": true,
    "microphonePermissionText": "This app needs access to your microphone for camera functionality."
  }
]
```

## Features Implemented

### Camera Component (`app/(add)/camera.tsx`)

The camera component includes:

- **Real-time camera preview** - Live camera feed within a styled frame
- **Photo capture** - Take photos with the shutter button
- **Flash control** - Toggle flash on/off
- **Permission handling** - Automatically requests camera permissions
- **Loading states** - Shows loading indicators while permissions are requested or camera loads
- **Back navigation** - Close button to go back

### Usage

```typescript
// The camera is automatically active when the component mounts
// Take a photo by pressing the shutter button
const takePhoto = async () => {
  if (camera.current) {
    const photo = await camera.current.takePhoto({
      flash,
      enableShutterSound: true,
    });
    console.log("Photo taken:", photo.path);
    // Process the photo here
  }
};
```

## Next Steps

To complete the camera functionality, you may want to:

1. **Create a photo preview screen** - Show the captured photo and allow users to confirm or retake
2. **Image processing** - Add image recognition or processing for food items
3. **Save photos** - Implement saving photos to the device or uploading to a server
4. **Barcode scanning** - Use the `useCodeScanner` hook to scan barcodes
5. **Add photo filters** - Apply filters before or after capture

### Example: Barcode Scanner

```typescript
const codeScanner = useCodeScanner({
  codeTypes: ["qr", "ean-13"],
  onCodeScanned: (codes) => {
    console.log(`Scanned ${codes.length} codes!`);
  },
});

<Camera
  ref={camera}
  codeScanner={codeScanner}
  // ... other props
/>;
```

## Building for Production

After making changes to native configuration (permissions, plugins), you need to rebuild:

```bash
# For iOS
npx expo run:ios

# For Android
npx expo run:android
```

## Troubleshooting

### Camera not showing

- Make sure permissions are granted
- Check that the device is physical (camera doesn't work in simulator/emulator)
- Verify that `isActive` is set to `true`

### Permission denied

- Uninstall and reinstall the app to trigger permission request again
- Check system settings to ensure camera permission is granted

### Build errors

- Run `npx expo prebuild --clean` to regenerate native projects
- Make sure all native dependencies are properly linked

## Documentation

For more information, visit the official documentation:

- [React Native Vision Camera Docs](https://react-native-vision-camera.com/)
- [API Reference](https://react-native-vision-camera.com/docs/api)
