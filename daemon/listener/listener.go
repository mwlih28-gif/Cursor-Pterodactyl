package listener

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strconv"

	"gaming-panel/daemon/docker"

	"github.com/redis/go-redis/v9"
)

type RedisListener struct {
	redisClient  *redis.Client
	dockerClient *docker.Client
	pubsub       *redis.PubSub
}

func NewRedisListener(redisURL string, dockerClient *docker.Client) *RedisListener {
	opt, err := redis.ParseURL(redisURL)
	if err != nil {
		log.Fatalf("Failed to parse Redis URL: %v", err)
	}

	client := redis.NewClient(opt)
	pubsub := client.Subscribe(context.Background(),
		"server:start",
		"server:stop",
		"server:restart",
		"server:backup",
	)

	return &RedisListener{
		redisClient:  client,
		dockerClient: dockerClient,
		pubsub:       pubsub,
	}
}

func (rl *RedisListener) Start(ctx context.Context) {
	ch := rl.pubsub.Channel()

	for {
		select {
		case <-ctx.Done():
			rl.pubsub.Close()
			return

		case msg := <-ch:
			go rl.handleMessage(ctx, msg)
		}
	}
}

func (rl *RedisListener) handleMessage(ctx context.Context, msg *redis.Message) {
	serverID, err := strconv.ParseUint(msg.Payload, 10, 64)
	if err != nil {
		log.Printf("Invalid server ID in message: %s", msg.Payload)
		return
	}

	log.Printf("Received message on channel %s for server %d", msg.Channel, serverID)

	switch msg.Channel {
	case "server:start":
		rl.handleStart(ctx, uint(serverID))
	case "server:stop":
		rl.handleStop(ctx, uint(serverID))
	case "server:restart":
		rl.handleRestart(ctx, uint(serverID))
	case "server:backup":
		rl.handleBackup(ctx, uint(serverID))
	}
}

func (rl *RedisListener) handleStart(ctx context.Context, serverID uint) {
	log.Printf("Starting server %d", serverID)

	// Get container name
	containerName := fmt.Sprintf("game-server-%d", serverID)

	// Check if container exists
	containers, err := rl.dockerClient.ListContainers(ctx, map[string]string{
		"server.id": fmt.Sprintf("%d", serverID),
	})

	if err != nil {
		log.Printf("Error listing containers: %v", err)
		return
	}

	if len(containers) > 0 {
		// Container exists, start it
		err = rl.dockerClient.StartContainer(ctx, containers[0].ID)
		if err != nil {
			log.Printf("Error starting container: %v", err)
			return
		}
		log.Printf("Container %s started", containers[0].ID)
	} else {
		log.Printf("Container not found for server %d. Need to create it first.", serverID)
		// TODO: Create container from server configuration
	}

	// Publish status update
	statusUpdate := map[string]interface{}{
		"server_id": serverID,
		"status":    "online",
	}
	data, _ := json.Marshal(statusUpdate)
	rl.redisClient.Publish(ctx, "server:status", string(data))
}

func (rl *RedisListener) handleStop(ctx context.Context, serverID uint) {
	log.Printf("Stopping server %d", serverID)

	containers, err := rl.dockerClient.ListContainers(ctx, map[string]string{
		"server.id": fmt.Sprintf("%d", serverID),
	})

	if err != nil || len(containers) == 0 {
		log.Printf("Container not found for server %d", serverID)
		return
	}

	timeout := 10
	err = rl.dockerClient.StopContainer(ctx, containers[0].ID, &timeout)
	if err != nil {
		log.Printf("Error stopping container: %v", err)
		return
	}

	log.Printf("Container %s stopped", containers[0].ID)

	statusUpdate := map[string]interface{}{
		"server_id": serverID,
		"status":    "offline",
	}
	data, _ := json.Marshal(statusUpdate)
	rl.redisClient.Publish(ctx, "server:status", string(data))
}

func (rl *RedisListener) handleRestart(ctx context.Context, serverID uint) {
	log.Printf("Restarting server %d", serverID)

	containers, err := rl.dockerClient.ListContainers(ctx, map[string]string{
		"server.id": fmt.Sprintf("%d", serverID),
	})

	if err != nil || len(containers) == 0 {
		log.Printf("Container not found for server %d", serverID)
		return
	}

	timeout := 10
	err = rl.dockerClient.RestartContainer(ctx, containers[0].ID, &timeout)
	if err != nil {
		log.Printf("Error restarting container: %v", err)
		return
	}

	log.Printf("Container %s restarted", containers[0].ID)

	statusUpdate := map[string]interface{}{
		"server_id": serverID,
		"status":    "online",
	}
	data, _ := json.Marshal(statusUpdate)
	rl.redisClient.Publish(ctx, "server:status", string(data))
}

func (rl *RedisListener) handleBackup(ctx context.Context, serverID uint) {
	log.Printf("Creating backup for server %d", serverID)
	// TODO: Implement backup logic
	// This would typically involve:
	// 1. Stop the server (if needed)
	// 2. Create a tar archive of the server data directory
	// 3. Upload to cloud storage (S3, etc.)
	// 4. Restart the server (if it was stopped)
}
