import { readFileSync } from 'fs';
import { resolve } from 'path';
import YAML from 'yaml';

const swaggerHTML = (spec) => `
<!DOCTYPE html>
<html>
<head>
  <title>API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.0.1/swagger-ui.css" />
  <style>
    html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin:0; background: #fafafa; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.0.1/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: '',
      spec: ${JSON.stringify(spec)},
      dom_id: '#swagger-ui',
      deepLinking: true,
      presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIBundle.presets.standalone
      ],
      plugins: [
        SwaggerUIBundle.plugins.DownloadUrl
      ],
      layout: "StandaloneLayout"
    });
  </script>
</body>
</html>
`;

export default async function handler(req, res) {
  try {
    // Read OpenAPI spec from the server directory
    const openapiPath = resolve(process.cwd(), 'apps/server/openapi.yaml');
    const openapiContent = readFileSync(openapiPath, 'utf8');
    const openapiDoc = YAML.parse(openapiContent);
    
    // Update server URL for production
    if (req.headers.host) {
      openapiDoc.servers = [{ url: `https://${req.headers.host}` }];
    }
    
    res.setHeader('Content-Type', 'text/html');
    res.send(swaggerHTML(openapiDoc));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Documentation not available' });
  }
}
