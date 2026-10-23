import fs from 'fs';
import path from 'path';

// PON AQUÍ TUS ARCHIVOS JSON
const archivosAProcesar = [
  'public/data/rutinas.json',
  'public/data/articulos.json',
  'public/data/ejercicios.json' // Agrégalo si también tiene imagenes
];

archivosAProcesar.forEach((nombreArchivo) => {
  const rutaArchivo = path.join(process.cwd(), nombreArchivo);

  if (!fs.existsSync(rutaArchivo)) {
    console.warn(`⚠️  Archivo no encontrado: ${nombreArchivo}, saltando...`);
    return;
  }

  console.log(`\n📄 Procesando: ${nombreArchivo}...`);

  try {
    const contenido = fs.readFileSync(rutaArchivo, 'utf8');
    const data = JSON.parse(contenido);
    let cambios = 0;

    // Función recursiva para recorrer el JSON
    const procesarObjeto = (obj) => {
      for (let key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          procesarObjeto(obj[key]);
        } else if (key === 'imagen_url' && typeof obj[key] === 'string') {
          const urlOriginal = obj[key];
          
          // Solo reemplaza la extensión si es png, jpg o jpeg
          if (/\.(png|jpg|jpeg)$/i.test(urlOriginal)) {
            const urlNueva = urlOriginal.replace(/\.(png|jpg|jpeg)$/i, '.webp');
            
            if (urlOriginal !== urlNueva) {
              obj[key] = urlNueva;
              cambios++;
              console.log(`  ✅ ${urlOriginal} -> ${urlNueva}`);
            }
          }
        }
      }
    };

    procesarObjeto(data);

    // Guardar el archivo con el formato bonito
    fs.writeFileSync(rutaArchivo, JSON.stringify(data, null, 2), 'utf8');
    console.log(`✨ ¡Listo! Se actualizaron ${cambios} imágenes.`);

  } catch (error) {
    console.error(`❌ Error procesando ${nombreArchivo}:`, error.message);
  }
});

console.log('\n🎉 Proceso terminado.');