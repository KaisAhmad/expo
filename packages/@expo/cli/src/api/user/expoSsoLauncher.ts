import openBrowserAsync from 'better-opn';
import http from 'http';
import { Socket } from 'node:net';
import querystring from 'querystring';

export default (options: {
  expoWebsiteUrl: string;
  serverPort: number;
}): { executeAuthFlow: () => Promise<string> } => {
  const { expoWebsiteUrl, serverPort } = options;
  if (!expoWebsiteUrl || !serverPort) {
    throw new Error('Expo website URL and localserver port are required.');
  }
  const scheme = 'http';
  const hostname = 'localhost';
  const path = '/auth/callback';
  const redirectUri = `${scheme}://${hostname}:${serverPort}${path}`;

  const buildExpoSsoLoginUrl = (): string => {
    const data = {
      cli_redirect_url: redirectUri,
    };
    const params = querystring.stringify(data);
    const expoSsoLoginUrl = `${expoWebsiteUrl}/sso-login?${params}`;
    return expoSsoLoginUrl;
  };

  // Start server and begin auth flow
  const executeAuthFlow = (): Promise<string> => {
    return new Promise<string>(async (resolve, reject) => {
      const connections = new Set<Socket>();

      const server = http.createServer(
        (request: http.IncomingMessage, response: http.ServerResponse) => {
          try {
            if (!(request.method === 'GET' && request.url?.includes('/auth/callback'))) {
              throw new Error('Unexpected SSO login response');
            }
            const url = new URL(request.url, `http:${request.headers.host}`);
            const sessionSecret = url.searchParams.get('sessionSecret');

            if (!sessionSecret) {
              throw new Error('No session secret returned');
            }
            resolve(sessionSecret);
            response.writeHead(200, { 'Content-Type': 'text/plain' });
            response.write(
              `Thank you, login details will be returned to the CLI. You can now close this tab.`
            );
            response.end();
          } catch (error) {
            reject(error);
          } finally {
            server.close();
            // Ensure that the server shuts down
            for (const connection of connections) {
              connection.destroy();
            }
          }
        }
      );

      server.listen(serverPort, hostname, () => {
        // eslint-disable-next-line no-console
        console.log(`Listening for login response at http://${hostname}:${serverPort}`);
      });

      server.on('connection', (connection) => {
        connections.add(connection);

        connection.on('close', () => {
          connections.delete(connection);
        });
      });

      const authorizeUrl = buildExpoSsoLoginUrl();
      openBrowserAsync(authorizeUrl);
    });
  };

  return {
    executeAuthFlow,
  };
};
