using OrbitBoard.Api.DTOs;
using OrbitBoard.Api.Exceptions;
using OrbitBoard.Api.Models;
using OrbitBoard.Api.Services;
using Xunit;

namespace OrbitBoard.Api.Tests;

public sealed class WorkspaceServiceTests
{
    private const string SeededProjectName = "Portal de Aprendizagem";

    private readonly WorkspaceService _service = new();

    private Guid AnyMemberId() => _service.GetTeamMembers().First().Id;

    [Fact]
    public void CreateProject_WithValidData_ResolvesOwnerAndPersists()
    {
        var created = _service.CreateProject(new CreateProjectRequest
        {
            Name = "Test Project",
            Description = "Valid description for the test project.",
            Status = ProjectStatus.Planning,
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
            DueDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(10)),
            OwnerId = AnyMemberId()
        });

        Assert.Equal("Test Project", created.Name);
        Assert.False(string.IsNullOrWhiteSpace(created.OwnerName));
        Assert.Contains(_service.GetProjects(), project => project.Id == created.Id);
    }

    [Fact]
    public void CreateProject_WithDuplicateName_ThrowsConflict()
    {
        var request = new CreateProjectRequest
        {
            Name = SeededProjectName,
            Description = "Attempt to reuse an existing project name.",
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
            OwnerId = AnyMemberId()
        };

        Assert.Throws<ConflictException>(() => _service.CreateProject(request));
    }

    [Fact]
    public void CreateProject_WithDueDateBeforeStart_ThrowsValidation()
    {
        var request = new CreateProjectRequest
        {
            Name = "Inverted Dates Project",
            Description = "Due date earlier than start date must be rejected.",
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
            DueDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-5)),
            OwnerId = AnyMemberId()
        };

        Assert.Throws<ValidationException>(() => _service.CreateProject(request));
    }

    [Fact]
    public void CreateProject_WithUnknownOwner_ThrowsValidation()
    {
        var request = new CreateProjectRequest
        {
            Name = "Unknown Owner Project",
            Description = "A project owner that does not exist must be rejected.",
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
            OwnerId = Guid.NewGuid()
        };

        Assert.Throws<ValidationException>(() => _service.CreateProject(request));
    }

    [Fact]
    public void DeleteProject_WithLinkedTasks_ThrowsConflict()
    {
        var projectWithTasks = _service.GetProjects().First(project => project.TotalTasks > 0);

        Assert.Throws<ConflictException>(() => _service.DeleteProject(projectWithTasks.Id));
    }

    [Fact]
    public void DeleteProject_WhenMissing_ThrowsNotFound()
    {
        Assert.Throws<NotFoundException>(() => _service.DeleteProject(Guid.NewGuid()));
    }

    [Fact]
    public void GetWorkItems_FilteredByDoneStatus_ReturnsOnlyDone()
    {
        var done = _service.GetWorkItems(null, WorkItemStatus.Done, null, null, null);

        Assert.NotEmpty(done);
        Assert.All(done, item => Assert.Equal(WorkItemStatus.Done, item.Status));
    }

    [Fact]
    public void GetDashboard_ReflectsProjectAndTaskCounts()
    {
        var dashboard = _service.GetDashboard();

        Assert.Equal(_service.GetProjects().Count, dashboard.TotalProjects);
        Assert.True(dashboard.TotalTasks > 0);
    }
}
