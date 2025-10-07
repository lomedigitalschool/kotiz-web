export default {
  server: {
    port: 3000,
    middleware: [
      (req, res, next) => {
        // Générer un nonce pour chaque requête
        res.setHeader('Content-Security-Policy', `
          default-src 'self';
          script-src 'self' 'nonce-${res.locals.nonce}' https://www.google.com/recaptcha/;
          style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
          img-src 'self' data: https:;
          connect-src 'self' ws: wss:;
          font-src 'self' data: https://fonts.gstatic.com;
          object-src 'none';
          media-src 'self';
          frame-src 'self' https://www.google.com/;
        `.replace(/\s+/g, ' '));
        next();
      }
    ]
  },
  build: {
    outDir: 'build'
  }
}