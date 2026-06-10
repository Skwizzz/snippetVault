let snippets = [];
let favoritesOnly = false;
let activeTag = null;

const quotes = [
    "Always code as if the guy who ends up maintaining your code will be a violent psychopath who knows where you live.",
    "All computers wait at the same speed.",
    "A misplaced decimal point will always end up where it will do the greatest damage.",
    "A computer program does what you tell it to do, not what you want it to do.",
    "Beta is Latin for still doesn’t work.",
    "It works on my machine."
];

function setDailyQuote() {
    const quoteBox = document.getElementById("quoteBox");

    if (!quoteBox) return;

    // quote stable du jour
    const dayIndex = new Date().getDate() % quotes.length;
    const quote = quotes[dayIndex];

    quoteBox.innerText = `💡 ${quote}`;
}
document.addEventListener("DOMContentLoaded", () => {
    snippets = JSON.parse(localStorage.getItem("snippets")) || [];
    setDailyQuote();
    snippets = snippets.map(s => ({
        ...s,
        favorite: s.favorite ?? false
        
    }));

    render();

    setTimeout(() => {
        const loader = document.getElementById("loader");
        if (loader) loader.style.display = "none";
    }, 400);
});


function addSnippet() {
    const title = document.getElementById("title").value.trim();
    const tag = document.getElementById("tag").value.trim();
    const code = document.getElementById("code").value;

    if (!title || !code) return;

    const snippet = {
        id: Date.now(),
        title,
        tag,
        code,
        favorite: false
    };

    snippets.push(snippet);
    save();
    render();

    document.getElementById("title").value = "";
    document.getElementById("tag").value = "";
    document.getElementById("code").value = "";
}

function deleteSnippet(id) {
    snippets = snippets.filter(s => s.id !== id);
    save();
    render();
}


function copyCode(code) {
    navigator.clipboard.writeText(code);
}

function save() {
    localStorage.setItem("snippets", JSON.stringify(snippets));
}


function render() {
    const container = document.getElementById("snippets");
    const search = document.getElementById("search")?.value.toLowerCase() || "";

    container.innerHTML = "";

    const filtered = snippets
        .sort((a, b) => b.favorite - a.favorite)
        .filter(s => {

            const matchSearch =
                s.title.toLowerCase().includes(search) ||
                (s.tag || "").toLowerCase().includes(search);

            const matchFav = favoritesOnly ? s.favorite : true;
            const matchTag = activeTag ? s.tag === activeTag : true;

            return matchSearch && matchFav && matchTag;
        });

    filtered.forEach(s => {

        const div = document.createElement("div");
        div.className = "snippet";
        div.dataset.id = s.id;

        div.innerHTML = `
            <h3>
                ${s.title}
                <button onclick="toggleFavorite(${s.id})">
                    ${s.favorite ? "⭐" : "☆"}
                </button>
            </h3>

            <div class="tag" onclick="filterTag('${s.tag}')">
                #${s.tag || "no-tag"}
            </div>
        `;

        const pre = document.createElement("pre");
        const code = document.createElement("code");

        code.className = "language-javascript";
        code.textContent = s.code; // 🔥 SAFE IMPORTANT

        pre.appendChild(code);
        div.appendChild(pre);

        const copyBtn = document.createElement("button");
        copyBtn.textContent = "Copy";
        copyBtn.onclick = () => copyCode(s.code);

        const delBtn = document.createElement("button");
        delBtn.textContent = "Delete";
        delBtn.onclick = () => deleteSnippet(s.id);

        div.appendChild(copyBtn);
        div.appendChild(delBtn);

        container.appendChild(div);
    });

    Prism.highlightAll();
}


function toggleFavorite(id) {
    snippets = snippets.map(s =>
        s.id === id ? { ...s, favorite: !s.favorite } : s
    );

    save();
    render();
}

function toggleFavoritesOnly() {
    favoritesOnly = !favoritesOnly;
    render();
}


function filterTag(tag) {
    activeTag = tag;
    render();
}

function showAll() {
    activeTag = null;
    favoritesOnly = false;
    render();
}


function toggleTheme() {
    document.body.classList.toggle("light");

    localStorage.setItem(
        "theme",
        document.body.classList.contains("light") ? "light" : "dark"
    );
}


function clearAllSnippets() {
    if (!confirm("⚠️ Delete ALL snippets?")) return;

    snippets = [];
    save();
    render();
}
