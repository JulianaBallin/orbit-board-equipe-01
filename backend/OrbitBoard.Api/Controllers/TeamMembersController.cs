using Microsoft.AspNetCore.Mvc;
using OrbitBoard.Api.DTOs;
using OrbitBoard.Api.Models;
using OrbitBoard.Api.Services;

namespace OrbitBoard.Api.Controllers;

[ApiController]
[Route("api/team-members")]
public sealed class TeamMembersController(IWorkspaceService service) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType<IReadOnlyList<TeamMember>>(StatusCodes.Status200OK)]
    public ActionResult<IReadOnlyList<TeamMember>> GetAll() => Ok(service.GetTeamMembers());

    [HttpPost]
    [ProducesResponseType<TeamMember>(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public ActionResult<TeamMember> Create(CreateTeamMemberRequest request)
    {
        var member = service.CreateTeamMember(request);
        return CreatedAtAction(nameof(GetAll), new { id = member.Id }, member);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType<TeamMember>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public ActionResult<TeamMember> Update(Guid id, UpdateTeamMemberRequest request) =>
        Ok(service.UpdateTeamMember(id, request));

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public IActionResult Delete(Guid id)
    {
        service.DeleteTeamMember(id);
        return NoContent();
    }
}
