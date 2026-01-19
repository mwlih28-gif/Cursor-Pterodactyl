package hub

import (
	"encoding/json"
	"log"

	"github.com/gofiber/websocket/v2"
)

type Hub struct {
	clients      map[*websocket.Conn]*Client
	serverRooms  map[string]map[*websocket.Conn]*Client
	broadcast    chan []byte
	register     chan *Client
	unregister   chan *Client
}

type Client struct {
	conn     *websocket.Conn
	hub      *Hub
	send     chan []byte
	serverID string
}

func NewHub() *Hub {
	return &Hub{
		clients:     make(map[*websocket.Conn]*Client),
		serverRooms: make(map[string]map[*websocket.Conn]*Client),
		broadcast:   make(chan []byte),
		register:    make(chan *Client),
		unregister:  make(chan *Client),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.clients[client.conn] = client
			if client.serverID != "" {
				if h.serverRooms[client.serverID] == nil {
					h.serverRooms[client.serverID] = make(map[*websocket.Conn]*Client)
				}
				h.serverRooms[client.serverID][client.conn] = client
			}
			log.Printf("Client connected. Total clients: %d", len(h.clients))

		case client := <-h.unregister:
			if _, ok := h.clients[client.conn]; ok {
				delete(h.clients, client.conn)
				close(client.send)
				
				if client.serverID != "" && h.serverRooms[client.serverID] != nil {
					delete(h.serverRooms[client.serverID], client.conn)
				}
			}
			log.Printf("Client disconnected. Total clients: %d", len(h.clients))

		case message := <-h.broadcast:
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
		}
	}
}

func (h *Hub) HandleConnection(c *websocket.Conn) {
	client := &Client{
		conn: c,
		hub:  h,
		send: make(chan []byte, 256),
	}

	h.register <- client

	go client.writePump()
	go client.readPump()
}

func (h *Hub) BroadcastToServer(serverUUID string, message interface{}) {
	data, err := json.Marshal(message)
	if err != nil {
		log.Printf("Error marshaling message: %v", err)
		return
	}

	if room, ok := h.serverRooms[serverUUID]; ok {
		for _, client := range room {
			select {
			case client.send <- data:
			default:
				close(client.send)
				delete(h.clients, client.conn)
				if h.serverRooms[serverUUID] != nil {
					delete(h.serverRooms[serverUUID], client.conn)
				}
			}
		}
	}
}

func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}

		// Parse message to get server UUID
		var msg map[string]interface{}
		if err := json.Unmarshal(message, &msg); err == nil {
			if serverID, ok := msg["server_id"].(string); ok {
				c.serverID = serverID
				// Re-register with server room
				c.hub.unregister <- c
				c.hub.register <- c
			}
		}

		c.hub.broadcast <- message
	}
}

func (c *Client) writePump() {
	defer c.conn.Close()

	for {
		select {
		case message, ok := <-c.send:
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			if err := c.conn.WriteMessage(websocket.TextMessage, message); err != nil {
				log.Printf("WebSocket write error: %v", err)
				return
			}
		}
	}
}
