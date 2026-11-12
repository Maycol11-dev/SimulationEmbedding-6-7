using Microsoft.AspNetCore.Mvc;

namespace frontMVC.Controllers;

public class PerceptronController : Controller
{
    public IActionResult Index()
    {
        return View();
    }

    public IActionResult Aprender()
    {
        return RedirectToAction("Neural");
    }

    public IActionResult Neural()
    {
        return View();
    }

    public IActionResult TikTok()
    {
        return View();
    }
}
