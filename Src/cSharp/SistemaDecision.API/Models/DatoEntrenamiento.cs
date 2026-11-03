namespace SistemaDecision.API.Models;

public class DatoEntrenamiento
{
    public int Id { get; set; }
    public string Descripcion { get; set; } = string.Empty;
    public string EntradasJson { get; set; } = "[]"; // 25 valores en formato JSON
    public string SalidaEsperada { get; set; } = string.Empty; // "Playa", "Cine", etc.
    public int IndiceClase { get; set; } // 0..4
}
