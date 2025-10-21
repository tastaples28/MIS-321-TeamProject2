using OceanFriendlyProductFinder.Services;

var builder = WebApplication.CreateBuilder(args);

// Configure to use port 5001 to avoid conflict with macOS AirPlay
builder.WebHost.UseUrls("http://localhost:5001");

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
app.UseAuthorization();
app.MapControllers();

app.Run();
