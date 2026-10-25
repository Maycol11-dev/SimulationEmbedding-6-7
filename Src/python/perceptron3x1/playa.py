import torch
import torch.nn as nn

# Datos: [sol, calor, fin de semana] -> ir a la playa? (1 = si, 0 = no)
X = torch.tensor([
    [1,1,1],  # sol, calor, finde -> si
    [1,1,0],  # sol, calor, pero entre semana -> si? o no, probemos
    [0,1,1],  # poco sol, calor, finde -> si
    [1,0,1],  # sol, poco calor, finde -> si
    [0,0,0],  # nada -> no
    [1,0,0],  # sol pero frio y entre semana -> no
    [0,0,1],  # frio, entre semana? no, finde pero frio/nada -> no
    [0,1,0],  # calor pero entre semana -> no
], dtype=torch.float32)

y = torch.tensor([
    [1.0],
    [1.0],
    [1.0],
    [1.0],
    [0.0],
    [0.0],
    [0.0],
    [0.0]
], dtype=torch.float32)

class Perceptron3x1(nn.Module):
    def __init__(self):
        super().__init__()
        # 3 entradas -> 1 neurona
        self.linear = nn.Linear(in_features=3, out_features=1)
        # Sigmoid para pasar a 0-1
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        return self.sigmoid(self.linear(x))


model = Perceptron3x1()
criterion = nn.BCELoss()  # Binary Cross Entropy, ideal para 0/1
optimizer = torch.optim.SGD(model.parameters(), lr=0.1)

print("Pesos iniciales:", model.linear.weight.data)
print("Bias inicial:", model.linear.bias.data)
print("\nEntrenando...\n")

for epoch in range(10000):
    optimizer.zero_grad()
    pred = model(X)
    loss = criterion(pred, y)
    loss.backward()
    optimizer.step()
    if epoch % 1000 == 0:
        print(f"Epoch {epoch} - Loss: {loss.item():.6f}")

print("\nEntrenamiento terminado")
print("Pesos finales:", model.linear.weight.data)
print("Bias final:", model.linear.bias.data)

# Probar
model.eval()
with torch.no_grad():
    # sol=1, calor=1, finde=1
    test = torch.tensor([[1,1,1],[0,0,1],[1,0,0],[0,1,0]], dtype=torch.float32)
    pred = model(test)
    for i,p in enumerate(pred):
        print(f"Entrada {test[i].tolist()} -> {p.item():.4f} ({'SI' if p.item()>0.5 else 'NO'})")
