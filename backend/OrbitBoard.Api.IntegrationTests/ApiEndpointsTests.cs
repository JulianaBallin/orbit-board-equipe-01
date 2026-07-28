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
    public async Task Swagger_ExposesExactlyTheNineteenDocumentedOperations()
    {
        using var document = await _client.GetFromJsonAsync<JsonDocument>("/swagger/v1/swagger.json");
        var httpMethods = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "delete", "get", "patch", "post", "put"
        };
        var actual = document!.RootElement
            .GetProperty("paths")
            .EnumerateObject()
            .SelectMany(path => path.Value
                .EnumerateObject()
                .Where(operation => httpMethods.Contains(operation.Name))
                .Select(operation => $"{operation.Name.ToUpperInvariant()} {path.Name}"))
            .Order()
            .ToArray();
        string[] expected =
        [
            "DELETE /api/projects/{id}",
            "DELETE /api/tasks/{id}",
            "DELETE /api/team-members/{id}",
            "GET /api/dashboard",
            "GET /api/projects",
            "GET /api/projects/{id}",
            "GET /api/tasks",
            "GET /api/tasks/{id}",
            "GET /api/tasks/{id}/history",
            "GET /api/team-members",
            "GET /health",
            "PATCH /api/tasks/{id}/position",
            "PATCH /api/tasks/{id}/status",
            "POST /api/projects",
            "POST /api/tasks",
            "POST /api/team-members",
            "PUT /api/projects/{id}",
            "PUT /api/tasks/{id}",
            "PUT /api/team-members/{id}"
        ];

        Assert.Equal(expected.Order(), actual);
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

    private async Task<TeamMember> RegisterMemberAsync(string name, string email)
    {
        var request = new CreateTeamMemberRequest
        {
            Name = name,
            Role = "Backend Developer",
            Email = email
        };

        var response = await _client.PostAsJsonAsync("/api/team-members", request, JsonOptions);
        return (await response.Content.ReadFromJsonAsync<TeamMember>(JsonOptions))!;
    }

    [Fact]
    public async Task UpdateTeamMember_WithValidData_Returns200AndRefreshesInitials()
    {
        var member = await RegisterMemberAsync("Marina Alves", "marina.alves@example.com");

        var request = new UpdateTeamMemberRequest
        {
            Name = "Marina Alves Peixoto",
            Role = "Tech Lead",
            Email = "marina.peixoto@example.com"
        };
        var response = await _client.PutAsJsonAsync($"/api/team-members/{member.Id}", request, JsonOptions);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var updated = await response.Content.ReadFromJsonAsync<TeamMember>(JsonOptions);
        var members = await _client.GetFromJsonAsync<List<TeamMember>>("/api/team-members", JsonOptions);
        Assert.Equal("MP", updated!.Initials);
        Assert.Equal("Tech Lead", updated.Role);
        Assert.Contains(members!, item =>
            item.Id == member.Id &&
            item.Initials == "MP" &&
            item.Role == "Tech Lead");
    }

    [Fact]
    public async Task UpdateTeamMember_WhenMissing_Returns404()
    {
        var request = new UpdateTeamMemberRequest
        {
            Name = "Qualquer Nome",
            Role = "Designer",
            Email = "qualquer@example.com"
        };

        var response = await _client.PutAsJsonAsync($"/api/team-members/{Guid.NewGuid()}", request, JsonOptions);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task DeleteTeamMember_WithoutLinks_Returns204()
    {
        var member = await RegisterMemberAsync("Marina Alves", "marina.alves@example.com");

        var response = await _client.DeleteAsync($"/api/team-members/{member.Id}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        var members = await _client.GetFromJsonAsync<List<TeamMember>>("/api/team-members", JsonOptions);
        Assert.DoesNotContain(members!, item => item.Id == member.Id);
    }

    [Fact]
    public async Task DeleteTeamMember_OwningAProject_Returns409()
    {
        var projects = await _client.GetFromJsonAsync<List<ProjectResponse>>("/api/projects", JsonOptions);
        var ownerId = projects!.First().OwnerId;

        var response = await _client.DeleteAsync($"/api/team-members/{ownerId}");

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task DeleteTeamMember_KeepsTheProjectListingHealthy()
    {
        var projects = await _client.GetFromJsonAsync<List<ProjectResponse>>("/api/projects", JsonOptions);
        await _client.DeleteAsync($"/api/team-members/{projects!.First().OwnerId}");

        var response = await _client.GetAsync("/api/projects");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
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

    [Fact]
    public async Task GetProject_WhenExists_Returns200WithTheRequestedProject()
    {
        var projects = await _client.GetFromJsonAsync<List<ProjectResponse>>("/api/projects", JsonOptions);
        var expected = projects!.First();

        var response = await _client.GetAsync($"/api/projects/{expected.Id}");
        var project = await response.Content.ReadFromJsonAsync<ProjectResponse>(JsonOptions);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(expected.Id, project!.Id);
        Assert.Equal(expected.Name, project.Name);
    }

    [Fact]
    public async Task UpdateProject_WithValidData_Returns200AndPersists()
    {
        var projects = await _client.GetFromJsonAsync<List<ProjectResponse>>("/api/projects", JsonOptions);
        var target = projects!.First();
        var request = new UpdateProjectRequest
        {
            Name = "Projeto atualizado pela integração",
            Description = "Descrição atualizada e persistida entre requisições HTTP.",
            Status = ProjectStatus.Active,
            StartDate = target.StartDate,
            DueDate = target.DueDate,
            OwnerId = target.OwnerId
        };

        var response = await _client.PutAsJsonAsync($"/api/projects/{target.Id}", request, JsonOptions);
        var persisted = await _client.GetFromJsonAsync<ProjectResponse>(
            $"/api/projects/{target.Id}", JsonOptions);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(request.Name, persisted!.Name);
        Assert.Equal(request.Description, persisted.Description);
        Assert.Equal(request.Status, persisted.Status);
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
    public async Task CreateAndGetTask_WithValidData_Returns201AndPersistsInitialHistory()
    {
        var projects = await _client.GetFromJsonAsync<List<ProjectResponse>>("/api/projects", JsonOptions);
        var request = new CreateWorkItemRequest
        {
            ProjectId = projects!.First().Id,
            Title = "Persistência entre requisições",
            Description = "Tarefa criada e consultada por uma segunda requisição HTTP.",
            Status = WorkItemStatus.Backlog,
            Priority = WorkItemPriority.High,
            EstimatedHours = 5
        };

        var response = await _client.PostAsJsonAsync("/api/tasks", request, JsonOptions);
        var created = await response.Content.ReadFromJsonAsync<WorkItemResponse>(JsonOptions);
        var persisted = await _client.GetFromJsonAsync<WorkItemResponse>(
            $"/api/tasks/{created!.Id}", JsonOptions);
        var history = await _client.GetFromJsonAsync<List<TaskHistoryEntryResponse>>(
            $"/api/tasks/{created.Id}/history", JsonOptions);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.EndsWith($"/api/tasks/{created.Id}", response.Headers.Location!.AbsolutePath);
        Assert.Equal(request.Title, persisted!.Title);
        var initial = Assert.Single(history!);
        Assert.Null(initial.FromStatus);
        Assert.Equal(request.Status, initial.ToStatus);
    }

    [Fact]
    public async Task UpdateTask_WithValidData_Returns200AndPersistsStatusHistory()
    {
        var projects = await _client.GetFromJsonAsync<List<ProjectResponse>>("/api/projects", JsonOptions);
        var task = await CreateTaskAsync(
            projects!.First().Id,
            "Tarefa antes da edição",
            WorkItemPriority.Low);
        var request = new UpdateWorkItemRequest
        {
            ProjectId = task.ProjectId,
            Title = "Tarefa após a edição",
            Description = "Conteúdo atualizado e persistido pela rota PUT.",
            Status = WorkItemStatus.Done,
            Priority = WorkItemPriority.High,
            EstimatedHours = 8
        };

        var response = await _client.PutAsJsonAsync($"/api/tasks/{task.Id}", request, JsonOptions);
        var persisted = await _client.GetFromJsonAsync<WorkItemResponse>(
            $"/api/tasks/{task.Id}", JsonOptions);
        var history = await _client.GetFromJsonAsync<List<TaskHistoryEntryResponse>>(
            $"/api/tasks/{task.Id}/history", JsonOptions);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(request.Title, persisted!.Title);
        Assert.Equal(request.Status, persisted.Status);
        Assert.Equal(request.Priority, persisted.Priority);
        Assert.Equal(2, history!.Count);
        Assert.Equal(WorkItemStatus.Review, history[1].FromStatus);
        Assert.Equal(WorkItemStatus.Done, history[1].ToStatus);
    }

    [Fact]
    public async Task DeleteTask_WhenExists_Returns204AndRemainsAbsent()
    {
        var projects = await _client.GetFromJsonAsync<List<ProjectResponse>>("/api/projects", JsonOptions);
        var task = await CreateTaskAsync(
            projects!.First().Id,
            "Tarefa removida pela integração",
            WorkItemPriority.Medium);

        var response = await _client.DeleteAsync($"/api/tasks/{task.Id}");
        var getResponse = await _client.GetAsync($"/api/tasks/{task.Id}");
        var historyResponse = await _client.GetAsync($"/api/tasks/{task.Id}/history");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, historyResponse.StatusCode);
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
