using OrbitBoard.Api.Models;

namespace OrbitBoard.Api.DTOs;

public sealed record ProjectResponse(
    Guid Id,
    string Name,
    string Description,
    ProjectStatus Status,
    DateOnly StartDate,
    DateOnly? DueDate,
    Guid OwnerId,
    string OwnerName,
    int TotalTasks,
    int CompletedTasks,
    DateTimeOffset CreatedAt);

public sealed record WorkItemResponse(
    Guid Id,
    Guid ProjectId,
    string ProjectName,
    string Title,
    string Description,
    WorkItemStatus Status,
    WorkItemPriority Priority,
    Guid? AssigneeId,
    string? AssigneeName,
    DateOnly? DueDate,
    int EstimatedHours,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);

public sealed record DashboardResponse(
    int TotalProjects,
    int ActiveProjects,
    int TotalTasks,
    int CompletedTasks,
    int OverdueTasks,
    IReadOnlyList<WorkItemResponse> RecentTasks,
    IReadOnlyDictionary<string, int> TasksByStatus);
