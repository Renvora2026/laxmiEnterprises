/// Global Application Configuration for Laxmi Enterprises Flutter WebApp
class AppConfig {
  /// The Web URL for the ERP portal.
  ///
  /// 🔴 IMPORTANT: Change this to your deployed URL before building for production.
  /// - Dev / Emulator:   'http://10.0.2.2:5173'
  /// - Dev / Real phone: 'http://192.168.X.X:5173'  (your PC's local IP)
  /// - Production:       'https://erp.laxmienterprises.com'  ← set this before release
  static const String initialUrl = 'http://10.0.2.2:5173';

  /// Cache-busting: when true the WebView clears its disk cache on every launch
  /// so users always see the latest deployed website immediately.
  static const bool clearCacheOnLaunch = true;

  /// App Name
  static const String appTitle = 'Laxmi Enterprises ERP';

  /// Corporate Brand Colors
  static const int primaryColorHex = 0xFF005BB5; // Sapphire Blue
  static const int secondaryColorHex = 0xFF00B4D8; // Electric Cyan
  static const int accentColorHex = 0xFFD4AF37; // Champagne Gold
  static const int darkCanvasHex = 0xFF090E17; // Midnight Slate
}
