/// Global Application Configuration for Laxmi Enterprises Flutter WebApp
class AppConfig {
  /// The Web URL for the ERP portal.
  /// - For Android Emulator accessing Vite on host PC: 'http://10.0.2.2:5173'
  /// - For Real Device on same Wi-Fi: Replace with your PC's IP, e.g. 'http://192.168.1.X:5173'
  /// - For Production Deployed Web App: e.g. 'https://erp.laxmienterprises.com'
  static const String initialUrl = 'http://10.0.2.2:5173';

  /// App Name
  static const String appTitle = 'Laxmi Enterprises ERP';

  /// Corporate Brand Colors
  static const int primaryColorHex = 0xFF005BB5; // Sapphire Blue
  static const int secondaryColorHex = 0xFF00B4D8; // Electric Cyan
  static const int accentColorHex = 0xFFD4AF37; // Champagne Gold
  static const int darkCanvasHex = 0xFF090E17; // Midnight Slate
}
