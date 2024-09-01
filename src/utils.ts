export function getThumbnail(mod : any) {
    return mod == undefined ? undefined : (mod.thumbnail != undefined && mod.thumbnail != "") 
        ? "https://raw.githubusercontent.com/DREDGE-Mods/DredgeModDatabase/database/thumbnails/" + mod.thumbnail
        : "/images/AberratedQuestionMark.png"
}

export function getSlug(mod : any) {
    return mod.name.toLowerCase().trim().split(" ").join("_")
}