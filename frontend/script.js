const fs = require('fs'); const content = fs.readFileSync('error.html', 'utf16le'); console.log(content.match(/INVALID_CLIENT[^<]*/i)); console.log(content.match(/ILLEGAL_REDIRECT_URI[^<]*/i));
