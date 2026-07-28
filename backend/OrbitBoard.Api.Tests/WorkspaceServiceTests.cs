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
    public void DeleteProject_WithUnfinishedTasks_ThrowsConflict()
    {
        var projectWithPending = _service.GetProjects()
            .First(project => project.TotalTasks > project.CompletedTasks);

        Assert.Throws<ConflictException>(() => _service.DeleteProject(projectWithPending.Id));
        Assert.Contains(_service.GetProjects(), project => project.Id == projectWithPending.Id);
    }

    [Fact]
    public void DeleteProject_WithOnlyDoneTasks_RemovesProjectAndItsTasks()
    {
        var project = _service.CreateProject(new CreateProjectRequest
        {
            Name = "Finished Project",
            Description = "Project whose tasks are all concluded.",
            Status = ProjectStatus.Planning,
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
            OwnerId = AnyMemberId()
        });

        var task = _service.CreateWorkItem(new CreateWorkItemRequest
        {
            ProjectId = project.Id,
            Title = "Concluded task",
            Description = "Task moved to Done before deleting the project.",
            Status = WorkItemStatus.Backlog,
            EstimatedHours = 2
        });
        _service.ChangeWorkItemStatus(task.Id, new ChangeWorkItemStatusRequest { Status = WorkItemStatus.Done });

        _service.DeleteProject(project.Id);

        Assert.DoesNotContain(_service.GetProjects(), item => item.Id == project.Id);
        Assert.Throws<NotFoundException>(() => _service.GetWorkItem(task.Id));
    }

    [Fact]
    public void DeleteProject_WithOnlyDoneTasks_KeepsRemainingTasksReadable()
    {
        var project = _service.CreateProject(new CreateProjectRequest
        {
            Name = "Archivable Project",
            Description = "Deleting it must not break the global task listing.",
            Status = ProjectStatus.Planning,
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
            OwnerId = AnyMemberId()
        });

        var task = _service.CreateWorkItem(new CreateWorkItemRequest
        {
            ProjectId = project.Id,
            Title = "Task to be archived",
            Description = "Concluded task removed together with its project.",
            EstimatedHours = 3
        });
        _service.ChangeWorkItemStatus(task.Id, new ChangeWorkItemStatusRequest { Status = WorkItemStatus.Done });

        _service.DeleteProject(project.Id);

        var remaining = _service.GetWorkItems(null, null, null, null, null);
        Assert.DoesNotContain(remaining, item => item.ProjectId == project.Id);
        Assert.All(remaining, item => Assert.False(string.IsNullOrWhiteSpace(item.ProjectName)));
    }

    [Fact]
    public void DeleteProject_WhenMissing_ThrowsNotFound()
    {
        Assert.Throws<NotFoundException>(() => _service.DeleteProject(Guid.NewGuid()));
    }

    private WorkItemResponse SeedTask(Guid projectId, string title, WorkItemPriority priority, WorkItemStatus status) =>
        _service.CreateWorkItem(new CreateWorkItemRequest
        {
            ProjectId = projectId,
            Title = title,
            Description = "Task created to exercise the manual ordering rules.",
            Status = status,
            Priority = priority,
            EstimatedHours = 2
        });

    private List<string> TitlesIn(WorkItemStatus status) =>
        _service.GetWorkItems(null, status, null, null, null).Select(item => item.Title).ToList();

    [Fact]
    public void CreateWorkItem_AppendsToTheEndOfItsPriorityGroup()
    {
        var project = _service.GetProjects().First();

        var first = SeedTask(project.Id, "Ordering first", WorkItemPriority.Low, WorkItemStatus.Review);
        var second = SeedTask(project.Id, "Ordering second", WorkItemPriority.Low, WorkItemStatus.Review);

        Assert.Equal(0, first.Position);
        Assert.Equal(1, second.Position);
    }

    [Fact]
    public void MoveWorkItem_ReordersInsideTheSamePriorityGroup()
    {
        var project = _service.GetProjects().First();
        SeedTask(project.Id, "Ordering first", WorkItemPriority.Low, WorkItemStatus.Review);
        SeedTask(project.Id, "Ordering second", WorkItemPriority.Low, WorkItemStatus.Review);
        var third = SeedTask(project.Id, "Ordering third", WorkItemPriority.Low, WorkItemStatus.Review);

        _service.MoveWorkItem(third.Id, new MoveWorkItemRequest
        {
            Status = WorkItemStatus.Review,
            Position = 0
        });

        var lowTitles = _service.GetWorkItems(null, WorkItemStatus.Review, WorkItemPriority.Low, null, null)
            .Select(item => item.Title)
            .ToList();

        Assert.Equal(["Ordering third", "Ordering first", "Ordering second"], lowTitles);
    }

    [Fact]
    public void MoveWorkItem_KeepsPriorityGroupsAboveTheManualOrder()
    {
        var project = _service.GetProjects().First();
        var low = SeedTask(project.Id, "Low priority task", WorkItemPriority.Low, WorkItemStatus.Review);
        SeedTask(project.Id, "Critical priority task", WorkItemPriority.Critical, WorkItemStatus.Review);

        _service.MoveWorkItem(low.Id, new MoveWorkItemRequest
        {
            Status = WorkItemStatus.Review,
            Position = 0
        });

        var titles = TitlesIn(WorkItemStatus.Review);

        Assert.True(titles.IndexOf("Critical priority task") < titles.IndexOf("Low priority task"));
    }

    [Fact]
    public void MoveWorkItem_ToAnotherColumnChangesStatusAndRecordsHistory()
    {
        var project = _service.GetProjects().First();
        var task = SeedTask(project.Id, "Travelling task", WorkItemPriority.Low, WorkItemStatus.Backlog);

        var moved = _service.MoveWorkItem(task.Id, new MoveWorkItemRequest
        {
            Status = WorkItemStatus.Done,
            Position = 0
        });

        Assert.Equal(WorkItemStatus.Done, moved.Status);
        Assert.Equal(0, moved.Position);
        Assert.Contains(_service.GetWorkItemHistory(task.Id), entry => entry.ToStatus == WorkItemStatus.Done);
    }

    [Fact]
    public void MoveWorkItem_BeyondTheEndLandsAsTheLastOfItsGroup()
    {
        var project = _service.GetProjects().First();
        var first = SeedTask(project.Id, "Ordering first", WorkItemPriority.Low, WorkItemStatus.Review);
        SeedTask(project.Id, "Ordering second", WorkItemPriority.Low, WorkItemStatus.Review);

        var moved = _service.MoveWorkItem(first.Id, new MoveWorkItemRequest
        {
            Status = WorkItemStatus.Review,
            Position = 99
        });

        Assert.Equal(1, moved.Position);
    }

    [Fact]
    public void MoveWorkItem_WithNegativePosition_ThrowsValidation()
    {
        var project = _service.GetProjects().First();
        var task = SeedTask(project.Id, "Invalid position task", WorkItemPriority.Low, WorkItemStatus.Backlog);

        Assert.Throws<ValidationException>(() => _service.MoveWorkItem(task.Id, new MoveWorkItemRequest
        {
            Status = WorkItemStatus.Backlog,
            Position = -1
        }));
    }

    [Fact]
    public void MoveWorkItem_WhenMissing_ThrowsNotFound()
    {
        Assert.Throws<NotFoundException>(() => _service.MoveWorkItem(Guid.NewGuid(), new MoveWorkItemRequest
        {
            Status = WorkItemStatus.Backlog,
            Position = 0
        }));
    }

    [Fact]
    public void DeleteWorkItem_ClosesTheGapLeftInTheGroup()
    {
        var project = _service.GetProjects().First();
        var first = SeedTask(project.Id, "Ordering first", WorkItemPriority.Low, WorkItemStatus.Review);
        SeedTask(project.Id, "Ordering second", WorkItemPriority.Low, WorkItemStatus.Review);

        _service.DeleteWorkItem(first.Id);

        var remaining = _service.GetWorkItems(null, WorkItemStatus.Review, WorkItemPriority.Low, null, null);

        Assert.All(remaining.Select((item, index) => (item, index)), pair =>
            Assert.Equal(pair.index, pair.item.Position));
    }

    [Fact]
    public void GetWorkItems_FilteredByDoneStatus_ReturnsOnlyDone()
    {
        var done = _service.GetWorkItems(null, WorkItemStatus.Done, null, null, null);

        Assert.NotEmpty(done);
        Assert.All(done, item => Assert.Equal(WorkItemStatus.Done, item.Status));
    }

    [Fact]
    public void CreateTeamMember_WithValidData_PersistsAndDerivesInitials()
    {
        var member = _service.CreateTeamMember(new CreateTeamMemberRequest
        {
            Name = "Camila Félix",
            Role = "Backend Developer",
            Email = "camila.felix@example.com"
        });

        Assert.Equal("Camila Félix", member.Name);
        Assert.Equal("CF", member.Initials);
        Assert.Contains(_service.GetTeamMembers(), item => item.Id == member.Id);
    }

    [Fact]
    public void CreateTeamMember_WithSingleWordName_UsesOneInitial()
    {
        var member = _service.CreateTeamMember(new CreateTeamMemberRequest
        {
            Name = "Madonna",
            Role = "Designer",
            Email = "madonna@example.com"
        });

        Assert.Equal("M", member.Initials);
    }

    [Fact]
    public void CreateTeamMember_WithComposedName_UsesFirstAndLastInitials()
    {
        var member = _service.CreateTeamMember(new CreateTeamMemberRequest
        {
            Name = "  ana clara souza lima  ",
            Role = "QA Analyst",
            Email = "ana.lima@example.com"
        });

        Assert.Equal("AL", member.Initials);
        Assert.Equal("ana clara souza lima", member.Name);
    }

    [Fact]
    public void CreateTeamMember_WithDuplicateEmail_ThrowsConflict()
    {
        var existing = _service.GetTeamMembers().First();

        var request = new CreateTeamMemberRequest
        {
            Name = "Outro Integrante",
            Role = "Backend Developer",
            Email = existing.Email.ToUpperInvariant()
        };

        Assert.Throws<ConflictException>(() => _service.CreateTeamMember(request));
    }

    [Fact]
    public void CreateTeamMember_CanBeAssignedAsProjectOwner()
    {
        var member = _service.CreateTeamMember(new CreateTeamMemberRequest
        {
            Name = "Novo Responsável",
            Role = "Tech Lead",
            Email = "novo.responsavel@example.com"
        });

        var project = _service.CreateProject(new CreateProjectRequest
        {
            Name = "Projeto do integrante novo",
            Description = "Projeto criado para validar o vínculo com o integrante.",
            Status = ProjectStatus.Planning,
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
            OwnerId = member.Id
        });

        Assert.Equal(member.Name, project.OwnerName);
    }

    private TeamMember SeedMember(string name, string email) =>
        _service.CreateTeamMember(new CreateTeamMemberRequest
        {
            Name = name,
            Role = "Backend Developer",
            Email = email
        });

    [Fact]
    public void UpdateTeamMember_ChangesDataAndRefreshesInitials()
    {
        var member = SeedMember("Marina Alves", "marina.alves@example.com");

        var updated = _service.UpdateTeamMember(member.Id, new UpdateTeamMemberRequest
        {
            Name = "Marina Alves Peixoto",
            Role = "Tech Lead",
            Email = "marina.peixoto@example.com"
        });

        Assert.Equal("Marina Alves Peixoto", updated.Name);
        Assert.Equal("Tech Lead", updated.Role);
        Assert.Equal("MP", updated.Initials);
    }

    [Fact]
    public void UpdateTeamMember_KeepingItsOwnEmail_IsAllowed()
    {
        var member = SeedMember("Marina Alves", "marina.alves@example.com");

        var updated = _service.UpdateTeamMember(member.Id, new UpdateTeamMemberRequest
        {
            Name = "Marina Alves",
            Role = "Tech Lead",
            Email = "marina.alves@example.com"
        });

        Assert.Equal("Tech Lead", updated.Role);
    }

    [Fact]
    public void UpdateTeamMember_WithEmailOfAnotherMember_ThrowsConflict()
    {
        var member = SeedMember("Marina Alves", "marina.alves@example.com");
        var other = _service.GetTeamMembers().First(item => item.Id != member.Id);

        Assert.Throws<ConflictException>(() => _service.UpdateTeamMember(member.Id, new UpdateTeamMemberRequest
        {
            Name = "Marina Alves",
            Role = "Tech Lead",
            Email = other.Email
        }));
    }

    [Fact]
    public void UpdateTeamMember_WhenMissing_ThrowsNotFound()
    {
        Assert.Throws<NotFoundException>(() => _service.UpdateTeamMember(Guid.NewGuid(), new UpdateTeamMemberRequest
        {
            Name = "Qualquer Nome",
            Role = "Designer",
            Email = "qualquer@example.com"
        }));
    }

    [Fact]
    public void DeleteTeamMember_WithoutLinks_RemovesIt()
    {
        var member = SeedMember("Marina Alves", "marina.alves@example.com");

        _service.DeleteTeamMember(member.Id);

        Assert.DoesNotContain(_service.GetTeamMembers(), item => item.Id == member.Id);
    }

    [Fact]
    public void DeleteTeamMember_OwningAProject_ThrowsConflict()
    {
        var member = SeedMember("Marina Alves", "marina.alves@example.com");
        _service.CreateProject(new CreateProjectRequest
        {
            Name = "Projeto da Marina",
            Description = "Projeto usado para travar a exclusão do integrante.",
            Status = ProjectStatus.Planning,
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
            OwnerId = member.Id
        });

        Assert.Throws<ConflictException>(() => _service.DeleteTeamMember(member.Id));
        Assert.Contains(_service.GetTeamMembers(), item => item.Id == member.Id);
    }

    [Fact]
    public void DeleteTeamMember_AssignedToATask_ThrowsConflict()
    {
        var member = SeedMember("Marina Alves", "marina.alves@example.com");
        var project = _service.GetProjects().First();
        _service.CreateWorkItem(new CreateWorkItemRequest
        {
            ProjectId = project.Id,
            Title = "Tarefa da Marina",
            Description = "Tarefa usada para travar a exclusão do integrante.",
            AssigneeId = member.Id,
            EstimatedHours = 2
        });

        Assert.Throws<ConflictException>(() => _service.DeleteTeamMember(member.Id));
    }

    [Fact]
    public void DeleteTeamMember_WhenMissing_ThrowsNotFound()
    {
        Assert.Throws<NotFoundException>(() => _service.DeleteTeamMember(Guid.NewGuid()));
    }

    [Fact]
    public void GetDashboard_ReflectsProjectAndTaskCounts()
    {
        var dashboard = _service.GetDashboard();

        Assert.Equal(_service.GetProjects().Count, dashboard.TotalProjects);
        Assert.True(dashboard.TotalTasks > 0);
    }

    [Fact]
    public void CreateWorkItem_RecordsInitialStatusInHistory()
    {
        var project = _service.GetProjects().First();
        var created = _service.CreateWorkItem(new CreateWorkItemRequest
        {
            ProjectId = project.Id,
            Title = "New task for history test",
            Description = "Task created to validate the initial history entry.",
            Status = WorkItemStatus.Backlog
        });

        var history = _service.GetWorkItemHistory(created.Id);

        var entry = Assert.Single(history);
        Assert.Null(entry.FromStatus);
        Assert.Equal(WorkItemStatus.Backlog, entry.ToStatus);
    }

    [Fact]
    public void ChangeWorkItemStatus_AppendsHistoryEntryInOrder()
    {
        var task = _service.GetWorkItems(null, null, null, null, null).First();

        var updated = _service.ChangeWorkItemStatus(task.Id, new ChangeWorkItemStatusRequest
        {
            Status = WorkItemStatus.Review
        });

        var history = _service.GetWorkItemHistory(task.Id);

        Assert.Equal(WorkItemStatus.Review, updated.Status);
        var last = Assert.Single(history);
        Assert.Equal(task.Status, last.FromStatus);
        Assert.Equal(WorkItemStatus.Review, last.ToStatus);
    }

    [Fact]
    public void ChangeWorkItemStatus_WithSameStatus_DoesNotDuplicateHistory()
    {
        var task = _service.GetWorkItems(null, null, null, null, null).First();

        _service.ChangeWorkItemStatus(task.Id, new ChangeWorkItemStatusRequest { Status = task.Status });

        Assert.Empty(_service.GetWorkItemHistory(task.Id));
    }

    [Fact]
    public void GetWorkItemHistory_WhenTaskMissing_ThrowsNotFound()
    {
        Assert.Throws<NotFoundException>(() => _service.GetWorkItemHistory(Guid.NewGuid()));
    }

    [Fact]
    public void CreateProject_WithInvalidStatus_ThrowsValidation()
    {
        var request = new CreateProjectRequest
        {
            Name = "Invalid Status Project",
            Description = "A project with an out-of-range status must be rejected.",
            Status = (ProjectStatus)999,
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
            OwnerId = AnyMemberId()
        };

        Assert.Throws<ValidationException>(() => _service.CreateProject(request));
    }

    [Fact]
    public void CreateWorkItem_WithInvalidStatus_ThrowsValidation()
    {
        var project = _service.GetProjects().First();
        var request = new CreateWorkItemRequest
        {
            ProjectId = project.Id,
            Title = "Task with invalid status",
            Description = "A task with an out-of-range status must be rejected.",
            Status = (WorkItemStatus)999
        };

        Assert.Throws<ValidationException>(() => _service.CreateWorkItem(request));
    }

    [Fact]
    public void CreateWorkItem_WithInvalidPriority_ThrowsValidation()
    {
        var project = _service.GetProjects().First();
        var request = new CreateWorkItemRequest
        {
            ProjectId = project.Id,
            Title = "Task with invalid priority",
            Description = "A task with an out-of-range priority must be rejected.",
            Priority = (WorkItemPriority)999
        };

        Assert.Throws<ValidationException>(() => _service.CreateWorkItem(request));
    }

    [Fact]
    public void ChangeWorkItemStatus_WithInvalidStatus_ThrowsValidation()
    {
        var task = _service.GetWorkItems(null, null, null, null, null).First();

        Assert.Throws<ValidationException>(() => _service.ChangeWorkItemStatus(
            task.Id,
            new ChangeWorkItemStatusRequest { Status = (WorkItemStatus)999 }));
    }

    [Fact]
    public void CreateWorkItem_WithDueDateBeforeProjectStart_ThrowsValidation()
    {
        var project = _service.GetProjects().First(project => project.Name == SeededProjectName);
        var request = new CreateWorkItemRequest
        {
            ProjectId = project.Id,
            Title = "Task due before project starts",
            Description = "A task due date earlier than the project start date must be rejected.",
            DueDate = project.StartDate.AddDays(-1)
        };

        Assert.Throws<ValidationException>(() => _service.CreateWorkItem(request));
    }

    [Fact]
    public void CreateWorkItem_WithDueDateAfterProjectDueDate_ThrowsValidation()
    {
        var project = _service.GetProjects().First(project =>
            project.Name == SeededProjectName && project.DueDate.HasValue);
        var request = new CreateWorkItemRequest
        {
            ProjectId = project.Id,
            Title = "Task due after project ends",
            Description = "A task due date later than the project due date must be rejected.",
            DueDate = project.DueDate!.Value.AddDays(1)
        };

        Assert.Throws<ValidationException>(() => _service.CreateWorkItem(request));
    }

    [Fact]
    public void CreateWorkItem_WithDueDateWithinProjectRange_Succeeds()
    {
        var project = _service.GetProjects().First(project =>
            project.Name == SeededProjectName && project.DueDate.HasValue);

        var created = _service.CreateWorkItem(new CreateWorkItemRequest
        {
            ProjectId = project.Id,
            Title = "Task due within project range",
            Description = "A task due date within the project range must be accepted.",
            DueDate = project.DueDate!.Value
        });

        Assert.Equal(project.DueDate, created.DueDate);
    }
}
