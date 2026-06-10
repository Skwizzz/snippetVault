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
                    ${s.favorite ? "⭐" : "FAVORITE"}
                </button>
            </h3>

            <div class="tag" onclick="filterTag('${s.tag}')">
                #${s.tag || "no-tag"}
            </div>
        `;

        const pre = document.createElement("pre");
        const code = document.createElement("code");

        code.className = "language-javascript";
        code.textContent = s.code; 

        pre.appendChild(code);
        div.appendChild(pre);

        const copyBtn = document.createElement("button");
        copyBtn.textContent = "Copy";
        copyBtn.onclick = () => copyCode(s.code);

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.onclick = () => editSnippet(s.id);

        const delBtn = document.createElement("button");
        delBtn.textContent = "Delete";
        delBtn.onclick = () => deleteSnippet(s.id);
        const btns = document.createElement("div");
        btns.className = "snippet-actions";
        const runBtn = document.createElement("button");
    runBtn.textContent = "▶ Run";
    runBtn.onclick = () => runSnippet(s.code, s.tag);

    btns.appendChild(copyBtn);
    btns.appendChild(editBtn);
    btns.appendChild(delBtn);
    btns.appendChild(runBtn);

    div.appendChild(btns);
    
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
function runSnippet(code, tag) {

    // 🐍 PYTHON
    if (tag === "python") {
        runPython(code);
        return;
    }

    const modal = document.createElement("div");
    modal.className = "run-modal";

    const iframe = document.createElement("iframe");

    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "none";

    let content = "";

    // HTML
    if (tag === "html") {
        content = code;
    }

    // CSS
    else if (tag === "css") {
        content = `
            <style>${code}</style>
            <div style="padding:20px">CSS Preview</div>
        `;
    }

    // JS
    else {
        content = `
            <html>
            <body>
            <script>
                try {
                    ${code}
                } catch (e) {
                    document.body.innerHTML = e;
                }
            <\/script>
            </body>
            </html>
        `;
    }

    iframe.srcdoc = content;

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "✖ Close";
    closeBtn.className = "close-run";
    closeBtn.onclick = () => modal.remove();

    modal.appendChild(closeBtn);
    modal.appendChild(iframe);

    document.body.appendChild(modal);
}
async function runPython(code) {

    if (!pyodide) {
        alert("Python is still loading...");
        return;
    }

    try {
        let output = "";

        pyodide.setStdout({
            batched: (text) => {
                output += text;
            }
        });

        pyodide.setStderr({
            batched: (text) => {
                output += text;
            }
        });

        await pyodide.runPythonAsync(code);

        alert(output || "Done");

    } catch (err) {
        alert("Python error: " + err);
    }
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
