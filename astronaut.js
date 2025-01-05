class Astronaut {
    constructor(x, y) {
      this.pos = createVector(x, y); // Position initiale (là où le vaisseau explose)
      this.vel = p5.Vector.random2D().mult(random(0.5, 1)); // Vitesse initiale lente et direction aléatoire
      this.angle = random(TWO_PI); // Angle initial aléatoire
      this.rotationSpeed = random(-0.05, 0.05); // Vitesse de rotation aléatoire
      this.size = 35; // Taille de l’astronaute
    }
  
    update() {
      this.pos.add(this.vel); // Déplacement en fonction de la vitesse
      this.angle += this.rotationSpeed; // Mise à jour de la rotation
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
      push();
      translate(this.pos.x, this.pos.y);
      rotate(this.angle); // Rotation de l’astronaute
      imageMode(CENTER);
      image(astroImg, 0, 0, this.size, this.size); // Affichage de l’astronaute
      console.log("Astronaut");
      pop();
    }
  }
  