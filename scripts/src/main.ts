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
        let dir = `${srcDir()}/pages/mods`;
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }

        // Now we fetch the readmes
        Promise.all(results.map(load_mod_readme)).then((modified_results) => {
            // Once readmes are fetched, save the current db
            let json = JSON.stringify(modified_results, null, 2);
    
            fs.writeFile(srcDir() + "/database.json", json, 'utf8', (err : Error) => {
                if (err) {
                    throw new Error(err.message);
                }
                else {
                    core.info("Saved updated database");
                }
            });
            core.info("Saved database.json");
        });
    });

    await fetch_json("https://raw.githubusercontent.com/DREDGE-Mods/DredgeModDownloadTracker/main/scripts/downloads.json").then((results) => {
        fs.writeFile(srcDir() + "/downloads.json", JSON.stringify(results, null, 2), 'utf8', (err : Error) => {
            if (err) {
                throw new Error(err.message);
            }
            else {
                core.info("Saved updated download counts");
            }
        });
    });
}

async function load_mod_readme(mod : any) {
    return await fetch_text(mod.readme_raw).then((results) => {
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
        let regex3 = /(!\[.*\]\()(.*\))/g
        var imageMatches = mod_page.match(regex3)
        // Do this programatically because regex is such a pain for checking if something doesn't contain something
        if (imageMatches != null) {
            for (let i = 0; i < imageMatches.length; i++) {
                var imageMatch = imageMatches[i];
                if (!imageMatch.includes("https://") && !imageMatch.includes("http://") && !imageMatch.includes("www.")) {
                    let correctedImageUrl = imageMatch.replace(regex3, "$1" + repo_root + "$2");
                    mod_page = mod_page.replace(imageMatch, correctedImageUrl);
                }
            }
        }

        fs.writeFile(`${srcDir()}/pages/mods/${page_name}.md`, mod_page, 'utf8', (err : Error) => {
            if (err) {
                throw new Error(err.message);
            }
            else {
                core.info("Saved mod page for " + mod.name);
            }
        });

        // Make a downloads page too
        let downloads_page = 
`---
layout: ../../../layouts/ModDownloadsPage.astro
mod_guid: ${mod.mod_guid}
---`
        let dir = `${srcDir()}/pages/mods/${page_name}`;
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFile(`${srcDir()}/pages/mods/${page_name}/downloads.md`, downloads_page, `utf8`, (err : Error) => {
            if (err) {
                throw new Error(err.message);
            }
            else {
                core.info("Saved mod downloads page for " + mod.name);
            }
        });

        return mod
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