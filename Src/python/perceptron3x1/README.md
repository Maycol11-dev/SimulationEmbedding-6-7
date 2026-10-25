# `playa.py` — Perceptrón de 3 entradas → 1 neurona

Este archivo es el ejemplo **más pequeño posible** de una red neuronal que aprende.
No reconoce imágenes todavía: decide si conviene **ir a la playa** a partir de 3 datos.

El objetivo del archivo es entender el ciclo completo de entrenamiento sin distracciones:

```text
entrada  →  neurona (suma ponderada + sigmoid)  →  probabilidad  →  decisión
```

---

## 1. Qué recibe y qué devuelve

### Entradas (`X`)

Cada fila es un caso. Cada columna es una condición, codificada como `1` (sí) o `0` (no):

| Columna | Condición |
|---|---|
| `x1` | ¿Hay sol? |
| `x2` | ¿Hace calor? |
| `x3` | ¿Es fin de semana? |

### Salida esperada (`y`)

- `1.0` → **SÍ** ir a la playa
- `0.0` → **NO** ir a la playa

### Los 8 ejemplos del archivo

| `[sol, calor, finde]` | `y` | Interpretación |
|---|---|---|
| `[1, 1, 1]` | 1 | sol + calor + finde |
| `[1, 1, 0]` | 1 | sol + calor entre semana |
| `[0, 1, 1]` | 1 | calor + finde |
| `[1, 0, 1]` | 1 | sol + finde |
| `[0, 0, 0]` | 0 | nada |
| `[1, 0, 0]` | 0 | solo sol |
| `[0, 0, 1]` | 0 | solo finde |
| `[0, 1, 0]` | 0 | solo calor |

> Regla oculta en los datos: ir a la playa si se cumplen **al menos 2 de las 3** condiciones.

---

## 2. Los procesos, en orden

### Proceso A — Definir los datos

```python
X = torch.tensor([...], dtype=torch.float32)
y = torch.tensor([...], dtype=torch.float32)
```

Se guardan entradas y respuestas en **tensores** (matrices de números).
`float32` es el tipo numérico estándar en redes neuronales.

### Proceso B — Definir la red

```python
class Perceptron3x1(nn.Module):
    def __init__(self):
        super().__init__()
        self.linear = nn.Linear(in_features=3, out_features=1)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        return self.sigmoid(self.linear(x))
```

La neurona hace dos operaciones:

**1. Suma ponderada** (`nn.Linear`):

```text
z = w1·x1 + w2·x2 + w3·x3 + b
```

- `w1, w2, w3` → **pesos**: cuánto importa cada condición.
- `b` → **bias**: umbral base de la neurona.
- Los 4 valores (`w1, w2, w3, b`) son las **perillas** que se van a aprender.

**2. Activación** (`nn.Sigmoid`):

```text
p = 1 / (1 + e^(-z))
```

Aplasta cualquier número `z` al rango `(0, 1)`, para interpretarlo como **probabilidad**.

| `z` | `p` |
|---|---|
| muy negativo | ≈ 0 |
| 0 | 0.5 |
| muy positivo | ≈ 1 |

La línea `super().__init__()` es obligatoria: registra la clase como módulo de PyTorch.
`forward()` define el camino que siguen los datos.

### Proceso C — Configurar el entrenamiento

```python
criterion = nn.BCELoss()
optimizer = torch.optim.SGD(model.parameters(), lr=0.1)
```

- `criterion` → **función de pérdida**. `BCELoss` (Binary Cross Entropy) mide qué tan lejos
  está la predicción de la respuesta correcta. Errores grandes = pérdida alta.
- `optimizer` → **optimizador**. `SGD` (gradiente descendente) es quien gira las perillas.
  `lr=0.1` es el **learning rate**: el tamaño del paso al ajustar.
- `model.parameters()` → entrega los 4 valores (`w1, w2, w3, b`) al optimizador.

### Proceso D — El bucle de entrenamiento

```python
for epoch in range(10000):
    optimizer.zero_grad()      # 1. limpiar gradientes anteriores
    pred = model(X)            # 2. FORWARD: predecir
    loss = criterion(pred, y)  # 3. medir el error
    loss.backward()            # 4. BACKWARD: calcular gradientes
    optimizer.step()           # 5. actualizar pesos
```

Se repite 10.000 veces (cada vuelta es una **época**). En cada vuelta:

| # | Línea | Qué pasa |
|---|---|---|
| 1 | `zero_grad()` | Borra los gradientes acumulados. Si se omite, se suman y el ajuste se corrompe. |
| 2 | `model(X)` | Pasa los 8 ejemplos por la neurona → 8 probabilidades. |
| 3 | `criterion(...)` | Compara las 8 predicciones con las 8 respuestas reales → un número de error. |
| 4 | `loss.backward()` | **Retropropagación**: calcula, para cada perilla, hacia dónde moverla para bajar el error (derivadas). |
| 5 | `optimizer.step()` | Aplica el ajuste: mueve cada perilla un poquito en la dirección que reduce el error. |

El `print` cada 1000 épocas permite ver la pérdida bajando, es decir, **el aprendizaje en vivo**.

### Proceso E — Evaluar el modelo

```python
model.eval()
with torch.no_grad():
    pred = model(test)
```

- `model.eval()` → pone la red en **modo prueba** (sin entrenar).
- `torch.no_grad()` → no calcula gradientes, así consume menos memoria y es más rápido (no se necesita para predecir).
- `p.item()` → extrae el número del tensor para imprimirlo.
- `p > 0.5` → umbral de decisión: si la probabilidad supera 0.5, la respuesta es **SÍ**.

---

## 3. Qué se obtiene al ejecutarlo

### Antes de entrenar (pesos aleatorios)

```text
Pesos iniciales: tensor([[-0.2396, 0.2819, -0.2356]])
Bias inicial:    tensor([-0.3107])
```

### Durante el entrenamiento (la pérdida baja)

```text
Epoch 0     - Loss: 0.743654
Epoch 1000  - Loss: 0.164637
Epoch 2000  - Loss: 0.096890
Epoch 3000  - Loss: 0.068139
Epoch 4000  - Loss: 0.052318
Epoch 5000  - Loss: 0.042356
Epoch 6000  - Loss: 0.035529
Epoch 7000  - Loss: 0.030569
Epoch 8000  - Loss: 0.026807
Epoch 9000  - Loss: 0.023859
```

### Después de entrenar

```text
Pesos finales: tensor([[7.0982, 7.0982, 7.0982]])
Bias final:    tensor([-10.4991])
```

### Qué significan esos números

La red descubrió que **las 3 condiciones valen lo mismo** (pesos iguales) y que
necesita que se junten **al menos 2** para activarse:

```text
z = 7.0982·(sol + calor + finde) − 10.4991
```

Umbral: se activa cuando `sol + calor + finde > 1.48`, o sea con **2 o 3 condiciones**.

| Suma | `z` | Probabilidad | Decisión |
|---|---|---|---|
| 3 | +10.80 | ≈ 1.0000 | SÍ |
| 2 | +3.70 | ≈ 0.9756 | SÍ |
| 1 | −3.40 | ≈ 0.0323 | NO |
| 0 | −10.50 | ≈ 0.0000 | NO |

Por eso las pruebas finales dan:

```text
Entrada [1.0, 1.0, 1.0] -> 1.0000 (SI)
Entrada [0.0, 0.0, 1.0] -> 0.0323 (NO)
Entrada [1.0, 0.0, 0.0] -> 0.0323 (NO)
Entrada [0.0, 1.0, 0.0] -> 0.0323 (NO)
```

> Nota: la regla aprendida es **"al menos 2 de 3"** (voto por mayoría), no un `AND` estricto,
> porque los datos de entrenamiento incluyen casos con 2 condiciones como `SÍ`.

---

## 4. Cómo ejecutarlo

Desde `Src/python/`:

```bash
perceptron3x1/../.venv/bin/python perceptron3x1/playa.py
```

O activando el entorno virtual:

```bash
source .venv/bin/activate
python perceptron3x1/playa.py
```

---

## 5. Glosario mínimo

| Término | Significado |
|---|---|
| **Tensor** | Matriz de números (aquí, los datos y los pesos). |
| **Peso (`w`)** | Cuánto importa una entrada. Se aprende. |
| **Bias (`b`)** | Umbral base de la neurona. Se aprende. |
| **Sigmoid** | Función que convierte cualquier número en probabilidad `0-1`. |
| **Loss** | Número que mide el error actual. Objetivo: bajarlo. |
| **Forward** | Pasar datos por la red para obtener una predicción. |
| **Backward** | Calcular qué ajustar para reducir el error. |
| **Optimizador** | Aplica esos ajustes sobre los pesos. |
| **Learning rate** | Tamaño del paso de cada ajuste. |
| **Época** | Una pasada completa sobre todos los datos. |

---

## 6. Por qué este archivo importa

Todo lo demás (MNIST, CNN, etc.) es este mismo ciclo, **escalado**:

- más entradas (784 píxeles en vez de 3),
- más neuronas y capas,
- convoluciones para entender la posición de los píxeles,
- pero **el mismo bucle**: `zero_grad → forward → loss → backward → step`.

Si se entiende este archivo, se entiende el núcleo del entrenamiento de cualquier red.
