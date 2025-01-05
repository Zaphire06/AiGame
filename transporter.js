class Transporter {
    constructor(x, y) {
      this.pos = createVector(x, y);
      this.vel = createVector(random(-1, 1), random(-1, 1)); // Direction initiale aléatoire
      this.acc = createVector();
      this.maxSpeed = 4; // Plus lent que les véhicules normaux
      this.maxForce = 0.3; // Force maximale pour changer de direction
      this.size = 70; // Taille du transporteur
      this.detectionRadius = 200; // Rayon de détection pour les astronautes
      this.wanderTheta = 0; // Angle pour errance
      this.radarAngle = 0; // Angle du radar
      // Traînée
      this.trail = [];
      this.maxTrailLength = 50;
    }
  
    applyForce(force) {
        this.acc.add(force);
      }
    
    wander() {
      // Algorithme d'errance
      let wanderPoint = this.vel.copy(); // Point de base dans la direction actuelle
      wanderPoint.setMag(100);          // Distance où placer le cercle de "boussole"
      wanderPoint.add(this.pos);        // Déplacer le point au-delà du transporteur

      let wanderRadius = 50;           // Rayon du cercle où se situe la cible de vagabondage

      // Calcul de la direction aléatoire à l'intérieur du cercle
      let theta = this.wanderTheta + this.vel.heading(); // Angle basé sur la direction actuelle
      let x = wanderRadius * cos(theta);
      let y = wanderRadius * sin(theta);

      wanderPoint.add(x, y);            // Déplacer le point final dans le cercle

      // Calculer la force de correction (steering) vers le point cible
      let steer = wanderPoint.sub(this.pos);
      steer.setMag(this.maxForce);      // Limiter la force de correction
      this.applyForce(steer);           // Appliquer la force au transporteur

      // Introduire une légère variation aléatoire dans l'angle
      let displaceRange = 0.3;          // Variation de l'angle
      this.wanderTheta += random(-displaceRange, displaceRange);
    }

    seek(target) {
      let desired = p5.Vector.sub(target, this.pos);
      desired.setMag(this.maxSpeed);
      let steer = p5.Vector.sub(desired, this.vel);
      steer.limit(this.maxForce);
      return steer;
    }

    avoidMeteors(meteors) {
      let steer = createVector(0, 0);
      for (let meteor of meteors) {
        let distance = p5.Vector.dist(this.pos, meteor.pos);
        let avoidRadius = 80; 
        if (distance < avoidRadius) {
          let flee = p5.Vector.sub(this.pos, meteor.pos);
          flee.setMag(this.maxSpeed * 10); // Fuite rapide
          flee.sub(this.vel);
          flee.limit(1); // Grande force d'évitement
          steer.add(flee);
        }
      }
      return steer;
    }

    detectAstronauts(astronauts) {
      for (let astronaut of astronauts) {
        let distance = p5.Vector.dist(this.pos, astronaut.pos);
        if (distance < this.detectionRadius) {
          return astronaut; // Retourne l'astronaute détecté
        }
      }
      return null; // Aucun astronaute détecté
    }

    collectAstronaut(astronaut, astronauts, rescuedAstronauts) {
      let distance = p5.Vector.dist(this.pos, astronaut.pos);
      if (distance < this.size / 2 + astronaut.size / 2) {
        // Si le transporteur touche l'astronaute, le récupérer
        let index = astronauts.indexOf(astronaut);
        if (index !== -1) {
          astronauts.splice(index, 1); // Retirer l'astronaute du tableau
          rescuedAstronauts.push(astronaut); // Ajouter l'astronaute au tableau des sauvés
          updateAstronautParticles(rescuedAstronauts.length.toString()); // Mettre à jour les particules
          print("Astronaute récupéré ! Total :", rescuedAstronauts.length);
        }
      }
    }

    edges() {
      // Si le transporteur sort de l'écran, ajuster sa position
      if (this.pos.x > width) {
        this.pos.x = width;
        this.vel.x *= -1; // Inverser la direction pour rebondir
      } else if (this.pos.x < 0) {
        this.pos.x = 0;
        this.vel.x *= -1;
      }
      if (this.pos.y > height) {
        this.pos.y = height;
        this.vel.y *= -1;
      } else if (this.pos.y < 0) {
        this.pos.y = 0;
        this.vel.y *= -1;
      }
    }

    drawRadar() {
        push();
      translate(this.pos.x, this.pos.y);
      
      // Vérifier si un astronaute est détecté (via maxSpeed comme indicateur)
      let isDetectingAstronaut = this.maxSpeed > 4;
      
      // Ajuster la vitesse et la couleur du radar en fonction de la détection
      let radarSpeed = isDetectingAstronaut ? radians(12) : radians(4); // Tourne 3 fois plus vite si détecte
      let radarColor = isDetectingAstronaut 
          ? { start: color(255, 0, 0, 50), end: color(255, 0, 0, 0) } // Rouge si détecte
          : { start: color(0, 255, 0, 50), end: color(0, 255, 0, 0) }; // Vert sinon
      
      // Rotation et ajustement de l'angle
      rotate(-this.radarAngle); // Rotation inversée
      this.radarAngle += radarSpeed; // Augmentation de la vitesse de rotation
      
      // Dessin du dégradé pour l'arc
      noStroke();
      for (let i = 0; i < 30; i++) { // 30 étapes pour un dégradé fluide
          let inter = map(i, 0, 30, 0, 1); // Interpolation de la transparence
          let colorFill = lerpColor(radarColor.start, radarColor.end, inter); // Dégradé entre les couleurs
          fill(colorFill);
          arc(0, 0, this.detectionRadius * 2, this.detectionRadius * 2, radians(i), radians(i + 1)); // Petit arc pour chaque étape
      }
    
      pop();
    }
    
    
    update(astronauts, meteors, rescuedAstronauts) {
      // Ajouter la position actuelle à la traînée
      this.trail.push(this.pos.copy());

      // Limiter la longueur de la traînée
      if (this.trail.length > this.maxTrailLength) {
        this.trail.shift(); // Supprimer les anciennes positions
      }
      let astronaut = this.detectAstronauts(astronauts);
      if (astronaut) {
          this.maxSpeed = 10; // Augmente la vitesse
          this.maxForce = 0.6; // Double la force d'accélération
        let seekForce = this.seek(astronaut.pos);
        this.applyForce(seekForce);
        this.collectAstronaut(astronaut, astronauts, rescuedAstronauts);
      } else {
        let wanderForce = this.wander();
        this.applyForce(wanderForce);
        this.maxSpeed = 4; // Réinitialise la vitesse
          this.maxForce = 0.3; // Réinitialise la force d'accélération
      }
  
      let avoidForce = this.avoidMeteors(meteors);
      this.applyForce(avoidForce);
  
      this.vel.add(this.acc);
      this.vel.limit(this.maxSpeed);
      this.pos.add(this.vel);
      this.acc.mult(0);
  
      this.edges();
    }
  
    show() {

      // Dessiner la traînée avec une opacité réduite
      noFill();
      strokeWeight(2);
      for (let i = 0; i < this.trail.length; i++) {
        let pos = this.trail[i];
        let alpha = map(i, 0, this.trail.length, 0, 255); // Opacité dégressive
        stroke(0, 255, 0, alpha * 0.8); // Violet avec opacité réduite (RGBA)
        point(pos.x, pos.y);
      }

      // Afficher le transporteur
      push();
      translate(this.pos.x, this.pos.y);
      rotate(this.vel.heading() + HALF_PI); // Rotation de 90° vers la droite
      imageMode(CENTER);
      image(transporterImg, 0, 0, this.size, this.size);
      pop();
  
      // Afficher l'effet radar
      this.drawRadar();
    }
}