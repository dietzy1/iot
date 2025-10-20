using Swashbuckle.AspNetCore.SwaggerGen;
using backend.Services;
using backend.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add CORS for frontend dashboard
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowDashboard", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// Configure SQLite DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
	options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register domain services
builder.Services.AddScoped<TemperatureService>();
builder.Services.AddScoped<NoiseService>();
builder.Services.AddScoped<SeatService>();

// Register background services
builder.Services.AddSingleton<IHostedService, CoapServerService>();
builder.Services.AddHostedService<MqttSubscriberService>();

var app = builder.Build();

// Apply migrations on startup (optional, but convenient for development)
using (var scope = app.Services.CreateScope())
{
	var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
	dbContext.Database.Migrate();
}

// Configure middleware pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Enable CORS
app.UseCors("AllowDashboard");

app.UseRouting();
app.MapControllers();

app.Run();
