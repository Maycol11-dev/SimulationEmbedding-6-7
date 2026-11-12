# SimulationEmbedding-6-7

Repositorio didáctico sobre redes neuronales. Incluye una aplicación web ASP.NET Core MVC, una API REST con SQLite y dos ejemplos de entrenamiento en Python con PyTorch.

## Estructura

```text
SimulationEmbedding-6-7/
├── SistemaDecision.slnx
├── frontMVC/                         # Aplicación web ASP.NET Core MVC (.NET 8)
│   ├── Controllers/
│   ├── Views/
│   └── wwwroot/                       # CSS y JavaScript de las simulaciones
└── Src/
    ├── cSharp/
    │   └── SistemaDecision.API/       # API REST ASP.NET Core (.NET 10) y SQLite
    └── python/
        ├── perceptron3x1/             # Perceptrón de 3 entradas y 1 salida
        └── mnist/                     # CNN para clasificar dígitos MNIST
```

## Requisitos

- .NET SDK compatible con los proyectos .NET 8 y .NET 10. Para ejecutar la aplicación MVC, también debe estar instalado el runtime de .NET 8.
- Python 3.10 o posterior para los ejemplos Python.
- PyTorch para `playa.py`; PyTorch y Torchvision para `train.py`.

La solución contiene ambos proyectos C#: `frontMVC` y `SistemaDecision.API`.

## Aplicación web MVC

La aplicación MVC presenta las simulaciones educativas. Para iniciarla desde la raíz del repositorio:

```bash
dotnet run --project frontMVC/frontMVC.csproj --launch-profile http
```

El perfil HTTP está configurado en `http://localhost:5267`. La ruta raíz redirige al inicio del perceptrón.

| Ruta | Contenido |
|---|---|
| `/Perceptron` | Introducción al perceptrón y acceso a las simulaciones |
| `/Perceptron/Neural` | Recorrido interactivo del perceptrón de 3 entradas |
| `/Perceptron/TikTok` | Simulación didáctica de recomendación con 25 señales, capa oculta configurable y 3 resultados: retención, salto e interacción |
| `/Actividad` | Introducción a la red multicapa para recomendar una actividad |
| `/Actividad/Probar` | Predicción interactiva con 25 entradas |
| `/Actividad/Entrenar` | Entrenamiento, curva de pérdida e historial de sesiones |
| `/Actividad/Red` | Inspección visual de la arquitectura y sus pesos |

El simulador de recomendación de TikTok es una demostración local del comportamiento de una red: el control de scroll recorre escenarios de ejemplo. No está conectado al servicio oficial de TikTok ni descarga videos de la plataforma.

## API REST y base de datos

La API implementa una red neuronal multicapa para recomendar una actividad según 25 entradas. Usa una capa oculta configurable, 5 salidas, backpropagation y SQLite para conservar sesiones y pesos. Al iniciarse, crea la base `decisiones.db`, carga datos de ejemplo y entrena una sesión inicial si todavía no existe una activa.

Para iniciarla desde la raíz:

```bash
dotnet run --project Src/cSharp/SistemaDecision.API/SistemaDecision.API.csproj --launch-profile http
```

La API escucha en `http://localhost:5050`. La página `/Actividad/Probar` usa esa dirección para las predicciones y mantiene un modo didáctico local si la API no está disponible. Las páginas de entrenamiento e inspección de la base de datos requieren que la API esté ejecutándose.

Endpoints disponibles:

| Método | Ruta | Función |
|---|---|---|
| `POST` | `/api/red/entrenar` | Entrena la red y guarda una nueva sesión y sus pesos |
| `POST` | `/api/red/predecir` | Predice una actividad a partir de 25 entradas |
| `POST` | `/api/red/forward-paso` | Devuelve los valores intermedios del cálculo y las probabilidades |
| `GET` | `/api/red/pesos/{sesionId}` | Consulta los pesos de una sesión |
| `GET` | `/api/red/sesiones` | Lista las sesiones de entrenamiento |
| `PUT` | `/api/red/sesiones/{id}/activar` | Activa una sesión guardada |
| `GET` | `/api/red/datos` | Consulta los datos de entrenamiento |

En entorno de desarrollo, la especificación OpenAPI está disponible en `/openapi/v1.json`.

### Ejecutar MVC y API juntas

La API debe estar activa en un terminal y la aplicación MVC en otro:

```bash
# Terminal 1: API en http://localhost:5050
dotnet run --project Src/cSharp/SistemaDecision.API/SistemaDecision.API.csproj --launch-profile http

# Terminal 2: MVC en http://localhost:5267
dotnet run --project frontMVC/frontMVC.csproj --launch-profile http
```

Si el puerto ya está ocupado, no inicies otra instancia en el mismo perfil: detén la instancia anterior con `Ctrl+C` o configura otro puerto en `Properties/launchSettings.json`.

## Ejemplos Python

Los ejemplos requieren PyTorch. El entrenamiento MNIST también necesita Torchvision. Crea un entorno virtual e instala las dependencias:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install torch torchvision
```

En Windows, activa el entorno con `.venv\\Scripts\\activate`.

### Perceptrón 3×1

`Src/python/perceptron3x1/playa.py` aprende a decidir si ir a la playa a partir de sol, calor y fin de semana. Entrena una neurona con sigmoid y pérdida BCE para clasificar los 8 casos de ejemplo.

```bash
cd Src/python/perceptron3x1
python playa.py
```

### Clasificación MNIST

`Src/python/mnist/train.py` entrena una CNN para clasificar dígitos escritos a mano del 0 al 9. Usa CPU por defecto si CUDA no está disponible, evalúa el modelo y guarda los pesos en `mnist.pth`. El dataset se descarga automáticamente a `data/` si hace falta.

```bash
cd Src/python/mnist
python train.py
```

## Ideas clave

| Concepto | Significado |
|---|---|
| Pesos (`w`) | Ajustan la importancia que tiene cada entrada. |
| Bias (`b`) | Desplaza el umbral de activación de una neurona. |
| Forward | Calcula la salida de la red para unas entradas. |
| Loss | Mide el error entre la predicción y la respuesta esperada. |
| Backpropagation | Calcula cómo modificar los parámetros para reducir el error. |
| Optimizador | Actualiza los pesos y bias usando los gradientes calculados. |
| ReLU y Softmax | Activaciones usadas en la red multicapa de recomendación de actividades. |

## Documentación adicional

- [Explicación del perceptrón 3×1](Src/python/perceptron3x1/README.md)
- [Explicación de la CNN MNIST](Src/python/mnist/README.md)