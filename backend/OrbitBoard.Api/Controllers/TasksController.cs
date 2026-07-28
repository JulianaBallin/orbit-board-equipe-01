using Microsoft.AspNetCore.Mvc;
using OrbitBoard.Api.DTOs;
using OrbitBoard.Api.Models;
using OrbitBoard.Api.Services;

namespace OrbitBoard.Api.Controllers;

[ApiController]
[Route("api/tasks")]
public sealed class TasksController(IWorkspaceService service) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType<IReadOnlyList<WorkItemResponse>>(StatusCodes.Status200OK)]
    public ActionResult<IReadOnlyList<WorkItemResponse>> GetAll(
        [FromQuery] Guid? projectId,
        [FromQuery] WorkItemStatus? status,
        [FromQuery] WorkItemPriority? priority,
        [FromQuery] Guid? assigneeId,
        [FromQuery] string? search) =>
        Ok(service.GetWorkItems(projectId, status, priority, assigneeId, search));

    [HttpGet("{id:guid}")]
    [ProducesResponseType<WorkItemResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult<WorkItemResponse> GetById(Guid id) => Ok(service.GetWorkItem(id));

    [HttpPost]
    [ProducesResponseType<WorkItemResponse>(StatusCodes.Status201Created)]
    public ActionResult<WorkItemResponse> Create(CreateWorkItemRequest request)
    {
        var item = service.CreateWorkItem(request);
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType<WorkItemResponse>(StatusCodes.Status200OK)]
    public ActionResult<WorkItemResponse> Update(Guid id, UpdateWorkItemRequest request) =>
        Ok(service.UpdateWorkItem(id, request));

    [HttpPatch("{id:guid}/status")]
    [ProducesResponseType<WorkItemResponse>(StatusCodes.Status200OK)]
    public ActionResult<WorkItemResponse> ChangeStatus(Guid id, ChangeWorkItemStatusRequest request) =>
        Ok(service.ChangeWorkItemStatus(id, request));

    [HttpPatch("{id:guid}/position")]
    [ProducesResponseType<WorkItemResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult<WorkItemResponse> Move(Guid id, MoveWorkItemRequest request) =>
        Ok(service.MoveWorkItem(id, request));

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public IActionResult Delete(Guid id)
    {
        service.DeleteWorkItem(id);
        return NoContent();
    }

    [HttpGet("{id:guid}/history")]
    [ProducesResponseType<IReadOnlyList<TaskHistoryEntryResponse>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult<IReadOnlyList<TaskHistoryEntryResponse>> GetHistory(Guid id) =>
        Ok(service.GetWorkItemHistory(id));
}
