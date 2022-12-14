// VARIABLES AND CONSTANTS

const PBR1_SCENECONFIG = {
	"default" : {
	
		"environment_tonemapping" : "linear",
		"environment_exposure" : 0.0,

		"environment_url" : ["./media/test.exr"],
		"environment_name": [],
		"environment_index":0
	},
	"current" : {},
}

// EVENT LISTENERS

// Zooming
document.addEventListener( 'mousewheel', (event) => {
    PBR1_ELEMENTS.camera.fov = Math.min(Math.max(PBR1_ELEMENTS.camera.fov + event.deltaY/50, 1), 150);
	PBR1_ELEMENTS.camera.updateProjectionMatrix();
});


// FUNCTIONS

function updateScene(incomingSceneConfiguration,fallbackType){

	newSceneConfiguration = buildNewSceneConfiguration(incomingSceneConfiguration,fallbackType);

	// Exposure

	if(PBR1_SCENECONFIG.current["environment_exposure"] != newSceneConfiguration["environment_exposure"]){
		PBR1_ELEMENTS.renderer.toneMappingExposure = Math.pow(2,newSceneConfiguration["environment_exposure"]);
	}

	if(PBR1_SCENECONFIG.current["environment_tonemapping"] != newSceneConfiguration["environment_tonemapping"]){
		PBR1_ELEMENTS.renderer.toneMapping = PBR1_THREEJSMAPPING.toneMapping[newSceneConfiguration["environment_tonemapping"]];
	}

	// Set Environment

	if( PBR1_SCENECONFIG.current.environment_index != newSceneConfiguration.environment_index || !arrayEquals(PBR1_SCENECONFIG.current["environment_url"],newSceneConfiguration["environment_url"])){
		if(newSceneConfiguration["environment_url"][newSceneConfiguration.environment_index].split("?")[0].split("#")[0].endsWith(".hdr")){
			var envLoader = new THREE.RGBELoader();
		}else if(newSceneConfiguration["environment_url"][newSceneConfiguration.environment_index].split("?")[0].split("#")[0].endsWith(".exr")){
			var envLoader = new THREE.EXRLoader();
		}
		
		envLoader.load(newSceneConfiguration["environment_url"][newSceneConfiguration.environment_index], texture => {
			const gen = new THREE.PMREMGenerator(PBR1_ELEMENTS.renderer);
			const envMap = gen.fromEquirectangular(texture).texture;
			PBR1_ELEMENTS.scene.environment = envMap;
			PBR1_ELEMENTS.scene.background = envMap;
			texture.dispose()
			gen.dispose()

			PBR1_ELEMENTS.renderer.toneMappingExposure = Math.pow(2,newSceneConfiguration["environment_exposure"]);
			PBR1_ELEMENTS.renderer.toneMapping = PBR1_THREEJSMAPPING.toneMapping[newSceneConfiguration["environment_tonemapping"]];
		});
		
	}

	PBR1_SCENECONFIG.current = structuredClone(newSceneConfiguration);
	updateGuiFromCurrentSceneConfiguration();
}

// MAIN

PBR1_ELEMENTS.scene = new THREE.Scene();

// camera
PBR1_ELEMENTS.camera = new THREE.PerspectiveCamera( 80, window.innerWidth / window.innerHeight, 0.1, 1000 );
PBR1_ELEMENTS.camera.position.x = 2;
PBR1_ELEMENTS.camera.position.y = 1;

// renderer
PBR1_ELEMENTS.renderer = new THREE.WebGLRenderer();
resizeRenderingArea();
PBR1_ELEMENTS.renderer.outputEncoding = THREE.sRGBEncoding;

// orbit controls
PBR1_ELEMENTS.controls = new THREE.OrbitControls(PBR1_ELEMENTS.camera, PBR1_ELEMENTS.renderer.domElement);
PBR1_ELEMENTS.controls.enableZoom = true;
PBR1_ELEMENTS.controls.minDistance = PBR1_ELEMENTS.controls.maxDistance = 2;
PBR1_ELEMENTS.controls.enablePan = false;
PBR1_ELEMENTS.controls.enableDamping = true;

// START
main()