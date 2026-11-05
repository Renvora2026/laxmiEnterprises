const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'laxmi_enterprises_mobile', 'lib', 'screens', 'splash_screen.dart');
let file = fs.readFileSync(filePath, 'utf8');

const target = `              // Corporate Architectural Logo Emblem
              Container(
                width: 90,
                height: 90,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF005BB5), Color(0xFF003870)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(22),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF005BB5).withValues(alpha: 0.4),
                      blurRadius: 24,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: const Center(
                  child: Text(
                    'L',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 50,
                      fontWeight: FontWeight.w900,
                      fontFamily: 'serif',
                    ),
                  ),
                ),
              ),`;

const replacement = `              // Corporate Laxmi Enterprises Logo Emblem
              Container(
                width: 110,
                height: 110,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF005BB5).withValues(alpha: 0.35),
                      blurRadius: 28,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(16),
                  child: Image.asset(
                    'assets/images/logo.png',
                    fit: BoxFit.contain,
                    errorBuilder: (context, error, stackTrace) {
                      return Container(
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFF005BB5), Color(0xFF003870)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: const Center(
                          child: Text(
                            'L',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 50,
                              fontWeight: FontWeight.w900,
                              fontFamily: 'serif',
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ),`;

// Normalize CRLF to LF for matching
const normFile = file.replace(/\r\n/g, '\n');
const normTarget = target.replace(/\r\n/g, '\n');
const normReplacement = replacement.replace(/\r\n/g, '\n');

if (normFile.includes(normTarget)) {
  const updated = normFile.replace(normTarget, normReplacement);
  fs.writeFileSync(filePath, updated, 'utf8');
  console.log('Successfully updated splash_screen.dart');
} else {
  console.log('Target not found in splash_screen.dart');
}
