using OceanFriendlyProductFinder.Services;

var builder = WebApplication.CreateBuilder(args);

// Configure to use Heroku's PORT environment variable
var port = Environment.GetEnvironmentVariable("PORT") ?? "5001";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Register services
builder.Services.AddSingleton<DatabaseService>();
builder.Services.AddScoped<OceanScoreService>();
builder.Services.AddScoped<SeedDataService>();

var app = builder.Build();

// Seed data on startup
using (var scope = app.Services.CreateScope())
{
    var seedService = scope.ServiceProvider.GetRequiredService<SeedDataService>();
    await seedService.SeedDataAsync();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseHttpsRedirection();

// Serve static files from the Client directory
// On Heroku, the path is MIS-321-TeamProject2/Client
var baseDir = Directory.GetCurrentDirectory();
var clientPath = Path.Combine(baseDir, "..", "MIS-321-TeamProject2", "Client");
if (!Directory.Exists(clientPath))
{
    // Try alternative path
    clientPath = Path.Combine(baseDir, "..", "..", "MIS-321-TeamProject2", "Client");
}
Console.WriteLine($"Serving static files from: {clientPath}");
Console.WriteLine($"Current directory: {baseDir}");

app.UseDefaultFiles(new DefaultFilesOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(clientPath),
    RequestPath = ""
});
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(clientPath),
    RequestPath = ""
});

app.UseAuthorization();
app.MapControllers();

app.Run();
