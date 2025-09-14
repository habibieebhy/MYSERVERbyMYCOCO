import { Express, Request, Response } from 'express';

export default function setupLogoutAuthRoutes(app: Express) {
   // POST /api/auth/logout
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    try {
      // If you were using server-side sessions, you would destroy them here:
      // req.session.destroy(err => { ... });

      console.log('User logged out successfully from the backend.');
      
      res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ success: false, error: 'An error occurred during logout.' });
    }
  });

  console.log('✅ Auth (logout) endpoint setup complete');
}

// IMPORTANT: Remember to import and call setupAuthRoutes(app); in your main server entry file (e.g., index.ts or server.ts) to register this route.
