using Swashbuckle.AspNetCore.SwaggerGen;
using backend.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSingleton<IHostedService, CoapServerService>();

var app = builder.Build();

app.Run();
