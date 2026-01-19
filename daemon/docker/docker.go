package docker

import (
	"context"
	"fmt"
	"io"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/filters"
	"github.com/docker/docker/client"
)

type Client struct {
	cli *client.Client
}

func NewClient() (*Client, error) {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return nil, fmt.Errorf("failed to create Docker client: %w", err)
	}

	return &Client{cli: cli}, nil
}

func (c *Client) StartContainer(ctx context.Context, containerID string) error {
	return c.cli.ContainerStart(ctx, containerID, types.ContainerStartOptions{})
}

func (c *Client) StopContainer(ctx context.Context, containerID string, timeout *int) error {
	if timeout == nil {
		defaultTimeout := 10
		timeout = &defaultTimeout
	}
	return c.cli.ContainerStop(ctx, containerID, container.StopOptions{Timeout: timeout})
}

func (c *Client) RestartContainer(ctx context.Context, containerID string, timeout *int) error {
	return c.cli.ContainerRestart(ctx, containerID, container.StopOptions{Timeout: timeout})
}

func (c *Client) CreateContainer(ctx context.Context, config *container.Config, hostConfig *container.HostConfig, name string) (string, error) {
	resp, err := c.cli.ContainerCreate(ctx, config, hostConfig, nil, nil, name)
	if err != nil {
		return "", fmt.Errorf("failed to create container: %w", err)
	}
	return resp.ID, nil
}

func (c *Client) RemoveContainer(ctx context.Context, containerID string, force bool) error {
	return c.cli.ContainerRemove(ctx, containerID, types.ContainerRemoveOptions{Force: force})
}

func (c *Client) GetContainerStats(ctx context.Context, containerID string, stream bool) (types.ContainerStats, error) {
	return c.cli.ContainerStats(ctx, containerID, stream)
}

func (c *Client) GetContainerLogs(ctx context.Context, containerID string, options types.ContainerLogsOptions) (io.ReadCloser, error) {
	return c.cli.ContainerLogs(ctx, containerID, options)
}

func (c *Client) ListContainers(ctx context.Context, labelFilter map[string]string) ([]types.Container, error) {
	filterArgs := filters.NewArgs()
	for key, value := range labelFilter {
		filterArgs.Add("label", fmt.Sprintf("%s=%s", key, value))
	}

	return c.cli.ContainerList(ctx, types.ContainerListOptions{
		Filters: filterArgs,
	})
}

func (c *Client) InspectContainer(ctx context.Context, containerID string) (types.ContainerJSON, error) {
	return c.cli.ContainerInspect(ctx, containerID)
}
