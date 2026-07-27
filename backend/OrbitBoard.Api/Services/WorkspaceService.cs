using OrbitBoard.Api.DTOs;
using OrbitBoard.Api.Exceptions;
using OrbitBoard.Api.Models;

namespace OrbitBoard.Api.Services;

public sealed class WorkspaceService : IWorkspaceService
{
    private readonly object _sync = new();
    private readonly List<Project> _projects = [];
    private readonly List<WorkItem> _workItems = [];
    private readonly List<TeamMember> _members = [];
    private readonly List<TaskStatusHistoryEntry> _history = [];

    public WorkspaceService()
    {
        Seed();
    }

    public IReadOnlyList<ProjectResponse> GetProjects()
    {
        lock (_sync)
        {
            return _projects
                .OrderBy(project => project.DueDate)
                .Select(ToProjectResponse)
                .ToList();
        }
    }

    public ProjectResponse GetProject(Guid id)
    {
        lock (_sync)
        {
            return ToProjectResponse(FindProject(id));
        }
    }

    public ProjectResponse CreateProject(CreateProjectRequest request)
    {
        lock (_sync)
        {
            ValidateProjectDates(request.StartDate, request.DueDate);
            EnsureMemberExists(request.OwnerId);
            EnsureUniqueProjectName(request.Name);

            var project = new Project
            {
                Name = request.Name.Trim(),
                Description = request.Description.Trim(),
                Status = request.Status,
                StartDate = request.StartDate,
                DueDate = request.DueDate,
                OwnerId = request.OwnerId
            };

            _projects.Add(project);
            return ToProjectResponse(project);
        }
    }

    public ProjectResponse UpdateProject(Guid id, UpdateProjectRequest request)
    {
        lock (_sync)
        {
            var project = FindProject(id);
            ValidateProjectDates(request.StartDate, request.DueDate);
            EnsureMemberExists(request.OwnerId);
            EnsureUniqueProjectName(request.Name, id);

            project.Name = request.Name.Trim();
            project.Description = request.Description.Trim();
            project.Status = request.Status;
            project.StartDate = request.StartDate;
            project.DueDate = request.DueDate;
            project.OwnerId = request.OwnerId;

            return ToProjectResponse(project);
        }
    }

    public void DeleteProject(Guid id)
    {
        lock (_sync)
        {
            var project = FindProject(id);
            if (_workItems.Any(item => item.ProjectId == id))
            {
                throw new ConflictException("O projeto possui tarefas e não pode ser excluído.");
            }

            _projects.Remove(project);
        }
    }

    public IReadOnlyList<WorkItemResponse> GetWorkItems(
        Guid? projectId,
        WorkItemStatus? status,
        WorkItemPriority? priority,
        Guid? assigneeId,
        string? search)
    {
        lock (_sync)
        {
            IEnumerable<WorkItem> query = _workItems;

            if (projectId.HasValue)
                query = query.Where(item => item.ProjectId == projectId.Value);
            if (status.HasValue)
                query = query.Where(item => item.Status == status.Value);
            if (priority.HasValue)
                query = query.Where(item => item.Priority == priority.Value);
            if (assigneeId.HasValue)
                query = query.Where(item => item.AssigneeId == assigneeId.Value);
            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();
                query = query.Where(item =>
                    item.Title.Contains(term, StringComparison.OrdinalIgnoreCase) ||
                    item.Description.Contains(term, StringComparison.OrdinalIgnoreCase));
            }

            return query
                .OrderBy(item => item.Status)
                .ThenByDescending(item => item.Priority)
                .ThenBy(item => item.DueDate)
                .Select(ToWorkItemResponse)
                .ToList();
        }
    }

    public WorkItemResponse GetWorkItem(Guid id)
    {
        lock (_sync)
        {
            return ToWorkItemResponse(FindWorkItem(id));
        }
    }

    public WorkItemResponse CreateWorkItem(CreateWorkItemRequest request)
    {
        lock (_sync)
        {
            FindProject(request.ProjectId);
            if (request.AssigneeId.HasValue)
                EnsureMemberExists(request.AssigneeId.Value);

            var item = new WorkItem
            {
                ProjectId = request.ProjectId,
                Title = request.Title.Trim(),
                Description = request.Description.Trim(),
                Status = request.Status,
                Priority = request.Priority,
                AssigneeId = request.AssigneeId,
                DueDate = request.DueDate,
                EstimatedHours = request.EstimatedHours
            };

            _workItems.Add(item);
            RecordStatusHistory(item.Id, null, item.Status);
            return ToWorkItemResponse(item);
        }
    }

    public WorkItemResponse UpdateWorkItem(Guid id, UpdateWorkItemRequest request)
    {
        lock (_sync)
        {
            var item = FindWorkItem(id);
            FindProject(request.ProjectId);
            if (request.AssigneeId.HasValue)
                EnsureMemberExists(request.AssigneeId.Value);

            var previousStatus = item.Status;

            item.ProjectId = request.ProjectId;
            item.Title = request.Title.Trim();
            item.Description = request.Description.Trim();
            item.Status = request.Status;
            item.Priority = request.Priority;
            item.AssigneeId = request.AssigneeId;
            item.DueDate = request.DueDate;
            item.EstimatedHours = request.EstimatedHours;
            item.UpdatedAt = DateTimeOffset.UtcNow;

            if (previousStatus != item.Status)
                RecordStatusHistory(item.Id, previousStatus, item.Status);

            return ToWorkItemResponse(item);
        }
    }

    public WorkItemResponse ChangeWorkItemStatus(Guid id, ChangeWorkItemStatusRequest request)
    {
        lock (_sync)
        {
            var item = FindWorkItem(id);
            var previousStatus = item.Status;

            item.Status = request.Status;
            item.UpdatedAt = DateTimeOffset.UtcNow;

            if (previousStatus != item.Status)
                RecordStatusHistory(item.Id, previousStatus, item.Status);

            return ToWorkItemResponse(item);
        }
    }

    public void DeleteWorkItem(Guid id)
    {
        lock (_sync)
        {
            _workItems.Remove(FindWorkItem(id));
        }
    }

    public IReadOnlyList<TaskHistoryEntryResponse> GetWorkItemHistory(Guid id)
    {
        lock (_sync)
        {
            FindWorkItem(id);
            return _history
                .Where(entry => entry.WorkItemId == id)
                .OrderBy(entry => entry.ChangedAt)
                .Select(ToHistoryResponse)
                .ToList();
        }
    }

    public IReadOnlyList<TeamMember> GetTeamMembers()
    {
        lock (_sync)
        {
            return _members.OrderBy(member => member.Name).ToList();
        }
    }

    public DashboardResponse GetDashboard()
    {
        lock (_sync)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var completed = _workItems.Count(item => item.Status == WorkItemStatus.Done);
            var recent = _workItems
                .OrderByDescending(item => item.UpdatedAt)
                .Take(6)
                .Select(ToWorkItemResponse)
                .ToList();

            var byStatus = Enum.GetValues<WorkItemStatus>()
                .ToDictionary(
                    status => status.ToString(),
                    status => _workItems.Count(item => item.Status == status));

            return new DashboardResponse(
                _projects.Count,
                _projects.Count(project => project.Status == ProjectStatus.Active),
                _workItems.Count,
                completed,
                _workItems.Count(item =>
                    item.DueDate.HasValue &&
                    item.DueDate.Value < today &&
                    item.Status != WorkItemStatus.Done),
                recent,
                byStatus);
        }
    }

    private Project FindProject(Guid id) =>
        _projects.FirstOrDefault(project => project.Id == id)
        ?? throw new NotFoundException("Projeto não encontrado.");

    private void RecordStatusHistory(Guid workItemId, WorkItemStatus? fromStatus, WorkItemStatus toStatus) =>
        _history.Add(new TaskStatusHistoryEntry
        {
            WorkItemId = workItemId,
            FromStatus = fromStatus,
            ToStatus = toStatus
        });

    private WorkItem FindWorkItem(Guid id) =>
        _workItems.FirstOrDefault(item => item.Id == id)
        ?? throw new NotFoundException("Tarefa não encontrada.");

    private void EnsureMemberExists(Guid id)
    {
        if (_members.All(member => member.Id != id))
            throw new ValidationException("O integrante informado não existe.");
    }

    private void EnsureUniqueProjectName(string name, Guid? ignoredId = null)
    {
        if (_projects.Any(project =>
            project.Id != ignoredId &&
            project.Name.Equals(name.Trim(), StringComparison.OrdinalIgnoreCase)))
        {
            throw new ConflictException("Já existe um projeto com esse nome.");
        }
    }

    private static void ValidateProjectDates(DateOnly startDate, DateOnly? dueDate)
    {
        if (dueDate.HasValue && dueDate.Value < startDate)
            throw new ValidationException("A data final não pode ser anterior à data inicial.");
    }

    private ProjectResponse ToProjectResponse(Project project)
    {
        var owner = _members.First(member => member.Id == project.OwnerId);
        var tasks = _workItems.Where(item => item.ProjectId == project.Id).ToList();

        return new ProjectResponse(
            project.Id,
            project.Name,
            project.Description,
            project.Status,
            project.StartDate,
            project.DueDate,
            project.OwnerId,
            owner.Name,
            tasks.Count,
            tasks.Count(item => item.Status == WorkItemStatus.Done),
            project.CreatedAt);
    }

    private WorkItemResponse ToWorkItemResponse(WorkItem item)
    {
        var project = _projects.First(project => project.Id == item.ProjectId);
        var assignee = item.AssigneeId.HasValue
            ? _members.FirstOrDefault(member => member.Id == item.AssigneeId.Value)
            : null;

        return new WorkItemResponse(
            item.Id,
            item.ProjectId,
            project.Name,
            item.Title,
            item.Description,
            item.Status,
            item.Priority,
            item.AssigneeId,
            assignee?.Name,
            item.DueDate,
            item.EstimatedHours,
            item.CreatedAt,
            item.UpdatedAt);
    }

    private static TaskHistoryEntryResponse ToHistoryResponse(TaskStatusHistoryEntry entry) =>
        new(entry.Id, entry.WorkItemId, entry.FromStatus, entry.ToStatus, entry.ChangedAt);

    private void Seed()
    {
        var ana = new TeamMember
        {
            Name = "Ana Ribeiro",
            Role = "Product Designer",
            Email = "ana.ribeiro@example.com",
            Initials = "AR"
        };
        var bruno = new TeamMember
        {
            Name = "Bruno Martins",
            Role = "Backend Developer",
            Email = "bruno.martins@example.com",
            Initials = "BM"
        };
        var carla = new TeamMember
        {
            Name = "Carla Nunes",
            Role = "Frontend Developer",
            Email = "carla.nunes@example.com",
            Initials = "CN"
        };
        var diego = new TeamMember
        {
            Name = "Diego Lima",
            Role = "Quality Analyst",
            Email = "diego.lima@example.com",
            Initials = "DL"
        };

        _members.AddRange([ana, bruno, carla, diego]);

        var portal = new Project
        {
            Name = "Portal de Aprendizagem",
            Description = "Plataforma para organizar trilhas, conteúdos e acompanhamento de progresso.",
            Status = ProjectStatus.Active,
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-35)),
            DueDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(28)),
            OwnerId = ana.Id
        };
        var eventos = new Project
        {
            Name = "Agenda de Eventos",
            Description = "Sistema para publicação, inscrição e acompanhamento de eventos comunitários.",
            Status = ProjectStatus.Active,
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-18)),
            DueDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(45)),
            OwnerId = bruno.Id
        };
        var biblioteca = new Project
        {
            Name = "Biblioteca Digital",
            Description = "Catálogo colaborativo de livros, avaliações e listas de leitura.",
            Status = ProjectStatus.Planning,
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)),
            DueDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(90)),
            OwnerId = carla.Id
        };

        _projects.AddRange([portal, eventos, biblioteca]);

        _workItems.AddRange([
            new WorkItem
            {
                ProjectId = portal.Id,
                Title = "Criar dashboard de progresso",
                Description = "Exibir métricas de trilhas iniciadas, concluídas e em andamento.",
                Status = WorkItemStatus.InProgress,
                Priority = WorkItemPriority.High,
                AssigneeId = carla.Id,
                DueDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(6)),
                EstimatedHours = 16
            },
            new WorkItem
            {
                ProjectId = portal.Id,
                Title = "Documentar endpoints de trilhas",
                Description = "Revisar exemplos de requisição e resposta na documentação da API.",
                Status = WorkItemStatus.Review,
                Priority = WorkItemPriority.Medium,
                AssigneeId = bruno.Id,
                DueDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(2)),
                EstimatedHours = 5
            },
            new WorkItem
            {
                ProjectId = eventos.Id,
                Title = "Validar fluxo de inscrição",
                Description = "Testar cenários de sucesso, lotação e cancelamento de inscrição.",
                Status = WorkItemStatus.Backlog,
                Priority = WorkItemPriority.Critical,
                AssigneeId = diego.Id,
                DueDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(9)),
                EstimatedHours = 12
            },
            new WorkItem
            {
                ProjectId = eventos.Id,
                Title = "Implementar listagem de eventos",
                Description = "Criar endpoint com filtros por data, categoria e disponibilidade.",
                Status = WorkItemStatus.Done,
                Priority = WorkItemPriority.High,
                AssigneeId = bruno.Id,
                DueDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-3)),
                EstimatedHours = 10
            },
            new WorkItem
            {
                ProjectId = biblioteca.Id,
                Title = "Definir modelo de avaliações",
                Description = "Mapear campos, regras e relacionamento entre livro, leitor e nota.",
                Status = WorkItemStatus.Backlog,
                Priority = WorkItemPriority.Medium,
                AssigneeId = ana.Id,
                DueDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(20)),
                EstimatedHours = 6
            }
        ]);
    }
}
