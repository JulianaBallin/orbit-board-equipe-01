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
        Assert.Equal(4, members!.Count);
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
}
