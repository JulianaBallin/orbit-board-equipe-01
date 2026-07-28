using System.Text.Json.Serialization;
using Microsoft.OpenApi.Models;
using OrbitBoard.Api.Middleware;
using OrbitBoard.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "OrbitBoard API",
        Version = "v1",
        Description = "API didática para gestão de projetos, tarefas e equipe."
    });
});

builder.Services.AddSingleton<IWorkspaceService, WorkspaceService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("Frontend");
app.MapControllers();

app.MapGet("/health", () => Results.Ok(new
{
    status = "healthy",
    service = "OrbitBoard.Api",
    utcTime = DateTimeOffset.UtcNow
})).WithTags("Health");

app.Run();
