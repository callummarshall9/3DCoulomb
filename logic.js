var pageIsLoaded = false, scene = null, charges = [], simRunning = true, timestep = 1;

function createScene(engine, canvas) {
  scene = new BABYLON.Scene(engine);//Creates new scene.
  var camera = new BABYLON.FreeCamera('camera', new BABYLON.Vector3(0, 5,-10), scene);//Creates new camera.
  camera.setTarget(BABYLON.Vector3.Zero());//Set it facing zero.
  camera.attachControl(canvas, false);//Attach control to the canvas.
  var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0,1,0), scene);//Create a light source.
  //var ground = BABYLON.MeshBuilder.CreateGround('ground1', {height:6, width:6, subdivisions: 2}, scene);
  // Return the created scene.
  return scene;
}

function pageLoaded() {
  pageIsLoaded = true;
  $("#timestep").val("1");
  $("#timestep").attr("disabled", "true");
  var canvas = document.getElementById("renderCanvas");
  var engine = new BABYLON.Engine(canvas, true);
  var scene = createScene(engine, canvas);
  engine.runRenderLoop(function() {
    scene.render();
  });
  window.addEventListener("resize", function() {
    engine.resize();
  });
  $("#timestep").on("keyup change", function() {
   timestep = parseFloat(this.value); // omit "var" to make it global
 });
 $("#addChargeBtn").click(function() {
    var x_coord = $("#x_coord").val(),
      y_coord = $("#y_coord").val(),
      z_coord = $("#z_coord").val(),
      charge_magnitude = $("#charge_mag").val(),
      charge_mass = $("#charge_mass").val();
    var sphere = BABYLON.MeshBuilder.CreateSphere("sphere" + charges.length, {diameter:1, segments: 16, updatable:true}, scene);
    sphere.position.x = x_coord;
    sphere.position.y = y_coord;
    sphere.position.z = z_coord;
    var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);
    if(charge_magnitude > 0) {
      myMaterial.diffuseColor = new BABYLON.Color3(0, 0, 1);
    } else {
      myMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
    }
    sphere.material = myMaterial;
    charges.push({mesh: sphere,
      x: parseFloat(x_coord),
      v_x: 0,
      y: parseFloat(y_coord),
      v_y:0,
      z: parseFloat(z_coord),
        v_z: 0,
      charge: parseFloat(charge_magnitude),
      mass: parseFloat(charge_mass)
    });
    updateChargeList();
  });
  setInterval(function() {
    if(simRunning) {
      updateChargePositions();
      updateMeshPositions();
      updateChargeList();
    }
  }, 1000);
}

function updateChargeList() {
  var html = "";
  for(var i = 0; i < charges.length; i = i + 1) {
    html = html + "<tr><td>" + charges[i].x + "</td><td>" + charges[i].y + "</td><td>" + charges[i].z + "</td><td>" + charges[i].charge + "</td></tr>";
  }
  $("#chargeList").html(html);
}

function resumeSimulation() {//When resume simulation button is clicked.
  $("#simulationStatus").html("Simulation status: Running.");
  $("#pauseSimulationBtn").show();
  $("#resumeSimulationBtn").hide();
  $("#timestep").attr("disabled", "");
  $("#createCharge").hide();//Hide create charge panel.
  simRunning = true;
}

function pauseSimulation() {//When pause simulation button is clicked.
  $("#simulationStatus").html("Simulation status: Paused.");
  $("#pauseSimulationBtn").hide();
  $("#resumeSimulationBtn").show();
  $("#timestep").removeAttr("disabled");
  $("#createCharge").show();//Show create charge panel.
  simRunning = false;
}
window.addEventListener('DOMContentLoaded', function() {
    pageLoaded();
});


//ACTUAL PHYSICS
function updateMeshPositions() {
  for(var i = 0; i < charges.length; i = i + 1) {
    charges[i].mesh.position.x = charges[i].x;
    charges[i].mesh.position.y = charges[i].y;
    charges[i].mesh.position.z = charges[i].z;
  }
}

function updateChargePositions() {
  for(var i = 0; i < charges.length; i = i + 1) {
    var net_force_x = 0;
    var net_force_y = 0;
    var net_force_z = 0;
    for(var j = 0; j < charges.length; j = j + 1) {
      if(i === j) { continue; }//A charge cannot act on itself.
      var dx = charges[i].x - charges[j].x;
      var dy = charges[i].y - charges[j].y;
      var dz = charges[i].z - charges[j].z;
      var permFreeSpace = 8.85418782 * 10 ** -12;
      var genForce = charges[i].charge * charges[j].charge / (4 * Math.PI * permFreeSpace * Math.pow(dx**2 + dy**2 + dz**2, 1.5)),
        genForceX = genForce * dx,
        genForceY = genForce * dy,
        genForceZ = genForce * dz;
      net_force_x = net_force_x + genForceX;
      net_force_y = net_force_y + genForceY;
      net_force_z = net_force_z + genForceZ;
    }
    var acceleration_x = net_force_x / charges[i].mass;
    var acceleration_y = net_force_y / charges[i].mass;
    var acceleration_z = net_force_z / charges[i].mass;
    charges[i].x = charges[i].x  + charges[i].v_x * timestep + 0.5 * acceleration_x * timestep * timestep;
    charges[i].y = charges[i].y  + charges[i].v_y * timestep + 0.5 * acceleration_y * timestep * timestep;
    charges[i].z = charges[i].z  + charges[i].v_z * timestep + 0.5 * acceleration_z * timestep * timestep;
    charges[i].v_x = charges[i].v_x + acceleration_x * timestep;
    charges[i].v_y = charges[i].v_y + acceleration_y * timestep;
    charges[i].v_z = charges[i].v_z + acceleration_z * timestep;
  }
}
