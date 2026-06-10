const updates = [
    {
        version: "v1.3",
        text: "Added Runner ( Still WIP ) Added tag selection"
    },
    {
        version: "v1.2",
        text: "Added import/export JSON snippets"
    },
    {
        version: "v1.1",
        text: "Added favorites + filtering system"
    },
    {
        version: "v1.0",
        text: "Initial release of Snippet Vault"
    }
];

function loadAbout() {

    const latest = updates[0];

    document.getElementById("latestUpdate").innerText =
        `${latest.version} - ${latest.text}`;

    const list = document.getElementById("changelog");

    updates.forEach(u => {

        const li = document.createElement("li");
        li.innerText = `${u.version} → ${u.text}`;

        list.appendChild(li);
    });
}

document.addEventListener("DOMContentLoaded", loadAbout);