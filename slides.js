/* Slides Application */

// Get elements from HTML
const editor = document.getElementById("editor");
const preview = document.getElementById("preview");
const slideCount = document.getElementById("slide-count");

const leftBtn = document.getElementById("left-btn");
const rightBtn = document.getElementById("right-btn");
const fullscreenBtn = document.getElementById("fullscreen-btn");

const newBtn = document.getElementById("new-btn");
const saveBtn = document.getElementById("save-btn");
const presentBtn = document.getElementById("present-btn");
const saveMessage = document.getElementById("save-message");

const editorScreen = document.getElementById("editor-screen");
const presentationScreen = document.getElementById("presentation-screen");
const presentSlide = document.getElementById("present-slide");
const presentSlideCount = document.getElementById("present-slide-count");

const presentLeftBtn = document.getElementById("present-left-btn");
const presentRightBtn = document.getElementById("present-right-btn");
const presentFullscreenBtn = document.getElementById("present-fullscreen-btn");

// Variables used in the application
let slides = [];
let currentSlide = 0;
let isPresenting = false;

const STORAGE_KEY = "my-slides";

// Default slides shown when the app is opened for the first time
const defaultText =
    "# Slide 1\n" +
    "## This is a heading\n\n" +
    "This is the content of slide 1\n" +
    "---\n" +
    "# Slide 2\n\n" +
    "- First point\n" +
    "- Second point\n" +
    "---\n" +
    "# Slide 3\n\n" +
    "You can write **bold** and *italic* text";

// Convert bold and italic text into HTML
function formatText(text) {
    text = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    text = text.replace(/\*(.+?)\*/g, "<em>$1</em>");

    return text;
}

// Convert Markdown into HTML
function markdownToHtml(markdown) {
    const lines = markdown.split("\n");
    let html = "";
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Close the list if the next line is not a list item
        if (inList && !line.startsWith("- ")) {
            html += "</ul>";
            inList = false;
        }

        if (line === "") {
            continue;
        }

        // Headings
        else if (line.startsWith("### ")) {
            html += "<h3>" + formatText(line.substring(4)) + "</h3>";
        }
        else if (line.startsWith("## ")) {
            html += "<h2>" + formatText(line.substring(3)) + "</h2>";
        }
        else if (line.startsWith("# ")) {
            html += "<h1>" + formatText(line.substring(2)) + "</h1>";
        }

        // Bullet points
        else if (line.startsWith("- ")) {
            if (!inList) {
                html += "<ul>";
                inList = true;
            }

            html += "<li>" + formatText(line.substring(2)) + "</li>";
        }

        // Normal text
        else {
            html += "<p>" + formatText(line) + "</p>";
        }
    }

    // Close the list if the slide ends with bullet points
    if (inList) {
        html += "</ul>";
    }

    return html;
}

// Display the current slide
function showSlide() {
    slides = editor.value.split("---");

    // Keep the current slide number within the available slides
    if (currentSlide >= slides.length) {
        currentSlide = slides.length - 1;
    }

    if (currentSlide < 0) {
        currentSlide = 0;
    }

    const html = markdownToHtml(slides[currentSlide]);
    const count = (currentSlide + 1) + " / " + slides.length;

    // Show the slide in the preview
    preview.innerHTML = html;
    slideCount.textContent = count;

    // Show the same slide in presentation mode
    presentSlide.innerHTML = html;
    presentSlideCount.textContent = count;

    // Disable buttons when there are no more slides to move to
    leftBtn.disabled = currentSlide === 0;
    presentLeftBtn.disabled = currentSlide === 0;

    rightBtn.disabled = currentSlide === slides.length - 1;
    presentRightBtn.disabled = currentSlide === slides.length - 1;
}

// Go to the previous slide
function goLeft() {
    if (currentSlide > 0) {
        currentSlide--;
        showSlide();
    }
}

// Go to the next slide
function goRight() {
    if (currentSlide < slides.length - 1) {
        currentSlide++;
        showSlide();
    }
}

// Start presentation mode
function startPresenting() {
    isPresenting = true;

    editorScreen.classList.add("hidden");
    presentationScreen.classList.remove("hidden");

    fullscreenBtn.textContent = "Exit Full Screen";

    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(function () {
            // Presentation mode can still work without full screen
        });
    }
}

// Exit presentation mode
function stopPresenting() {
    isPresenting = false;

    presentationScreen.classList.add("hidden");
    editorScreen.classList.remove("hidden");

    fullscreenBtn.textContent = "Full Screen";

    if (document.fullscreenElement) {
        document.exitFullscreen();
    }
}

// Switch between full screen and normal mode
function toggleFullScreen() {
    if (isPresenting) {
        stopPresenting();
    } else {
        startPresenting();
    }
}

// Exit presentation mode if the user presses Esc
document.addEventListener("fullscreenchange", function () {
    if (!document.fullscreenElement && isPresenting) {
        stopPresenting();
    }
});

// Save slides in the browser
function saveSlides() {
    localStorage.setItem(STORAGE_KEY, editor.value);

    saveMessage.textContent = "Saved!";

    setTimeout(function () {
        saveMessage.textContent = "";
    }, 2000);
}

// Load saved slides when the app opens
function loadSlides() {
    const savedSlides = localStorage.getItem(STORAGE_KEY);

    if (savedSlides !== null) {
        editor.value = savedSlides;
    } else {
        editor.value = defaultText;
    }
}

// Create a new slide
function newSlides() {
    editor.value = "# New Slide";
    currentSlide = 0;
    showSlide();
}

// Button events
leftBtn.addEventListener("click", goLeft);
rightBtn.addEventListener("click", goRight);
fullscreenBtn.addEventListener("click", toggleFullScreen);

presentLeftBtn.addEventListener("click", goLeft);
presentRightBtn.addEventListener("click", goRight);
presentFullscreenBtn.addEventListener("click", toggleFullScreen);

presentBtn.addEventListener("click", startPresenting);
saveBtn.addEventListener("click", saveSlides);
newBtn.addEventListener("click", newSlides);

// Update the preview when the user types
editor.addEventListener("input", showSlide);

// Keyboard shortcuts
document.addEventListener("keydown", function (event) {

    // Ctrl + S saves the slides
    if (event.ctrlKey && event.key.toLowerCase() === "s") {
        event.preventDefault();
        saveSlides();
    }

    // F11 switches presentation mode on or off
    if (event.key === "F11") {
        event.preventDefault();
        toggleFullScreen();
    }

    // Arrow keys move between slides
    // Don't change slides when typing in the editor
    const typing = document.activeElement === editor && !isPresenting;

    if (!typing) {
        if (event.key === "ArrowRight") {
            goRight();
        } else if (event.key === "ArrowLeft") {
            goLeft();
        }
    }
});

// Start the application
loadSlides();
showSlide();
