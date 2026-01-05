import { WebSocketServer } from 'ws';
import { getAvatarUrlForStudent } from '../utils/helpers.js';

let wss = null;
const clients = new Set();

/**
 * Setup WebSocket server
 */
export function setupWebSocket(server) {
  wss = new WebSocketServer({ server, path: '/ws/events' });
  
  wss.on('connection', (ws, req) => {
    clients.add(ws);
    console.log('[INFO] WebSocket client connected');
    
    // Send welcome message
    ws.send(JSON.stringify({
      type: 'info',
      message: 'ws_connected'
    }));
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'ack', message: 'ok' }));
          return;
        }
        
        // Handle image recognition via WebSocket
        if (data.img) {
          // This would require face recognition integration
          // For now, just acknowledge
          ws.send(JSON.stringify({ 
            type: 'ack', 
            message: 'Image received (face recognition via WebSocket not fully implemented)' 
          }));
          return;
        }
        
        ws.send(JSON.stringify({ type: 'ack', message: 'ok' }));
      } catch (error) {
        console.error('[ERROR] WebSocket message error:', error);
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: 'Invalid message format' 
        }));
      }
    });
    
    ws.on('close', () => {
      clients.delete(ws);
      console.log('[INFO] WebSocket client disconnected');
    });
    
    ws.on('error', (error) => {
      console.error('[ERROR] WebSocket error:', error);
      clients.delete(ws);
    });
  });
  
  console.log('[INFO] WebSocket server initialized');
}

/**
 * Broadcast presence event to all connected clients
 */
export function broadcastPresence(payload) {
  if (!wss) return;
  
  const message = JSON.stringify({
    type: 'presence',
    payload
  });
  
  console.log('[WS] Broadcasting presence:', payload.student_id, payload.status, 'to', clients.size, 'clients');
  
  clients.forEach(client => {
    if (client.readyState === 1) { // WebSocket.OPEN
      try {
        client.send(message);
      } catch (error) {
        console.error('[ERROR] Failed to send WebSocket message:', error);
        clients.delete(client);
      }
    }
  });
}

// Generic event broadcaster (announcements, messages, leave status, etc.)
export function broadcastEvent(type, payload) {
  if (!wss) return;

  const message = JSON.stringify({ type, payload });
  clients.forEach((client) => {
    if (client.readyState === 1) {
      try {
        client.send(message);
      } catch (error) {
        console.error('[ERROR] Failed to send WebSocket message:', error);
        clients.delete(client);
      }
    }
  });
}

