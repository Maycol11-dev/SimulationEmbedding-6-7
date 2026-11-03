using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using SistemaDecision.API.Models;

namespace SistemaDecision.API.Data;

public static class SeedData
{
    public static async Task InicializarAsync(AppDbContext db)
    {
        if (await db.DatosEntrenamiento.AnyAsync())
        {
            return; // Ya hay datos
        }

        var datos = new List<DatoEntrenamiento>();

        void Agregar(string descripcion, string salida, int clase, double[] entradas)
        {
            datos.Add(new DatoEntrenamiento
            {
                Descripcion = descripcion,
                SalidaEsperada = salida,
                IndiceClase = clase,
                EntradasJson = JsonSerializer.Serialize(entradas)
            });
        }

        // ==========================
        // 0: PLAYA (Calor, sol, sin lluvia, energía, tiempo, aire libre)
        // ==========================
        Agregar("Día caluroso de verano con amigos", "Playa", 0, new double[] {
            0.9, 0, 0, 0.4, 1.0,   0.8, 0.9, 0.2, 0.8, 1,   0.6, 1, 0.9, 1, 0,   1, 0, 0, 0.8, 0,   0.4, 0.7, 0.2, 1.0, 0.1
        });
        Agregar("Tarde soleada de finde con pareja", "Playa", 0, new double[] {
            0.85, 0, 0, 0.3, 0.9,  0.7, 0.8, 0.1, 0.7, 1,   0.7, 1, 0.8, 1, 0,   0, 1, 0, 0.6, 0,   0.3, 0.8, 0.2, 0.9, 0.1
        });
        Agregar("Feriado con sol radiante y tiempo libre", "Playa", 0, new double[] {
            0.8, 0, 0.1, 0.5, 0.9, 0.8, 0.8, 0.1, 0.8, 1,   0.5, 1, 1.0, 0, 1,   1, 1, 0, 0.7, 0,   0.5, 0.6, 0.2, 0.95, 0.2
        });
        Agregar("Fin de semana despejado y muchas ganas de aire libre", "Playa", 0, new double[] {
            0.75, 0, 0, 0.4, 0.8,  0.8, 0.7, 0.2, 0.7, 1,   0.4, 1, 0.8, 1, 0,   1, 0, 0, 0.6, 0,   0.4, 0.6, 0.3, 0.9, 0.1
        });
        Agregar("Día de calor intenso escapando de la ciudad", "Playa", 0, new double[] {
            0.95, 0, 0.1, 0.6, 1.0, 0.7, 0.8, 0.3, 0.6, 1,  0.6, 1, 0.9, 1, 0,   0, 1, 0, 0.5, 0,   0.3, 0.7, 0.3, 1.0, 0.0
        });
        Agregar("Vacaciones con familia frente al mar", "Playa", 0, new double[] {
            0.8, 0, 0, 0.5, 0.85,  0.7, 0.9, 0.1, 0.8, 1,   0.8, 1, 1.0, 1, 0,   0, 0, 1, 0.7, 0,   0.4, 0.8, 0.3, 0.85, 0.1
        });
        Agregar("Sábado caluroso con amigos y buena energía", "Playa", 0, new double[] {
            0.85, 0, 0, 0.4, 0.9,  0.9, 0.9, 0.1, 0.8, 1,   0.5, 1, 0.7, 1, 0,   1, 0, 0, 0.9, 0,   0.5, 0.7, 0.2, 0.9, 0.1
        });
        Agregar("Domingo de relax bajo el sol y mates", "Playa", 0, new double[] {
            0.78, 0, 0, 0.3, 0.85, 0.6, 0.8, 0.1, 0.7, 1,   0.4, 1, 0.8, 1, 0,   0, 1, 0, 0.5, 0,   0.2, 0.5, 0.5, 0.9, 0.2
        });
        Agregar("Tarde primaveral muy cálida con transporte", "Playa", 0, new double[] {
            0.77, 0, 0.1, 0.4, 0.8, 0.8, 0.8, 0.2, 0.7, 1,  0.6, 1, 0.6, 1, 0,   1, 1, 0, 0.7, 0,   0.4, 0.6, 0.3, 0.85, 0.1
        });
        Agregar("Calor agobiante buscando agua fresca", "Playa", 0, new double[] {
            0.92, 0, 0, 0.5, 0.95, 0.75, 0.85, 0.2, 0.8, 1, 0.5, 1, 0.8, 0, 1,   1, 0, 0, 0.8, 0,   0.3, 0.7, 0.2, 0.95, 0.0
        });

        // ==========================
        // 1: CINE (Lluvia o frío, entretenimiento, dinero, relax bajo techo)
        // ==========================
        Agregar("Tarde lluviosa con ganas de ver una peli con pareja", "Cine", 1, new double[] {
            0.3, 1, 0.3, 0.8, 0.1,  0.5, 0.7, 0.3, 0.6, 1,   0.7, 1, 0.6, 1, 0,   0, 1, 0, 0.5, 0,   0.1, 0.9, 0.6, 0.1, 0.4
        });
        Agregar("Día frío y nublado buscando entretenimiento", "Cine", 1, new double[] {
            0.25, 0, 0.4, 0.7, 0.2, 0.6, 0.6, 0.3, 0.7, 1,   0.8, 1, 0.5, 0, 0,   1, 0, 0, 0.6, 0,   0.1, 0.85, 0.5, 0.1, 0.3
        });
        Agregar("Lluvia torrencial de domingo y estreno esperado", "Cine", 1, new double[] {
            0.35, 1, 0.5, 0.9, 0.0, 0.5, 0.8, 0.2, 0.8, 1,   0.6, 1, 0.7, 1, 0,   0, 1, 0, 0.6, 0,   0.0, 0.95, 0.6, 0.0, 0.2
        });
        Agregar("Noche fresca entre semana para despejarse con amigos", "Cine", 1, new double[] {
            0.4, 0, 0.2, 0.6, 0.2,  0.6, 0.7, 0.4, 0.6, 1,   0.6, 1, 0.4, 0, 0,   1, 0, 0, 0.7, 0,   0.1, 0.8, 0.5, 0.2, 0.3
        });
        Agregar("Clima ventoso y frío, plan bajo techo", "Cine", 1, new double[] {
            0.2, 0, 0.8, 0.6, 0.3,  0.5, 0.6, 0.3, 0.7, 1,   0.7, 1, 0.5, 1, 0,   0, 1, 0, 0.4, 0,   0.1, 0.9, 0.7, 0.1, 0.2
        });
        Agregar("Finde con dinero para pochoclos y buena pantalla", "Cine", 1, new double[] {
            0.45, 0.5, 0.2, 0.7, 0.2, 0.6, 0.8, 0.2, 0.7, 1, 0.9, 1, 0.6, 1, 0,  1, 1, 0, 0.7, 0,   0.1, 0.9, 0.5, 0.1, 0.3
        });
        Agregar("Día gris sin sol pero con muchas ganas de una historia", "Cine", 1, new double[] {
            0.38, 0, 0.2, 0.65, 0.1, 0.55, 0.7, 0.25, 0.7, 1, 0.65, 1, 0.5, 0, 0, 0, 1, 0, 0.5, 0,  0.1, 0.85, 0.6, 0.1, 0.4
        });
        Agregar("Salida tranquila con familia a sala climatizada", "Cine", 1, new double[] {
            0.3, 0.4, 0.2, 0.7, 0.2, 0.6, 0.75, 0.2, 0.8, 1, 0.8, 1, 0.6, 1, 0,   0, 0, 1, 0.6, 0,   0.1, 0.88, 0.5, 0.1, 0.2
        });
        Agregar("Tormenta eléctrica afuera, refugio en el shopping", "Cine", 1, new double[] {
            0.35, 1, 0.7, 0.95, 0.0, 0.5, 0.65, 0.3, 0.6, 1, 0.75, 1, 0.7, 1, 0,  1, 0, 0, 0.6, 0,   0.0, 0.9, 0.6, 0.0, 0.2
        });
        Agregar("Día destemplado y ganas de desconectar viendo ficción", "Cine", 1, new double[] {
            0.32, 0.2, 0.3, 0.6, 0.2, 0.55, 0.7, 0.35, 0.65, 1, 0.6, 0, 0.5, 0, 0, 0, 0, 0, 0.2, 0,  0.1, 0.85, 0.6, 0.1, 0.4
        });

        // ==========================
        // 2: GYM (Energía alta, salud 1, ganas de actividad física, baja social)
        // ==========================
        Agregar("Lunes con energía desbordante y foco en entrenar", "Gym", 2, new double[] {
            0.5, 0, 0.1, 0.5, 0.5,  0.95, 0.8, 0.3, 0.8, 1,  0.3, 1, 0.3, 0, 0,   0, 0, 0, 0.2, 0,   1.0, 0.2, 0.1, 0.2, 0.3
        });
        Agregar("Día estresante que requiere descargar energía con pesas", "Gym", 2, new double[] {
            0.4, 0, 0.2, 0.5, 0.3,  0.8, 0.5, 0.9, 0.6, 1,   0.2, 1, 0.3, 0, 0,   0, 0, 0, 0.1, 0,   0.95, 0.1, 0.2, 0.2, 0.1
        });
        Agregar("Mañana fría pero salud al 100% y rutina pendiente", "Gym", 2, new double[] {
            0.2, 0, 0.1, 0.4, 0.4,  0.9, 0.8, 0.2, 0.9, 1,   0.3, 0, 0.4, 0, 0,   0, 0, 0, 0.1, 0,   0.9, 0.1, 0.2, 0.1, 0.2
        });
        Agregar("Tarde libre para hacer cardio y fuerza a full", "Gym", 2, new double[] {
            0.6, 0, 0.1, 0.4, 0.6,  0.85, 0.85, 0.2, 0.8, 1, 0.4, 1, 0.4, 1, 0,   1, 0, 0, 0.3, 0,   0.95, 0.2, 0.2, 0.3, 0.2
        });
        Agregar("Lluvia afuera, perfecto para entrenar bajo techo", "Gym", 2, new double[] {
            0.35, 1, 0.2, 0.8, 0.0, 0.85, 0.7, 0.4, 0.7, 1,  0.3, 1, 0.35, 0, 0,  0, 0, 0, 0.1, 0,   0.9, 0.2, 0.2, 0.0, 0.2
        });
        Agregar("Objetivo fitness semanal: no romper la racha", "Gym", 2, new double[] {
            0.5, 0, 0, 0.5, 0.5,    0.8, 0.75, 0.3, 0.75, 1, 0.3, 1, 0.3, 0, 0,   0, 0, 0, 0.1, 0,   0.88, 0.1, 0.3, 0.2, 0.2
        });
        Agregar("Motivación alta y música lista para entrenar", "Gym", 2, new double[] {
            0.6, 0, 0.2, 0.4, 0.5,  0.92, 0.9, 0.2, 0.85, 1, 0.4, 1, 0.4, 1, 0,   0, 1, 0, 0.3, 0,   0.92, 0.2, 0.1, 0.3, 0.2
        });
        Agregar("Descanso mental a través del esfuerzo físico", "Gym", 2, new double[] {
            0.45, 0, 0.1, 0.4, 0.3, 0.75, 0.6, 0.8, 0.65, 1, 0.2, 1, 0.3, 0, 0,   0, 0, 0, 0.1, 0,   0.85, 0.1, 0.3, 0.2, 0.1
        });
        Agregar("Finde a la mañana: entrenamiento antes de almorzar", "Gym", 2, new double[] {
            0.55, 0, 0, 0.4, 0.6,   0.88, 0.8, 0.1, 0.8, 1,  0.3, 1, 0.4, 1, 0,   0, 0, 0, 0.2, 0,   0.9, 0.2, 0.2, 0.3, 0.2
        });
        Agregar("Ganas de superación personal y salud impecable", "Gym", 2, new double[] {
            0.5, 0, 0.1, 0.5, 0.5,  0.9, 0.85, 0.2, 0.8, 1,  0.3, 1, 0.35, 0, 0,  0, 0, 0, 0.2, 0,   0.94, 0.15, 0.15, 0.2, 0.3
        });

        // ==========================
        // 3: CASA (Cansancio, mal tiempo, poco dinero, ganas de descansar o aprender)
        // ==========================
        Agregar("Lluvia, cansancio extremo y maratón de series en la cama", "Casa", 3, new double[] {
            0.3, 1, 0.4, 0.9, 0.0,  0.2, 0.4, 0.6, 0.3, 1,   0.1, 0, 0.8, 1, 0,   0, 0, 0, 0.1, 0,   0.0, 0.7, 1.0, 0.0, 0.3
        });
        Agregar("Enfermo con fiebre y necesidad de reposo", "Casa", 3, new double[] {
            0.4, 0, 0.1, 0.5, 0.4,  0.1, 0.3, 0.5, 0.4, 0,   0.3, 0, 0.9, 0, 0,   0, 0, 1, 0.0, 0,   0.0, 0.3, 1.0, 0.0, 0.1
        });
        Agregar("Sin un peso a fin de mes, tarde de mates y lectura", "Casa", 3, new double[] {
            0.5, 0, 0.2, 0.5, 0.4,  0.4, 0.6, 0.3, 0.7, 1,   0.05, 0, 0.7, 1, 0,  0, 0, 0, 0.2, 0,   0.1, 0.4, 0.8, 0.1, 0.8
        });
        Agregar("Estrés laboral acumulado, domingo de silencio y recarga", "Casa", 3, new double[] {
            0.45, 0, 0.1, 0.5, 0.3, 0.2, 0.5, 0.85, 0.4, 1,  0.4, 1, 0.8, 1, 0,   0, 0, 0, 0.05, 0,  0.0, 0.3, 0.95, 0.1, 0.4
        });
        Agregar("Tormenta de viento y frío, mantita y videojuegos", "Casa", 3, new double[] {
            0.15, 1, 0.9, 0.8, 0.0, 0.4, 0.7, 0.2, 0.6, 1,   0.2, 0, 0.7, 1, 0,   0, 0, 0, 0.2, 0,   0.0, 0.8, 0.85, 0.0, 0.3
        });
        Agregar("Dormí 3 horas, cuerpo destruido pidiendo almohada", "Casa", 3, new double[] {
            0.5, 0, 0, 0.5, 0.5,    0.1, 0.3, 0.6, 0.2, 1,   0.2, 0, 0.6, 0, 0,   0, 0, 0, 0.0, 0,   0.0, 0.2, 1.0, 0.0, 0.1
        });
        Agregar("Día de estudiar programación y proyectos personales", "Casa", 3, new double[] {
            0.4, 0, 0.1, 0.4, 0.4,  0.6, 0.8, 0.3, 0.7, 1,   0.3, 0, 0.8, 1, 0,   0, 0, 0, 0.1, 0,   0.1, 0.3, 0.6, 0.1, 1.0
        });
        Agregar("Ganas nulas de socializar, cocina casera y relax", "Casa", 3, new double[] {
            0.48, 0, 0.1, 0.5, 0.3, 0.4, 0.6, 0.4, 0.6, 1,   0.3, 0, 0.6, 0, 0,   0, 0, 0, 0.0, 0,   0.1, 0.4, 0.9, 0.1, 0.5
        });
        Agregar("Frío polar afuera y fiaca insuperable", "Casa", 3, new double[] {
            0.1, 0, 0.6, 0.6, 0.2,  0.3, 0.5, 0.3, 0.5, 1,   0.2, 0, 0.7, 1, 0,   0, 1, 0, 0.2, 0,   0.0, 0.6, 0.9, 0.0, 0.2
        });
        Agregar("Agotamiento mental tras semana de exámenes", "Casa", 3, new double[] {
            0.5, 0, 0.1, 0.4, 0.4,  0.2, 0.4, 0.9, 0.3, 1,   0.2, 0, 0.9, 1, 0,   0, 0, 0, 0.0, 0,   0.0, 0.3, 0.98, 0.0, 0.1
        });

        // ==========================
        // 4: SALIR (Fin de semana/noche, amigos/pareja, dinero, socializar al máximo, entretenimiento)
        // ==========================
        Agregar("Sábado a la noche con amigos, fiesta y previa", "Salir", 4, new double[] {
            0.6, 0, 0.1, 0.4, 0.1,  0.85, 0.95, 0.1, 0.8, 1, 0.8, 1, 0.7, 1, 0,   1, 0, 0, 1.0, 0,   0.2, 0.95, 0.1, 0.4, 0.0
        });
        Agregar("Feriado para festejar cumpleaños en un bar", "Salir", 4, new double[] {
            0.55, 0, 0.1, 0.4, 0.2, 0.8, 0.9, 0.1, 0.75, 1, 0.75, 1, 0.8, 0, 1,   1, 1, 0, 0.95, 1,  0.1, 0.9, 0.1, 0.3, 0.1
        });
        Agregar("Cena y tragos en pareja en zona céntrica", "Salir", 4, new double[] {
            0.65, 0, 0.1, 0.4, 0.1, 0.75, 0.9, 0.2, 0.7, 1, 0.9, 1, 0.5, 1, 0,   0, 1, 0, 0.8, 0,   0.1, 0.85, 0.2, 0.3, 0.1
        });
        Agregar("Viernes después del trabajo a brindar con el equipo", "Salir", 4, new double[] {
            0.5, 0, 0.2, 0.5, 0.2,  0.7, 0.85, 0.4, 0.6, 1,  0.7, 1, 0.4, 1, 0,   1, 0, 0, 0.9, 1,   0.1, 0.8, 0.2, 0.3, 0.1
        });
        Agregar("Noche de música en vivo y recital con amigos", "Salir", 4, new double[] {
            0.55, 0, 0.1, 0.4, 0.0, 0.9, 0.95, 0.1, 0.8, 1, 0.85, 1, 0.6, 1, 0,   1, 0, 0, 0.95, 0,  0.3, 0.98, 0.1, 0.4, 0.1
        });
        Agregar("Sábado de boliche y baile hasta la madrugada", "Salir", 4, new double[] {
            0.6, 0, 0.1, 0.5, 0.0,  0.95, 0.95, 0.1, 0.85, 1, 0.8, 1, 0.8, 1, 0,  1, 0, 0, 1.0, 0,   0.4, 0.95, 0.1, 0.3, 0.0
        });
        Agregar("Fin de semana con plata, transporte y muchas ganas de diversión", "Salir", 4, new double[] {
            0.65, 0, 0.1, 0.4, 0.2, 0.8, 0.9, 0.1, 0.7, 1,  0.95, 1, 0.6, 1, 0,   1, 1, 0, 0.9, 0,   0.2, 0.9, 0.15, 0.4, 0.1
        });
        Agregar("Reunión con amigos que no veía hace mucho tiempo", "Salir", 4, new double[] {
            0.5, 0, 0.2, 0.5, 0.1,  0.8, 0.95, 0.2, 0.7, 1,  0.65, 1, 0.6, 1, 0,   1, 0, 0, 0.95, 0,  0.1, 0.85, 0.2, 0.4, 0.1
        });
        Agregar("Festejo de fin de año, comida y fiesta nocturna", "Salir", 4, new double[] {
            0.7, 0, 0.1, 0.4, 0.1,  0.85, 0.95, 0.2, 0.8, 1, 0.85, 1, 0.7, 1, 0,   1, 1, 0, 1.0, 1,   0.2, 0.95, 0.1, 0.5, 0.1
        });
        Agregar("Noche templada perfecta para recorrer bares", "Salir", 4, new double[] {
            0.62, 0, 0.1, 0.4, 0.0, 0.8, 0.9, 0.1, 0.75, 1, 0.75, 1, 0.6, 1, 0,   1, 1, 0, 0.9, 0,   0.2, 0.9, 0.15, 0.4, 0.1
        });

        await db.DatosEntrenamiento.AddRangeAsync(datos);
        await db.SaveChangesAsync();
    }
}
