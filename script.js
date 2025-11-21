// IDs de las tarjetas
const scoreGeneralEl = document.querySelector("#score-general .score-value");
const scoreGeneralMethod = document.querySelector("#score-general .score-method");
const recomendacionesContainer = document.getElementById("recomendaciones-container");
const tablaDatosContainer = document.getElementById("tabla-datos");
const scoresContainer = document.getElementById("scores-partes");

// Fotos con parte y método
const fotosData = [
    {bodyPart: "Pelvis", method: "REBA", src: "pelvis_reba.jpeg", info: "Información Pelvis REBA"},
    {bodyPart: "Pelvis", method: "RULA", src: "pelvis_rula.jpeg", info: "Información Pelvis RULA"},
    {bodyPart: "L5", method: "REBA", src: "l5_reba.jpeg", info: "Información L5 REBA"},
    {bodyPart: "L5", method: "RULA", src: "l5_rula.jpeg", info: "Información L5 RULA"},
    {bodyPart: "T8", method: "REBA", src: "upper_reba.jpeg", info: "Información Upperleg REBA"},
];

// Galería
const galleryContainer = document.getElementById("gallery-container");
const bodyPartFilter = document.getElementById("body-part-filter");
const methodFilter = document.getElementById("method-filter");

function displayPhotos() {
    const selectedPart = bodyPartFilter.value;
    const selectedMethod = methodFilter.value;

    const filtered = fotosData.filter(foto =>
        (selectedPart === "all" || foto.bodyPart === selectedPart) &&
        (selectedMethod === "all" || foto.method === selectedMethod)
    );

    galleryContainer.innerHTML = "";

    if(filtered.length === 0){
        galleryContainer.innerHTML = "<p>No hay fotos disponibles para esta selección.</p>";
        return;
    }

    filtered.forEach(foto => {
        const div = document.createElement("div");
        div.classList.add("gallery-item");
        div.innerHTML = `
            <img src="${foto.src}" alt="${foto.bodyPart}" style="width:200px; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.3);">
            <p>${foto.info}</p>
        `;
        galleryContainer.appendChild(div);
    });
}

bodyPartFilter.addEventListener("change", displayPhotos);
methodFilter.addEventListener("change", displayPhotos);
displayPhotos();

// Función para leer CSV
async function loadCSV(path) {
    const response = await fetch(path);
    const data = await response.text();
    const lines = data.split("\n").filter(l => l.trim() !== "");
    const headers = lines[0].split(",");
    const rows = lines.slice(1).map(line => {
        const values = line.split(",");
        const obj = {};
        headers.forEach((h,i) => obj[h.trim()] = values[i].trim());
        return obj;
    });
    return { headers, rows };
}

// Ajustar color de score 0-3
function getScoreColor(score) {
    score = parseFloat(score);
    if(score >= 3) return "#ff3b30"; // rojo
    if(score >= 2) return "#ffcc00"; // amarillo
    return "#34c759"; // verde
}

// Mostrar tabla
function mostrarTabla(headers, rows) {
    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.style.fontSize = "0.9em";

    const thead = document.createElement("thead");
    const trHead = document.createElement("tr");
    headers.forEach(h => {
        const th = document.createElement("th");
        th.textContent = h;
        th.style.padding = "8px";
        th.style.borderBottom = "1px solid #ccc";
        th.style.textAlign = "center";
        trHead.appendChild(th);
    });
    thead.appendChild(trHead);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    rows.forEach(row => {
        const tr = document.createElement("tr");
        headers.forEach(h => {
            const td = document.createElement("td");
            td.textContent = row[h];
            td.style.padding = "6px";
            td.style.textAlign = "center";
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    tablaDatosContainer.innerHTML = "";
    tablaDatosContainer.appendChild(table);
}

// Mostrar scores por parte y promedio
function mostrarScoresPartes(rows) {
    scoresContainer.innerHTML = "";

    let totalReba = 0;
    let totalRula = 0;
    let count = 0;

    rows.forEach(row => {
        const part = row["Parte"];
        const reba = parseFloat(row["REBA"]) || 0;
        const rula = parseFloat(row["RULA"]) || 0;
        const promedio = ((reba + rula)/2).toFixed(1);

        totalReba += reba;
        totalRula += rula;
        count++;

        const div = document.createElement("div");
        div.classList.add("score-part");
        div.innerHTML = `
            <h4>${part}</h4>
            <p>REBA: <span style="color:${getScoreColor(reba)}">${reba}</span></p>
            <p>RULA: <span style="color:${getScoreColor(rula)}">${rula}</span></p>
            <p>Promedio: <span style="color:${getScoreColor(promedio)}">${promedio}</span></p>
        `;
        scoresContainer.appendChild(div);
    });

    const promedioGeneral = ((totalReba + totalRula)/(2*count)).toFixed(1);
    const divProm = document.createElement("div");
    divProm.classList.add("score-general-part");
    divProm.innerHTML = `<h3>Promedio General REBA/RULA: <span style="color:${getScoreColor(promedioGeneral)}">${promedioGeneral}</span></h3>`;
    scoresContainer.prepend(divProm);

    // Actualizar tarjeta general
    scoreGeneralEl.textContent = promedioGeneral;
    scoreGeneralMethod.textContent = "Promedio REBA/RULA";
}

// Función principal
async function init() {
    const resultadosData = await loadCSV("RESULTADOS_PUNTAJES-4.csv");

    mostrarScoresPartes(resultadosData.rows);
    mostrarTabla(resultadosData.headers, resultadosData.rows);
}

// Inicializar
init();
