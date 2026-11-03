namespace SistemaDecision.API.Models;

public record PredecirRequest(double[] Entradas);

public record PredecirResponse(
    string Prediccion,
    Dictionary<string, double> Probabilidades,
    int SesionUsada
);

public record EntrenarRequest(
    int Epocas = 5000,
    double LearningRate = 0.05,
    int NeuronasOcultas = 8
);

public record EntrenarResponse(
    int SesionId,
    double LossFinal,
    double AccuracyFinal,
    List<double> HistorialLoss,
    string Arquitectura
);

public record ForwardPasoRequest(double[] Entradas);

public record ForwardPasoResponse(
    double[] Entradas,
    double[] HiddenPreActivacion,
    double[] HiddenPostActivacion,
    double[] SalidaPreActivacion,
    Dictionary<string, double> Probabilidades,
    string Prediccion,
    PesosCapaDto[] Capas
);

public record PesosCapaDto(
    int NumeroCapa,
    int NeuronasEntrada,
    int NeuronasSalida,
    string FuncionActivacion,
    double[][] Pesos,
    double[] Biases
);

public record SesionDto(
    int Id,
    DateTime Fecha,
    int Epocas,
    double LearningRate,
    double LossFinal,
    double AccuracyFinal,
    string Arquitectura,
    bool EsActiva
);
