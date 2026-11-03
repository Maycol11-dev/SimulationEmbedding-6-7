using Microsoft.AspNetCore.Mvc;

namespace frontMVC.Controllers;

public class ActividadController : Controller
{
    // Hub principal de la red de 25 entradas
    public IActionResult Index()
    {
        return View();
    }

    // Simulador interactivo: 25 sliders -> predicción en vivo
    public IActionResult Probar()
    {
        return View();
    }

    // Entrenamiento en vivo conectado a la API y registro en SQLite
    public IActionResult Entrenar()
    {
        return View();
    }

    // Inspección de la arquitectura y pesos guardados en la BD
    public IActionResult Red()
    {
        return View();
    }
}
