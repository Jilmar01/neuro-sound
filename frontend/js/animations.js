document.querySelectorAll(".playbackcontrols i").forEach(icon => {
    
    icon.addEventListener("mouseenter", () => {
        const name = icon.classList[1]; // ej: "bi-skip-backward"
        if (!name.endsWith("-fill")) {
            icon.dataset.original = name;  
            icon.classList.replace(name, name + "-fill");
        }
    });

    icon.addEventListener("mouseleave", () => {
        if (icon.dataset.original) {
            icon.classList.forEach(c => {
                if (c.endsWith("-fill")) {
                    icon.classList.replace(c, icon.dataset.original);
                }
            });
        }
    });

})

const playBtn = document.getElementsByClassName("playbackcontrols")[0];

playBtn.addEventListener("click", () => {
    if (playBtn.classList.contains("bi-play")) {
        // Cambiar a pause
        playBtn.classList.remove("bi-play");
        playBtn.classList.add("bi-pause");
    } else {
        // Cambiar a play
        playBtn.classList.remove("bi-pause");
        playBtn.classList.add("bi-play");
    }
});

