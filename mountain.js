var perlin = noise.perlin3,
  sounds = {
    bg: new Audio(
      "https://projects.thibautfoussard.com/themountains/music/soundtrack.mp3"
    ),
    transition: new Audio(
      "https://projects.thibautfoussard.com/themountains/music/sonar2.mp3"
    )
  },
  lightPositionAmp = 8,
  cameraInteractionEnabled = false,
  initVerticesY = [],
  verticesShuffles = 0,
  mouse = {};

/*
	============================================
	SRC : Scene - Renderer - Camera
	============================================
*/

var scene = new THREE.Scene();
//scene.background = new THREE.Color( 0x000000, 1 );

var canvas = document.getElementById("canvas");
var renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
//renderer.setClearColor(0x000000, 1);

var camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.01,
  10000
);

camera.position.z = 3;
camera.position.x = 0;
camera.position.y = 1;
camera.rotation.set(0, 0, 0);
scene.add(camera);

/*
	============================================
	Background color
	============================================
*/

var gl = canvas.getContext("experimental-webgl");
//gl.clearColor(51, 51, 51, 1);
//gl.clear(gl.COLOR_BUFFER_BIT);

/*
	============================================
	Lights
	============================================
*/
var light_1 = new THREE.PointLight(0xffffff, 10, 8, 2);
light_1.position.set(0, 0, 0);
scene.add(light_1);

var rimlight = new THREE.PointLight(0xffffff, 2, 100);
rimlight.position.set(7.6, 0, -2.4);
rimlight.visible = false;
scene.add(rimlight);

/*
	============================================
	Objects
	============================================
*/

var mesh;
function init() {
  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight;

  camera.position.initY = 1;
  camera.position.initZ = 4;

  var loader = new THREE.JSONLoader();
  loader.load(
    "https://projects.thibautfoussard.com/themountains/old_1/json/plane_2.json",
    function(geometry, materials) {
      var material = new THREE.MeshPhongMaterial({
        color: 0x1a1a1a,
        reflectivity: 1,
        transparent: true,
        opacity: 1,
        side: THREE.DoubleSide,
        shininess: 100,
        specular: 0x333333,
        shading: THREE.FlatShading
      });
      mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = 0;
      mesh.position.y = 0;
      mesh.position.z = 0;
      scene.add(mesh);

      mesh.geometry.vertices.forEach(function(vertex) {
        initVerticesY.push(vertex.y);
      });
      document.getElementById("wrapper").style.opacity = 1;

      animate();
      document
        .getElementById("loader__cta")
        .addEventListener("click", function() {
          sounds.bg.play();
          sounds.transition.volume = 0.5;
          document.getElementById("controls").style.display = "block";
          intro();
        });
    }
  );
}

function animate() {
  mesh.geometry.verticesNeedUpdate = true;

  requestAnimationFrame(animate);

  camera.lookAt(scene.position);
  renderer.render(scene, camera);
}

function intro() {
  anime({
    targets: [light_1.position, camera.position],
    z: 6.5,
    easing: "easeInOutQuart",
    duration: 3000
  });

  setTimeout(function() {
    anime({
      targets: "#loader",
      opacity: 0,
      easing: "easeInQuart",
      duration: 2000
    });
    setTimeout(function(){
            document.getElementById('loader').style.display = "none";
        }, 2025);
    anime({
      targets: ["#note"],
      opacity: 1,
      easing: "easeInQuart",
      duration: 2000
    });
    cameraInteractionEnabled = true;
  }, 2000);
}

function shuffleLight() {
  anime({
    targets: [light_1.color],
    r: 0.1 + Math.random(),
    g: 0.1 + Math.random(),
    b: 0.1 + Math.random(),
    easing: "easeInOutQuart",
    duration: 1000
  });

  anime({
    targets: [rimlight.color],
    r: 0.1 + Math.random(),
    g: 0.1 + Math.random(),
    b: 0.1 + Math.random(),
    easing: "easeInOutQuart",
    duration: 1000
  });

  anime({
    targets: light_1.position,
    y: Math.random(),
    easing: "easeInOutQuart",
    duration: 1000
  });

  anime({
    targets: light_1.intensity,
    intensity: Math.max(Math.random() * 20, 2),
    easing: "easeInOutQuart",
    duration: 1000
  });
}

function shuffleVertices() {
  if (MathAnimations.animation === null)
    updateFOV(Math.floor(Math.random() * 60) + 30);

  verticesShuffles++;
  if (verticesShuffles >= 8) {
    verticesShuffles = 0;
    reset();
    return;
  }
  var randX = 0.1 + Math.random(),
    randY = 0.1 + Math.random(),
    randZ = 0.1 + Math.random(),
    randXYZ = 0.5 + Math.random(),
    heightFactor = 1 + Math.random();

  mesh.geometry.vertices.forEach(function(vertex) {
    var newY =
      perlin(
        vertex.x * randX * randXYZ,
        vertex.y * randY * randXYZ,
        vertex.z * randZ * randXYZ
      ) * heightFactor;
    anime({
      targets: vertex,
      y: newY,
      easing: "easeInOutQuart",
      duration: 2000
    });
  });
}

var MathAnimations = {
  animation: null,
  i: 0,
  animate: function(newAnimation) {
    MathAnimations.animation = newAnimation;
    MathAnimations.i = 0;
    newAnimation();
  },
  sinX: function() {
    if (MathAnimations.animation == MathAnimations.sinX)
      requestAnimationFrame(MathAnimations.animation);
    mesh.geometry.vertices.forEach(function(vertex) {
      var newY = vertex.y + Math.sin(MathAnimations.i / 100 + vertex.x) / 100;
      vertex.y = newY;
    });
    MathAnimations.i++;
  },
  sinZ: function() {
    if (MathAnimations.animation == MathAnimations.sinZ)
      requestAnimationFrame(MathAnimations.animation);
    mesh.geometry.vertices.forEach(function(vertex) {
      var newY = vertex.y + Math.sin(MathAnimations.i / 100 + vertex.z) / 100;
      vertex.y = newY;
    });
    MathAnimations.i++;
  },
  sinXZ: function() {
    if (MathAnimations.animation == MathAnimations.sinXZ)
      requestAnimationFrame(MathAnimations.animation);
    mesh.geometry.vertices.forEach(function(vertex) {
      var newY = Math.sin(MathAnimations.i / 100 + vertex.x * vertex.z) / 3;
      vertex.y = newY;
    });
    MathAnimations.i++;
  }
};

function reset() {
  rimlight.visible = false;
  moveCameraY(1);
  updateFOV(45);
  MathAnimations.animation = null;
  var i = 0;
  mesh.geometry.vertices.forEach(function(vertex) {
    var newY = initVerticesY[i];
    anime({
      targets: vertex,
      y: newY,
      easing: "easeInOutQuart",
      duration: 2000
    });
    i++;
  });
}

(function animateRimLight() {
  anime({
    targets: rimlight,
    intensity: 0.2,
    easing: "easeInOutQuart",
    duration: 4000
  });
  setTimeout(function() {
    anime({
      targets: rimlight,
      intensity: 3,
      easing: "easeInOutQuart",
      duration: 4000
    });
    setTimeout(animateRimLight, 4000);
  }, 4000);
})();

function updateFOV(fov) {
  var fovAnimation = anime({
    targets: camera,
    fov: fov,
    easing: "easeInOutQuart",
    duration: 2000
  });
  fovAnimation.update = function() {
    camera.updateProjectionMatrix();
  };
}

function moveCameraY(y) {
  cameraInteractionEnabled = false;
  var cameraAnimation = anime({
    targets: camera.position,
    y: y,
    easing: "easeInOutQuart",
    duration: 2000
  });
  cameraAnimation.complete = function() {
    cameraInteractionEnabled = true;
    camera.position.initY = y;
  };
}

/*
	============================================
	Window events
	============================================
*/

window.addEventListener("load", init);

window.addEventListener("resize", function() {
  (canvas.width = window.innerWidth), (canvas.height = window.innerHeight);

  renderer.setSize(canvas.width, canvas.height);

  camera.aspect = canvas.width / canvas.height;
  camera.updateProjectionMatrix();
});

window.addEventListener("mousemove", function(event) {
  if (!cameraInteractionEnabled) return;
  mouse.x = event.clientX;
  mouse.y = event.clientY;
  light_1.position.x = (mouse.x / canvas.width * 2 - 1) * lightPositionAmp;
  light_1.position.z =
    camera.position.initZ +
    (mouse.y / canvas.height * 2 - 1) * lightPositionAmp;
  camera.position.y =
    camera.position.initY + (mouse.y / canvas.height * 2 - 1) / 10;
  camera.position.x = (mouse.x / canvas.width * 2 - 1) / 10;
});

document.getElementById("canvas").addEventListener("click", function() {
  sounds.transition.play();
  shuffleVertices();
});

document.getElementById("canvas").addEventListener(
  "contextmenu",
  function(ev) {
    ev.preventDefault();
    sounds.transition.play();
    shuffleLight();
  },
  false
);

/*
	============================================
	Document events
	============================================
*/

document.getElementById("controls__reset").addEventListener("click", reset);
document.getElementById("controls__mute").addEventListener("click", function() {
  if (!sounds.bg) sounds.bg = document.getElementById("audio");
  if (sounds.bg.volume == 1) {
    sounds.bg.volume = 0;
    document.querySelector("#controls__mute span").classList.add("switch--on");
  } else {
    sounds.bg.volume = 1;
    document
      .querySelector("#controls__mute span")
      .classList.remove("switch--on");
  }
});
document
  .getElementById("controls__rimlight")
  .addEventListener("click", function() {
    if (!rimlight.visible) {
      document
        .querySelector("#controls__rimlight span")
        .classList.add("switch--on");
      rimlight.visible = true;
    } else {
      document
        .querySelector("#controls__rimlight span")
        .classList.remove("switch--on");
      rimlight.visible = false;
    }
  });
document.getElementById("controls__sinX").addEventListener("click", function() {
  if (MathAnimations.animation != MathAnimations.sinX) {
    updateFOV(25);
    moveCameraY(-5);
    rimlight.visible = true;
    document
      .querySelector("#controls__rimlight span")
      .classList.add("switch--on");

    MathAnimations.animate(MathAnimations.sinX);
  }
});
document.getElementById("controls__sinZ").addEventListener("click", function() {
  if (MathAnimations.animation != MathAnimations.sinZ) {
    updateFOV(25);
    moveCameraY(5);
    rimlight.visible = true;
    document
      .querySelector("#controls__rimlight span")
      .classList.add("switch--on");

    MathAnimations.animate(MathAnimations.sinZ);
  }
});
document
  .getElementById("controls__sinXZ")
  .addEventListener("click", function() {
    if (MathAnimations.animation != MathAnimations.sinXZ) {
      updateFOV(45);
      moveCameraY(1);
      rimlight.visible = true;
      document
        .querySelector("#controls__rimlight span")
        .classList.add("switch--on");

      MathAnimations.animate(MathAnimations.sinXZ);
    }
  });
