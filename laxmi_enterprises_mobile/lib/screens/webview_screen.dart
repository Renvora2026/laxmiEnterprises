import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import '../config/app_config.dart';
import 'offline_screen.dart';

class WebViewScreen extends StatefulWidget {
  final String initialUrl;

  const WebViewScreen({super.key, this.initialUrl = AppConfig.initialUrl});

  @override
  State<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> with WidgetsBindingObserver {
  late final WebViewController _controller;
  int _loadingProgress = 0;
  bool _hasError = false;
  bool _isOffline = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _checkConnectivityThenLoad();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  // ── Re-check connectivity when app comes back to foreground ──────────────
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed && _isOffline) {
      _checkConnectivityThenLoad();
    }
  }

  // ── Connectivity pre-flight check ─────────────────────────────────────────
  Future<void> _checkConnectivityThenLoad() async {
    final result = await Connectivity().checkConnectivity();
    final offline = result.contains(ConnectivityResult.none) ||
        result.isEmpty ||
        (result.length == 1 && result.first == ConnectivityResult.none);

    if (mounted) {
      setState(() {
        _isOffline = offline;
        _hasError = false;
      });
    }

    if (!offline) {
      _initWebViewController();
    }
  }

  // ── WebView initialisation ─────────────────────────────────────────────────
  void _initWebViewController() {
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFFF8FAFC))
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (int progress) {
            if (mounted) setState(() => _loadingProgress = progress);
          },
          onPageStarted: (String url) {
            if (mounted) {
              setState(() {
                _hasError = false;
                _isOffline = false;
                _loadingProgress = 10;
              });
            }
          },
          onPageFinished: (String url) {
            if (mounted) setState(() => _loadingProgress = 100);
          },
          onWebResourceError: (WebResourceError error) {
            if (error.isForMainFrame ?? true) {
              if (mounted) {
                setState(() {
                  _hasError = true;
                });
              }
            }
          },
        ),
      );

    // Clear cache on launch so deployed updates are always visible immediately
    if (AppConfig.clearCacheOnLaunch) {
      _controller.clearCache();
      _controller.clearLocalStorage();
    }

    _controller.loadRequest(Uri.parse(widget.initialUrl));
  }

  // ── Reload / Retry ─────────────────────────────────────────────────────────
  Future<void> _reloadWebView() async {
    await _checkConnectivityThenLoad();
    if (!_isOffline && !_hasError) {
      setState(() {
        _hasError = false;
        _loadingProgress = 10;
      });
      await _controller.reload();
    }
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop) return;
        if (!_isOffline && !_hasError && await _controller.canGoBack()) {
          await _controller.goBack();
        } else {
          if (context.mounted) Navigator.of(context).maybePop();
        }
      },
      child: Scaffold(
        backgroundColor: const Color(0xFFF8FAFC),
        body: SafeArea(
          child: _isOffline
              ? OfflineScreen(onRetry: _reloadWebView)
              : _hasError
                  ? OfflineScreen(onRetry: _reloadWebView)
                  : Stack(
                      children: [
                        // ── Main WebView ──────────────────────────────────
                        WebViewWidget(controller: _controller),

                        // ── Top loading bar ───────────────────────────────
                        if (_loadingProgress < 100)
                          Positioned(
                            top: 0,
                            left: 0,
                            right: 0,
                            child: LinearProgressIndicator(
                              value: _loadingProgress / 100.0,
                              backgroundColor: Colors.transparent,
                              valueColor: const AlwaysStoppedAnimation<Color>(
                                Color(AppConfig.secondaryColorHex),
                              ),
                              minHeight: 3,
                            ),
                          ),

                        // ── Floating Refresh button (replaces broken pull-to-refresh) ──
                        Positioned(
                          bottom: 18,
                          right: 18,
                          child: AnimatedOpacity(
                            opacity: _loadingProgress >= 100 ? 1.0 : 0.0,
                            duration: const Duration(milliseconds: 300),
                            child: FloatingActionButton.small(
                              onPressed: _loadingProgress >= 100 ? _reloadWebView : null,
                              backgroundColor: const Color(AppConfig.primaryColorHex),
                              tooltip: 'Refresh',
                              child: const Icon(Icons.refresh_rounded, color: Colors.white, size: 20),
                            ),
                          ),
                        ),
                      ],
                    ),
        ),
      ),
    );
  }
}
