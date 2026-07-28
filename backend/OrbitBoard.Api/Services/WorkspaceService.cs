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
            EnsureDefined(request.Status, "O status do projeto informado é inválido.");
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
            EnsureDefined(request.Status, "O status do projeto informado é inválido.");
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
            var pending = _workItems.Count(item => item.ProjectId == id && item.Status != WorkItemStatus.Done);
            if (pending > 0)
            {
                throw new ConflictException(
                    $"O projeto possui {pending} tarefa(s) não concluída(s) e não pode ser excluído.");
            }

            var finished = _workItems.Where(item => item.ProjectId == id).Select(item => item.Id).ToHashSet();
            _history.RemoveAll(entry => finished.Contains(entry.WorkItemId));
            _workItems.RemoveAll(item => item.ProjectId == id);
            _projects.Remove(project);
            ReindexBoard();
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
                .ThenBy(item => item.Position)
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
            var project = FindProject(request.ProjectId);
            if (request.AssigneeId.HasValue)
                EnsureMemberExists(request.AssigneeId.Value);
            EnsureDefined(request.Status, "O status da tarefa informado é inválido.");
            EnsureDefined(request.Priority, "A prioridade informada é inválida.");
            ValidateWorkItemDueDate(request.DueDate, project);

            var item = new WorkItem
            {
                ProjectId = request.ProjectId,
                Title = request.Title.Trim(),
                Description = request.Description.Trim(),
                Status = request.Status,
                Priority = request.Priority,
                AssigneeId = request.AssigneeId,
                DueDate = request.DueDate,
                EstimatedHours = request.EstimatedHours,
                Position = NextPosition(request.Status, request.Priority)
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
            var project = FindProject(request.ProjectId);
            if (request.AssigneeId.HasValue)
                EnsureMemberExists(request.AssigneeId.Value);
            EnsureDefined(request.Status, "O status da tarefa informado é inválido.");
            EnsureDefined(request.Priority, "A prioridade informada é inválida.");
            ValidateWorkItemDueDate(request.DueDate, project);

            var previousStatus = item.Status;
            var previousPriority = item.Priority;

            item.ProjectId = request.ProjectId;
            item.Title = request.Title.Trim();
            item.Description = request.Description.Trim();
            item.Status = request.Status;
            item.Priority = request.Priority;
            item.AssigneeId = request.AssigneeId;
            item.DueDate = request.DueDate;
            item.EstimatedHours = request.EstimatedHours;
            item.UpdatedAt = DateTimeOffset.UtcNow;

            if (previousStatus != item.Status || previousPriority != item.Priority)
            {
                item.Position = NextPosition(item.Status, item.Priority);
                ReindexBoard();
            }

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
            EnsureDefined(request.Status, "O status da tarefa informado é inválido.");
            var previousStatus = item.Status;

            item.Status = request.Status;
            item.UpdatedAt = DateTimeOffset.UtcNow;

            if (previousStatus != item.Status)
            {
                item.Position = NextPosition(item.Status, item.Priority);
                ReindexBoard();
                RecordStatusHistory(item.Id, previousStatus, item.Status);
            }

            return ToWorkItemResponse(item);
        }
    }

    public WorkItemResponse MoveWorkItem(Guid id, MoveWorkItemRequest request)
    {
        lock (_sync)
        {
            var item = FindWorkItem(id);
            EnsureDefined(request.Status, "O status da tarefa informado é inválido.");

            if (request.Position < 0)
                throw new ValidationException("A posição da tarefa não pode ser negativa.");

            var previousStatus = item.Status;
            var group = _workItems
                .Where(other => other.Id != id
                    && other.Status == request.Status
                    && other.Priority == item.Priority)
                .OrderBy(other => other.Position)
                .ToList();

            item.Status = request.Status;
            item.UpdatedAt = DateTimeOffset.UtcNow;
            group.Insert(Math.Min(request.Position, group.Count), item);

            for (var index = 0; index < group.Count; index += 1)
                group[index].Position = index;

            ReindexBoard();

            if (previousStatus != request.Status)
                RecordStatusHistory(item.Id, previousStatus, item.Status);

            return ToWorkItemResponse(item);
        }
    }

    public void DeleteWorkItem(Guid id)
    {
        lock (_sync)
        {
            _workItems.Remove(FindWorkItem(id));
            ReindexBoard();
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

    public TeamMember CreateTeamMember(CreateTeamMemberRequest request)
    {
        lock (_sync)
        {
            var email = request.Email.Trim();
            if (_members.Any(member => string.Equals(member.Email, email, StringComparison.OrdinalIgnoreCase)))
                throw new ConflictException("Já existe um integrante com esse email.");

            var member = new TeamMember
            {
                Name = request.Name.Trim(),
                Role = request.Role.Trim(),
                Email = email,
                Initials = BuildInitials(request.Name)
            };

            _members.Add(member);
            return member;
        }
    }

    public TeamMember UpdateTeamMember(Guid id, UpdateTeamMemberRequest request)
    {
        lock (_sync)
        {
            var member = FindMember(id);
            var email = request.Email.Trim();

            if (_members.Any(other => other.Id != id
                && string.Equals(other.Email, email, StringComparison.OrdinalIgnoreCase)))
            {
                throw new ConflictException("Já existe um integrante com esse email.");
            }

            member.Name = request.Name.Trim();
            member.Role = request.Role.Trim();
            member.Email = email;
            member.Initials = BuildInitials(request.Name);

            return member;
        }
    }

    public void DeleteTeamMember(Guid id)
    {
        lock (_sync)
        {
            var member = FindMember(id);
            var projects = _projects.Count(project => project.OwnerId == id);
            var tasks = _workItems.Count(item => item.AssigneeId == id);

            if (projects > 0 || tasks > 0)
            {
                throw new ConflictException(
                    $"O integrante responde por {projects} projeto(s) e {tasks} tarefa(s) e não pode ser excluído.");
            }

            _members.Remove(member);
        }
    }

    private TeamMember FindMember(Guid id) =>
        _members.FirstOrDefault(member => member.Id == id)
        ?? throw new NotFoundException("Integrante não encontrado.");

    private static string BuildInitials(string name)
    {
        var parts = name
            .Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(part => char.IsLetter(part[0]))
            .ToList();

        if (parts.Count == 0)
            return string.Empty;

        var first = char.ToUpperInvariant(parts[0][0]);
        if (parts.Count == 1)
            return first.ToString();

        return $"{first}{char.ToUpperInvariant(parts[^1][0])}";
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

    private int NextPosition(WorkItemStatus status, WorkItemPriority priority) =>
        _workItems.Count(item => item.Status == status && item.Priority == priority);

    private void ReindexBoard()
    {
        foreach (var group in _workItems.GroupBy(item => (item.Status, item.Priority)))
        {
            var ordered = group.OrderBy(item => item.Position).ToList();
            for (var index = 0; index < ordered.Count; index += 1)
                ordered[index].Position = index;
        }
    }

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

    private static void ValidateWorkItemDueDate(DateOnly? dueDate, Project project)
    {
        if (!dueDate.HasValue)
            return;

        if (dueDate.Value < project.StartDate)
            throw new ValidationException("O prazo da tarefa não pode ser anterior à data inicial do projeto.");

        if (project.DueDate.HasValue && dueDate.Value > project.DueDate.Value)
            throw new ValidationException("O prazo da tarefa não pode ser posterior ao prazo do projeto.");
    }

    private static void EnsureDefined<TEnum>(TEnum value, string message) where TEnum : struct, Enum
    {
        if (!Enum.IsDefined(value))
            throw new ValidationException(message);
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
            item.Position,
            item.CreatedAt,
            item.UpdatedAt);
    }

    private static TaskHistoryEntryResponse ToHistoryResponse(TaskStatusHistoryEntry entry) =>
        new(entry.Id, entry.WorkItemId, entry.FromStatus, entry.ToStatus, entry.ChangedAt);

    private void Seed()
    {
        var allef = new TeamMember
        {
            Name = "Allef Oliveira Ramos",
            Role = "Frontend Developer",
            Email = "allef.ramos@example.com",
            Initials = "AR"
        };
        var camila = new TeamMember
        {
            Name = "Camila Félix dos Reis",
            Role = "Backend Developer",
            Email = "camila.reis@example.com",
            Initials = "CR"
        };
        var fernanda = new TeamMember
        {
            Name = "Fernanda de Oliveira da Costa",
            Role = "Backend Developer",
            Email = "fernanda.costa@example.com",
            Initials = "FC"
        };
        var juliana = new TeamMember
        {
            Name = "Juliana Ballin Lima",
            Role = "Backend Developer",
            Email = "juliana.lima@example.com",
            Initials = "JL"
        };
        var pedro = new TeamMember
        {
            Name = "Pedro Henrique Oliveira Dias",
            Role = "Backend Developer",
            Email = "pedro.dias@example.com",
            Initials = "PD"
        };

        _members.AddRange([allef, camila, fernanda, juliana, pedro]);

        var portal = new Project
        {
            Name = "Portal de Aprendizagem",
            Description = "Plataforma para organizar trilhas, conteúdos e acompanhamento de progresso.",
            Status = ProjectStatus.Active,
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-35)),
            DueDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(28)),
            OwnerId = camila.Id
        };
        var eventos = new Project
        {
            Name = "Agenda de Eventos",
            Description = "Sistema para publicação, inscrição e acompanhamento de eventos comunitários.",
            Status = ProjectStatus.Active,
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-18)),
            DueDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(45)),
            OwnerId = juliana.Id
        };
        var biblioteca = new Project
        {
            Name = "Biblioteca Digital",
            Description = "Catálogo colaborativo de livros, avaliações e listas de leitura.",
            Status = ProjectStatus.Planning,
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)),
            DueDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(90)),
            OwnerId = fernanda.Id
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
                AssigneeId = allef.Id,
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
                AssigneeId = juliana.Id,
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
                AssigneeId = pedro.Id,
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
                AssigneeId = juliana.Id,
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
                AssigneeId = camila.Id,
                DueDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(20)),
                EstimatedHours = 6
            }
        ]);

        foreach (var group in _workItems.GroupBy(item => (item.Status, item.Priority)))
        {
            var ordered = group.OrderBy(item => item.DueDate).ToList();
            for (var index = 0; index < ordered.Count; index += 1)
                ordered[index].Position = index;
        }
    }
}
