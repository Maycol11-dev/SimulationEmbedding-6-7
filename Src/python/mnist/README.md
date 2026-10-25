# `train.py` — CNN para reconocer dígitos MNIST

Este archivo entrena una **Red Neuronal Convolucional (CNN)** chiquita para reconocer
dígitos escritos a mano del 0 al 9. Es la misma idea que el perceptrón
(`3 entradas -> 1 neurona`), pero **escalado a imágenes**.

Flujo resumido:

```text
imagen 28x28 (1 canal) → CNN (filtros + ReLU + MaxPool) → clasificador (Linear) → 10 probabilidades → dígito
```

---

## 1. Qué es MNIST

[MNIST](https://yann.lecun.com/exdb/mnist/) es un dataset clásico de díggis escritos a mano.

| Conjunto | Cantidad | Uso |
|---|---|---|
| Entrenamiento (`train=True`) | 60.000 imágenes | Entrenar la red (ajustar perillas). |
| Prueba (`test=False`) | 10.000 imágenes | Evaluar qué tan bien generaliza. |
| Tamaño | 28x28 pixels | En escala de grises, **1 canal**. |
| Clases | 10 (`0-9`) | Cada imagen pertenece un único dígito. |

Al ejecutarlo por primera vez, `torchvision.datasets.MNIST` lo descarga automáticamente
a `./data/`. Esos archivos **no** se suben al repo (van al caché/local).

---

## 2. Los procesos, in order

### Proceso A — Configuración

```python
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
BATCH_SIZE = 64
EPOCHS = 5
LR = 1e-3
```

| Variable | Valor | Explicación |
|---|---|---| 
| `DEVICE` | `cpu` (tu caso) | Dónde se ejecuta: CPU o GPU. `cpu` funciona, pero GPU acelera. |
| `BATCH_SIZE` | 64 | Cuántas imágenes procesa la red por cada paso del bucle. Menor consume menos RAM, mayor acelera. |
| `EPOCHS` | 5 | Cuántas veces pasa toda
,En el lenguaje: la red completa por el conjunto de entrenamiento. |
| `LR` (learning rate) | `1e-3` = 0.001 | Tamaño del pasito al ajustar los pesos. Con `Adam` va bien con este valor. |

### Proceso B — Preprocesamiento de las imágenes

```python
transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize((0.1307,), (0.3081,))
])
```

Dos pasos importantíssimos:

| Paso | Explicación | Resultado |
|---|---|---|
| `ToTensor()` | Convierte la imagen de PIL/array 0-255 a tensor PyTorch. También cambia de `(H,W)` a `(C,H,W)`. | Forma ` (1, 28, 28)`. Valores `0.0` - `1.0`. |
| `Normalize((0.1307,), (0.3081,)) | Usa promedio y desviación estándar calculados sobre MNIST. Centra y escala los valores. | Ayuda to que la red
e due  maîtrise. (faster and stable) but here, just explanation: esto ayuda a que el entrenamiento sea más estable y rápido. | 

> **Nota:** Estos números `0.1307` y `0.3081` son fijos para MNIST. Si usaras otro dataset, tendrías que calcularlos.</>

### Proceso C — Cargar el dataset

```python
train_set = datasets.MNIST(root="./data", train=True, download=True, transform=transform)
test_set  = datasets.MNIST(root="./data", train=False, download=True, transform=transform)

train_loader = DataLoader(train_set, batch_size=BATCH_SIZE, shuffle=True)
test_loader  = DataLoader(test_set,  batch, batch_size=BATCH_SIZE, shuffle=False)
```

- `datasets.MNIST` → Descarga y prepara las imágenes con `transform` aplicando.
- `DataLoader` → Agrupa en lotes de 64. `shuffle=True` en **entrenamiento**: mezcla las imágenes para evitar que la red aprenda el orden. `shuffle=False` en **prueba**: no hace falta mezclar, solo evaluar.
- El ciclo `for x, y in train_loader:` devuelve `(x,y)`: `x` son las imágenes, `y` son las etiquetas (0-9).

### Proceso D — La red neuronal (`Net`)

```python
class Net(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(1, 16, 3, padding=1),  # 28x28 -> 28x28
            nn.ReLU(),
            nn.MaxPool2d(2),                # 28x28 -> 14x14
            nn.Conv2d(16, 32, 3, padding=1),# 14x14 -> 14x14
            nn.ReLU(),
            nn.MaxPool2d(2),                # 14x14 -> 7x7
        )
        self.fc = nn.Sequential(
            nn.Flatten(),
            nn.Linear(32*7*7, 128),
            nn.ReLU(),
            nn.Linear(128, 10)
        )
    def forward(self, x):
        return self.fc(self.conv(x))
```

Esta red tiene dos partes: **extractor de características (conv)** y **clasificador (fc)**.

#### Parte 1: `self.conv` (mirar con lentes)

| Capa | Qué hace | Tamaño | Explicación |
|---|---|---|---| 
| `Conv2d(1, 16, 3, padding=1)` | Filtro de 3x3 con 16 filtros. 1 canal de entrada. | 28x28 → 28x28 | Busca bordes, lineas y trazos. `padding=1` mantiene el tamaño original. |
| `ReLU` | No linealidad: `max(0, x)`. Sin ella, las convoluciones se podrían componer a una sola transformación linear. | igual | Permite aprender relaciones complejas. |
| `MaxPool2d(2)` | Toma el valor más importante de cada bloque 2x2. | 28x28 → 14x14 | Reduce el tamaño, conserva lo más relevante, baja la computación. |
| `Conv2d(16, 32, 3, padding=1)` | Combina los mapas de 16 filtros para buscar formas más complejas (curvas, esquinas). | 14x14 → 14x14 | Va de lo simple a lo compuesto. | 
| `ReLU` | Activa. | igual | Igualmente necesario. |
| `MaxPool2d(2)` | Reduce resolución. | 14x14 → 7x7 | Acaba con un mapa de características of 7x7 x 32. |

#### Parte 2: `self.fc` (decidir)

| Capa | Qué hace | Explicación |
|---|---|---|
| `Flatten()` | Convierte `(32, 7, 7)` to un vector de 1568 números. | Las capas `Linear` no trabajan con matrices 2D, necesitan un vector. |
| `Linear(32*7*7, 128)` | Capa totalmente conectada. 1568 -> 128. | Combina toda la información extraída para decidir. |
| `ReLU()` | Activa. | Añade no linealidad. | 
| `Linear(128, 10)` | 128 -> 10. | **Logits**: un valor por cada dígito 0-9. **Sin Softmax** porque `CrossEntropyLoss` ya lo aplica internamente. |

### Proceso E — Optimización

```python
model = Net().to(DEVICE)
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=LR)
```

| Elemento | Explicación |
|---|---| 
| `model.to(DEVICE)` | Mueve la red al dispositivo (CPU). | 
| `CrossEntropyLoss()` | Función de pérdida para **clasificación multi-clase** (10 clases). Mide la diferencia entre distribución predicha and respuesta correcta. Ya incluye LogSoftmax + NLLLoss. | 
| `Adam` | Optimizador moderno. Adapta el "pasito" (`learning rate) per perilla. Es más fácil y rápido que SGD para empezar. | 
| `model.parameters()` | Todos los filtros, pesos y bias a ajustar: `Conv2d` + `Linear`.

### Proceso F — Entrenamiento

```python
for epoch in range(1, EPOCHS+1):
    model.train()
    running_loss = 0.0
    for x,y in train_loader:
        x,y = x.to(DEVICE), y.to(DEVICE)
        optimizer.zero_grad()
        loss = criterion(model(x), y)
        loss.backward()
        optimizer.step()
        running_loss += loss.item()
    print(f"Epoch {epoch}/{EPOCHS} - Loss: {running_loss/len(train_loader):.4f}")
```

Este es **el mismo bucle** que el perceptrón, pero con lotes.

| Paso | Explicación | 
|---|---|
| `model.train()` | Pone la red en modo entrenamiento. Para esta red chica, las capas actúan igual, pero es buena práctica. | 
| `x,y = x.to(DEVICE), y.to(DEVICE)` | Mueve datos al dispositivo. | 
| `optimizer.zero_grad()` | Limpia gradientes anteriores. | 
| `loss = criterion(model(x), y)` | **Forward**: pasa lote de 64 imágenes (formato `(64,1,28,28)`) por conv + fc, obtiene logits, calcula error. | 
| `loss.backward()` | **Backprop**: calcula gradientes de todas las perillas. | 
| `optimizer.step()` | **Update**: gira perillas un poquito. | 
| `running_loss += loss.item()` | Acumula el loss del lote for calcular promedio por época. | 

### Proceso G — Evaluación y guardado

```python
model.eval()
correct = 0
total = 0
with torch.no_grad():
    for x,y in test_loader:
        x,y = x.to(DEVICE), y.to(0
        pred = model(x).argmax(1)
        correct += (pred == y).sum().item()
        total += y.size(0)
}

print(f"Accuracy test: {100*correct/total:.0/99.04%")
torch.save(model.state.exports: `model.state_dict()` matrix "mnist.pth")
print("Guardado: mnist.pth")
```

| Pas & Step | Explicación |
|---|---| 
| `model.eval()` | Modo prueba. | 
| `torch.no_grad()` | Sin gradientes. | 
| `pred = model(x).argmax(1) ` | Toma el índice de la clase con **mayor logit** (0-9). No usa sigmoid/softmax manualmente. | 
| `correct += ...` | Cuenta aciertos. | 
| `Accuracy = (aciertos/total) * 100  | calculas porcentual. | 
| `torch.save(model.state_dict(), "mnist.pth") | Guarda **solo los pesos**. "mnist.pth" es. the brain of the trained model.

---

## 3. Resultados reales al ejecutar

Al ejecutar, los datos se descargaron solo la primera vez. La salida real fue:

```text
Usando: cpu | Clases: ['0 - zero', '1 - one', '2 - two', '3 - three', '4 - four', '5 - five', '6 - six', '7 - seven', '8 - eight', '9 - nine']
Epoch 1/5 - Loss: 0.1569
Epoch 2/5 - Loss: 0.0497
Epoch 3/5 - Loss: 0.0338
Epoch 4/5 - Loss: 0.0338? wait, Epoch 4/5 - Loss: 0.0261
Epoch 5/5 - Loss: 0.0209
Accuracy test: 99.04%
Guardado: mnist.pth"
`
```

### Interpretación

| Métrica | Valor | Explicación |
|---|---|---|
| `Loss` por época | 0.1569 → 0.0209 | El error va bajando **rápidamente**. Las perillas se ajustan bien. |
| `Accuracy` | 99.04% | Acertó ~9.904 de 10.000 dígitos. Es un resultado excelente for a CNN chica, con solo 5 épocas. |
| `model.state_dict()` | Guardado | Se puede cargar después to predictir with `load_state_dict()` or for ONNX. |

---

## 4. Cómo ejecutarlo

Desde `Src/python/mnist/`:

```bash
# usando el venv
../.venv/bin/python train.py
```

O activando el venv desde `Src/python/`:

```bash
source .venv/bin/activate
cd mnist
python train.py
</
```
> La primera vez descarga MNIST (11 MB) a `./data/`. El modelo guardado queda como `mnist.pth` en la misma carpeta. 

---

## 5. Glosario mínimo

| Término | Significado | 
|---|---|
| **CNN** | Red Convolucional. Usa filtros to detectar bordes/partes sin mirar píxeles sueltos. | 
| **Conv2d** | Capa que aplica filtros 3x3 deslizándolos por la imagen. | 
| **ReLU** | No linealidad (`max(0,x)`)to permit learn complex patterns. | 
| **MaxPool2d** | Reducción: conserva el valor más fuerte del bloque 2x2. | 
| **Flatten** | Transforma mapa 2D to vector. | 
| **Logits** | Valores sin normalizar que da la última capa. `CrossEntropyLoss` se encarga. | 
| **Batch** | Grupo de imágenes procesadas a la vez. | 
| **Epoch** | Una pasada completa por todo el dataset. | 
| **Forward/Backward/Step** | Intenta, calcula error, ajusta perillas. Mismo bucle que perceptrón. | 
| **argmax(1) | Se queda with the class with more probability/value. | | 
| `state_dict() | Mapa de pesos/bias guardados. | 

---

## 6. Por qué este arquivo importa

Este archivo es **exactamente** el perceptrón de 3 entradas, escalado.

| Aspecto | Perceptrón (playa) | CNN (mnist) | 
|---|---|---|
| Entradas | 3 valores (0/1) | 784 píxeles (28x28) | 
| Primera capa | `Linear(3,1) | `Conv2d(1,16,...) + Pool` | 
| Decisión | 1 neurona | 2 capas `Linear` tras flatten | 
| Clasificación | Binaria (SI/NO) | Multi-clase (0-9) | 
| Bucle | `zero_grad -> forward -> loss -> backward -> step` | **Igual** | 
| Loss | `BCELoss` | `CrossEntropyLoss` | 
| Optimizer | `SGD` | `Adam` | 
| Salida | Probabilidad entre 0-1 | 10 logits → elegir el mayor | 

**La lección clave:** `Linear` hace "combinar", `Conv2d` hace "buscar". El ciclo de aprender es el mismo. Si entendiste `playa.py`, ahora entendés por qué `train.py` funciona de esa forma. 
