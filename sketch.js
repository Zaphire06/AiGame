let target, vehicle, targetObj;
let vehicles;
let hits = 0;
let mouseMode = true; // Mode cible par défaut : souris
let vehicleImg;
let showVelocityVector = true; // Par défaut, le vecteur vitesse est affiché
let avoidCollisions = false; // Désactivé par défaut
let inFormation = false; // Le mode de formation est désactivé par défaut
let meteors = [];
let numMeteors = 10; // Nombre de météorites
let meteorMode = false; // Mode Météorite désactivé par défaut
let gameMode = 'peaceful'; // Mode par défaut
let explosionImg;
let spriteSheet;
let spriteData;
let explosionFrames = [];
let font;  // Police pour former les textes avec des particules
let menuParticles = [];
let buttons = [];

let activeMode = "DESTROY";  // Mode actif par défaut

let buttonLabels = [
  "TOGGLE TARGET MODE",
  "TOGGLE FORMATION", "TOGGLE METEOR MODE", "TOGGLE VELOCITY VECTOR",
  "PEACEFUL MODE", "NORMAL MODE", "HARDCORE MODE", "SWITCH MODE"
];


function toggleMode() {
  print("Changement de mode");
  if (activeMode === "FOLLOW") {
    activeMode = "DESTROY";
    print("Mode actif:", activeMode);
  } else {
    activeMode = "FOLLOW";
    console.log("Mode actif:", activeMode);
  }

  arrangeParticlesToText(activeMode);  // Générer les particules du nouveau mode

  // Appliquer le mode aux véhicules (si nécessaire)
  vehicles.forEach(vehicle => {
    vehicle.seekMode = activeMode.toLowerCase();  // Appliquer "follow" ou "destroy"
  });
}


function toggleFormation() {
  print("Changement de mode de formation");
  inFormation = !inFormation;
}

function changeGameMode(mode) {
  gameMode = mode;
  console.log("Mode de jeu:", gameMode);
}

function toggleMeteorMode() {
  meteorMode = !meteorMode; // Inverse l'état du mode Météorite
}

function toggleAvoidCollisions() {
  avoidCollisions = !avoidCollisions; // Inverse l'état d'évitement des collisions
  print("col", avoidCollisions);
}


function toggleVector() {
  showVelocityVector = !showVelocityVector; // Inverse la valeur pour activer/désactiver l'affichage du vecteur
}

function repositionTarget() {
  if (mouseMode) {
    // Si en mode souris, juste réinitialiser la position à un point aléatoire
    target.x = random(width);
    target.y = random(height);
  } else {
    // Si en mode mobile, recrée une nouvelle cible mobile à une position aléatoire
    targetObj = new Target(random(width), random(height));
  }
}

function preload() {
  // Chargement de l'image de l'explosion
  // Charger le spritesheet
  spriteSheet = loadImage('./explosion_spritesheet.png');

  font = loadFont('./PressStart2P-Regular.ttf');  // Charger la police

  // Charger le fichier texte et le parser
  loadStrings('./explosion_spritesheet.txt', parseSpriteData);

  vehicleImg = loadImage('./vehicule.png');
}

function parseSpriteData(data) {
  data.forEach(line => {
    // Chaque ligne est de la forme : "frame0000 = 0 0 100 100"
    let parts = line.split(' = '); // Séparer le nom de la frame et les coordonnées

    let coords = parts[1].split(' '); // Séparer les coordonnées (x, y, w, h)

    // Créer un objet frame avec les coordonnées extraites
    let frame = {
      x: int(coords[0]),
      y: int(coords[1]),
      w: int(coords[2]),
      h: int(coords[3])
    };

    // Ajouter la frame au tableau des frames
    explosionFrames.push(frame);
  });
}

function mousePressed() {
  // Appel à la fonction de gestion des clics du menu
  for (let button of buttons) {
    button.handleClick();
  }

  for (let slider of sliders) {
    slider.startDrag();
  }
}

function mouseReleased() {
  // Arrêter le glissement des sliders
  for (let slider of sliders) {
    slider.stopDrag();
  }
}


function switchTargetMode() {
  mouseMode = !mouseMode;
  if (!mouseMode) {
    targetObj = new Target(random(width), random(height)); // Crée une nouvelle cible mobile
  }
}

function generateButtonParticles(label, x, y) {
  let points = font.textToPoints(label, x, y, 15, {
    sampleFactor: 1  // Ajuster le nombre de points (plus c'est bas, plus il y a de particules)
  });

  points.forEach(pt => {
    let p = new MenuParticle(pt.x, pt.y);
    menuParticles.push(p);
  });
}

let stars = [];
let numStars = 150; // Nombre d'étoiles
let modeParticles = [];

function generateModeParticles(modeText) {
  modeParticles = [];  // Réinitialiser les particules du mode
  print("Génération des particules pour le mode:", modeText);
  let points = font.textToPoints(modeText, width - 200, height - 50, 20, {
    sampleFactor: 0.9  // Ajuste le nombre de particules
  });

  points.forEach(pt => {
    let p = new MenuParticle(pt.x, pt.y);
    modeParticles.push(p);
  });
}

function arrangeParticlesToText(modeText) {
  modeParticles.forEach(p => {
    let force = p5.Vector.random2D().mult(random(2, 7));  // Appliquer une force aléatoire de dispersion
    p.applyForce(force);  // Appliquer la force de dispersion
  });

  // Générer les nouveaux points pour le texte du mode (Follow ou Destroy)
  let newPoints = font.textToPoints(modeText, width - 200, height - 50, 20, {
    sampleFactor: 0.9  // Ajuste le nombre de points pour chaque lettre (plus petit = plus de points)
  });

  // Réassigner les cibles aux particules existantes
  for (let i = 0; i < modeParticles.length; i++) {
    if (i < newPoints.length) {
      // Assigner les cibles des nouvelles particules normalement
      modeParticles[i].target = createVector(newPoints[i].x, newPoints[i].y);
    } else {
      // Si il y a plus de particules que de points, elles se superposent à des cibles existantes
      let randomIndex = int(random(newPoints.length));  // Choisir une position aléatoire déjà utilisée
      modeParticles[i].target = createVector(newPoints[randomIndex].x, newPoints[randomIndex].y);
    }
  }

  // Si le nouveau texte a plus de points que les particules disponibles, il faut en créer des nouvelles
  if (newPoints.length > modeParticles.length) {
    for (let i = modeParticles.length; i < newPoints.length; i++) {
      let newParticle = new Particle(newPoints[i].x, newPoints[i].y);
      modeParticles.push(newParticle);
    }
  }

}

//// Game over si tous les véhicules sont détruits, toutes les particules des boutons des menus forme le texte "GAME OVER"
function gatherButtonParticlesForGameOver() {
  let allParticles = [];

  // Récupérer toutes les particules des boutons
  buttons.forEach(button => {
    allParticles = allParticles.concat(button.particles);
    print("Particules des bouton:", allParticles.length);
  });

  // // Réinitialiser les particules des boutons
  // buttons.forEach(button => {
  //   button.particles = [];
  // });

  // Générer les points pour le texte "GAME OVER"
  let points = font.textToPoints("GAME OVER", width / 2 - 500, height / 2, 120, {
    sampleFactor: 0.6
  });

  // Réassigner les cibles aux particules existantes
  for (let i = 0; i < allParticles.length; i++) {
    if (i < points.length) {
      allParticles[i].target = createVector(points[i].x, points[i].y);
    } else {
      let randomIndex = int(random(points.length));
      allParticles[i].target = createVector(points[randomIndex].x, points[randomIndex].y);
    }
  }

  // Si le texte a plus de points que les particules disponibles, créer de nouvelles particules
  if (points.length > allParticles.length) {
    for (let i = allParticles.length; i < points.length; i++) {
      let newParticle = new MenuParticle(points[i].x, points[i].y);
      allParticles.push(newParticle);
    }
  } else {
    // Si il y a plus de particules que de points, les faire voler dans tous les sens
    for (let i = points.length; i < allParticles.length; i++) {
      let randomForce = p5.Vector.random2D().mult(random(2, 7));  // Appliquer une force aléatoire de dispersion
      allParticles[i].applyForce(randomForce);  // Appliquer la force de dispersion
    }
  }

  // Assigner les particules au tableau global des particules
  // menuParticles = allParticles;
}

function setup() {
  createCanvas(windowWidth, windowHeight);


  // Générer les particules du mode actif
  generateModeParticles(activeMode);

  // Initialisation du menu (appel de initMenu dans menu.js)
  // initMenu();
  // Générer les particules pour les boutons
  buttons.push(new Button("CHANGE TARGET", 50, height - 100, switchTargetMode));
  buttons.push(new Button("SHOW VELOCITY VECTOR", 400, height - 100, toggleVector));
  buttons.push(new Button("MODE FORMATION", 800, height - 100, toggleFormation));
  buttons.push(new Button("SWITCH MODE", width - 230, height - 100, toggleMode));

  buttons.push(new Button("METEOR MODE", 50, height - 50, toggleMeteorMode));
  buttons.push(new Button("PEACEFUL MODE", 300, height - 50, () => changeGameMode('peaceful')));
  buttons.push(new Button("NORMAL MODE", 600, height - 50, () => changeGameMode('normal')));
  buttons.push(new Button("HARDCORE MODE", 900, height - 50, () => changeGameMode('hardcore')));


  // Première ligne de boutons
  // for (let i = 0; i < 4; i++) {
  //   generateButtonParticles(buttonLabels[i], buttonX + i * buttonSpacingX, buttonY1);
  // }

  // // Deuxième ligne de boutons
  // for (let i = 4; i < buttonLabels.length; i++) {
  //   generateButtonParticles(buttonLabels[i], buttonX + (i - 4) * buttonSpacingX, buttonY2);
  // }

  sliders.push(new Slider("Max Speed", width - 250, 50, 200, 8, 0, 100, updateMaxSpeed));
  sliders.push(new Slider("Max Force", width - 250, 100, 200, 0.25, 0, 1, updateMaxForce));

  // Création des météorites
  for (let i = 0; i < numMeteors; i++) {
    meteors.push(new Meteor());
  }

  // Création des étoiles
  for (let i = 0; i < numStars; i++) {
    let star = {
      x: random(width),
      y: random(height),
      z: random(1, 3) // Vitesse de l'étoile
    };
    stars.push(star);
  }

  // Création des véhicules
  vehicles = [];
  let nbVehicles = 12; // Nombre de véhicules
  for (let i = 0; i < nbVehicles; i++) {
    let x = random(width);
    let y = random(height);
    vehicles.push(new Vehicle(x, y));
  }

  target = createVector(random(width), random(height)); // Cible initiale
}

function updateMaxSpeed(value) {
  vehicles.forEach(vehicle => {
    vehicle.maxSpeed = value;
  });
}

function updateMaxForce(value) {
  vehicles.forEach(vehicle => {
    vehicle.maxForce = value;
  });
}

function updateRadius(value) {
  vehicles.forEach(vehicle => {
    vehicle.r = value;
  });
}

let frameIndex = 0;

function drawExplosions() {
  // Parcourir toutes les explosions actives
  for (let i = explosions.length - 1; i >= 0; i--) {
    let exp = explosions[i]; // Récupérer l'explosion actuelle

    // Obtenir les coordonnées de la frame actuelle
    let frame = explosionFrames[exp.frameIndex];
    let img = spriteSheet.get(frame.x, frame.y, frame.w, frame.h);

    // Afficher l'image de l'explosion à la position du véhicule
    let v = exp.vehicle; // Référence au véhicule explosé
    push();
    imageMode(CENTER);
    image(img, v.pos.x, v.pos.y, v.r * 7, v.r * 7);
    pop();

    // Incrémenter le compteur
    exp.frameCounter++;

    // Passer à la frame suivante seulement après "frameDelay" cycles
    let frameDelay = 1; // Augmenter cette valeur pour ralentir l'animation
    if (exp.frameCounter % frameDelay === 0) {
      exp.frameIndex++;
    }

    // Si l'animation est terminée, supprimer l'explosion
    if (exp.frameIndex >= explosionFrames.length) {
      explosions.splice(i, 1); // Retirer cette explosion
    }
  }
}

function drawParticles() {
  // Parcourir toutes les particules actives
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];

    // Mettre à jour la position de la particule
    p.update();

    // Vérifier si la particule est hors de l'écran
    if (p.isOffScreen()) {
      particles.splice(i, 1); // Supprimer la particule si elle est hors de l'écran
      continue;
    }

    // Afficher la particule
    p.show();

    // Vérifier la collision avec tous les véhicules
    for (let v of vehicles) {
      p.reactToVehicle(v);
    }
  }
}


let explosions = []; // Pour suivre les explosions actives
let particles = []; // Tableau pour suivre les particules actives

function destroyVehicle(v) {

  // Ajouter une explosion active pour ce véhicule
  explosions.push({
    vehicle: v,           // Référence au véhicule
    frameIndex: 0,        // Compteur de frame pour l'animation
    frameCounter: 0       // Compteur pour ralentir l'animation
  });


  // Retirer le véhicule de la simulation après l'explosion
  setTimeout(() => {
    let index = vehicles.indexOf(v);
    if (index !== -1) {
      vehicles.splice(index, 1);
    }
    // Générer des particules à la position du véhicule détruit
    for (let i = 0; i < 20; i++) { // 20 particules par explosion, tu peux ajuster ce nombre
      particles.push(new Particle(v.pos.x, v.pos.y));
    }
  }, 50); // Délai pour laisser le temps à l'animation de se jouer
}

function keyPressed() {
  if (key === '&') {
    explosions.push({
      vehicle: vehicles[0],           // Référence au véhicule
      frameIndex: 0,        // Compteur de frame pour l'animation
      frameCounter: 0       // Compteur pour ralentir l'animation
    });
    drawExplosion(vehicles[0]);
    print("Debug explosion at mouse position");
  }
  if (key === 'p') {
    toggleInterface();
  }
}

// la fonction draw est appelée en boucle par p5.js, 60 fois par seconde par défaut
// Le canvas est effacé automatiquement avant chaque appel à draw
function draw() {
  // Fond légèrement bleuté
  background(10, 10, 40);

  drawExplosions();

  drawParticles();

  // drawMenu();

  sliders.forEach(slider => {
    slider.show();  // Affiche chaque slider
  });

  buttons.forEach(button => {
    button.show();  // Afficher chaque bouton (les particules)
  });

  modeParticles.forEach(p => {
    p.behaviors();
    p.update();
    p.show();
  });

  if (meteorMode) {
    // Afficher et mettre à jour les météorites
    for (let meteor of meteors) {
      meteor.update();
      meteor.show();
    }

    // Les vaisseaux doivent éviter les météorites
    for (let v of vehicles) {
      let avoidMeteorForce = v.avoidMeteors(meteors); // Ajouter une méthode pour éviter les météorites
      v.applyForce(avoidMeteorForce);
    }

    // Vérifier si un véhicule touche une météorite
    for (let v of vehicles) {
      for (let meteor of meteors) {
        if (p5.Vector.dist(v.pos, meteor.pos) < meteor.size / 2 && gameMode != 'peaceful') {
          // Collision détectée avec une météorite
          destroyVehicle(v); // Détruire le véhicule
          print("Collision avec une météorite");
          break;
        }
      }
    }
  }

  // function mousePressed() {
  //   buttons.forEach(button => {
  //     button.handleClick();  // Vérifier si un bouton est cliqué
  //   });
  //   print("Mouse pressed");
  //   isMousePressed = true;
  // }

  // function mouseReleased() {
  //   isMousePressed = false;  // La souris est relâchée
  // }



  // Dessiner les étoiles
  for (let star of stars) {
    noStroke();
    fill(255);
    ellipse(star.x, star.y, 2, 2); // Chaque étoile est un petit cercle

    // Déplacer l'étoile lentement
    star.x -= star.z;

    // Si l'étoile sort de l'écran, la remettre à droite
    if (star.x < 0) {
      star.x = width;
      star.y = random(height);
    }
  }

  // Mise à jour de la cible (soit elle suit la souris, soit elle est mobile)
  if (mouseMode) {
    target.x = mouseX;
    target.y = mouseY;
  } else {
    targetObj.update();
    targetObj.show();
    target = targetObj.pos;
  }

  // Vérifier si un véhicule touche la cible
  for (let v of vehicles) {
    if (p5.Vector.dist(v.pos, target) < 20 && !mouseMode) { // Si un véhicule touche la cible (20 pixels de rayon)
      // Déplacer la cible à une nouvelle position aléatoire dans le canvas
      target.x = random(width);
      target.y = random(height);

      targetObj.vel = createVector(random(-5, 5), random(-5, 5)); // Nouvelle direction aléatoire
    }
  }

  // Mise à jour du leader
  if (vehicles.length > 0) {
    vehicles[0].applyBehaviors(target, vehicles);
    vehicles[0].update();
    vehicles[0].show();
  } else {
    // Si le leader est détruit, le jeu est perdu
    print("Game Over");
    gatherButtonParticlesForGameOver(); // Générer les particules pour le texte "GAME OVER"
    //noLoop(); // Arrêter la boucle draw
  }

  // Mise à jour des autres véhicules en mode formation ou comportement normal
  if (inFormation) {
    for (let i = 1; i < vehicles.length; i++) {
      vehicles[i].applyFormation(vehicles[0]);
      vehicles[i].update();
      vehicles[i].show();
    }
  } else {
    for (let i = 1; i < vehicles.length; i++) {
      vehicles[i].applyBehaviors(target, vehicles);
      vehicles[i].update();
      vehicles[i].show();
    }
  }
}
