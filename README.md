# SimulationEmbedding-6-7

Sistema de decisión con simulación/embedding. El repo integra una API en .NET y una app web MVC para visualizar, paso a paso, cómo aprende una red neuronal.

## Estructura

```text
SimulationEmbedding-6-7/
├── SistemaDecision.slnx        # Solución .NET (XML)
├── frontMVC/                   # Frontend MVC .NET 8 (visualizador del perceptrón)
└── Src/
    ├── cSharp/                # Código C# (.NET 10 API)
    │   └── SistemaDecision.API/
    └── python/                # Código Python + PyTorch
        ├── .venv/             # Entorno virtual (local)
        ├── mnist/             # CNN para reconocer dígitos (MNIST)
        └── perceptron3x1/     # Perceptrón 3 entradas -> 1 neurona
```

## Objetivo didáctico: Perceptrón 3x1

El corazón didáctico es entender el núcleo de las redes neuronales y, por extensión, las LLMs.

- **Entradas:** `[sol, calor, fin de semana]` (0/1)
- **Salida:** ¿Ir a la playa? (`SI` / `NO`)
- **Aprendizaje:** Ajustando **pesos + bias** para minimizar el error
- **Regla aprendida:** "Al menos 2 de 3" (voto por mayoría)

## Proyectos

### 1) `frontMVC` (visualizador web)

Visualiza el perceptrón sin escribir fórmulas frías. Se accede a `/Perceptron`.

| Vista | ¿Para qué? |
|---|---|
| **Inicio (/Perceptron)** | Presentación + conexión con LLMs (la diferencia es la escala) |
| **Entender** | Ver flechas, pesos, `z = w*x + b`, `sigmoid`, probabilidad y decisión en vivo |
| **Entrenar (animado)** | Ciclo `intentar → equivocarse → ajustar` con los 8 ejemplos de `playa.py`. Muestra perillas, predicción vs real y `loss` bajando |
| **Jugar** | Con pesos aprendidos `[7.0982, 7.0982, 7.0982]`, `b = -10.4991`. Mové los interruptores y mirá el cálculo en vivo |

### 2) `Src/python/perceptron3x1/`

- `playa.py` — Entrena un perceptrón con `PyTorch` (10.000 épocas). Imprime pesos iniciales/finales y pruebas.
- `README.md` — Explicación paso a paso del código, bucle `zero_grad → forward → loss → backward → step`, sigmoid, BCELoss.

### 3) `Src/python/mnist/`

- `train.py` — CNN chiquita para reconocer dígitos MNIST (5 épocas). Guarda `mnist.pth`.
- `README.md` — Explica `Conv2d`, `ReLU`, `MaxPool2d`, `Flatten`, `Linear`, `CrossEntropyLoss`, `argmax`, diferencia con el perceptrón (escalado).

### 4) `Src/cSharp/SistemaDecision.API/`

API minimal en **.NET 10** con OpenAPI. Actualmente es el scaffold del endpoint `/weatherforecast`. Pendiente integrar con el modelo.

## Cómo ejecutar

### Frontend MVC

```bash
cd frontMVC
dotnet run
```

Abrir la URL que muestre (por defecto `https://localhost:7xxx` o `http://localhost:5xxx`). Arranca directo en `/Perceptron`.

### Python (perceptrón 3x1)

```bash
cd Src/python
source .venv/bin/activate
cd perceptron3x1
python playa.py
```

### Python (MNIST)

```bash
cd Src/python
source .venv/bin/activate
cd mnist
python train.py
```

## Conceptos clave

| Concepto | Explicación |
|---|---|
| **Pesos (`w`)** | Importancia de cada entrada. Se aprenden. |
| **Bias (`b`)** | Umbral/exigencia de la neurona. Se aprende. |
| **Sigmoid** | Traduce `z` a probabilidad entre 0 y 1. |
| **Forward/Backward/Step** | Intentar → calcular error → ajustar perillas. |
| **Loss** | Qué tan lejos está la predicción. Se quiere minimizar. |
| **CNN** | Usa filtros para buscar bordes/partes, no mira píxeles sueltos. |
| **Escalado** | El mecanismo es el mismo: miles/billones de perillas en lugar de 4. |

## Notas

- El `.venv` de Python es local (ignorado por git).
- MNIST se descarga a `./data/` la primera vez.
- Los pesos reales usados en el frontend coinciden con la corrida de `playa.py`.
- Documentación didáctica en `Src/python/perceptron3x1/README.md` y `Src/python/mnist/README.md`.
