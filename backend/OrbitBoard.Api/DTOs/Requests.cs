using System.ComponentModel.DataAnnotations;
using OrbitBoard.Api.Models;

namespace OrbitBoard.Api.DTOs;

public sealed class CreateProjectRequest
{
    [Required, StringLength(80, MinimumLength = 3)]
    public string Name { get; init; } = string.Empty;

    [Required, StringLength(500, MinimumLength = 10)]
    public string Description { get; init; } = string.Empty;

    public ProjectStatus Status { get; init; } = ProjectStatus.Planning;

    public DateOnly StartDate { get; init; } = DateOnly.FromDateTime(DateTime.UtcNow);

    public DateOnly? DueDate { get; init; }

    [Required]
    public Guid OwnerId { get; init; }
}

public sealed class UpdateProjectRequest
{
    [Required, StringLength(80, MinimumLength = 3)]
    public string Name { get; init; } = string.Empty;

    [Required, StringLength(500, MinimumLength = 10)]
    public string Description { get; init; } = string.Empty;

    public ProjectStatus Status { get; init; }

    public DateOnly StartDate { get; init; }

    public DateOnly? DueDate { get; init; }

    [Required]
    public Guid OwnerId { get; init; }
}

public sealed class CreateWorkItemRequest
{
    [Required]
    public Guid ProjectId { get; init; }

    [Required, StringLength(120, MinimumLength = 3)]
    public string Title { get; init; } = string.Empty;

    [Required, StringLength(800, MinimumLength = 5)]
    public string Description { get; init; } = string.Empty;

    public WorkItemStatus Status { get; init; } = WorkItemStatus.Backlog;

    public WorkItemPriority Priority { get; init; } = WorkItemPriority.Medium;

    public Guid? AssigneeId { get; init; }

    public DateOnly? DueDate { get; init; }

    [Range(1, 200)]
    public int EstimatedHours { get; init; } = 1;
}

public sealed class UpdateWorkItemRequest
{
    [Required]
    public Guid ProjectId { get; init; }

    [Required, StringLength(120, MinimumLength = 3)]
    public string Title { get; init; } = string.Empty;

    [Required, StringLength(800, MinimumLength = 5)]
    public string Description { get; init; } = string.Empty;

    public WorkItemStatus Status { get; init; }

    public WorkItemPriority Priority { get; init; }

    public Guid? AssigneeId { get; init; }

    public DateOnly? DueDate { get; init; }

    [Range(1, 200)]
    public int EstimatedHours { get; init; }
}

public sealed class ChangeWorkItemStatusRequest
{
    public WorkItemStatus Status { get; init; }
}

public sealed class CreateTeamMemberRequest
{
    [Required, StringLength(80, MinimumLength = 3)]
    public string Name { get; init; } = string.Empty;

    [Required, StringLength(60, MinimumLength = 3)]
    public string Role { get; init; } = string.Empty;

    [Required, EmailAddress, StringLength(120)]
    public string Email { get; init; } = string.Empty;
}

public sealed class MoveWorkItemRequest
{
    public WorkItemStatus Status { get; init; }

    [Range(0, int.MaxValue)]
    public int Position { get; init; }
}
