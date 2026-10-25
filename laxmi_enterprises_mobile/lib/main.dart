import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'config/app_config.dart';
import 'screens/splash_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  // Set system UI overlay style
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Color(AppConfig.darkCanvasHex),
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );

  runApp(const LaxmiEnterprisesApp());
}

class LaxmiEnterprisesApp extends StatelessWidget {
  const LaxmiEnterprisesApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: AppConfig.appTitle,
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        primaryColor: const Color(AppConfig.primaryColorHex),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(AppConfig.primaryColorHex),
          primary: const Color(AppConfig.primaryColorHex),
          secondary: const Color(AppConfig.secondaryColorHex),
        ),
        scaffoldBackgroundColor: const Color(0xFFF8FAFC),
      ),
      home: const SplashScreen(),
    );
  }
}
