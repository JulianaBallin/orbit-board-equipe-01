namespace OrbitBoard.Api.Models;

public enum ProjectStatus
{
    Planning,
    Active,
    OnHold,
    Completed
}

public enum WorkItemStatus
{
    Backlog,
    InProgress,
    Review,
    Done
}

public enum WorkItemPriority
{
    Low,
    Medium,
    High,
    Critical
}

public sealed class Project
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public required string Name { get; set; }
    public required string Description { get; set; }
    public ProjectStatus Status { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly? DueDate { get; set; }
    public Guid OwnerId { get; set; }
    public DateTimeOffset CreatedAt { get; init; } = DateTimeOffset.UtcNow;
}

public sealed class WorkItem
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public Guid ProjectId { get; set; }
    public required string Title { get; set; }
    public required string Description { get; set; }
    public WorkItemStatus Status { get; set; }
    public WorkItemPriority Priority { get; set; }
    public Guid? AssigneeId { get; set; }
    public DateOnly? DueDate { get; set; }
    public int EstimatedHours { get; set; }
    public DateTimeOffset CreatedAt { get; init; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}

public sealed class TeamMember
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public required string Name { get; set; }
    public required string Role { get; set; }
    public required string Email { get; set; }
    public string Initials { get; set; } = string.Empty;
}

public sealed class TaskStatusHistoryEntry
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public Guid WorkItemId { get; set; }
    public WorkItemStatus? FromStatus { get; set; }
    public WorkItemStatus ToStatus { get; set; }
    public DateTimeOffset ChangedAt { get; init; } = DateTimeOffset.UtcNow;
}
