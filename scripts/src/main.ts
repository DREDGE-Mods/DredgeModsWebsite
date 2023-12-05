const core = require("@actions/core");
const node_fetch = require("node-fetch");
const fs = require("fs");

function srcDir() {
    let dir = process.cwd().split("\\").slice(-1)[0];
    // This is dumb. Idk. Makes it run properly locally and via the action
    let src_dir = dir == "build" ? "../../src" : (dir == "scripts" ? "../src" : "src");
    return src_dir;
}

async function run() {
    core.info("Started fetching mod database. Running from " + process.cwd());

    await fetch_json("https://raw.githubusercontent.com/xen-42/DredgeModDatabase/database/database.json").then((results) => {
        let json = JSON.stringify(results, null, 2);
        core.info(json);

        fs.writeFile(srcDir() + "/database.json", json, 'utf8', (err : Error) => {
            if (err) {
                throw new Error(err.message);
            }
            else {
                core.info("Saved updated database");
            }
        });
        core.info("Saved database.json");

        let dir = `${srcDir()}/pages/mods`;
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }

        // Now we fetch the readmes
        results.forEach(load_mod_readme);
    });
}

async function load_mod_readme(mod : {readme_raw : string, name : string}) {
    await fetch_text(mod.readme_raw).then((results) => {
        let page_name = mod.name.toLowerCase().trim().split(" ").join("_");

        let mod_page = 
`---
layout: ../../layouts/ModPage.astro
mod: ${JSON.stringify(mod)}
---
${results}`
        let repo_root = mod.readme_raw.replace("README.md", "");

        // Takes before and after ./ parts of a local path image embed as capture groups
        let regex = /(!\[.*\]\()\.\/(.*\))/g
        mod_page = mod_page.replace(regex, "$1" + repo_root + "$2");

        // Also replace local path images that just start with /
        let regex2 = /(!\[.*\]\()\.\/(.*\))/g
        mod_page = mod_page.replace(regex2, "$1" + repo_root + "$2");

        // Also cover direct paths to images (doesn't start with https://, http://, or www.)
        let regex3 = /(!\[.*\]\()(?!https:\/\/.*$|http:\/\/.*$|www..*$)(.*)/
        mod_page = mod_page.replace(regex2, "$1" + repo_root + "$2")

        fs.writeFile(`${srcDir()}/pages/mods/${page_name}.md`, mod_page, 'utf8', (err : Error) => {
            if (err) {
                throw new Error(err.message);
            }
            else {
                core.info("Saved mod page for " + mod.name);
            }
        });
    });
}

async function fetch_json(url : string) {
    let settings = {method: "GET"};
    let res = await node_fetch(url, settings);
    let json = await res.json();

    if (json.hasOwnProperty("message") && (json["message"] as string).includes("API rate limit exceeded")) {
        throw new Error(json["message"]);
    }

    return json;
}

async function fetch_text(url : string) {
    let settings = {method: "GET"};
    let res = await node_fetch(url, settings);
    let text = await res.text();

    return text;
}

run().catch((error) => core.setFailed("Workflow failed! " + error.message));