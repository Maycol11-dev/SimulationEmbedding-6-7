namespace SistemaDecision.API.Models;

public class Peso
{
    public int Id { get; set; }
    public int CapaId { get; set; }
    public int NeuronaDe { get; set; } // -1 para Bias
    public int NeuronaA { get; set; }
    public double Valor { get; set; }
    public bool EsBias { get; set; }

    public CapaRed? Capa { get; set; }
}
