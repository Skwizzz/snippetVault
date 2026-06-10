let snippets = JSON.parse(localStorage.getItem("snippets")) || [];
let favoritesOnly = false;


function addSnippet() {
    const title = document.getElementById("title").value;
    const tag = document.getElementById("tag").value;
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
    alert("Copied!");
}

function save() {
    localStorage.setItem("snippets", JSON.stringify(snippets));
}

function render() {
    const container = document.getElementById("snippets");
    const search = document.getElementById("search")?.value.toLowerCase() || "";

    container.innerHTML = "";

    snippets
        .sort((a, b) => b.favorite - a.favorite)
        .filter(s => {

            const matchSearch =
                s.title.toLowerCase().includes(search) ||
                (s.tag || "").toLowerCase().includes(search);

            const isFavorite = s.favorite === true;

            const matchFav = favoritesOnly ? isFavorite : true;

            return matchSearch && matchFav;
        })
        .forEach(s => {

            const star = s.favorite ? "⭐" : "☆";

            container.innerHTML += `
                <div class="snippet">
                    <h3>
                        ${s.title}
                        <button onclick="toggleFavorite(${s.id})">
                            ${star}
                        </button>
                    </h3>

                    <div class="tag">#${s.tag || "no-tag"}</div>

                    <pre><code class="language-javascript">${escapeHtml(s.code)}</code></pre>

                    <button onclick="copyCode(\`${s.code}\`)">Copy</button>
                    <button onclick="deleteSnippet(${s.id})">Delete</button>
                </div>
            `;
        });

    Prism.highlightAll();
}

function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
function toggleTheme() {
    document.body.classList.toggle("light");

    // save preference
    if (document.body.classList.contains("light")) {
        localStorage.setItem("theme", "light");
    } else {
        localStorage.setItem("theme", "dark");
    }
}

// load saved theme
window.onload = () => {
    if (localStorage.getItem("theme") === "light") {
        document.body.classList.add("light");
    }
};
function filterTag(tag) {
    const items = document.querySelectorAll(".snippet");

    items.forEach(el => {
        if (el.innerText.toLowerCase().includes(tag)) {
            el.style.display = "block";
        } else {
            el.style.display = "none";
        }
    });
}

function showAll() {
    document.querySelectorAll(".snippet").forEach(el => {
        el.style.display = "block";
    });
}
function toggleFavorite(id) {
    snippets = snippets.map(s => {
        if (s.id === id) {
            return { ...s, favorite: !s.favorite };
        }
        return s;
    });

    save();
    render();
}
function toggleFavoritesOnly() {
    favoritesOnly = !favoritesOnly;
    render();
}
window.addEventListener("DOMContentLoaded", () => {
    render();
});
document.addEventListener("DOMContentLoaded", () => {
    snippets = JSON.parse(localStorage.getItem("snippets")) || [];

    snippets = snippets.map(s => ({
        ...s,
        favorite: s.favorite ?? false
    }));

    render();

    // simulate loading delay (UI feel)
    setTimeout(() => {
        document.getElementById("loader").style.display = "none";
    }, 400);
});
function clearAllSnippets() {
    const confirmDelete = confirm("⚠️ Delete ALL snippets? This cannot be undone.");

    if (!confirmDelete) return;

    snippets = [];
    save();
    render();
}