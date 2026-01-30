import { getUser } from "./utils/auth.js";
import { fetchRequest } from "./utils/fetch.js";

const moodChart = document.getElementById('moodChart')
const emotionTarget = document.getElementById("emotionTarget");
const tonesList = document.getElementById("tonesList");
const genreContainer = document.getElementById("genreContainer");
const pureBar = document.getElementById("pureBar");


async function initResult() {
    const response = await getUser();

    if (!response?.success || !response?.data) {
        window.location.replace("./login.html");
        return;
    }

    if (!response.data.form) {
        window.location.replace("./survey.html");
        return;
    }

    await getResult();

}

async function getSurvey() {
    try {
        const response = await fetchRequest(
            "api/survey/get-register",
            "GET",
            null,
            true
        );
        return response;
    } catch (error) {
        console.error("Error fetching result:", error);
    }
}

async function setGraphic(data) {

    new Chart(moodChart, {
        type: 'doughnut',
        data: {
            labels: data.genres,
            datasets: [{
                label: 'Nivel',
                data: [35, 23, 42],
                backgroundColor: [
                    "rgb(95, 125, 250)",
                    "rgb(109, 82, 219)",
                    "rgb(168, 45, 245)"
                ],
                borderWidth: 0,
                borderRadius: 0
            }]
        },
        options: {
            cutout: "50%",
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    borderRadius: 0,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: true
        }
    });
}

function setGenre(data) {

    genreContainer.innerHTML = "";

    if (data.genres.length <= 3) {

        data.genres.forEach(g => {
            genreContainer.innerHTML += `
                    <div class="col-12">
                        <div class="genre-item">
                            <i class="bi bi-music-note me-2"></i>${g}
                        </div>
                    </div>
                `;
        });

    } else if (data.genres.length <= 6) {

        data.genres.forEach(g => {
            genreContainer.innerHTML += `
                    <div class="col-6">
                        <div class="genre-item">
                            <i class="bi bi-music-note me-2"></i>${g}
                        </div>
                    </div>
                `;
        });
    } else {

        data.genres.forEach(g => {
            genreContainer.innerHTML += `
                    <div class="col-4">
                        <div class="genre-item
                            <i class="bi bi-music-note me-2"></i>${g}
                        </div>  
                    </div>
                `;
        });
    }
}

function setTones(data) {
    pureBar.innerHTML = "";
    const total = data.tones.length;
    data.tones.forEach((hz, i) => {
        const width = 100 / total;
        const hue = 240 + (i * 30);
        pureBar.innerHTML += `<div class="pure-bar-segment" style="width:${width}%; background:linear-gradient(135deg, hsl(${hue}, 70%, 60%), hsl(${hue + 20}, 70%, 50%));">${hz} Hz</div>`;
    });
}

const intentMap = {
        1: "tristeza",
        2: "calma",
        3: "felicidad",
        4: "molestia"
    };

async function getResult() {
    const response = await getSurvey();
    const data = response.data;

    console.log(data);
    
    console.log(data.tones.group);
    

    const dataUser = {
        emotion: intentMap[data.intent],
        genres: data.genres,
        tones: data.tones.group
    };
    
    emotionTarget.innerText = dataUser.emotion.toUpperCase();
    
    setGraphic(dataUser);
    setGenre(dataUser);
    setTones(dataUser);
}



initResult();