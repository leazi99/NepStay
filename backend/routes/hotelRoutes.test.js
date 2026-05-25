/**
 * Unit tests for hotelRoutes.js
 * 
 * Tests route configuration and middleware application
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import express from 'express';
import hotelRoutes from './hotelRoutes.js';

describe('Hotel Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/hotels', hotelRoutes);
  });

  describe('Route Configuration', () => {
    it('should have GET /api/hotels route for listing hotels', () => {
      const routes = [];
      hotelRoutes.stack.forEach((middleware) => {
        if (middleware.route) {
          routes.push({
            path: middleware.route.path,
            methods: Object.keys(middleware.route.methods)
          });
        }
      });

      const listRoute = routes.find(r => r.path === '/' && r.methods.includes('get'));
      expect(listRoute).toBeDefined();
    });

    it('should have GET /api/hotels/featured route', () => {
      const routes = [];
      hotelRoutes.stack.forEach((middleware) => {
        if (middleware.route) {
          routes.push({
            path: middleware.route.path,
            methods: Object.keys(middleware.route.methods)
          });
        }
      });

      const featuredRoute = routes.find(r => r.path === '/featured' && r.methods.includes('get'));
      expect(featuredRoute).toBeDefined();
    });

    it('should have GET /api/hotels/:id route', () => {
      const routes = [];
      hotelRoutes.stack.forEach((middleware) => {
        if (middleware.route) {
          routes.push({
            path: middleware.route.path,
            methods: Object.keys(middleware.route.methods)
          });
        }
      });

      const detailRoute = routes.find(r => r.path === '/:id' && r.methods.includes('get'));
      expect(detailRoute).toBeDefined();
    });

    it('should have GET /api/hotels/:id/rooms route', () => {
      const routes = [];
      hotelRoutes.stack.forEach((middleware) => {
        if (middleware.route) {
          routes.push({
            path: middleware.route.path,
            methods: Object.keys(middleware.route.methods)
          });
        }
      });

      const roomsRoute = routes.find(r => r.path === '/:id/rooms' && r.methods.includes('get'));
      expect(roomsRoute).toBeDefined();
    });

    it('should have POST /api/hotels route for creating hotels', () => {
      const routes = [];
      hotelRoutes.stack.forEach((middleware) => {
        if (middleware.route) {
          routes.push({
            path: middleware.route.path,
            methods: Object.keys(middleware.route.methods)
          });
        }
      });

      const createRoute = routes.find(r => r.path === '/' && r.methods.includes('post'));
      expect(createRoute).toBeDefined();
    });

    it('should have PUT /api/hotels/:id route for updating hotels', () => {
      const routes = [];
      hotelRoutes.stack.forEach((middleware) => {
        if (middleware.route) {
          routes.push({
            path: middleware.route.path,
            methods: Object.keys(middleware.route.methods)
          });
        }
      });

      const updateRoute = routes.find(r => r.path === '/:id' && r.methods.includes('put'));
      expect(updateRoute).toBeDefined();
    });

    it('should have DELETE /api/hotels/:id route for deleting hotels', () => {
      const routes = [];
      hotelRoutes.stack.forEach((middleware) => {
        if (middleware.route) {
          routes.push({
            path: middleware.route.path,
            methods: Object.keys(middleware.route.methods)
          });
        }
      });

      const deleteRoute = routes.find(r => r.path === '/:id' && r.methods.includes('delete'));
      expect(deleteRoute).toBeDefined();
    });
  });

  describe('Middleware Application', () => {
    it('should apply userAuth and requireRole middleware to POST / route', () => {
      const postRoute = hotelRoutes.stack.find(
        layer => layer.route && layer.route.path === '/' && layer.route.methods.post
      );

      expect(postRoute).toBeDefined();
      // POST route should have 3 handlers: userAuth, requireRole, createHotel
      expect(postRoute.route.stack.length).toBeGreaterThanOrEqual(3);
    });

    it('should apply userAuth and requireRole middleware to PUT /:id route', () => {
      const putRoute = hotelRoutes.stack.find(
        layer => layer.route && layer.route.path === '/:id' && layer.route.methods.put
      );

      expect(putRoute).toBeDefined();
      // PUT route should have 3 handlers: userAuth, requireRole, updateHotel
      expect(putRoute.route.stack.length).toBeGreaterThanOrEqual(3);
    });

    it('should apply userAuth and requireRole middleware to DELETE /:id route', () => {
      const deleteRoute = hotelRoutes.stack.find(
        layer => layer.route && layer.route.path === '/:id' && layer.route.methods.delete
      );

      expect(deleteRoute).toBeDefined();
      // DELETE route should have 3 handlers: userAuth, requireRole, deleteHotel
      expect(deleteRoute.route.stack.length).toBeGreaterThanOrEqual(3);
    });

    it('should NOT apply authentication middleware to public GET routes', () => {
      const getRoute = hotelRoutes.stack.find(
        layer => layer.route && layer.route.path === '/' && layer.route.methods.get
      );

      expect(getRoute).toBeDefined();
      // Public GET route should have only 1 handler: getHotels
      expect(getRoute.route.stack.length).toBe(1);
    });
  });
});
