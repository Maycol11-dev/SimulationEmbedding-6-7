namespace SistemaDecision.API.Models;

public class CapaRed
{
    public int Id { get; set; }
    public int SesionId { get; set; }
    public int NumeroCapa { get; set; } // 0: Entrada -> Oculta, 1: Oculta -> Salida
    public int NeuronasEntrada { get; set; }
    public int NeuronasSalida { get; set; }
    public string FuncionActivacion { get; set; } = string.Empty;

    public SesionEntrenamiento? Sesion { get; set; }
    public List<Peso> Pesos { get; set; } = new();
}
