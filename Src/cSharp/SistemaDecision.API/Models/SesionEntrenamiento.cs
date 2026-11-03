namespace SistemaDecision.API.Models;

public class SesionEntrenamiento
{
    public int Id { get; set; }
    public DateTime Fecha { get; set; } = DateTime.UtcNow;
    public int Epocas { get; set; }
    public double LearningRate { get; set; }
    public double LossFinal { get; set; }
    public double AccuracyFinal { get; set; }
    public string Arquitectura { get; set; } = string.Empty;
    public bool EsActiva { get; set; }

    public List<CapaRed> Capas { get; set; } = new();
}
