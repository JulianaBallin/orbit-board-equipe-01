using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc.Testing;
using OrbitBoard.Api.DTOs;
using OrbitBoard.Api.Models;
using Xunit;

namespace OrbitBoard.Api.IntegrationTests;

public sealed class ApiEndpointsTests : IDisposable
{
    private const string SeededProjectName = "Portal de Aprendizagem";

    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() }
    };

    private readonly WebApplicationFactory<Program> _factory = new();
    private readonly HttpClient _client;

    public ApiEndpointsTests() => _client = _factory.CreateClient();

    public void Dispose()
    {
        _client.Dispose();
        _factory.Dispose();
    }

    private async Task<Guid> GetAnyMemberIdAsync()
    {
        var members = await _client.GetFromJsonAsync<List<TeamMember>>("/api/team-members", JsonOptions);
        return members!.First().Id;
    }

    [Fact]
    public async Task Health_ReturnsHealthyPayload()
    {
        var response = await _client.GetAsync("/health");
        var body = await response.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Contains("healthy", body);
    }

    [Fact]
    public async Task GetProjects_ReturnsSeededProjectsAsJson()
    {
        var response = await _client.GetAsync("/api/projects");
        var projects = await response.Content.ReadFromJsonAsync<List<ProjectResponse>>(JsonOptions);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Contains("application/json", response.Content.Headers.ContentType!.MediaType);
        Assert.NotNull(projects);
        Assert.True(projects!.Count >= 3);
    }

    [Fact]
    public async Task GetTeamMembers_ReturnsSeededMembers()
    {
        var members = await _client.GetFromJsonAsync<List<TeamMember>>("/api/team-members", JsonOptions);

        Assert.NotNull(members);
        Assert.Equal(5, members!.Count);
    }

    [Fact]
    public async Task CreateTeamMember_WithValidData_Returns201AndIsListed()
    {
        var request = new CreateTeamMemberRequest
        {
            Name = "Renata Vasconcelos",
            Role = "Backend Developer",
            Email = "renata.vasconcelos@example.com"
        };

        var response = await _client.PostAsJsonAsync("/api/team-members", request, JsonOptions);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var created = await response.Content.ReadFromJsonAsync<TeamMember>(JsonOptions);
        Assert.Equal("RV", created!.Initials);

        var members = await _client.GetFromJsonAsync<List<TeamMember>>("/api/team-members", JsonOptions);
        Assert.Contains(members!, member => member.Id == created.Id);
    }

    [Fact]
    public async Task CreateTeamMember_WithDuplicateEmail_Returns409()
    {
        var members = await _client.GetFromJsonAsync<List<TeamMember>>("/api/team-members", JsonOptions);
        var request = new CreateTeamMemberRequest
        {
            Name = "Integrante Repetido",
            Role = "Designer",
            Email = members!.First().Email
        };

        var response = await _client.PostAsJsonAsync("/api/team-members", request, JsonOptions);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task CreateTeamMember_WithInvalidEmail_Returns400()
    {
        var request = new CreateTeamMemberRequest
        {
            Name = "Integrante Inválido",
            Role = "Designer",
            Email = "isso-nao-e-um-email"
        };

        var response = await _client.PostAsJsonAsync("/api/team-members", request, JsonOptions);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreateTeamMember_WithShortName_Returns400()
    {
        var request = new CreateTeamMemberRequest
        {
            Name = "Ab",
            Role = "Designer",
            Email = "ab@example.com"
        };

        var response = await _client.PostAsJsonAsync("/api/team-members", request, JsonOptions);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreateProject_WithValidData_Returns201AndIsListed()
    {
        var request = new CreateProjectRequest
        {
            Name = "Integração Contínua",
            Description = "Projeto criado por teste de integração de API.",
            Status = ProjectStatus.Planning,
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
            DueDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(15)),
            OwnerId = await GetAnyMemberIdAsync()
        };

        var response = await _client.PostAsJsonAsync("/api/projects", request, JsonOptions);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var created = await response.Content.ReadFromJsonAsync<ProjectResponse>(JsonOptions);
        Assert.NotNull(created);
        Assert.Equal(request.Name, created!.Name);

        var projects = await _client.GetFromJsonAsync<List<ProjectResponse>>("/api/projects", JsonOptions);
        Assert.Contains(projects!, project => project.Id == created.Id);
    }

    [Fact]
    public async Task CreateProject_WithDuplicateName_Returns409()
    {
        var request = new CreateProjectRequest
        {
            Name = SeededProjectName,
            Description = "Nome repetido deve ser rejeitado pela API.",
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
            OwnerId = await GetAnyMemberIdAsync()
        };

        var response = await _client.PostAsJsonAsync("/api/projects", request, JsonOptions);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task GetProject_WhenMissing_Returns404()
    {
        var response = await _client.GetAsync($"/api/projects/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private async Task<WorkItemResponse> CreateTaskAsync(Guid projectId, string title, WorkItemPriority priority)
    {
        var request = new CreateWorkItemRequest
        {
            ProjectId = projectId,
            Title = title,
            Description = "Tarefa criada pelo teste de integração da ordenação manual.",
            Status = WorkItemStatus.Review,
            Priority = priority,
            EstimatedHours = 3
        };

        var response = await _client.PostAsJsonAsync("/api/tasks", request, JsonOptions);
        return (await response.Content.ReadFromJsonAsync<WorkItemResponse>(JsonOptions))!;
    }

    [Fact]
    public async Task MoveTask_ToAnotherPosition_Returns200AndReordersTheGroup()
    {
        var projects = await _client.GetFromJsonAsync<List<ProjectResponse>>("/api/projects", JsonOptions);
        var projectId = projects!.First().Id;

        await CreateTaskAsync(projectId, "Ordenação primeira", WorkItemPriority.Low);
        var last = await CreateTaskAsync(projectId, "Ordenação segunda", WorkItemPriority.Low);

        var move = new MoveWorkItemRequest { Status = WorkItemStatus.Review, Position = 0 };
        var response = await _client.PatchAsJsonAsync($"/api/tasks/{last.Id}/position", move, JsonOptions);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var moved = await response.Content.ReadFromJsonAsync<WorkItemResponse>(JsonOptions);
        Assert.Equal(0, moved!.Position);

        var review = await _client.GetFromJsonAsync<List<WorkItemResponse>>(
            "/api/tasks?status=Review&priority=Low", JsonOptions);
        Assert.Equal("Ordenação segunda", review!.First().Title);
    }

    [Fact]
    public async Task MoveTask_WhenMissing_Returns404()
    {
        var move = new MoveWorkItemRequest { Status = WorkItemStatus.Backlog, Position = 0 };

        var response = await _client.PatchAsJsonAsync($"/api/tasks/{Guid.NewGuid()}/position", move, JsonOptions);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task MoveTask_WithNegativePosition_Returns400()
    {
        var projects = await _client.GetFromJsonAsync<List<ProjectResponse>>("/api/projects", JsonOptions);
        var task = await CreateTaskAsync(projects!.First().Id, "Posição inválida", WorkItemPriority.Low);

        var move = new MoveWorkItemRequest { Status = WorkItemStatus.Review, Position = -1 };
        var response = await _client.PatchAsJsonAsync($"/api/tasks/{task.Id}/position", move, JsonOptions);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetTasks_ReturnsThePositionOfEachTask()
    {
        var tasks = await _client.GetFromJsonAsync<List<WorkItemResponse>>("/api/tasks", JsonOptions);

        Assert.NotEmpty(tasks!);
        Assert.All(tasks!, task => Assert.True(task.Position >= 0));
    }

    [Fact]
    public async Task DeleteProject_WithUnfinishedTasks_Returns409()
    {
        var projects = await _client.GetFromJsonAsync<List<ProjectResponse>>("/api/projects", JsonOptions);
        var target = projects!.First(project => project.TotalTasks > project.CompletedTasks);

        var response = await _client.DeleteAsync($"/api/projects/{target.Id}");

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task DeleteProject_WithOnlyDoneTasks_Returns204()
    {
        var createProject = new CreateProjectRequest
        {
            Name = "Concluded Project For Deletion",
            Description = "Project used to validate deletion when every task is done.",
            Status = ProjectStatus.Planning,
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
            OwnerId = await GetAnyMemberIdAsync()
        };
        var projectResponse = await _client.PostAsJsonAsync("/api/projects", createProject, JsonOptions);
        var project = await projectResponse.Content.ReadFromJsonAsync<ProjectResponse>(JsonOptions);

        var createTask = new CreateWorkItemRequest
        {
            ProjectId = project!.Id,
            Title = "Concluded task",
            Description = "Task moved to done before deleting its project.",
            EstimatedHours = 4
        };
        var taskResponse = await _client.PostAsJsonAsync("/api/tasks", createTask, JsonOptions);
        var task = await taskResponse.Content.ReadFromJsonAsync<WorkItemResponse>(JsonOptions);

        var statusRequest = new ChangeWorkItemStatusRequest { Status = WorkItemStatus.Done };
        var statusResponse = await _client.PatchAsJsonAsync($"/api/tasks/{task!.Id}/status", statusRequest, JsonOptions);
        Assert.Equal(HttpStatusCode.OK, statusResponse.StatusCode);

        var deleteResponse = await _client.DeleteAsync($"/api/projects/{project.Id}");

        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await _client.GetAsync($"/api/tasks/{task.Id}")).StatusCode);
    }

    [Fact]
    public async Task GetTasks_FilteredByDoneStatus_ReturnsOnlyDone()
    {
        var tasks = await _client.GetFromJsonAsync<List<WorkItemResponse>>(
            "/api/tasks?status=Done", JsonOptions);

        Assert.NotNull(tasks);
        Assert.NotEmpty(tasks!);
        Assert.All(tasks!, task => Assert.Equal(WorkItemStatus.Done, task.Status));
    }

    [Fact]
    public async Task GetDashboard_ReturnsConsistentTotals()
    {
        var dashboard = await _client.GetFromJsonAsync<DashboardResponse>("/api/dashboard", JsonOptions);
        var projects = await _client.GetFromJsonAsync<List<ProjectResponse>>("/api/projects", JsonOptions);

        Assert.NotNull(dashboard);
        Assert.Equal(projects!.Count, dashboard!.TotalProjects);
        Assert.True(dashboard.TotalTasks > 0);
    }

    [Fact]
    public async Task GetTaskHistory_AfterStatusChange_ReturnsEntry()
    {
        var task = (await _client.GetFromJsonAsync<List<WorkItemResponse>>("/api/tasks", JsonOptions))!.First();
        var newStatus = task.Status == WorkItemStatus.Done ? WorkItemStatus.InProgress : WorkItemStatus.Done;

        var patchResponse = await _client.PatchAsJsonAsync(
            $"/api/tasks/{task.Id}/status",
            new ChangeWorkItemStatusRequest { Status = newStatus },
            JsonOptions);
        Assert.Equal(HttpStatusCode.OK, patchResponse.StatusCode);

        var history = await _client.GetFromJsonAsync<List<TaskHistoryEntryResponse>>(
            $"/api/tasks/{task.Id}/history", JsonOptions);

        Assert.NotNull(history);
        var last = history!.Last();
        Assert.Equal(task.Status, last.FromStatus);
        Assert.Equal(newStatus, last.ToStatus);
    }

    [Fact]
    public async Task GetTaskHistory_WhenTaskMissing_Returns404()
    {
        var response = await _client.GetAsync($"/api/tasks/{Guid.NewGuid()}/history");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
