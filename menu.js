let sliders = [];
let isDragging = false;

class Slider {
    constructor(label, x, y, width, value, min, max, updateFunction) {
        this.label = label;
        this.x = x;
        this.y = y;
        this.width = width;
        this.value = value;
        this.min = min;
        this.max = max;
        this.dragging = false;
        this.updateFunction = updateFunction;  // Fonction appelée lorsque la valeur change
    }

    show() {
        fill(255);
        textSize(15);
        text(this.label + ": " + nf(this.value, 1, 2), this.x, this.y - 10);

        let sliderX = map(this.value, this.min, this.max, this.x, this.x + this.width);
        stroke(255);
        line(this.x, this.y, this.x + this.width, this.y);
        fill(0, 255, 255);
        ellipse(sliderX, this.y, 10, 10);

        if (this.dragging) {
            this.value = map(mouseX, this.x, this.x + this.width, this.min, this.max);
            this.value = constrain(this.value, this.min, this.max);
            this.updateFunction(this.value); // Appelle la fonction associée pour mettre à jour les valeurs du jeu
        }
    }

    isMouseOver() {
        let sliderX = map(this.value, this.min, this.max, this.x, this.x + this.width);
        return dist(mouseX, mouseY, sliderX, this.y) < 10;
    }

    startDrag() {
        if (this.isMouseOver()) {
            this.dragging = true;
        }
    }

    stopDrag() {
        this.dragging = false;
    }
}

let isMousePressed = false;

class MenuParticle {
    constructor(x, y) {
        this.target = createVector(x, y);  // Position cible (point du texte)
        this.pos = createVector(random(width), random(height));  // Position aléatoire
        this.vel = p5.Vector.random2D();  // Vitesse aléatoire
        this.acc = createVector();
        this.r = 2;
        this.maxspeed = 8;
        this.maxforce = 0.3;
    }

    applyForce(force) {
        this.acc.add(force);
    }

    behaviors() {
        let arrive = this.arrive(this.target);
        let mouse = createVector(mouseX, mouseY);
        let flee = this.flee(mouse);

        arrive.mult(1);  // Subtil comportement d'arrivée

        // Si la souris survole seulement, fuite plus légère
        flee.mult(6);  // Réduction de la force de fuite en hover

        this.applyForce(flee);
        this.applyForce(arrive);
    }

    update() {
        this.pos.add(this.vel);
        this.vel.add(this.acc);
        this.acc.mult(0);  // Réinitialisation de l'accélération
    }

    show() {
        stroke(255);
        strokeWeight(this.r);
        point(this.pos.x, this.pos.y);  // Affichage des particules
    }

    arrive(target) {
        let desired = p5.Vector.sub(target, this.pos);
        let d = desired.mag();
        let speed = this.maxspeed;
        if (d < 100) {
            speed = map(d, 0, 100, 0, this.maxspeed);
        }
        desired.setMag(speed);
        let steer = p5.Vector.sub(desired, this.vel);
        steer.limit(this.maxforce);
        return steer;
    }

    flee(target) {
        let desired = p5.Vector.sub(target, this.pos);
        let d = desired.mag();
        if (d < 8) {
            desired.setMag(this.maxspeed);
            desired.mult(-1);  // Fuite dans la direction opposée
            let steer = p5.Vector.sub(desired, this.vel);
            steer.limit(this.maxforce + 0.1);
            return steer;
        } else {
            return createVector(0, 0);  // Pas de fuite si la souris est trop loin
        }
    }
}


class Button {
    constructor(label, x, y, callback) {
        this.label = label;
        this.x = x;
        this.y = y;
        this.width = textWidth(label) * 2.5;  // Largeur basée sur le texte
        this.height = 20;  // Hauteur du bouton (environ la taille du texte)
        this.callback = callback;  // Fonction à appeler lorsqu'on clique sur le bouton
        this.particles = [];  // Particules pour dessiner le texte
        this.createParticles();  // Générer les particules à partir du texte
    }

    // Générer les particules pour le texte
    createParticles() {
        let points = font.textToPoints(this.label, this.x, this.y, 18, {
            sampleFactor: 0.8  // Ajuster pour augmenter ou diminuer le nombre de particules
        });

        // Créer une particule pour chaque point
        points.forEach(pt => {
            let p = new MenuParticle(pt.x, pt.y);
            this.particles.push(p);
        });
    }

    // Afficher les particules du bouton
    show() {
        this.particles.forEach(p => {
            p.behaviors();
            p.update();
            p.show();
        });
    }

    // Vérifier si la souris est au-dessus du bouton
    isMouseOver() {
        return mouseX > this.x && mouseX < this.x + this.width && mouseY > this.y - this.height && mouseY < this.y;
    }

    // Gérer le clic
    handleClick() {
        if (this.isMouseOver()) {
            isMousePressed = true;
            print(this.label, this.callback);
            this.callback();  // Exécuter la fonction associée si cliqué
            isMousePressed = false;
        }
    }
}
