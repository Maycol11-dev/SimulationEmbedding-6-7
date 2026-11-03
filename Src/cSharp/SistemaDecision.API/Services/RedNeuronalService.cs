using Microsoft.EntityFrameworkCore;
using SistemaDecision.API.Data;
using SistemaDecision.API.Models;

namespace SistemaDecision.API.Services;

public class ForwardResult
{
    public double[] Entradas { get; set; } = Array.Empty<double>();
    public double[] Z1 { get; set; } = Array.Empty<double>();
    public double[] A1 { get; set; } = Array.Empty<double>();
    public double[] Z2 { get; set; } = Array.Empty<double>();
    public double[] A2 { get; set; } = Array.Empty<double>(); // Probabilidades
    public int IndicePredicho { get; set; }
    public string ActividadPredicha { get; set; } = string.Empty;
}

public class EntrenarResultado
{
    public double LossFinal { get; set; }
    public double AccuracyFinal { get; set; }
    public List<double> HistorialLoss { get; set; } = new();
}

public class RedNeuronalService
{
    public static readonly string[] Actividades = { "Playa", "Cine", "Gym", "Casa", "Salir" };

    private int _inputSize;
    private int _hiddenSize;
    private int _outputSize;

    // Pesos y Bias
    // W1: [_inputSize, _hiddenSize]
    // b1: [_hiddenSize]
    // W2: [_hiddenSize, _outputSize]
    // b2: [_outputSize]
    public double[,] W1 { get; private set; } = new double[0, 0];
    public double[] B1 { get; private set; } = Array.Empty<double>();
    public double[,] W2 { get; private set; } = new double[0, 0];
    public double[] B2 { get; private set; } = Array.Empty<double>();

    public void InicializarPesos(int inputSize, int hiddenSize, int outputSize)
    {
        _inputSize = inputSize;
        _hiddenSize = hiddenSize;
        _outputSize = outputSize;

        W1 = new double[inputSize, hiddenSize];
        B1 = new double[hiddenSize];
        W2 = new double[hiddenSize, outputSize];
        B2 = new double[outputSize];

        var rand = new Random(42);

        // He Initialization para ReLU: std = sqrt(2 / inputSize)
        double stdW1 = Math.Sqrt(2.0 / inputSize);
        for (int i = 0; i < inputSize; i++)
        {
            for (int j = 0; j < hiddenSize; j++)
            {
                W1[i, j] = GenerarGaussiana(rand, 0, stdW1);
            }
        }

        // Xavier Initialization para Softmax: std = sqrt(2 / (hiddenSize + outputSize))
        double stdW2 = Math.Sqrt(2.0 / (hiddenSize + outputSize));
        for (int j = 0; j < hiddenSize; j++)
        {
            for (int k = 0; k < outputSize; k++)
            {
                W2[j, k] = GenerarGaussiana(rand, 0, stdW2);
            }
        }

        // Bias arrancan en 0
        Array.Clear(B1, 0, B1.Length);
        Array.Clear(B2, 0, B2.Length);
    }

    private static double GenerarGaussiana(Random rand, double mean, double stdDev)
    {
        // Transformación Box-Muller
        double u1 = 1.0 - rand.NextDouble();
        double u2 = 1.0 - rand.NextDouble();
        double randStdNormal = Math.Sqrt(-2.0 * Math.Log(u1)) * Math.Sin(2.0 * Math.PI * u2);
        return mean + stdDev * randStdNormal;
    }

    public ForwardResult Forward(double[] input)
    {
        if (input.Length != _inputSize)
        {
            throw new ArgumentException($"Se esperaban {_inputSize} entradas, se recibieron {input.Length}.");
        }

        // Capa Oculta 1: z1 = W1 * x + b1
        double[] z1 = new double[_hiddenSize];
        double[] a1 = new double[_hiddenSize];

        for (int j = 0; j < _hiddenSize; j++)
        {
            double sum = B1[j];
            for (int i = 0; i < _inputSize; i++)
            {
                sum += input[i] * W1[i, j];
            }
            z1[j] = sum;
            // Activación ReLU
            a1[j] = Math.Max(0.0, sum);
        }

        // Capa Salida: z2 = W2 * a1 + b2
        double[] z2 = new double[_outputSize];
        for (int k = 0; k < _outputSize; k++)
        {
            double sum = B2[k];
            for (int j = 0; j < _hiddenSize; j++)
            {
                sum += a1[j] * W2[j, k];
            }
            z2[k] = sum;
        }

        // Activación Softmax con estabilidad numérica (restando max)
        double[] a2 = Softmax(z2);

        // Elegir la clase con mayor probabilidad
        int maxIndex = 0;
        double maxProb = a2[0];
        for (int k = 1; k < _outputSize; k++)
        {
            if (a2[k] > maxProb)
            {
                maxProb = a2[k];
                maxIndex = k;
            }
        }

        return new ForwardResult
        {
            Entradas = (double[])input.Clone(),
            Z1 = z1,
            A1 = a1,
            Z2 = z2,
            A2 = a2,
            IndicePredicho = maxIndex,
            ActividadPredicha = Actividades[maxIndex]
        };
    }

    private static double[] Softmax(double[] z)
    {
        int length = z.Length;
        double max = z[0];
        for (int i = 1; i < length; i++)
        {
            if (z[i] > max) max = z[i];
        }

        double[] exp = new double[length];
        double sum = 0.0;
        for (int i = 0; i < length; i++)
        {
            exp[i] = Math.Exp(z[i] - max);
            sum += exp[i];
        }

        double[] result = new double[length];
        for (int i = 0; i < length; i++)
        {
            result[i] = exp[i] / (sum + 1e-12);
        }
        return result;
    }

    public EntrenarResultado Entrenar(double[][] inputs, int[] targets, int epocas, double learningRate)
    {
        int n = inputs.Length;
        var historialLoss = new List<double>();

        int intervaloMuestreo = Math.Max(1, epocas / 100);

        for (int epoca = 1; epoca <= epocas; epoca++)
        {
            double totalLoss = 0.0;

            // Acumuladores de gradiente por lote completo
            double[,] gradW1 = new double[_inputSize, _hiddenSize];
            double[] gradB1 = new double[_hiddenSize];
            double[,] gradW2 = new double[_hiddenSize, _outputSize];
            double[] gradB2 = new double[_outputSize];

            for (int idx = 0; idx < n; idx++)
            {
                var x = inputs[idx];
                int target = targets[idx];

                // 1. Forward
                var fwd = Forward(x);

                // 2. Pérdida Cross-Entropy: -log(p_target)
                double probCorrecta = Math.Max(fwd.A2[target], 1e-12);
                totalLoss += -Math.Log(probCorrecta);

                // 3. Gradiente Salida: dz2 = a2 - y_onehot
                double[] dz2 = new double[_outputSize];
                for (int k = 0; k < _outputSize; k++)
                {
                    dz2[k] = fwd.A2[k] - (k == target ? 1.0 : 0.0);
                }

                // 4. Gradientes W2 y b2
                for (int j = 0; j < _hiddenSize; j++)
                {
                    for (int k = 0; k < _outputSize; k++)
                    {
                        gradW2[j, k] += fwd.A1[j] * dz2[k];
                    }
                }
                for (int k = 0; k < _outputSize; k++)
                {
                    gradB2[k] += dz2[k];
                }

                // 5. Backpropagation a capa oculta: da1 = W2 * dz2
                double[] dz1 = new double[_hiddenSize];
                for (int j = 0; j < _hiddenSize; j++)
                {
                    double sum = 0.0;
                    for (int k = 0; k < _outputSize; k++)
                    {
                        sum += dz2[k] * W2[j, k];
                    }
                    // Derivada de ReLU: 1 si z1 > 0, 0 sino
                    dz1[j] = fwd.Z1[j] > 0 ? sum : 0.0;
                }

                // 6. Gradientes W1 y b1
                for (int i = 0; i < _inputSize; i++)
                {
                    for (int j = 0; j < _hiddenSize; j++)
                    {
                        gradW1[i, j] += x[i] * dz1[j];
                    }
                }
                for (int j = 0; j < _hiddenSize; j++)
                {
                    gradB1[j] += dz1[j];
                }
            }

            // Actualizar pesos (promediando por el tamaño de lote n)
            double factor = learningRate / n;

            for (int i = 0; i < _inputSize; i++)
            {
                for (int j = 0; j < _hiddenSize; j++)
                {
                    W1[i, j] -= factor * gradW1[i, j];
                }
            }
            for (int j = 0; j < _hiddenSize; j++)
            {
                B1[j] -= factor * gradB1[j];
            }

            for (int j = 0; j < _hiddenSize; j++)
            {
                for (int k = 0; k < _outputSize; k++)
                {
                    W2[j, k] -= factor * gradW2[j, k];
                }
            }
            for (int k = 0; k < _outputSize; k++)
            {
                B2[k] -= factor * gradB2[k];
            }

            double avgLoss = totalLoss / n;

            if (epoca % intervaloMuestreo == 0 || epoca == epocas)
            {
                historialLoss.Add(Math.Round(avgLoss, 5));
            }
        }

        // Calcular precisión final
        int aciertos = 0;
        for (int idx = 0; idx < n; idx++)
        {
            var res = Forward(inputs[idx]);
            if (res.IndicePredicho == targets[idx])
            {
                aciertos++;
            }
        }

        double accuracyFinal = (double)aciertos / n;
        double lossFinal = historialLoss.LastOrDefault();

        return new EntrenarResultado
        {
            LossFinal = lossFinal,
            AccuracyFinal = accuracyFinal,
            HistorialLoss = historialLoss
        };
    }

    public async Task GuardarPesosAsync(AppDbContext db, int sesionId)
    {
        // 1. Capa Entrada -> Oculta
        var capa0 = new CapaRed
        {
            SesionId = sesionId,
            NumeroCapa = 0,
            NeuronasEntrada = _inputSize,
            NeuronasSalida = _hiddenSize,
            FuncionActivacion = "ReLU"
        };
        db.CapasRed.Add(capa0);
        await db.SaveChangesAsync();

        var pesosCapa0 = new List<Peso>();
        for (int i = 0; i < _inputSize; i++)
        {
            for (int j = 0; j < _hiddenSize; j++)
            {
                pesosCapa0.Add(new Peso
                {
                    CapaId = capa0.Id,
                    NeuronaDe = i,
                    NeuronaA = j,
                    Valor = W1[i, j],
                    EsBias = false
                });
            }
        }
        for (int j = 0; j < _hiddenSize; j++)
        {
            pesosCapa0.Add(new Peso
            {
                CapaId = capa0.Id,
                NeuronaDe = -1,
                NeuronaA = j,
                Valor = B1[j],
                EsBias = true
            });
        }
        await db.Pesos.AddRangeAsync(pesosCapa0);

        // 2. Capa Oculta -> Salida
        var capa1 = new CapaRed
        {
            SesionId = sesionId,
            NumeroCapa = 1,
            NeuronasEntrada = _hiddenSize,
            NeuronasSalida = _outputSize,
            FuncionActivacion = "Softmax"
        };
        db.CapasRed.Add(capa1);
        await db.SaveChangesAsync();

        var pesosCapa1 = new List<Peso>();
        for (int j = 0; j < _hiddenSize; j++)
        {
            for (int k = 0; k < _outputSize; k++)
            {
                pesosCapa1.Add(new Peso
                {
                    CapaId = capa1.Id,
                    NeuronaDe = j,
                    NeuronaA = k,
                    Valor = W2[j, k],
                    EsBias = false
                });
            }
        }
        for (int k = 0; k < _outputSize; k++)
        {
            pesosCapa1.Add(new Peso
            {
                CapaId = capa1.Id,
                NeuronaDe = -1,
                NeuronaA = k,
                Valor = B2[k],
                EsBias = true
            });
        }
        await db.Pesos.AddRangeAsync(pesosCapa1);

        await db.SaveChangesAsync();
    }

    public async Task CargarPesosAsync(AppDbContext db, int sesionId)
    {
        var capas = await db.CapasRed
            .Where(c => c.SesionId == sesionId)
            .OrderBy(c => c.NumeroCapa)
            .Include(c => c.Pesos)
            .ToListAsync();

        if (capas.Count < 2)
        {
            throw new InvalidOperationException($"La sesión {sesionId} no tiene las capas esperadas.");
        }

        var capa0 = capas[0];
        var capa1 = capas[1];

        _inputSize = capa0.NeuronasEntrada;
        _hiddenSize = capa0.NeuronasSalida;
        _outputSize = capa1.NeuronasSalida;

        W1 = new double[_inputSize, _hiddenSize];
        B1 = new double[_hiddenSize];
        W2 = new double[_hiddenSize, _outputSize];
        B2 = new double[_outputSize];

        foreach (var p in capa0.Pesos)
        {
            if (p.EsBias)
            {
                if (p.NeuronaA >= 0 && p.NeuronaA < _hiddenSize)
                    B1[p.NeuronaA] = p.Valor;
            }
            else
            {
                if (p.NeuronaDe >= 0 && p.NeuronaDe < _inputSize && p.NeuronaA >= 0 && p.NeuronaA < _hiddenSize)
                    W1[p.NeuronaDe, p.NeuronaA] = p.Valor;
            }
        }

        foreach (var p in capa1.Pesos)
        {
            if (p.EsBias)
            {
                if (p.NeuronaA >= 0 && p.NeuronaA < _outputSize)
                    B2[p.NeuronaA] = p.Valor;
            }
            else
            {
                if (p.NeuronaDe >= 0 && p.NeuronaDe < _hiddenSize && p.NeuronaA >= 0 && p.NeuronaA < _outputSize)
                    W2[p.NeuronaDe, p.NeuronaA] = p.Valor;
            }
        }
    }

    public PesosCapaDto[] ObtenerPesosDto()
    {
        // Capa 0
        var pesos0 = new double[_inputSize][];
        for (int i = 0; i < _inputSize; i++)
        {
            pesos0[i] = new double[_hiddenSize];
            for (int j = 0; j < _hiddenSize; j++)
            {
                pesos0[i][j] = Math.Round(W1[i, j], 4);
            }
        }
        var biases0 = B1.Select(b => Math.Round(b, 4)).ToArray();

        var dto0 = new PesosCapaDto(0, _inputSize, _hiddenSize, "ReLU", pesos0, biases0);

        // Capa 1
        var pesos1 = new double[_hiddenSize][];
        for (int j = 0; j < _hiddenSize; j++)
        {
            pesos1[j] = new double[_outputSize];
            for (int k = 0; k < _outputSize; k++)
            {
                pesos1[j][k] = Math.Round(W2[j, k], 4);
            }
        }
        var biases1 = B2.Select(b => Math.Round(b, 4)).ToArray();

        var dto1 = new PesosCapaDto(1, _hiddenSize, _outputSize, "Softmax", pesos1, biases1);

        return new[] { dto0, dto1 };
    }
}
