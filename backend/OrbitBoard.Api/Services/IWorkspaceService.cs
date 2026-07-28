using OrbitBoard.Api.DTOs;
using OrbitBoard.Api.Models;

namespace OrbitBoard.Api.Services;

public interface IWorkspaceService
{
    IReadOnlyList<ProjectResponse> GetProjects();
    ProjectResponse GetProject(Guid id);
    ProjectResponse CreateProject(CreateProjectRequest request);
    ProjectResponse UpdateProject(Guid id, UpdateProjectRequest request);
    void DeleteProject(Guid id);

    IReadOnlyList<WorkItemResponse> GetWorkItems(
        Guid? projectId,
        WorkItemStatus? status,
        WorkItemPriority? priority,
        Guid? assigneeId,
        string? search);
    WorkItemResponse GetWorkItem(Guid id);
    WorkItemResponse CreateWorkItem(CreateWorkItemRequest request);
    WorkItemResponse UpdateWorkItem(Guid id, UpdateWorkItemRequest request);
    WorkItemResponse ChangeWorkItemStatus(Guid id, ChangeWorkItemStatusRequest request);
    void DeleteWorkItem(Guid id);

    IReadOnlyList<TeamMember> GetTeamMembers();
    DashboardResponse GetDashboard();
}
