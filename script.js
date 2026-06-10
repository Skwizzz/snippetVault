let snippets = [];
let favoritesOnly = false;
let activeTag = null;
let editingId = null;
let pyodide;

async function initPython() {
    pyodide = await loadPyodide();
    console.log("Python ready");
}

initPython();
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
    if (editingId) {

    snippets = snippets.map(s => {

        if (s.id === editingId) {
            return {
                ...s,
                title,
                tag,
                code
            };
        return {
        ...s,
        title,
        tag,
        code,
        updatedAt: Date.now()
        };
        }

        return s;
    });

    editingId = null;

    document.querySelector(".form button").innerText =
        "Add Snippet";

    save();
    render();

    document.getElementById("title").value = "";
    document.getElementById("tag").value = "";
    document.getElementById("code").value = "";

    return;
}
    

    if (!title || !code) return;

    const snippet = {
    id: Date.now(),
    title,
    tag,
    code,
    favorite: false,

    createdAt: Date.now(),
    updatedAt: Date.now(),
    copies: 0,
    
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


function copyCode(code, id) {
    navigator.clipboard.writeText(code);

    snippets = snippets.map(s =>
        s.id === id
            ? { ...s, copies: (s.copies || 0) + 1 }
            : s
    );

    save();
    render();
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

        // HEADER
        const header = document.createElement("h3");
        header.innerHTML = `
            ${s.title}
            <button onclick="toggleFavorite(${s.id})">
                ${s.favorite ? "⭐" : "FAVORITE"}
            </button>
        `;

        // TAG
        const tag = document.createElement("div");
        tag.className = "tag";
        tag.textContent = `#${s.tag || "no-tag"}`;
        tag.onclick = () => filterTag(s.tag);

        // STATS
        const stats = document.createElement("div");
stats.className = "snippet-stats";

const created = new Date(s.createdAt).toLocaleDateString();
const updated = new Date(s.updatedAt).toLocaleDateString();

stats.innerHTML = `
<span>📅 ${created}</span>
<span>✏️ ${updated}</span>
<span>📋 ${s.copies || 0} copies</span>
`;

div.appendChild(stats);

div.innerHTML = ` ... `

        // CODE BLOCK
        const pre = document.createElement("pre");
        const code = document.createElement("code");
        code.className = "language-javascript";
        code.textContent = s.code;
        pre.appendChild(code);

        // ACTIONS
        const actions = document.createElement("div");
        actions.className = "snippet-actions";

        const copyBtn = document.createElement("button");
        copyBtn.textContent = "Copy";
        copyBtn.onclick = () => copyCode(s.code, s.id);

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.onclick = () => editSnippet(s.id);

        const delBtn = document.createElement("button");
        delBtn.textContent = "Delete";
        delBtn.onclick = () => deleteSnippet(s.id);

        

        actions.append(copyBtn, editBtn, delBtn,);

        // ASSEMBLY ORDER (IMPORTANT)
        div.append(header, tag, stats, pre, actions);
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
function editSnippet(id) {
    const snippet = snippets.find(s => s.id === id);

    if (!snippet) return;

    document.getElementById("title").value = snippet.title;
    document.getElementById("tag").value = snippet.tag;
    document.getElementById("code").value = snippet.code;

    editingId = id;

    document.querySelector(".form button").innerText = "💾 Save Changes";
    snippet.updatedAt = Date.now();
}
function importSnippets(event) {

    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(e) {

        try {

            const imported =
                JSON.parse(e.target.result);

            snippets = imported;

            save();
            render();

            alert("Import successful");

        } catch {

            alert("Invalid JSON file");

        }
    };

    reader.readAsText(file);
}
function exportSnippets() {

    const data = JSON.stringify(snippets, null, 2);

    const blob = new Blob(
        [data],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = "snippet-vault-backup.json";

    a.click();

    URL.revokeObjectURL(url);
}

function goAbout() {
    window.location.href = "about.html";
}
function updateTagStyle(select) {
    const wrapper = select.parentElement;

    wrapper.classList.remove("js", "css", "html", "python");

    if (select.value) {
        wrapper.classList.add(select.value);
    }
}
