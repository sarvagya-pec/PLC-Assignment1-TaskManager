using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http.Json;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);

//  Enable CORS so React (localhost:5173) can access backend (localhost:5098)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Configure JSON options (optional)
builder.Services.Configure<JsonOptions>(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = null;
});

var app = builder.Build();

//  Apply the CORS policy
app.UseCors("AllowFrontend");

app.MapGet("/", () => Results.Redirect("/api/tasks"));

//  In-memory task list
var tasks = new List<TaskItem>
{
    new TaskItem { Id = 1, Title = "Sample task", Description = "This is a sample task", IsCompleted = false, CreatedAt = DateTime.Now }
};
var nextId = 2;

//  GET all tasks
app.MapGet("/api/tasks", () => Results.Ok(tasks));

//  GET one task by ID
app.MapGet("/api/tasks/{id:int}", (int id) =>
{
    var t = tasks.FirstOrDefault(x => x.Id == id);
    return t is not null ? Results.Ok(t) : Results.NotFound();
});

//  POST create new task
app.MapPost("/api/tasks", (TaskCreateDto dto) =>
{
    if (string.IsNullOrWhiteSpace(dto.Title) || dto.Title.Length < 1)
        return Results.BadRequest("Title is required.");

    var t = new TaskItem
    {
        Id = nextId++,
        Title = dto.Title,
        Description = dto.Description ?? string.Empty,
        IsCompleted = false,
        CreatedAt = DateTime.Now
    };
    tasks.Add(t);
    return Results.Created($"/api/tasks/{t.Id}", t);
});

//  PUT toggle completion
app.MapPut("/api/tasks/{id:int}/toggle", (int id) =>
{
    var t = tasks.FirstOrDefault(x => x.Id == id);
    if (t is null) return Results.NotFound();
    t.IsCompleted = !t.IsCompleted;
    return Results.Ok(t);
});

//  DELETE remove a task
app.MapDelete("/api/tasks/{id:int}", (int id) =>
{
    var t = tasks.FirstOrDefault(x => x.Id == id);
    if (t is null) return Results.NotFound();
    tasks.Remove(t);
    return Results.NoContent();
});

app.Run();

//  Models
public class TaskItem
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
}

public class TaskCreateDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
}
