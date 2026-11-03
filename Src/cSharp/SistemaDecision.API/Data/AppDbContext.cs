using Microsoft.EntityFrameworkCore;
using SistemaDecision.API.Models;

namespace SistemaDecision.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<SesionEntrenamiento> SesionesEntrenamiento => Set<SesionEntrenamiento>();
    public DbSet<CapaRed> CapasRed => Set<CapaRed>();
    public DbSet<Peso> Pesos => Set<Peso>();
    public DbSet<DatoEntrenamiento> DatosEntrenamiento => Set<DatoEntrenamiento>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<SesionEntrenamiento>()
            .HasMany(s => s.Capas)
            .WithOne(c => c.Sesion)
            .HasForeignKey(c => c.SesionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<CapaRed>()
            .HasMany(c => c.Pesos)
            .WithOne(p => p.Capa)
            .HasForeignKey(p => p.CapaId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Peso>()
            .HasIndex(p => p.CapaId);

        modelBuilder.Entity<CapaRed>()
            .HasIndex(c => c.SesionId);
    }
}
