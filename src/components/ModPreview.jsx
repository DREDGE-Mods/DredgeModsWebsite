import { getThumbnail, getSlug } from '../utils.ts'

export default function ModPreview({mod : mod}) {
    return (
        <div className="m-2" style={{"flex": "1 1 0", "min-width": "300px", "max-width": "500px"}}>
            <div className="p-2 pb-1 card bg-secondary h-100">
                <div className="d-flex flex-column text-center h-100">
                    <a href={"/mods/" + getSlug(mod)}>
                        <h5 className="text-center">{mod.name}</h5>
                        <div className="pb-2">
                            <img className="bg-black bg-opacity-50" style={{"object-fit": "contain"}} src={getThumbnail(mod)} alt={mod.name} width="400" height="200" loading="eager"/>
                        </div>
                    </a>
                    <div className="flex-grow-1"></div>
                    <div className="bg-black bg-opacity-25 p-1 mb-1">
                        <div style={{height: "80px", "max-height": "80px", overflow: "hidden", "text-overflow": "ellipsis", whitespace: "nowrap"}} className="d-block align-text-top">
                        <p>{mod.description}</p> 
                        </div>
                        <div className="opacity-50 ">
                            <p className="mb-0"><i>By {mod.author} • {mod.downloads} downloads</i></p>  
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

