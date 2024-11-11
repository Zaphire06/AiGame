class Vehicle {
  constructor(x, y) {
    // position du véhicule
    this.pos = createVector(x, y);
    // vitesse du véhicule
    this.vel = createVector(0, 0);
    // accélération du véhicule
    this.acc = createVector(0, 0);
    // vitesse maximale du véhicule
    this.maxSpeed = 8;
    // force maximale appliquée au véhicule
    this.maxForce = 0.35;
    // rayon du véhicule
    this.r = 16;

    this.avoidanceRadius = 50; // Rayon d'évitement

    this.formationTarget = createVector(0, 0); // Cible pour la position dans la formation

    // Traînée
    this.trail = [];
    this.maxTrailLength = 50; // Longueur maximale de la traînée
  }

  applyBehaviors(target, vehicles) {
    let seekForce = this.seek(target); // Force pour suivre la cible ou la position de formation

    // Le leader (vehicles[0]) ne doit pas être affecté par l'évitement
    if (this === vehicles[0]) {
      this.applyForce(seekForce); // Le leader suit simplement la cible
    } else {
      // Comportement d'évitement pour les autres véhicules
      let avoidForce = this.avoidCollisions(vehicles);

      // Priorité absolue à l'évitement des collisions
      if (avoidForce.mag() > 0.1) {
        this.applyForce(avoidForce); // Si un danger est détecté, l'évitement est prioritaire
      } else {
        // Si aucune collision n'est détectée, revenir à la formation ou suivre la cible
        this.applyForce(seekForce);
      }
    }
  }


  avoidCollisions(vehicles) {
    let avoidRadius = 70; // Augmenter le rayon d'évitement à 100 pixels
    let steer = createVector(0, 0); // Force d'évitement
    let count = 0;

    for (let other of vehicles) {
      if (other !== this) { // Ne pas se comparer à soi-même
        let distance = p5.Vector.dist(this.pos, other.pos);
        if (distance < avoidRadius) {
          // Calculer une force pour s'éloigner du véhicule proche
          let flee = p5.Vector.sub(this.pos, other.pos);
          flee.setMag(this.maxSpeed * 1.5); // Augmenter la vitesse d'évitement
          flee.sub(this.vel);               // Prendre en compte la vitesse actuelle
          flee.limit(this.maxForce * 2);    // Appliquer une force d'évitement renforcée
          steer.add(flee);                  // Ajouter la force d'évitement
          count++;
        }

        if (distance < 7) {
          print("Collision détectée !");
        }
      }

    }

    // Si des véhicules sont proches, appliquer la force moyenne
    if (count > 0) {
      steer.div(count);
    }

    return steer; // Retourner la force d'évitement
  }

  avoidMeteors(meteors) {
    let steer = createVector(0, 0);


    for (let meteor of meteors) {
      let avoidRadius = 120; // Rayon d'évitement des météorites (augmente pour plus de sécurité)
      let distance = p5.Vector.dist(this.pos, meteor.pos);

      if (distance < avoidRadius) {
        // Calculer une force d'évitement, renforcée en fonction de la proximité
        let flee = p5.Vector.sub(this.pos, meteor.pos);
        let forceMultiplier = map(distance, 0, avoidRadius, 5, 1); // Plus on est proche, plus la force est grande
        flee.setMag(this.maxSpeed * forceMultiplier); // La force augmente à mesure que la distance diminue
        flee.sub(this.vel);
        flee.limit(this.maxForce * forceMultiplier); // La force maximale est aussi amplifiée

        steer.add(flee); // Ajouter la force d'évitement à la direction finale
      }
    }

    return steer; // Retourner la force d'évitement
  }

  applyFormation(leader) {
    let index = vehicles.indexOf(this);

    // Calculer la rangée et la colonne en fonction de l'indice
    let row = floor(index / 2);
    let col = index % 2;

    // Équilibrer la formation pour les véhicules impairs
    if (vehicles.length % 2 === 1 && index === vehicles.length - 1) {
      col = 0; // Centre le dernier véhicule s'il est impair
    }

    // Distance derrière le leader (Y), et à gauche ou à droite (X)
    let offsetX = (col === 0 ? -row * 60 : row * 60);
    let offsetY = (row + 1) * 60;

    // Calculer la direction du leader
    let direction = leader.vel.heading();

    // Vecteur pour positionner derrière le leader
    let behindLeader = p5.Vector.fromAngle(direction + PI).setMag(offsetY);

    // Ajuster la position en fonction du décalage X
    let formationTarget = leader.pos.copy().add(behindLeader).add(p5.Vector.fromAngle(direction + HALF_PI).setMag(offsetX));

    // Appliquer une force pour rejoindre la position dans la formation
    let force = this.seek(formationTarget);
    this.applyForce(force);
  }

  // seek est une méthode qui permet de faire se rapprocher le véhicule de la cible passée en paramètre
  seek(target) {
    let desired;

    if (this.seekMode === 'destroy' && !mouseMode && target.vel) {
      // Calcul de la direction vers l'interception
      let toTarget = p5.Vector.sub(target.pos, this.pos);
      let distance = toTarget.mag();

      // Calcul du temps d'interception en fonction de la distance et des vitesses
      let relativeSpeed = this.maxSpeed + target.vel.mag();
      let timeToIntercept = distance / relativeSpeed;

      // Calcul de la position future de la cible (point d'interception)
      let futurePosition = p5.Vector.add(target.pos, p5.Vector.mult(target.vel, timeToIntercept));

      // Afficher le point visé pour le véhicule leader uniquement
      if (this === vehicles[0]) {
        fill("blue");
        noStroke();
        circle(futurePosition.x, futurePosition.y, 10);  // Petit cercle bleu au point d'interception
      }

      // Calcul du vecteur vers la future position pour interception
      desired = p5.Vector.sub(futurePosition, this.pos);
    } else {
      // Mode de poursuite normal vers la cible actuelle
      desired = p5.Vector.sub(target.pos ? target.pos : target, this.pos);
    }

    // Déterminer la vitesse sans ralentir si en mode "destroy"
    let distance = desired.mag();
    let speed = this.seekMode === 'destroy' ? this.maxSpeed : map(distance, 0, 200, 0, this.maxSpeed);
    desired.setMag(speed);

    // Calcul de la force de correction (steering)
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce);

    return steer;
  }




  flee(target) {
    // on calcule la direction opposée à la cible
    let force = p5.Vector.sub(this.pos, target);

    // on limite ce vecteur à la longueur maxSpeed
    force.setMag(this.maxSpeed);

    // on calcule maintenant force = desiredSpeed - currentSpeed
    force.sub(this.vel);
    // et on limite cette force à la longueur maxForce
    force.limit(this.maxForce);
    return force;
  }

  fleeVehicles(vehicles) {
    let fleeForce = createVector(0, 0);
    let count = 0;

    for (let other of vehicles) {
      let distance = p5.Vector.dist(this.pos, other.pos);

      if (distance > 0 && distance < this.avoidanceRadius) {
        let avoidVector = p5.Vector.sub(this.pos, other.pos); // Direction opposée à l'autre véhicule
        avoidVector.setMag(this.maxSpeed); // La force d'évitement est définie à la vitesse maximale
        avoidVector.sub(this.vel); // Prend en compte la différence de vitesse
        avoidVector.limit(this.maxForce); // Limite la force à la force maximale

        // Renforce l'évitement en fonction de la proximité (plus ils sont proches, plus la force est grande)
        let scaledAvoidance = avoidVector.copy().div(distance);
        fleeForce.add(scaledAvoidance);
        count++;
      }
    }

    if (count > 0) {
      fleeForce.div(count); // Moyenne de la force d'évitement
    }

    return fleeForce;
  }


  // applyForce est une méthode qui permet d'appliquer une force au véhicule
  // en fait on additionne le vecteurr force au vecteur accélération
  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    // Ajouter la position actuelle à la traînée
    this.trail.push(this.pos.copy());

    // Limiter la longueur de la traînée
    if (this.trail.length > this.maxTrailLength) {
      this.trail.shift(); // Supprimer les anciennes positions
    }

    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.set(0, 0);
  }

  // On dessine le véhicule
  show() {
    // Dessiner la traînée avec une opacité réduite
    noFill();
    strokeWeight(2);
    for (let i = 0; i < this.trail.length; i++) {
      let pos = this.trail[i];
      let alpha = map(i, 0, this.trail.length, 0, 255); // Opacité dégressive
      stroke(255, 83, 255, alpha * 0.8); // Violet avec opacité réduite (RGBA)
      point(pos.x, pos.y);
    }

    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading() + PI / 2); // Ajoute une rotation de 90° pour que l'avant du PNG soit bien orienté
    imageMode(CENTER); // Centre l'image au milieu de la position
    image(vehicleImg, 0, 0, this.r * 4, this.r * 4); // Ajuste la taille de l'image (augmentée ici)
    pop();

    // Dessine le vecteur vitesse si activé
    if (showVelocityVector) {
      this.drawVelocityVector();
    }
  }

  drawVelocityVector() {
    push();
    // Dessin du vecteur vitesse
    // Il part du centre du véhicule et va dans la direction du vecteur vitesse
    strokeWeight(3);
    stroke(255, 0, 0);
    line(this.pos.x, this.pos.y, this.pos.x + this.vel.x * 10, this.pos.y + this.vel.y * 10);
    // dessine une petite fleche au bout du vecteur vitesse
    let arrowSize = 5;
    translate(this.pos.x + this.vel.x * 10, this.pos.y + this.vel.y * 10);
    rotate(this.vel.heading());
    translate(-arrowSize / 2, 0);
    triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
    pop();
  }

  // que fait cette méthode ?
  // elle permet de faire réapparaitre le véhicule de 
  // l'autre côté du canvas
  edges() {
    if (this.pos.x > width + this.r) {
      this.pos.x = -this.r;
    } else if (this.pos.x < -this.r) {
      this.pos.x = width + this.r;
    }
    if (this.pos.y > height + this.r) {
      this.pos.y = -this.r;
    } else if (this.pos.y < -this.r) {
      this.pos.y = height + this.r;
    }
  }
}

class Target extends Vehicle {
  constructor(x, y) {
    super(x, y);
    this.pos = createVector(x, y);
    this.vel = createVector(random(-5, 5), random(-5, 5)); // Vitesse initiale aléatoire
    this.maxSpeed = 20;  // Vitesse maximale (modifiable)
    this.maxForce = 0.75;  // Force maximale
  }

  update() {
    // Limiter la vitesse actuelle de la cible par maxSpeed
    this.vel.limit(this.maxSpeed);

    // Ajouter la vitesse à la position
    this.pos.add(this.vel);

    // Gestion des bords (réapparaître de l'autre côté)
    this.edges();
  }

  edges() {
    if (this.pos.x > width) {
      this.pos.x = 0;
    } else if (this.pos.x < 0) {
      this.pos.x = width;
    }
    if (this.pos.y > height) {
      this.pos.y = 0;
    } else if (this.pos.y < 0) {
      this.pos.y = height;
    }
  }

  show() {
    fill("red");
    noStroke();
    circle(this.pos.x, this.pos.y, 32); // Dessiner la cible
  }
}

class Meteor {
  constructor() {
    // Position initiale : toujours à droite de l'écran
    this.pos = createVector(random(width, width + 100), random(height));

    // Vitesse de déplacement (vers la gauche)
    this.speed = random(2, 6);

    // Taille aléatoire des météorites
    this.size = random(40, 80);

    // Vitesse de rotation
    this.rotationSpeed = random(0.01, 0.05);
    this.rotation = 0; // Angle de rotation initial

    // Image de la météorite
    this.img = loadImage('./meteor.png');
  }

  update() {
    // Déplacement vers la gauche
    this.pos.x -= this.speed;

    // Appliquer la rotation
    this.rotation += this.rotationSpeed;

    // Si la météorite sort de l'écran, la réinitialiser
    if (this.pos.x < -this.size) {
      this.pos = createVector(random(width, width + 100), random(height));
      this.speed = random(2, 6); // Vitesse différente
    }
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.rotation); // Appliquer la rotation
    imageMode(CENTER);
    image(this.img, 0, 0, this.size, this.size); // Dessiner la météorite
    pop();
  }
}


class Particle {
  constructor(x, y) {
    // Position initiale à la position de l'explosion
    this.pos = createVector(x, y);

    // Vitesse initiale très faible
    this.vel = p5.Vector.random2D().mult(random(0.5, 1)); // Petite vitesse initiale

    // Accélération progressive
    this.acc = p5.Vector.random2D().mult(0.01); // L'accélération est très faible

    // Rotation initiale et vitesse de rotation
    this.angle = random(TWO_PI); // Angle initial aléatoire
    this.rotationSpeed = random(-0.05, 0.05); // Rotation lente initiale, aléatoire

    // Taille aléatoire de la particule (carrés et rectangles pour simuler des débris)
    this.width = random(5, 12);
    this.height = random(5, 20); // Les débris peuvent être plus longs pour simuler des plaques métalliques

    // Couleurs grisées pour l'effet de métal
    let grey = random(50, 200);
    this.color = color(grey, grey, grey, 200); // Différentes nuances de gris avec légère transparence

    // Vitesse maximale et minimale
    this.maxSpeed = 3;
    this.minSpeed = 0.5;
  }

  update() {
    // Appliquer l'accélération à la vitesse
    this.vel.add(this.acc);

    // Limiter la vitesse de la particule
    this.vel.limit(this.maxSpeed);

    // Si la vitesse devient trop faible, on s'assure qu'elle ne s'arrête jamais complètement
    if (this.vel.mag() < this.minSpeed) {
      this.vel.setMag(this.minSpeed); // Appliquer la vitesse minimale
    }

    // Appliquer la vitesse à la position
    this.pos.add(this.vel);

    // Appliquer la rotation
    this.angle += this.rotationSpeed;

    // Ralentir légèrement la particule au fil du temps pour donner un effet de friction dans l'espace
    this.vel.mult(0.99); // Ralentissement progressif (décélération)
  }

  show() {
    // Afficher la particule en forme de débris (rectangles) avec rotation
    push();
    translate(this.pos.x, this.pos.y); // Déplacer à la position
    rotate(this.angle); // Appliquer la rotation
    noStroke();
    fill(this.color);
    rect(0, 0, this.width, this.height); // Afficher le rectangle depuis le centre
    pop();
  }

  // Vérifier si la particule est hors de l'écran
  isOffScreen() {
    return (this.pos.x < 0 || this.pos.x > width || this.pos.y < 0 || this.pos.y > height);
  }

  // Interaction plus douce avec les véhicules (les particules sont repoussées plus lentement)
  reactToVehicle(vehicle) {
    let distance = p5.Vector.dist(this.pos, vehicle.pos);
    if (distance < vehicle.r * 2) {
      // Appliquer une force de réaction lente en cas de contact avec un véhicule
      let pushForce = p5.Vector.sub(this.pos, vehicle.pos).setMag(0.5); // Une force plus petite pour un effet doux
      this.vel.add(pushForce); // Ajouter la force à la vitesse

      // Augmenter la rotation légèrement quand touché
      this.rotationSpeed += random(-0.02, 0.02);
    }
  }
}
