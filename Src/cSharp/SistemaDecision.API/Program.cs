using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using SistemaDecision.API.Data;
using SistemaDecision.API.Models;
using SistemaDecision.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Configurar SQLite
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=decisiones.db"));

// Habilitar CORS para que el frontend MVC pueda llamar a la API
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddOpenApi();

var app = builder.Build();

// Inicialización de la Base de Datos y Seed
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
    await SeedData.InicializarAsync(db);

    // Si aún no hay ninguna sesión activa, entrenamos una automáticamente
    if (!await db.SesionesEntrenamiento.AnyAsync(s => s.EsActiva))
    {
        var datos = await db.DatosEntrenamiento.ToListAsync();
        if (datos.Count > 0)
        {
            var inputs = datos.Select(d => JsonSerializer.Deserialize<double[]>(d.EntradasJson)!).ToArray();
            var targets = datos.Select(d => d.IndiceClase).ToArray();

            var red = new RedNeuronalService();
            red.InicializarPesos(25, 8, 5);
            var resultado = red.Entrenar(inputs, targets, epocas: 2500, learningRate: 0.08);

            var sesionInicial = new SesionEntrenamiento
            {
                Epocas = 2500,
                LearningRate = 0.08,
                LossFinal = resultado.LossFinal,
                AccuracyFinal = resultado.AccuracyFinal,
                Arquitectura = "25-8-5",
                EsActiva = true
            };
            db.SesionesEntrenamiento.Add(sesionInicial);
            await db.SaveChangesAsync();

            await red.GuardarPesosAsync(db, sesionInicial.Id);
        }
    }
}

app.UseCors();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// ==========================================
// ENDPOINTS DE LA RED NEURONAL
// ==========================================

// 1. Entrenar la red neuronal y guardar pesos en SQLite
app.MapPost("/api/red/entrenar", async (EntrenarRequest req, AppDbContext db) =>
{
    var datos = await db.DatosEntrenamiento.ToListAsync();
    if (datos.Count == 0)
    {
        return Results.BadRequest(new { error = "No hay datos de entrenamiento disponibles en la base de datos." });
    }

    var inputs = datos.Select(d => JsonSerializer.Deserialize<double[]>(d.EntradasJson)!).ToArray();
    var targets = datos.Select(d => d.IndiceClase).ToArray();

    int neuronasOcultas = req.NeuronasOcultas > 0 ? req.NeuronasOcultas : 8;
    int epocas = req.Epocas > 0 ? req.Epocas : 3000;
    double lr = req.LearningRate > 0 ? req.LearningRate : 0.05;

    var red = new RedNeuronalService();
    red.InicializarPesos(25, neuronasOcultas, 5);
    var resultado = red.Entrenar(inputs, targets, epocas, lr);

    // Desactivar sesiones anteriores
    var sesionesAnteriores = await db.SesionesEntrenamiento.Where(s => s.EsActiva).ToListAsync();
    foreach (var s in sesionesAnteriores)
    {
        s.EsActiva = false;
    }

    var sesion = new SesionEntrenamiento
    {
        Epocas = epocas,
        LearningRate = lr,
        LossFinal = resultado.LossFinal,
        AccuracyFinal = resultado.AccuracyFinal,
        Arquitectura = $"25-{neuronasOcultas}-5",
        EsActiva = true
    };
    db.SesionesEntrenamiento.Add(sesion);
    await db.SaveChangesAsync();

    // Guardar los pesos y bias calculados
    await red.GuardarPesosAsync(db, sesion.Id);

    return Results.Ok(new EntrenarResponse(
        sesion.Id,
        resultado.LossFinal,
        resultado.AccuracyFinal,
        resultado.HistorialLoss,
        sesion.Arquitectura
    ));
});

// 2. Predecir actividad dados 25 valores de entrada (usa pesos guardados en SQLite)
app.MapPost("/api/red/predecir", async (PredecirRequest req, AppDbContext db) =>
{
    if (req.Entradas == null || req.Entradas.Length != 25)
    {
        return Results.BadRequest(new { error = "Se requieren exactamente 25 entradas normalizadas entre 0 y 1." });
    }

    var sesion = await db.SesionesEntrenamiento.FirstOrDefaultAsync(s => s.EsActiva);
    if (sesion == null)
    {
        return Results.BadRequest(new { error = "No hay una sesión de entrenamiento activa en la base de datos." });
    }

    var red = new RedNeuronalService();
    await red.CargarPesosAsync(db, sesion.Id);

    var res = red.Forward(req.Entradas);

    var probabilidades = new Dictionary<string, double>();
    for (int k = 0; k < RedNeuronalService.Actividades.Length; k++)
    {
        probabilidades[RedNeuronalService.Actividades[k]] = Math.Round(res.A2[k], 4);
    }

    return Results.Ok(new PredecirResponse(
        res.ActividadPredicha,
        probabilidades,
        sesion.Id
    ));
});

// 3. Forward paso a paso para visualización pedagógica de operaciones internas
app.MapPost("/api/red/forward-paso", async (ForwardPasoRequest req, AppDbContext db) =>
{
    if (req.Entradas == null || req.Entradas.Length != 25)
    {
        return Results.BadRequest(new { error = "Se requieren exactamente 25 entradas." });
    }

    var sesion = await db.SesionesEntrenamiento.FirstOrDefaultAsync(s => s.EsActiva);
    if (sesion == null)
    {
        return Results.BadRequest(new { error = "No hay una sesión de entrenamiento activa." });
    }

    var red = new RedNeuronalService();
    await red.CargarPesosAsync(db, sesion.Id);

    var res = red.Forward(req.Entradas);

    var probabilidades = new Dictionary<string, double>();
    for (int k = 0; k < RedNeuronalService.Actividades.Length; k++)
    {
        probabilidades[RedNeuronalService.Actividades[k]] = Math.Round(res.A2[k], 4);
    }

    return Results.Ok(new ForwardPasoResponse(
        res.Entradas,
        res.Z1.Select(v => Math.Round(v, 4)).ToArray(),
        res.A1.Select(v => Math.Round(v, 4)).ToArray(),
        res.Z2.Select(v => Math.Round(v, 4)).ToArray(),
        probabilidades,
        res.ActividadPredicha,
        red.ObtenerPesosDto()
    ));
});

// 4. Obtener matriz de pesos y bias de una sesión
app.MapGet("/api/red/pesos/{sesionId:int}", async (int sesionId, AppDbContext db) =>
{
    var sesion = await db.SesionesEntrenamiento.FindAsync(sesionId);
    if (sesion == null)
    {
        return Results.NotFound(new { error = $"Sesión {sesionId} no encontrada." });
    }

    var red = new RedNeuronalService();
    await red.CargarPesosAsync(db, sesionId);

    return Results.Ok(red.ObtenerPesosDto());
});

// 5. Listar sesiones de entrenamiento registradas en SQLite
app.MapGet("/api/red/sesiones", async (AppDbContext db) =>
{
    var sesiones = await db.SesionesEntrenamiento
        .OrderByDescending(s => s.Fecha)
        .Select(s => new SesionDto(
            s.Id,
            s.Fecha,
            s.Epocas,
            s.LearningRate,
            s.LossFinal,
            s.AccuracyFinal,
            s.Arquitectura,
            s.EsActiva
        ))
        .ToListAsync();

    return Results.Ok(sesiones);
});

// 6. Activar una sesión guardada para que se use en las predicciones
app.MapPut("/api/red/sesiones/{id:int}/activar", async (int id, AppDbContext db) =>
{
    var sesionObjetivo = await db.SesionesEntrenamiento.FindAsync(id);
    if (sesionObjetivo == null)
    {
        return Results.NotFound(new { error = $"Sesión {id} no encontrada." });
    }

    var todas = await db.SesionesEntrenamiento.ToListAsync();
    foreach (var s in todas)
    {
        s.EsActiva = (s.Id == id);
    }
    await db.SaveChangesAsync();

    return Results.Ok(new { mensaje = $"Sesión {id} activada exitosamente." });
});

// 7. Consultar datos de entrenamiento
app.MapGet("/api/red/datos", async (AppDbContext db) =>
{
    var datos = await db.DatosEntrenamiento.ToListAsync();
    return Results.Ok(datos);
});

app.Run();
